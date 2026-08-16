import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BreadCrumbsComponent } from "./breadcrumbs-component";

const items = [
  { id: 1, caption: "Home" },
  { id: 2, caption: "About" },
  { id: 3, caption: "Contact" },
];

describe("BreadCrumbsComponent", () => {
  it("renders all item captions", () => {
    render(<BreadCrumbsComponent items={items} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders last item as non-clickable text", () => {
    render(<BreadCrumbsComponent items={items} />);

    expect(screen.queryByRole("button", { name: "Contact" })).not.toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("fires onClick with item id for non-last items", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<BreadCrumbsComponent items={items} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(onClick).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: "About" }));
    expect(onClick).toHaveBeenCalledWith(2);
  });

  it("renders separators between items", () => {
    render(<BreadCrumbsComponent items={items} />);

    expect(screen.getAllByText("/")).toHaveLength(2);
  });

  it("renders nothing when items are empty", () => {
    const { container } = render(<BreadCrumbsComponent items={[]} />);

    expect(container.querySelector(".MuiBox-root")).toBeEmptyDOMElement();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
