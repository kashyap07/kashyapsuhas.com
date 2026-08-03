import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  JSX,
  ReactNode,
} from "react";
import React from "react";

import type { MDXComponents } from "mdx/types";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";

import * as MdxComponents from "@components/mdx";
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

interface CodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const Code = ({ children, ...props }: CodeProps) => {
  const codeString = getNodeText(children);
  const codeHTML = highlight(codeString);

  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
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
      options={{ ...props.options, blockJS: false }}
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
