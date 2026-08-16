import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

import {
  listResumeTemplatesApi,
  listGeneratedResumesApi,
  generateResumeApi,
  type ResumeTemplate,
  type ResumeGenerateRequest,
  type GeneratedResume,
} from "@/api/resumes-api";

import {
  useResumeTemplatesQuery,
  useGeneratedResumesQuery,
  useGeneratedResumesByJobQuery,
  useGenerateResumeMutation,
} from "./use-resumes-queries";
import { queryKeys } from "./query-keys";

vi.mock("@/api/resumes-api", () => ({
  listResumeTemplatesApi: vi.fn(),
  listGeneratedResumesApi: vi.fn(),
  generateResumeApi: vi.fn(),
  fetchResumePreviewApi: vi.fn(),
  getPreviewUrl: vi.fn(),
  getDownloadUrl: vi.fn(),
}));

const mockListResumeTemplatesApi = vi.mocked(listResumeTemplatesApi);
const mockListGeneratedResumesApi = vi.mocked(listGeneratedResumesApi);
const mockGenerateResumeApi = vi.mocked(generateResumeApi);

const template: ResumeTemplate = {
  id: "t1",
  name: "Modern",
  language: "en",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const resume: GeneratedResume = {
  id: "r1",
  jobAdId: "j1",
  resumeTemplateId: "t1",
  jobAdvertisement: { title: "Frontend Engineer" },
  resumeTemplate: { name: "Modern" },
  filename: "resume.pdf",
  atsScore: 80,
  generatedAt: "2026-01-01T00:00:00Z",
};

const request: ResumeGenerateRequest = {
  jobAdId: "j1",
  resumeTemplateId: "t1",
  language: "en",
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

describe("useResumeTemplatesQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the resume templates", async () => {
    mockListResumeTemplatesApi.mockResolvedValue([template]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useResumeTemplatesQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([template]));
    expect(mockListResumeTemplatesApi).toHaveBeenCalledTimes(1);
  });
});

describe("useGeneratedResumesQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all generated resumes with the list key when no jobAdId is given", async () => {
    mockListGeneratedResumesApi.mockResolvedValue([resume]);
    const { queryClient, wrapper } = makeWrapper();
    const { result } = renderHook(() => useGeneratedResumesQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([resume]));
    expect(mockListGeneratedResumesApi).toHaveBeenCalledWith(undefined);
    expect(queryClient.getQueryData(queryKeys.resumes.list())).toEqual([resume]);
  });

  it("fetches generated resumes with the byJob key when a jobAdId is given", async () => {
    mockListGeneratedResumesApi.mockResolvedValue([resume]);
    const { queryClient, wrapper } = makeWrapper();
    const { result } = renderHook(() => useGeneratedResumesQuery("j1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual([resume]));
    expect(mockListGeneratedResumesApi).toHaveBeenCalledWith("j1");
    expect(queryClient.getQueryData(queryKeys.resumes.byJob("j1"))).toEqual([
      resume,
    ]);
  });
});

describe("useGeneratedResumesByJobQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches generated resumes for the job ad when enabled", async () => {
    mockListGeneratedResumesApi.mockResolvedValue([resume]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useGeneratedResumesByJobQuery("j1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual([resume]));
    expect(mockListGeneratedResumesApi).toHaveBeenCalledWith("j1");
  });

  it("does not run when jobAdId is undefined", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useGeneratedResumesByJobQuery(undefined), {
      wrapper,
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(mockListGeneratedResumesApi).not.toHaveBeenCalled();
  });
});

describe("useGenerateResumeMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the request through to generateResumeApi", async () => {
    mockGenerateResumeApi.mockResolvedValue({
      previewId: "p1",
      filename: "resume.pdf",
      atsScore: 80,
      generatedAt: "2026-01-01T00:00:00Z",
    });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useGenerateResumeMutation(), { wrapper });

    result.current.mutate(request);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGenerateResumeApi).toHaveBeenCalledWith(request, expect.anything());
  });
});
