import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { GeneratedResume } from "@/api/resumes-api";

import PastResumesPage from "./past-resumes-page";

vi.setConfig({ testTimeout: 30000 });

const mockNavigate = vi.hoisted(() => vi.fn());

const state = vi.hoisted(() => ({
  jobs: [] as { id: string; title: string }[],
  all: [] as GeneratedResume[],
  byJob: {} as Record<string, GeneratedResume[]>,
  isLoading: false,
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

vi.mock("@/hooks/use-job-ads-queries", () => ({
  useJobAdsQuery: () => ({ data: state.jobs, isLoading: false }),
}));

vi.mock("@/hooks/use-resumes-queries", () => ({
  useGeneratedResumesQuery: (jobAdId?: string) => ({
    data: jobAdId ? state.byJob[jobAdId] : state.all,
    isLoading: state.isLoading,
  }),
  getPreviewUrl: (id: string) => "/preview/" + id,
  getDownloadUrl: (id: string) => "/download/" + id,
}));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/data-display/empty-state", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}));

const defaultJobs = [
  { id: "job1", title: "Frontend Engineer" },
  { id: "job2", title: "Backend Engineer" },
];

const defaultResumes: GeneratedResume[] = [
  {
    id: "r1",
    jobAdId: "job1",
    resumeTemplateId: "t1",
    jobAdvertisement: { title: "Frontend Engineer" },
    resumeTemplate: { name: "Modern" },
    filename: "my-resume.pdf",
    atsScore: 82,
    generatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "r2",
    jobAdId: null,
    resumeTemplateId: "t2",
    jobAdvertisement: null,
    resumeTemplate: null,
    filename: null,
    atsScore: 0,
    generatedAt: "2025-01-02T00:00:00Z",
  },
];

function renderPage(initialEntries = ["/resumes/history"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PastResumesPage />
    </MemoryRouter>
  );
}

describe("PastResumesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    state.jobs = [...defaultJobs];
    state.all = [...defaultResumes];
    state.byJob = { job1: [defaultResumes[0]] };
    state.isLoading = false;
  });

  it("lists all generated resumes with fallback titles, template names, and ATS scores", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Past Resumes" })
    ).toBeInTheDocument();
    expect(screen.getByText("my-resume.pdf")).toBeInTheDocument();
    expect(screen.getByText("Untitled Resume")).toBeInTheDocument();
    expect(screen.getByText("Modern")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("ATS: 82")).toBeInTheDocument();
    expect(screen.getByText("General Purpose")).toBeInTheDocument();
    expect(screen.queryByText("ATS: 0")).not.toBeInTheDocument();
    expect(screen.getByText("2 resumes generated")).toBeInTheDocument();
  });

  it("shows the job title in the header and a filter chip when filtered", () => {
    renderPage(["/resumes/history?jobAdId=job1"]);

    expect(
      screen.getByRole("heading", { name: "Resumes for Frontend Engineer" })
    ).toBeInTheDocument();
    expect(screen.getByText("Job: Frontend Engineer")).toBeInTheDocument();
  });

  it("clears the job filter when Show all resumes is clicked", async () => {
    const user = userEvent.setup();
    renderPage(["/resumes/history?jobAdId=job1"]);

    await user.click(screen.getByRole("button", { name: "Show all resumes" }));

    expect(
      await screen.findByRole("heading", { name: "Past Resumes" })
    ).toBeInTheDocument();
  });

  it("shows a filtered empty state when no resumes match the job", () => {
    state.byJob = { job1: [] };
    renderPage(["/resumes/history?jobAdId=job1"]);

    expect(
      screen.getByText("No resumes generated for this job advertisement yet.")
    ).toBeInTheDocument();
  });

  it("shows a generic empty state when there are no resumes", () => {
    state.all = [];
    renderPage();

    expect(
      screen.getByText("No resumes generated yet. Generate your first resume to see it here.")
    ).toBeInTheDocument();
  });

  it("links preview and download actions to the resume urls", () => {
    renderPage();

    const downloadLinks = screen.getAllByRole("link", { name: /download/i });
    expect(downloadLinks[0]).toHaveAttribute("href", "/download/r1");
    expect(downloadLinks[1]).toHaveAttribute("href", "/download/r2");

    const previewLinks = screen.getAllByRole("link", { name: "Open in new tab" });
    expect(previewLinks[0]).toHaveAttribute("href", "/preview/r1");
    expect(previewLinks[1]).toHaveAttribute("href", "/preview/r2");
  });

  it("navigates to resume generation when Generate New is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Generate New" }));

    expect(mockNavigate).toHaveBeenCalledWith("/resumes");
  });

  it("navigates to resume generation with the job id when filtered", async () => {
    const user = userEvent.setup();
    renderPage(["/resumes/history?jobAdId=job1"]);

    await user.click(screen.getByRole("button", { name: "Generate New" }));

    expect(mockNavigate).toHaveBeenCalledWith("/resumes?jobAdId=job1");
  });
});
