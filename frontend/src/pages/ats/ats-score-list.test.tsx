import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { AtsScore } from "@/api/ats-api";
import type { JobAd } from "@/api/job-ads-api";

import AtsScoreListPage from "./ats-score-list";

vi.setConfig({ testTimeout: 60000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  jobAdsQuery: { data: undefined as JobAd[] | undefined, isLoading: false },
  scoresQuery: { data: undefined as AtsScore[] | undefined },
  computeMutation: {
    mutate: vi.fn(),
    isPending: false,
    variables: undefined as string | undefined,
  },
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

vi.mock("@/hooks/use-job-ads-queries", () => ({
  useJobAdsQuery: () => state.jobAdsQuery,
}));

vi.mock("@/hooks/use-ats-queries", () => ({
  useAtsScoresQuery: () => state.scoresQuery,
  useComputeAtsScoreMutation: () => state.computeMutation,
}));

const job1: JobAd = {
  id: "1",
  title: "Frontend Engineer",
  description: "Build UI",
  requirements: "React",
  location: "Mumbai",
  language: "en",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

const job2: JobAd = {
  id: "2",
  title: "Backend Engineer",
  description: "Build APIs",
  requirements: "Node",
  location: "Delhi",
  language: "hi",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

function makeScore(overrides: Partial<AtsScore>): AtsScore {
  return {
    userId: "u1",
    jobAdId: "1",
    atsScore: 80,
    recommendations: [],
    aiFeedback: null,
    computedAt: "2026-08-01T00:00:00Z",
    atsThreshold: 40,
    ...overrides,
  };
}

const score1 = makeScore({ jobAdId: "1", atsScore: 80 });
const score2 = makeScore({ jobAdId: "2", atsScore: 30 });

function renderPage() {
  return render(
    <MemoryRouter>
      <AtsScoreListPage />
    </MemoryRouter>
  );
}

describe("AtsScoreListPage", () => {
  beforeEach(() => {
    state.jobAdsQuery.data = undefined;
    state.jobAdsQuery.isLoading = false;
    state.scoresQuery.data = undefined;
    state.computeMutation.mutate = vi.fn();
    state.computeMutation.isPending = false;
    state.computeMutation.variables = undefined;
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

  it("shows the score badge and view button for scored jobs and a compute button for unscored jobs", () => {
    state.jobAdsQuery.data = [job1, job2];
    state.scoresQuery.data = [score1];

    renderPage();

    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Score" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compute Score" })).toBeInTheDocument();
  });

  it("navigates to the score detail when the view button is clicked", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [job1];
    state.scoresQuery.data = [score1];

    renderPage();

    await user.click(screen.getByRole("button", { name: "View Score" }));
    expect(mockNavigate).toHaveBeenCalledWith("/ats/1");
  });

  it("computes a score for a job without one and navigates to the result", async () => {
    const user = userEvent.setup();
    state.computeMutation.mutate = vi.fn(
      (
        _jobId: string,
        opts?: { onSuccess?: (data: { jobAdId: string }) => void }
      ) => opts?.onSuccess?.({ jobAdId: job2.id })
    );
    state.jobAdsQuery.data = [job1, job2];
    state.scoresQuery.data = [score1];

    renderPage();

    await user.click(screen.getByRole("button", { name: "Compute Score" }));

    expect(state.computeMutation.mutate).toHaveBeenCalledWith("2", expect.any(Object));
    expect(toastMock.success).toHaveBeenCalledWith("ATS score computed");
    expect(mockNavigate).toHaveBeenCalledWith("/ats/2");
  });

  it("shows a computing state and disables buttons while a score is being computed", () => {
    state.jobAdsQuery.data = [job1];
    state.scoresQuery.data = [score1];
    state.computeMutation.isPending = true;
    state.computeMutation.variables = job1.id;

    renderPage();

    expect(screen.getByRole("button", { name: "Computing..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Recompute score" })).toBeDisabled();
  });

  it("recomputes a score when the refresh icon is clicked", async () => {
    const user = userEvent.setup();
    state.computeMutation.mutate = vi.fn(
      (
        _jobId: string,
        opts?: { onSuccess?: (data: { jobAdId: string }) => void }
      ) => opts?.onSuccess?.({ jobAdId: job1.id })
    );
    state.jobAdsQuery.data = [job1];
    state.scoresQuery.data = [score1];

    renderPage();

    await user.click(screen.getByRole("button", { name: "Recompute score" }));

    expect(state.computeMutation.mutate).toHaveBeenCalledWith("1", expect.any(Object));
    expect(toastMock.success).toHaveBeenCalledWith("ATS score computed");
  });

  it("shows the generate resume CTA only when the score meets the threshold and navigates on click", async () => {
    const user = userEvent.setup();
    state.jobAdsQuery.data = [job1, job2];
    state.scoresQuery.data = [score1, score2];

    renderPage();

    expect(screen.getAllByText("Generate Resume")).toHaveLength(1);

    await user.click(screen.getByText("Generate Resume"));
    expect(mockNavigate).toHaveBeenCalledWith("/resumes?jobAdId=1");
  });

  it("shows an empty state when there are no job ads", () => {
    state.jobAdsQuery.data = [];
    state.scoresQuery.data = [];

    renderPage();

    expect(
      screen.getByText(
        "No job advertisements found. Add a job ad first to compute ATS scores."
      )
    ).toBeInTheDocument();
  });
});
