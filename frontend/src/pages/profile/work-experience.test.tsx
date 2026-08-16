import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import type { WorkExperience } from "@/api/users-api";

import WorkExperiencePage from "./work-experience";

vi.setConfig({ testTimeout: 30000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  query: { data: undefined as WorkExperience[] | undefined, isLoading: false },
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
  useWorkExperiencesQuery: () => state.query,
  useCreateWorkExperienceMutation: () => state.create,
  useUpdateWorkExperienceMutation: () => state.update,
  useDeleteWorkExperienceMutation: () => state.del,
}));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/data-display/empty-state", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}));

const defaultWork: WorkExperience = {
  id: "we1",
  company: "Acme Corp",
  role: "Frontend Engineer",
  startDate: "2020-01-01",
  endDate: "",
  description: "Built dashboards",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkExperiencePage />
    </MemoryRouter>
  );
}

function getItemPaper(text: string): HTMLElement {
  return screen.getByText(text).closest(".MuiPaper-root") as HTMLElement;
}

describe("WorkExperiencePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    state.query.data = [defaultWork];
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

  it("renders loading skeletons while work experience entries are loading", () => {
    state.query.isLoading = true;
    const { container } = renderPage();

    expect(container.querySelectorAll('[class*="MuiSkeleton"]')).toHaveLength(3);
  });

  it("shows an empty state when there are no work experience entries", () => {
    state.query.data = [];
    renderPage();

    expect(
      screen.getByText("No work experience entries yet. Add your first entry.")
    ).toBeInTheDocument();
  });

  it("renders work experience entries with company, role, and date range", () => {
    renderPage();

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("2020-01-01 - Present")).toBeInTheDocument();
  });

  it("requires company and role before creating", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Experience" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Company is required")).toBeInTheDocument();
    expect(screen.getByText("Role is required")).toBeInTheDocument();
  });

  it("creates a work experience entry when the form is valid", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Experience" }));
    await user.type(screen.getByLabelText("Company *"), "Globex");
    await user.type(screen.getByLabelText("Role *"), "Engineer");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(state.create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ company: "Globex", role: "Engineer" }),
      expect.anything()
    );
  });

  it("pre-fills the modal when editing and updates the entry", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("Frontend Engineer").querySelectorAll("button")[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Edit Work Experience")).toBeInTheDocument();
    expect(screen.getByLabelText("Company *")).toHaveValue("Acme Corp");

    const role = screen.getByLabelText("Role *");
    await user.clear(role);
    await user.type(role, "Lead");
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(state.update.mutate).toHaveBeenCalledWith(
      { id: "we1", data: expect.objectContaining({ role: "Lead" }) },
      expect.anything()
    );
  });

  it("deletes a work experience entry after confirming", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("Frontend Engineer").querySelectorAll("button")[1]);

    expect(
      screen.getByText('Delete "Frontend Engineer at Acme Corp"? This action cannot be undone.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes" }));

    expect(state.del.mutate).toHaveBeenCalledWith("we1", expect.anything());
    expect(toast.success).toHaveBeenCalledWith("Work experience deleted");
    expect(
      screen.queryByText('Delete "Frontend Engineer at Acme Corp"? This action cannot be undone.')
    ).not.toBeInTheDocument();
  });

  it("shows Saving while the create mutation is pending", async () => {
    state.create.isPending = true;
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Experience" }));

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
