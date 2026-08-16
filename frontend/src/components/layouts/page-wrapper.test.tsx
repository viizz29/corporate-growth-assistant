import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import PageWrapper from "./page-wrapper";

describe("PageWrapper", () => {
  it("renders children", () => {
    render(<PageWrapper>page content</PageWrapper>);

    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("renders a Box container", () => {
    const { container } = render(<PageWrapper>page content</PageWrapper>);

    expect(container.querySelector(".MuiBox-root")).toBeInTheDocument();
  });

  it("merges custom sx with defaults", () => {
    const { container } = render(
      <PageWrapper sx={{ pt: 8 }}>page content</PageWrapper>
    );

    const box = container.querySelector(".MuiBox-root") as HTMLElement;
    expect(box).toHaveStyle({ paddingTop: "64px" });
  });
});
