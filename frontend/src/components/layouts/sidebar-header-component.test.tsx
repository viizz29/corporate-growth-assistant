import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SidebarHeader } from "./sidebar-header-component";

vi.mock("@/config", () => ({
  APP_NAME: "Test App",
}));

describe("SidebarHeader", () => {
  it("renders APP_NAME", () => {
    render(<SidebarHeader isSidebarOpen toggleSidebar={vi.fn()} />);

    expect(screen.getByText("Test App")).toBeInTheDocument();
  });

  it("renders close button when showClose and isSidebarOpen are true", () => {
    render(
      <SidebarHeader isSidebarOpen toggleSidebar={vi.fn()} showClose />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not render close button when isSidebarOpen is false", () => {
    render(
      <SidebarHeader isSidebarOpen={false} toggleSidebar={vi.fn()} showClose />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render close button when showClose is false", () => {
    render(
      <SidebarHeader isSidebarOpen toggleSidebar={vi.fn()} showClose={false} />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls toggleSidebar when close button is clicked", async () => {
    const toggleSidebar = vi.fn();
    const user = userEvent.setup();

    render(
      <SidebarHeader isSidebarOpen toggleSidebar={toggleSidebar} showClose />
    );

    await user.click(screen.getByRole("button"));
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });
});
