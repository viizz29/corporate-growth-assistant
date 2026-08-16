import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import type { Project } from "@/api/users-api";

import ProjectsPage from "./projects";

vi.setConfig({ testTimeout: 30000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  query: { data: undefined as Project[] | undefined, isLoading: false },
  create: { mutate: vi.fn(), isPending: false },
  update: { mutate: vi.fn(), isPending: false },
  del: { mutate: vi.fn(), isPending: false },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

vi.mock("react-toastify", () => ({ toast: toastMock }));

vi.mock("@/hooks/use-users-queries", () => ({
  useProjectsQuery: () => state.query,
  useCreateProjectMutation: () => state.create,
  useUpdateProjectMutation: () => state.update,
  useDeleteProjectMutation: () => state.del,
}));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/data-display/empty-state", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}));

const defaultProject: Project = {
  id: "p1",
  projectName: "Portfolio Site",
  description: "A portfolio",
  startDate: "2021-01-01",
  endDate: "2022-01-01",
  techStack: "React, Node.js, PostgreSQL ",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>
  );
}

function getItemPaper(text: string): HTMLElement {
  return screen.getByText(text).closest(".MuiPaper-root") as HTMLElement;
}

describe("ProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    state.query.data = [defaultProject];
    state.query.isLoading = false;
    state.create.isPending = false;
    state.create.mutate = vi.fn();
    state.update.isPending = false;
    state.update.mutate = vi.fn();
    state.del.isPending = false;
    state.del.mutate = vi.fn(
      (_id: string, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    );
  });

  it("renders loading skeletons while projects are loading", () => {
    state.query.isLoading = true;
    const { container } = renderPage();

    expect(container.querySelectorAll('[class*="MuiSkeleton"]')).toHaveLength(3);
  });

  it("shows an empty state when there are no projects", () => {
    state.query.data = [];
    renderPage();

    expect(screen.getByText("No projects yet. Add your first project.")).toBeInTheDocument();
  });

  it("renders projects and splits the tech stack into chips", () => {
    const { container } = renderPage();

    expect(screen.getByText("Portfolio Site")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
    expect(container.querySelectorAll(".MuiChip-root")).toHaveLength(3);
  });

  it("does not render tech stack chips when the stack is empty", () => {
    state.query.data = [{ ...defaultProject, techStack: "" }];
    const { container } = renderPage();

    expect(screen.getByText("Portfolio Site")).toBeInTheDocument();
    expect(container.querySelectorAll(".MuiChip-root")).toHaveLength(0);
  });

  it("requires a project name before creating", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Project" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Project name is required")).toBeInTheDocument();
  });

  it("creates a project when the form is valid", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Project" }));
    await user.type(screen.getByLabelText("Project Name *"), "CRM Tool");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(state.create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ projectName: "CRM Tool" }),
      expect.anything()
    );
  });

  it("pre-fills the modal when editing and updates the project", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("Portfolio Site").querySelectorAll("button")[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Edit Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Name *")).toHaveValue("Portfolio Site");

    const projectName = screen.getByLabelText("Project Name *");
    await user.clear(projectName);
    await user.type(projectName, "New Site");
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(state.update.mutate).toHaveBeenCalledWith(
      { id: "p1", data: expect.objectContaining({ projectName: "New Site" }) },
      expect.anything()
    );
  });

  it("deletes a project after confirming", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("Portfolio Site").querySelectorAll("button")[1]);

    expect(
      screen.getByText('Delete "Portfolio Site"? This action cannot be undone.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes" }));

    expect(state.del.mutate).toHaveBeenCalledWith("p1", expect.anything());
    expect(toast.success).toHaveBeenCalledWith("Project deleted");
    expect(
      screen.queryByText('Delete "Portfolio Site"? This action cannot be undone.')
    ).not.toBeInTheDocument();
  });
});
