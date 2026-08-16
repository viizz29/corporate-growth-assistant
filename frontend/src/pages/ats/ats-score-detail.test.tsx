import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { AtsScore } from "@/api/ats-api";
import type { JobAd } from "@/api/job-ads-api";
import type { GeneratedResume } from "@/api/resumes-api";

import AtsScoreDetailPage from "./ats-score-detail";

vi.setConfig({ testTimeout: 60000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const resumeUrls = vi.hoisted(() => ({
  getPreviewUrl: vi.fn((id: string) => `/preview/${id}`),
  getDownloadUrl: vi.fn((id: string) => `/download/${id}`),
}));

const routerState = vi.hoisted(() => ({
  params: {} as Record<string, string | undefined>,
}));

const state = vi.hoisted(() => ({
  jobQuery: { data: undefined as JobAd | undefined, isLoading: false },
  scoreQuery: {
    data: undefined as AtsScore | undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
  },
  computeMutation: { mutate: vi.fn(), isPending: false, isError: false },
  resumesQuery: { data: undefined as GeneratedResume[] | undefined, isLoading: false },
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
  default: ({ title }: { title: string }) => (
    <div data-testid="page-header">{title}</div>
  ),
}));

vi.mock("@/hooks/use-job-ads-queries", () => ({
  useJobAdQuery: () => state.jobQuery,
}));

vi.mock("@/hooks/use-ats-queries", () => ({
  useAtsScoreQuery: () => state.scoreQuery,
  useComputeAtsScoreMutation: () => state.computeMutation,
}));

vi.mock("@/hooks/use-resumes-queries", () => ({
  useGeneratedResumesByJobQuery: () => state.resumesQuery,
  getPreviewUrl: resumeUrls.getPreviewUrl,
  getDownloadUrl: resumeUrls.getDownloadUrl,
}));

const job: JobAd = {
  id: "1",
  title: "Frontend Engineer",
  description: "Build UI",
  requirements: "React",
  location: "Mumbai",
  language: "en",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

function makeScore(overrides: Partial<AtsScore>): AtsScore {
  return {
    userId: "u1",
    jobAdId: "1",
    atsScore: 85,
    recommendations: [],
    aiFeedback: null,
    computedAt: "2026-08-01T00:00:00Z",
    atsThreshold: 40,
    ...overrides,
  };
}

const generatedResume: GeneratedResume = {
  id: "r1",
  jobAdId: "1",
  resumeTemplateId: "t1",
  jobAdvertisement: { title: "Frontend Engineer" },
  resumeTemplate: { name: "Modern" },
  filename: null,
  atsScore: 80,
  generatedAt: "2026-08-01T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/ats/1"]}>
      <AtsScoreDetailPage />
    </MemoryRouter>
  );
}

