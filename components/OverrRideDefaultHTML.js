import { BsLink45Deg } from "react-icons/bs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDarkReasonable } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// TODO: https://github.com/react-syntax-highlighter/react-syntax-highlighter#light-build

const pre = (props) => {
  const { className, metastring, children } = props.children?.props;
  const language = className.split("-").slice(-1)[0];
  return (
    <div data-component="code-block" className="relative">
      {metastring && (
        <span className="absolute text-white text-sm -top-5 -right-2 bg-secondary py-2 px-4 font-bold rounded">
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
    <h1 id={id} className="relative group -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h1>
  );
};

const h2 = (props) => {
  const id = props?.children.split(" ").join("-").toLowerCase();
  return (
    <h2 id={id} className="relative group -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h2>
  );
};

const h3 = (props) => {
  const id = props?.children.split(" ").join("-").toLowerCase();
  return (
    <h3 id={id} className="relative group -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h3>
  );
};

const h4 = (props) => {
  const id = props?.children.split(" ").join("-").toLowerCase();
  return (
    <h4 id={id} className="relative group -ml-12 pl-12">
      <AnchorIcon id={id} />
      {props.children}
    </h4>
  );
};

export { pre, h1, h2, h3, h4 };
