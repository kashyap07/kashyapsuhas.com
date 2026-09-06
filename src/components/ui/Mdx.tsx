import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  JSX,
  ReactElement,
  ReactNode,
} from "react";
import React, { Children, isValidElement } from "react";

import { highlightCode } from "@lib/highlight";
import type { MDXComponents } from "mdx/types";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import * as MdxComponents from "@components/mdx";
import { CodeBlock } from "@components/mdx/CodeBlock";
import { bindFootnoteComponents } from "@components/mdx/Footnotes";
import Lightbox from "@components/mdx/trip/Lightbox";
import { TripRouteProvider } from "@components/mdx/trip/TripContext";
import { bindTripComponents, getTrip } from "@components/mdx/trip/registry";
import slugify from "@utils/slugify";

const { ImageMDX } = MdxComponents;

// flatten react children to plain text. headings/code can carry nested nodes
// (`## foo *bar*`, links, inline code), so a bare `typeof === "string"` check
// drops the text and yields empty slugs / unhighlighted code.
function getNodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node)) {
    return getNodeText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

const CustomLink = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { href, children, ...rest } = props;

  if (!href) {
    return <a {...rest}>{children}</a>;
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
};

// inline `code` only. fenced blocks never reach this: Pre reads its child's
// props for the source and renders shiki output itself, so the mapped <code>
// element is built but thrown away. inline code is deliberately NOT
// highlighted, a one-word chip coloured like a keyword reads as noise.
const Code = (props: HTMLAttributes<HTMLElement>) => (
  <code {...props} className="inline-code" />
);

interface PreProps extends HTMLAttributes<HTMLPreElement> {
  children?: ReactNode;
}

// async server component: highlighting is a build-time concern, so the shiki
// grammars never ship to the browser. mdx hands us <pre> wrapping a <code>
// whose className carries the fence language and whose child is still the raw
// source string, which is exactly what both shiki and the copy button need.
const Pre = async ({ children }: PreProps) => {
  const child = Children.toArray(children).find(isValidElement) as
    | ReactElement<{ className?: string; children?: ReactNode }>
    | undefined;

  const raw = getNodeText(child ?? children).replace(/\n$/, "");
  const lang = /language-([\w-]+)/.exec(child?.props?.className ?? "")?.[1];

  const { html, lang: label } = await highlightCode(raw, lang);

  return <CodeBlock html={html} raw={raw} lang={label} />;
};

const createHeading = (level: number) => {
  const HeadingComponent = ({
    children,
    ...props
  }: HTMLAttributes<HTMLHeadingElement>) => {
    const text = getNodeText(children);
    const slug = slugify(text);

    const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    return (
      <Heading id={slug} {...props}>
        <a href={`#${slug}`} className="anchor" />
        {children}
      </Heading>
    );
  };
  HeadingComponent.displayName = `Heading${level}`;
  return HeadingComponent;
};

const defaultComponentMapping: MDXComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  img: ImageMDX,
  a: CustomLink,
  code: Code,
  pre: Pre,
  ...MdxComponents,
};

type CustomMDXProps = JSX.IntrinsicAttributes &
  MDXRemoteProps & {
    // trip slug from frontmatter. binds <Stop>/<TripPhoto>/<TripMap>/etc to
    // that trip's manifests and mounts the route provider + lightbox.
    trip?: string;
  };

function CustomMDX({ trip, ...props }: CustomMDXProps) {
  const tripData = trip ? getTrip(trip) : null;
  // footnotes number themselves from the order their markers appear, which
  // means reading the source before it's compiled.
  const footnotes = bindFootnoteComponents(
    typeof props.source === "string" ? props.source : "",
  );

  const mdx = (
    <MDXRemote
      {...props}
      options={{
        ...props.options,
        blockJS: false,
        mdxOptions: {
          ...props.options?.mdxOptions,
          // gfm is what turns pipe tables into real <table>s. also brings
          // strikethrough and autolinked urls. footnotes here are the custom
          // <Fn>/<Footnote> jsx pair, so gfm's [^1] syntax never collides.
          remarkPlugins: [
            ...(props.options?.mdxOptions?.remarkPlugins ?? []),
            remarkGfm,
          ],
        },
      }}
      components={{
        ...defaultComponentMapping,
        ...footnotes,
        ...(tripData ? bindTripComponents(tripData) : {}),
        ...props.components,
      }}
    />
  );

  if (!tripData) return mdx;

  return (
    <TripRouteProvider route={tripData.route}>
      {mdx}
      <Lightbox />
    </TripRouteProvider>
  );
}

export default CustomMDX;
