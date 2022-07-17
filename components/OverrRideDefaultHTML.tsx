import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDarkReasonable } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { BsLink45Deg } from "react-icons/bs";
import { ReactChild, ReactFragment, ReactPortal } from "react";
import { slugify } from "../utils/stringUtils";

// TODO: https://github.com/react-syntax-highlighter/react-syntax-highlighter#light-build

const pre = (props: {
  children: { props: { className?: any; metastring: any; children: any } };
}) => {
  const { className, metastring, children } = props.children?.props;
  const language = className.split("-").slice(-1)[0];
  return (
    <div data-component="code-block" className="relative">
      {metastring && (
        <span className="absolute -top-5 -right-2 rounded bg-secondary px-4 py-2 text-sm font-bold">
          {metastring}
        </span>
      )}
      <SyntaxHighlighter
        language={language}
        style={atomOneDarkReasonable}
        showLineNumbers
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const inlineCode = (props: { children: any }) => {
  const { children } = props;
  return (
    <pre className="inline !w-fit-content rounded !bg-gray-100 !py-1 !px-2 font-sans !text-sm font-medium !leading-tight !text-black">
      {children}
    </pre>
  );
};

// @ts-ignore
const AnchorIcon = ({ id }) => {
  return (
    <a
      className="absolute -ml-8 hidden pr-10 pt-2 text-2xl !text-black md:hover:block md:group-hover:block"
      aria-hidden="true"
      href={`#${id}`}
    >
      <BsLink45Deg />
    </a>
  );
};

const h1 = (props: { children: {} | null | undefined }) => {
  // @ts-ignore
  const id = props?.children?.split(" ").join("-").toLowerCase();
  return (
    <h1 id={id} className="group relative -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h1>
  );
};

const h2 = (props: { children: any }) => {
  const id = slugify(props.children);

  return (
    <h2 id={id} className="group relative -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h2>
  );
};

const h3 = (props: { children: any }) => {
  const id = slugify(props.children);

  return (
    <h3 id={id} className="group relative -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h3>
  );
};

const h4 = (props: { children: any }) => {
  const id = slugify(props.children);

  return (
    <h4 id={id} className="group relative -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h4>
  );
};

export { pre, h1, h2, h3, h4, inlineCode };
