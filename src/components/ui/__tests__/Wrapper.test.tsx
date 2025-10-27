import React from "react";

import { render, screen } from "@testing-library/react";

import Wrapper from "../Wrapper";

describe("Wrapper", () => {
  it("renders children correctly", () => {
    render(
      <Wrapper>
        <div>Test Content</div>
      </Wrapper>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies default NARROW max-width class", () => {
    const { container } = render(
      <Wrapper>
        <div>Content</div>
      </Wrapper>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("max-w-5xl");
  });

  it("applies WIDE max-width class when specified", () => {
    const { container } = render(
      <Wrapper maxWidth="WIDE">
        <div>Content</div>
      </Wrapper>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("max-w-7xl");
  });

  it("applies FULL_WIDTH max-width class when specified", () => {
    const { container } = render(
      <Wrapper maxWidth="FULL_WIDTH">
        <div>Content</div>
      </Wrapper>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("max-w-full");
  });

  it("applies FULL_SCREEN_WIDTH with special classes", () => {
    const { container } = render(
      <Wrapper maxWidth="FULL_SCREEN_WIDTH">
        <div>Content</div>
      </Wrapper>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("w-screen");
    expect(section).toHaveClass("px-0");
  });

  it("applies custom className alongside default classes", () => {
    const { container } = render(
      <Wrapper className="custom-class">
        <div>Content</div>
      </Wrapper>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-class");
    expect(section).toHaveClass("relative");
    expect(section).toHaveClass("mx-auto");
  });

  it("renders as a section element", () => {
    const { container } = render(
      <Wrapper>
        <div>Content</div>
      </Wrapper>,
    );

    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("has correct data attribute", () => {
    const { container } = render(
      <Wrapper>
        <div>Content</div>
      </Wrapper>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveAttribute(
      "data-component",
      "max-width-wrapper",
    );
  });
});
