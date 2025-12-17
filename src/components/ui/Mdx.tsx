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
import { ImageAutoHeight } from "@components/ui";

const { ImageMDX } = MdxComponents;

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
  const codeString = typeof children === "string" ? children : "";
  const codeHTML = highlight(codeString);

  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
};

const slugify = (str: string): string => {
  return str
    .toString()
    .toLowerCase()
    .trim() // remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/&/g, "-and-") // replace & with 'and'
    .replace(/[^\w\-]+/g, "") // remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // replace multiple - with single -
};

const createHeading = (level: number) => {
  const HeadingComponent = ({
    children,
    ...props
  }: HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof children === "string" ? children : "";
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

function CustomMDX(props: JSX.IntrinsicAttributes & MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...defaultComponentMapping, ...props.components }}
    />
  );
}

export default CustomMDX;