describe("AtsScoreDetailPage", () => {
  beforeEach(() => {
    routerState.params = { jobAdId: "1" };
    state.jobQuery.data = job;
    state.jobQuery.isLoading = false;
    state.scoreQuery.data = undefined;
    state.scoreQuery.isLoading = false;
    state.scoreQuery.isError = false;
    state.scoreQuery.isFetching = false;
    state.computeMutation.mutate = vi.fn();
    state.computeMutation.isPending = false;
    state.computeMutation.isError = false;
    state.resumesQuery.data = [];
    state.resumesQuery.isLoading = false;
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    resumeUrls.getPreviewUrl.mockClear();
    resumeUrls.getDownloadUrl.mockClear();
  });

  it("navigates back to the ats list when there is no job ad id", () => {
    routerState.params = {};

    renderPage();

    expect(mockNavigate).toHaveBeenCalledWith("/ats");
  });

  it("renders skeleton placeholders while the page is loading", () => {
    state.jobQuery.isLoading = true;
    const { container } = renderPage();

    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("computes a score automatically when the score query errors", () => {
    state.scoreQuery.isError = true;
    state.scoreQuery.isFetching = false;

    renderPage();

    expect(state.computeMutation.mutate).toHaveBeenCalledTimes(1);
    expect(state.computeMutation.mutate).toHaveBeenCalledWith("1");
    expect(
      screen.getByText("No ATS score available for this job ad.")
    ).toBeInTheDocument();
  });

  it("renders the score ring with a green indicator and success status for high scores", () => {
    state.scoreQuery.data = makeScore({ atsScore: 85 });
    const { container } = renderPage();

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(
      screen.getByText("Great match! Your profile is well-aligned with this job.")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".MuiLinearProgress-colorSuccess")
    ).toBeInTheDocument();
  });

  it("renders an amber indicator and moderate status for medium scores", () => {
    state.scoreQuery.data = makeScore({ atsScore: 50 });
    const { container } = renderPage();

    expect(
      screen.getByText("Moderate match. See recommendations below to improve.")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".MuiLinearProgress-colorWarning")
    ).toBeInTheDocument();
  });

  it("renders a red indicator and low status for low scores", () => {
    state.scoreQuery.data = makeScore({ atsScore: 25 });
    const { container } = renderPage();

    expect(
      screen.getByText("Low match. Review the recommendations to strengthen your profile.")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".MuiLinearProgress-colorError")
    ).toBeInTheDocument();
  });

  it("shows an optimized alert when there are no recommendations", () => {
    state.scoreQuery.data = makeScore({ recommendations: [] });

    renderPage();

    expect(
      screen.getByText("No recommendations — your profile is optimized for this job!")
    ).toBeInTheDocument();
  });

  it("renders recommendation rows with message, type and details", () => {
    state.scoreQuery.data = makeScore({
      recommendations: [
        { type: "skill", message: "Add more React experience", details: "Focus on hooks" },
      ],
    });

    renderPage();

    expect(screen.getByText("Add more React experience")).toBeInTheDocument();
    expect(screen.getByText("skill")).toBeInTheDocument();
    expect(screen.getByText("Focus on hooks")).toBeInTheDocument();
  });

  it("shows an info alert when ai feedback is absent", () => {
    state.scoreQuery.data = makeScore({ aiFeedback: null });

    renderPage();

    expect(
      screen.getByText(
        "AI feedback is not available for this score. It is generated when a scoring service is configured."
      )
    ).toBeInTheDocument();
  });

  it("renders ai feedback sections when present", () => {
    state.scoreQuery.data = makeScore({
      aiFeedback: {
        currentScore: 85,
        summary: "Strong technical profile",
        strengths: ["Solid React fundamentals"],
        weaknesses: [],
        improvementAreas: [{ area: "System design", detail: "Add more depth" }],
        skillRecommendations: [],
        projectSuggestions: [],
      },
    });

    renderPage();

    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Strong technical profile")).toBeInTheDocument();
    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.getByText("Solid React fundamentals")).toBeInTheDocument();
    expect(screen.getByText("Weaknesses")).toBeInTheDocument();
    expect(screen.getByText("No weaknesses identified.")).toBeInTheDocument();
    expect(screen.getByText("System design")).toBeInTheDocument();
  });

  it("renders skeleton placeholders while generated resumes load", () => {
    state.scoreQuery.data = makeScore({});
    state.resumesQuery.isLoading = true;
    const { container } = renderPage();

    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows an alert when no resumes have been generated", () => {
    state.scoreQuery.data = makeScore({});
    state.resumesQuery.data = [];

    renderPage();

    expect(
      screen.getByText("No resumes generated for this job advertisement yet.")
    ).toBeInTheDocument();
  });

  it("renders generated resume rows with template, ats chip and preview and download links", () => {
    state.scoreQuery.data = makeScore({});
    state.resumesQuery.data = [generatedResume];

    renderPage();

    expect(screen.getByText("Untitled Resume")).toBeInTheDocument();
    expect(screen.getByText("Modern")).toBeInTheDocument();
    expect(screen.getByText("ATS: 80")).toBeInTheDocument();

    const previewLink = screen.getByRole("link", { name: /open in new tab/i });
    expect(previewLink).toHaveAttribute("href", "/preview/r1");

    const downloadLink = screen.getByRole("link", { name: /download/i });
    expect(downloadLink).toHaveAttribute("href", "/download/r1");

    expect(resumeUrls.getPreviewUrl).toHaveBeenCalledWith("r1");
    expect(resumeUrls.getDownloadUrl).toHaveBeenCalledWith("r1");
  });

  it("recomputes the score and shows a success toast", async () => {
    const user = userEvent.setup();
    state.computeMutation.mutate = vi.fn(
      (_jobId: string, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    );
    state.scoreQuery.data = makeScore({});

    renderPage();

    await user.click(screen.getByRole("button", { name: "Recompute Score" }));

    expect(state.computeMutation.mutate).toHaveBeenCalledWith("1", expect.any(Object));
    expect(toastMock.success).toHaveBeenCalledWith("Score recomputed");
  });

  it("shows a recomputing label and disables the button while recomputing", () => {
    state.computeMutation.isPending = true;
    state.scoreQuery.data = makeScore({});

    renderPage();

    expect(screen.getByRole("button", { name: "Recomputing..." })).toBeDisabled();
  });

  it("renders the generate resume CTA when the score meets the threshold", () => {
    state.scoreQuery.data = makeScore({ atsScore: 85, atsThreshold: 40 });

    renderPage();

    expect(screen.getByText("Ready to generate your resume?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Resume" })).toBeInTheDocument();
  });

  it("hides the generate resume CTA when the score is below the threshold", () => {
    state.scoreQuery.data = makeScore({ atsScore: 30, atsThreshold: 40 });

    renderPage();

    expect(
      screen.queryByText("Ready to generate your resume?")
    ).not.toBeInTheDocument();
  });
});
