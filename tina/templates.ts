import type { TinaField } from "tinacms";
export function blog_postFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "Title",
      required: true,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
    },
    {
      type: "string",
      name: "category",
      label: "Category",
      options: ["Tech", "Food", "Travel", "Life"],
      required: true,
    },
    {
      type: "datetime",
      name: "creation_date",
      label: "Creation Date",
      required: true,
    },
    {
      type: "string",
      name: "tags",
      label: "Tags",
      list: true,
      ui: {
        component: "tags",
      },
    },
    {
      type: "image",
      name: "hero_image",
      label: "Hero Image",
    },
    {
      type: "boolean",
      name: "draft",
      label: "Draft",
    },
    {
      type: "string",
      name: "author",
      label: "Author",
      required: true,
    },
  ] as TinaField[];
}
