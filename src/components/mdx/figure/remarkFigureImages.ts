// lift images that are alone in their paragraph (whitespace and line breaks
// aside) out of the <p>, and flag them so MarkdownImage renders a <figure>.
// same idea as remark-unwrap-images, hand rolled like remarkCodeTitle.
type MdNode = {
  type: string;
  value?: string;
  data?: { hProperties?: Record<string, unknown> };
  children?: MdNode[];
};

const isBlank = (n: MdNode) =>
  n.type === "break" || (n.type === "text" && !n.value?.trim());

export function remarkFigureImages() {
  const walk = (node: MdNode) => {
    if (!node.children) return;
    node.children = node.children.flatMap((child) => {
      const kids = child.children ?? [];
      const imageOnly =
        child.type === "paragraph" &&
        kids.some((k) => k.type === "image") &&
        kids.every((k) => k.type === "image" || isBlank(k));
      if (!imageOnly) {
        walk(child);
        return [child];
      }
      return kids
        .filter((k) => k.type === "image")
        .map((img) => {
          img.data = img.data ?? {};
          img.data.hProperties = { ...img.data.hProperties, "data-figure": "" };
          return img;
        });
    });
  };
  return (tree: MdNode) => walk(tree);
}
