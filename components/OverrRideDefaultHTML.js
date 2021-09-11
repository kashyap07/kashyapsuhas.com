import { BsLink45Deg } from "react-icons/bs";

const code = ({ children, className }) => {
  return (
    <div data-component="test" className="justify-center items-center">
      <span className={`${className}`}>{children}</span>
    </div>
  );
};

const h1 = (props) => {
  return (
    <h1 id={id} className="relative group">
      <a
        className="hidden absolute text-2xl !text-gray-300 dark:!text-gray-600 md:group-hover:block md:hover:block -ml-8 pr-10 pt-2"
        aria-hidden="true"
        href={`#${id}`}
      >
        <BsLink45Deg />
      </a>
      {props.children}
    </h1>
  );
};

const h2 = (props) => {
  const id = props?.children.split(" ").join("-").toLowerCase();
  return (
    <h2 id={id} className="relative group">
      <a
        className="hidden absolute text-2xl !text-gray-300 dark:!text-gray-600 md:group-hover:block md:hover:block -ml-8 pr-10 pt-2"
        aria-hidden="true"
        href={`#${id}`}
      >
        <BsLink45Deg />
      </a>
      {props.children}
    </h2>
  );
};

export { code, h1, h2 };
