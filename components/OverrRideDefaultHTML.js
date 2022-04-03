import { BsLink45Deg } from "react-icons/bs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDarkReasonable } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { slugify } from "../utils/stringUtils";

// TODO: https://github.com/react-syntax-highlighter/react-syntax-highlighter#light-build

const pre = (props) => {
  const { className, metastring, children } = props.children?.props;
  const language = className.split("-").slice(-1)[0];
  return (
    <div data-component="code-block" className="relative">
      {metastring && (
        <span className="absolute px-4 py-2 text-sm font-bold text-white rounded -top-5 -right-2 bg-secondary">
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

const inlineCode = (props) => {
  const { children } = props;
  return (
    <pre className="!w-fit-content inline !py-1 !px-2 rounded font-medium font-sans !text-gray-900 !bg-gray-100 dark:!text-white dark:!bg-gray-800">
      {children}
    </pre>
  );
};

const AnchorIcon = ({ id }) => {
  return (
    <a
      className="hidden absolute text-2xl !text-gray-300 dark:!text-gray-600 md:group-hover:block md:hover:block -ml-8 pr-10 pt-2"
      aria-hidden="true"
      href={`#${id}`}
    >
      <BsLink45Deg />
    </a>
  );
};

const h1 = (props) => {
  const id = props?.children.split(" ").join("-").toLowerCase();
  return (
    <h1 id={id} className="relative pl-12 -ml-12 group">
      <AnchorIcon id={id} />
      {props.children}
    </h1>
  );
};

const h2 = (props) => {
  const id = slugify(props.children);

  return (
    <h2 id={id} className="relative pl-12 -ml-12 group">
      <AnchorIcon id={id} />
      {props.children}
    </h2>
  );
};

const h3 = (props) => {
  const id = slugify(props.children);

  return (
    <h3 id={id} className="relative pl-12 -ml-12 group">
      <AnchorIcon id={id} />
      {props.children}
    </h3>
  );
};

const h4 = (props) => {
  const id = slugify(props.children);

  return (
    <h4 id={id} className="relative pl-12 -ml-12 group">
      <AnchorIcon id={id} />
      {props.children}
    </h4>
  );
};

export { pre, h1, h2, h3, h4, inlineCode };
