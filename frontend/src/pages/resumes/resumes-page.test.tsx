import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import type { ResumeGenerateResponse } from "@/api/resumes-api";

import ResumesPage from "./resumes-page";

vi.setConfig({ testTimeout: 30000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  jobs: [] as { id: string; title: string }[],
  jobsLoading: false,
  templates: [] as {
    id: string;
    name: string;
    language: string;
    isActive: boolean;
  }[],
  templatesLoading: false,
  templatesFetching: false,
  score: null as null | { atsScore: number; atsThreshold: number },
  scoreLoading: false,
  generate: { mutate: vi.fn(), isPending: false },
  generateGeneral: { mutate: vi.fn(), isPending: false },
  fetchResumePreviewApi: vi.fn(),
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

vi.mock("@/hooks/use-job-ads-queries", () => ({
  useJobAdsQuery: () => ({
    data: state.jobs,
    isLoading: state.jobsLoading,
  }),
}));

vi.mock("@/hooks/use-resumes-queries", () => ({
  useResumeTemplatesQuery: () => ({
    data: state.templates,
    isLoading: state.templatesLoading,
    isFetching: state.templatesFetching,
  }),
  useGenerateResumeMutation: () => state.generate,
  useGenerateGeneralResumeMutation: () => state.generateGeneral,
  fetchResumePreviewApi: state.fetchResumePreviewApi,
  getPreviewUrl: (id: string) => "/preview/" + id,
  getDownloadUrl: (id: string) => "/download/" + id,
}));

vi.mock("@/hooks/use-ats-queries", () => ({
  useAtsScoreQuery: () => ({
    data: state.score,
    isLoading: state.scoreLoading,
  }),
}));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/data-display/empty-state", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}));

vi.mock("@/components/pdf-viewer/pdf-viewer", () => ({
  default: () => <div data-testid="pdf-viewer" />,
}));

const defaultJobs = [
  { id: "job1", title: "Frontend Engineer" },
  { id: "job2", title: "Backend Engineer" },
];
const defaultTemplates = [
  { id: "t1", name: "Modern", language: "en", isActive: true },
  { id: "t2", name: "Classic", language: "hi", isActive: true },
];
const defaultResponse: ResumeGenerateResponse = {
  previewId: "p1",
  filename: "resume.pdf",
  atsScore: 85,
  generatedAt: "2025-01-01T00:00:00Z",
};

function renderPage(initialEntries = ["/resumes"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ResumesPage />
    </MemoryRouter>
  );
}

describe("ResumesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    state.jobs = [...defaultJobs];
    state.jobsLoading = false;
    state.templates = [...defaultTemplates];
    state.templatesLoading = false;
    state.templatesFetching = false;
    state.score = { atsScore: 85, atsThreshold: 40 };
    state.scoreLoading = false;
    state.generate.isPending = false;
    state.generate.mutate = vi.fn(
      (
        _vars: { jobAdId: string; resumeTemplateId: string },
        opts?: { onSuccess?: (data: ResumeGenerateResponse) => void }
      ) => opts?.onSuccess?.(defaultResponse)
    );
    state.generateGeneral.isPending = false;
    state.generateGeneral.mutate = vi.fn(
      (
        _vars: { resumeTemplateId: string },
        opts?: { onSuccess?: (data: ResumeGenerateResponse) => void }
      ) => opts?.onSuccess?.(defaultResponse)
    );
    state.fetchResumePreviewApi.mockReset();
    state.fetchResumePreviewApi.mockResolvedValue(new Blob());
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:fake"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  it("auto-selects the first job advertisement and enables generation", async () => {
    renderPage();

    expect(
      await screen.findByText("Eligible to generate a resume for this job.")
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(
      screen.queryByText(/Resume generation requires an ATS score of at least/)
    ).not.toBeInTheDocument();
  });

  it("shows a footnote when the ATS score is below the threshold", async () => {
    state.score = { atsScore: 30, atsThreshold: 40 };
    renderPage();

    expect(
      await screen.findByText(/ATS score below 40\./)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Resume generation requires an ATS score of at least 40/)
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Eligible to generate a resume for this job.")
    ).not.toBeInTheDocument();
  });

  it("calls the generate mutation and shows a preview on success", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Eligible to generate a resume for this job.");

    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(state.generate.mutate).toHaveBeenCalledWith(
      { jobAdId: "job1", resumeTemplateId: "t1" },
      expect.anything()
    );
    expect(await screen.findByTestId("pdf-viewer")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Resume generated successfully");
  });

  it("generates a general purpose resume without a job ad or ATS score", async () => {
    state.jobs = [];
    state.score = null;
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole("button", { name: "General purpose" })
    );

    expect(
      screen.getByText(/A general purpose resume uses your full profile/)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(state.generateGeneral.mutate).toHaveBeenCalledWith(
      { resumeTemplateId: "t1" },
      expect.anything()
    );
    expect(await screen.findByTestId("pdf-viewer")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Resume generated successfully");
  });

  it("shows a loading state while the preview is being fetched", async () => {
    state.fetchResumePreviewApi.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Eligible to generate a resume for this job.");

    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(await screen.findByText("Loading preview...")).toBeInTheDocument();
  });

  it("shows a toast error when the preview fails to load", async () => {
    state.fetchResumePreviewApi.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Eligible to generate a resume for this job.");

    await user.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to load resume preview")
    );
    expect(screen.queryByTestId("pdf-viewer")).not.toBeInTheDocument();
  });

  it("navigates to resume history with the selected job id", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Eligible to generate a resume for this job.");

    await user.click(screen.getByRole("button", { name: "History" }));

    expect(mockNavigate).toHaveBeenCalledWith("/resumes/history?jobAdId=job1");
  });

  it("shows a warning when there are no resume templates", async () => {
    state.templates = [];
    renderPage();

    expect(
      await screen.findByText("No active resume templates were found on the server.")
    ).toBeInTheDocument();
  });
});
