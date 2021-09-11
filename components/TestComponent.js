import { Calculator } from "react-mac-calculator";

const TestComponent = ({ children, className }) => {
  return (
    <div data-component="test" className="justify-center items-center">
      <span className={`${className}`}>
        {typeof window !== "undefined" && <Calculator />}
      </span>
    </div>
  );
};

export default TestComponent;
