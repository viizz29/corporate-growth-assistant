import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { JobAd } from "@/api/job-ads-api";

import JobAdFormPage from "./job-ad-form";

vi.setConfig({ testTimeout: 60000 });

type ApiError = { response?: { data?: { message?: string } } };

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  jobAdQuery: {
    data: undefined as JobAd | undefined,
    isLoading: false,
    isError: false,
  },
  queryId: undefined as string | undefined,
  createMutation: {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null as ApiError | null,
  },
  updateMutation: {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null as ApiError | null,
  },
  updateId: undefined as string | undefined,
  deleteMutation: { mutate: vi.fn(), isPending: false },
}));

const routerState = vi.hoisted(() => ({
  params: {} as Record<string, string | undefined>,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => routerState.params,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

vi.mock("react-toastify", () => ({ toast: toastMock }));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layouts/page-header", () => ({
  default: ({
    title,
    actionLabel,
    onAction,
  }: {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => (
    <div>
      <div data-testid="page-header-title">{title}</div>
      {actionLabel && <button onClick={onAction}>{actionLabel}</button>}
    </div>
  ),
}));

vi.mock("@/components/forms/form-card", () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/components/modals/confirmation-modal", () => ({
  default: ({
    open,
    message,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div data-testid="confirm-modal">
        <div>{message}</div>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock("@/hooks/use-job-ads-queries", () => ({
  useJobAdQuery: (id: string | undefined) => {
    state.queryId = id;
    return state.jobAdQuery;
  },
  useCreateJobAdMutation: () => state.createMutation,
  useUpdateJobAdMutation: (id: string) => {
    state.updateId = id;
    return state.updateMutation;
  },
  useDeleteJobAdMutation: () => state.deleteMutation,
}));

const existingJob: JobAd = {
  id: "5",
  title: "Senior React Dev",
  description: "Lead the frontend team",
  requirements: "React, TypeScript",
  location: "Pune",
  language: "hi",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/job-ads/new"]}>
      <JobAdFormPage />
    </MemoryRouter>
  );
}

describe("JobAdFormPage", () => {
  beforeEach(() => {
    routerState.params = {};
    state.jobAdQuery.data = undefined;
    state.jobAdQuery.isLoading = false;
    state.jobAdQuery.isError = false;
    state.createMutation.mutate = vi.fn();
    state.createMutation.isPending = false;
    state.createMutation.isError = false;
    state.createMutation.error = null;
    state.updateMutation.mutate = vi.fn();
    state.updateMutation.isPending = false;
    state.updateMutation.isError = false;
    state.updateMutation.error = null;
    state.deleteMutation.mutate = vi.fn();
    state.deleteMutation.isPending = false;
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it("renders an empty form in create mode", () => {
    renderPage();

    expect(screen.getByRole("textbox", { name: /job title/i })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /description/i })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /requirements/i })).toHaveValue("");
    expect(screen.getByRole("button", { name: "Create Job Ad" })).toBeInTheDocument();
  });

  it("shows validation errors when required fields are missing", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole("button", { name: "Create Job Ad" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Requirements are required")).toBeInTheDocument();
    expect(state.createMutation.mutate).not.toHaveBeenCalled();
  });

  it("creates a job ad and navigates to its detail page", async () => {
    const user = userEvent.setup();
    state.createMutation.mutate = vi.fn(
      (
        _values: unknown,
        opts?: { onSuccess?: (data: { id: string }) => void }
      ) => opts?.onSuccess?.({ id: "9" })
    );

    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: /job title/i }),
      "Frontend Engineer"
    );
    await user.type(
      screen.getByRole("textbox", { name: /description/i }),
      "Build UI components"
    );
    await user.type(
      screen.getByRole("textbox", { name: /requirements/i }),
      "React, TypeScript"
    );
    await user.click(screen.getByRole("button", { name: "Create Job Ad" }));

    expect(state.createMutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Frontend Engineer",
        description: "Build UI components",
        requirements: "React, TypeScript",
        language: "en",
      }),
      expect.any(Object)
    );
    expect(toastMock.success).toHaveBeenCalledWith("Job advertisement created");
    expect(mockNavigate).toHaveBeenCalledWith("/job-ads/9");
  });

  it("pre-fills the form from the job ad in edit mode", () => {
    routerState.params = { id: "5" };
    state.jobAdQuery.data = existingJob;

    renderPage();

    expect(screen.getByRole("textbox", { name: /job title/i })).toHaveValue(
      "Senior React Dev"
    );
    expect(screen.getByRole("textbox", { name: /description/i })).toHaveValue(
      "Lead the frontend team"
    );
    expect(screen.getByRole("textbox", { name: /requirements/i })).toHaveValue(
      "React, TypeScript"
    );
    expect(screen.getByRole("textbox", { name: /location/i })).toHaveValue("Pune");
    expect(state.queryId).toBe("5");
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  it("updates the job ad in edit mode", async () => {
    const user = userEvent.setup();
    routerState.params = { id: "5" };
    state.jobAdQuery.data = existingJob;
    state.updateMutation.mutate = vi.fn(
      (_values: unknown, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    );

    renderPage();

    await user.clear(screen.getByRole("textbox", { name: /job title/i }));
    await user.type(
      screen.getByRole("textbox", { name: /job title/i }),
      "Principal React Dev"
    );
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(state.updateId).toBe("5");
    expect(state.updateMutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Principal React Dev",
        language: "hi",
        location: "Pune",
      }),
      expect.any(Object)
    );
    expect(toastMock.success).toHaveBeenCalledWith("Job advertisement updated");
  });

  it("deletes the job ad from edit mode", async () => {
    const user = userEvent.setup();
    routerState.params = { id: "5" };
    state.jobAdQuery.data = existingJob;
    state.deleteMutation.mutate = vi.fn(
      (_value: unknown, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    );

    renderPage();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    expect(screen.getByText(/Delete "Senior React Dev"/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(state.deleteMutation.mutate).toHaveBeenCalled();
    expect(toastMock.success).toHaveBeenCalledWith("Job advertisement deleted");
    expect(mockNavigate).toHaveBeenCalledWith("/job-ads");
  });

  it("shows the server error message in an alert when the mutation fails", () => {
    state.createMutation.isError = true;
    state.createMutation.error = {
      response: { data: { message: "Title already exists" } },
    };

    renderPage();

    expect(screen.getByText("Title already exists")).toBeInTheDocument();
  });

  it("disables the submit button and shows a saving label while pending", () => {
    state.createMutation.isPending = true;

    renderPage();

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
