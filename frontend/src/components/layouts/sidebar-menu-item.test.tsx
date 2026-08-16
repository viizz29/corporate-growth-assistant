import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { SidebarMenuItem } from "./sidebar-menu-item";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderMenuItem(path: string, initialEntries: string[], onClick?: () => void) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SidebarMenuItem
        icon={<span>icon</span>}
        activeIcon={<span>active</span>}
        path={path}
        onClick={onClick}
      >
        Home
      </SidebarMenuItem>
    </MemoryRouter>
  );
}

function getListItem(container: HTMLElement): HTMLElement {
  return container.querySelector(".MuiListItemButton-root") as HTMLElement;
}

describe("SidebarMenuItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children", () => {
    renderMenuItem("/", ["/"]);

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("selects root path when current location matches exactly", () => {
    const { container } = renderMenuItem("/", ["/"]);

    expect(getListItem(container)).toHaveAttribute(
      "class",
      expect.stringContaining("Mui-selected")
    );
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.queryByText("icon")).not.toBeInTheDocument();
  });

  it("does not select root path when location differs", () => {
    const { container } = renderMenuItem("/", ["/other"]);

    expect(getListItem(container)).toHaveAttribute(
      "class",
      expect.not.stringContaining("Mui-selected")
    );
    expect(screen.getByText("icon")).toBeInTheDocument();
    expect(screen.queryByText("active")).not.toBeInTheDocument();
  });

  it("selects non-root path when location matches exactly", () => {
    const { container } = renderMenuItem("/dashboard", ["/dashboard"]);

    expect(getListItem(container)).toHaveAttribute(
      "class",
      expect.stringContaining("Mui-selected")
    );
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("selects non-root path when location starts with path plus slash", () => {
    const { container } = renderMenuItem("/dashboard", ["/dashboard/reports"]);

    expect(getListItem(container)).toHaveAttribute(
      "class",
      expect.stringContaining("Mui-selected")
    );
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("does not select non-root path when location differs", () => {
    const { container } = renderMenuItem("/dashboard", ["/other"]);

    expect(getListItem(container)).toHaveAttribute(
      "class",
      expect.not.stringContaining("Mui-selected")
    );
    expect(screen.getByText("icon")).toBeInTheDocument();
  });

  it("navigates to path and calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    renderMenuItem("/dashboard", ["/"], onClick);

    await user.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.invocationCallOrder[0]).toBeLessThan(
      onClick.mock.invocationCallOrder[0]
    );
  });
});
