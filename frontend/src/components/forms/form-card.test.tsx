import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import FormCard from "./form-card";

describe("FormCard", () => {
  it("renders the title", () => {
    render(<FormCard title="Profile">content</FormCard>);

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <FormCard title="Profile">
        <span>child content</span>
      </FormCard>
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("applies the default maxWidth of 480", () => {
    render(<FormCard title="Profile">content</FormCard>);

    const paper = screen.getByText("Profile").closest(".MuiPaper-root") as HTMLElement;
    expect(paper).toHaveStyle({ maxWidth: "480px" });
  });

  it("allows overriding maxWidth", () => {
    render(
      <FormCard title="Profile" maxWidth={720}>
        content
      </FormCard>
    );

    const paper = screen.getByText("Profile").closest(".MuiPaper-root") as HTMLElement;
    expect(paper).toHaveStyle({ maxWidth: "720px" });
  });
});
