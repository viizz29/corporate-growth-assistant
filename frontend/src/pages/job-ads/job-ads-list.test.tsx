import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { JobAd } from "@/api/job-ads-api";

import JobAdsListPage from "./job-ads-list";

vi.setConfig({ testTimeout: 60000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  jobAdsQuery: { data: undefined as JobAd[] | undefined, isLoading: false },
  deleteMutation: { mutate: vi.fn(), isPending: false },
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

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layouts/page-header", () => ({
  default: () => <div data-testid="page-header" />,
}));

vi.mock("@/components/data-display/empty-state", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
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
  useJobAdsQuery: () => state.jobAdsQuery,
  useDeleteJobAdMutation: () => state.deleteMutation,
}));

const englishJob: JobAd = {
  id: "1",
  title: "Frontend Engineer",
  description: "A".repeat(200),
  requirements: "React, TypeScript",
  location: "Mumbai",
  language: "en",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

const hindiJob: JobAd = {
  id: "2",
  title: "Backend Engineer",
  description: "Build APIs with Node.js",
  requirements: "Node.js",
  location: "Delhi",
  language: "hi",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <JobAdsListPage />
    </MemoryRouter>
  );
}

describe("JobAdsListPage", () => {
  beforeEach(() => {
    state.jobAdsQuery.data = undefined;
    state.jobAdsQuery.isLoading = false;
    state.deleteMutation.mutate = vi.fn();
    state.deleteMutation.isPending = false;
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it("renders skeleton placeholders while job ads load", () => {
    state.jobAdsQuery.isLoading = true;
    const { container } = renderPage();

    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders job rows with title, language chip and truncated description", () => {
    state.jobAdsQuery.data = [englishJob];

    renderPage();

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("..."))).toBeInTheDocument();
  });

  it("navigates to the edit page when a row is clicked", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [englishJob];

    renderPage();

    await user.click(screen.getByText("Frontend Engineer"));
    expect(mockNavigate).toHaveBeenCalledWith("/job-ads/1");
  });

  it("filters job ads by search term in the title case-insensitively", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [englishJob, hindiJob];

    renderPage();

    await user.type(
      screen.getByPlaceholderText("Search by title or location..."),
      "frontend"
    );

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();
  });

  it("filters job ads by search term in the location", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [englishJob, hindiJob];

    renderPage();

    await user.type(
      screen.getByPlaceholderText("Search by title or location..."),
      "delhi"
    );

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Frontend Engineer")).not.toBeInTheDocument();
  });

  it("filters job ads by language", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [englishJob, hindiJob];

    renderPage();

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "English" }));

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();
  });

  it("shows the no ads message when there are no job advertisements", () => {
    state.jobAdsQuery.data = [];

    renderPage();

    expect(
      screen.getByText("No job advertisements yet. Add your first job ad.")
    ).toBeInTheDocument();
  });

  it("shows the no results message when no job ad matches the filter", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [englishJob];

    renderPage();

    await user.type(
      screen.getByPlaceholderText("Search by title or location..."),
      "zzz"
    );

    expect(screen.getByText("No job ads match your search.")).toBeInTheDocument();
  });

  it("opens the confirmation modal and deletes the job ad on confirm", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [englishJob];
    state.deleteMutation.mutate = vi.fn(
      (_id: string, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    );

    renderPage();

    const [, deleteButton] = screen.getAllByRole("button");
    await user.click(deleteButton);

    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    expect(screen.getByText(/Delete "Frontend Engineer"/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(state.deleteMutation.mutate).toHaveBeenCalledWith("1", expect.any(Object));
    expect(toastMock.success).toHaveBeenCalledWith("Job advertisement deleted");
    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
  });
});
