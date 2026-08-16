import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PageHeader from "./page-header";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Dashboard" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders back button only when onBack is provided", () => {
    render(<PageHeader title="Dashboard" onBack={vi.fn()} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not render back button when onBack is absent", () => {
    render(<PageHeader title="Dashboard" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("fires onBack when back button is clicked", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();

    render(<PageHeader title="Dashboard" onBack={onBack} />);

    await user.click(screen.getByRole("button"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders action button when actionLabel and onAction are present", () => {
    render(<PageHeader title="Dashboard" actionLabel="Save" onAction={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("does not render action button when onAction is absent", () => {
    render(<PageHeader title="Dashboard" actionLabel="Save" />);

    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("does not render action button when actionLabel is absent", () => {
    render(<PageHeader title="Dashboard" onAction={vi.fn()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("fires onAction when action button is clicked", async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();

    render(<PageHeader title="Dashboard" actionLabel="Save" onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
