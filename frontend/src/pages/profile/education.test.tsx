import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import type { Education } from "@/api/users-api";

import EducationPage from "./education";

vi.setConfig({ testTimeout: 30000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  query: { data: undefined as Education[] | undefined, isLoading: false },
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
  useEducationsQuery: () => state.query,
  useCreateEducationMutation: () => state.create,
  useUpdateEducationMutation: () => state.update,
  useDeleteEducationMutation: () => state.del,
}));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/data-display/empty-state", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}));

const defaultEducation: Education = {
  id: "edu1",
  institution: "MIT",
  degree: "BSc Computer Science",
  fieldOfStudy: "Computer Science",
  startDate: "2019-09-01",
  endDate: "",
  description: "Graduated with honors",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const educationWithoutStartDate: Education = {
  id: "edu2",
  institution: "Harvard",
  degree: "MSc",
  fieldOfStudy: "Data Science",
  startDate: "",
  endDate: "2021-05-01",
  description: "",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <EducationPage />
    </MemoryRouter>
  );
}

function getItemPaper(text: string): HTMLElement {
  return screen.getByText(text).closest(".MuiPaper-root") as HTMLElement;
}

describe("EducationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    state.query.data = [defaultEducation];
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

  it("renders loading skeletons while education entries are loading", () => {
    state.query.isLoading = true;
    const { container } = renderPage();

    expect(container.querySelectorAll('[class*="MuiSkeleton"]')).toHaveLength(3);
  });

  it("shows an empty state when there are no education entries", () => {
    state.query.data = [];
    renderPage();

    expect(
      screen.getByText("No education entries yet. Add your first education.")
    ).toBeInTheDocument();
  });

  it("renders education entries with institution, degree, and date range", () => {
    state.query.data = [defaultEducation, educationWithoutStartDate];
    renderPage();

    expect(screen.getByText("MIT")).toBeInTheDocument();
    expect(screen.getByText("BSc Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("2019-09-01 - Present")).toBeInTheDocument();
    expect(screen.getByText("? - 2021-05-01")).toBeInTheDocument();
  });

  it("opens the Add modal with an empty form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Education" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Add Education")).toBeInTheDocument();
    expect(screen.getByLabelText("Institution *")).toHaveValue("");
  });

  it("requires an institution before creating", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Education" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Institution is required")).toBeInTheDocument();
  });

  it("creates an education entry when the form is valid", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Education" }));
    await user.type(screen.getByLabelText("Institution *"), "Stanford");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(state.create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ institution: "Stanford" }),
      expect.anything()
    );
  });

  it("pre-fills the modal when editing and updates the entry", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("MIT").querySelectorAll("button")[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Edit Education")).toBeInTheDocument();
    expect(screen.getByLabelText("Institution *")).toHaveValue("MIT");

    const institution = screen.getByLabelText("Institution *");
    await user.clear(institution);
    await user.type(institution, "Caltech");
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(state.update.mutate).toHaveBeenCalledWith(
      { id: "edu1", data: expect.objectContaining({ institution: "Caltech" }) },
      expect.anything()
    );
  });

  it("deletes an education entry after confirming", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("MIT").querySelectorAll("button")[1]);

    expect(
      screen.getByText('Delete "MIT"? This action cannot be undone.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes" }));

    expect(state.del.mutate).toHaveBeenCalledWith("edu1", expect.anything());
    expect(toast.success).toHaveBeenCalledWith("Education entry deleted");
    expect(
      screen.queryByText('Delete "MIT"? This action cannot be undone.')
    ).not.toBeInTheDocument();
  });

  it("shows Saving while the create mutation is pending", async () => {
    state.create.isPending = true;
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Education" }));

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
