import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  listResumeTemplatesApi,
  listGeneratedResumesApi,
  generateResumeApi,
  generateGeneralResumeApi,
  fetchResumePreviewApi,
  getPreviewUrl,
  getDownloadUrl,
} from "./resumes-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
vi.mock("@/config", () => ({
  API_BASE_URL: "/base",
  BACKEND_SERVER: "http://backend:3000",
}));

const mockApi = vi.mocked(api);

describe("resumes-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listResumeTemplatesApi sends GET to templates endpoint", async () => {
    const templates = [{ id: "t1", name: "Modern" }];
    mockApi.get.mockResolvedValue({ data: templates });

    const result = await listResumeTemplatesApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/resumes/templates");
    expect(result).toEqual(templates);
  });

  it("listGeneratedResumesApi omits params when jobAdId is not provided", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    await listGeneratedResumesApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/resumes", {
      params: undefined,
    });
  });

  it("listGeneratedResumesApi includes jobAdId param when provided", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    await listGeneratedResumesApi("job1");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/resumes", {
      params: { jobAdId: "job1" },
    });
  });

  it("generateResumeApi sends POST with request data", async () => {
    const request = { jobAdId: "j1", resumeTemplateId: "t1" };
    const response = { previewId: "p1", atsScore: 90 };
    mockApi.post.mockResolvedValue({ data: response });

    const result = await generateResumeApi(request);

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/resumes/generate", request);
    expect(result).toEqual(response);
  });

  it("generateGeneralResumeApi sends POST with request data", async () => {
    const request = { resumeTemplateId: "t1" };
    const response = { previewId: "p1", atsScore: 0 };
    mockApi.post.mockResolvedValue({ data: response });

    const result = await generateGeneralResumeApi(request);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/api/v1/resumes/generate-general",
      request
    );
    expect(result).toEqual(response);
  });

  it("fetchResumePreviewApi requests a blob", async () => {
    const blob = new Blob();
    mockApi.get.mockResolvedValue({ data: blob });

    const result = await fetchResumePreviewApi("p1");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/resumes/preview/p1", {
      responseType: "blob",
    });
    expect(result).toBe(blob);
  });

  it("getPreviewUrl builds URL from backend base when mock api is off", () => {
    vi.stubEnv("VITE_MOCK_API_ON", "false");

    expect(getPreviewUrl("p1")).toBe(
      "http://backend:3000/base/api/v1/resumes/preview/p1",
    );
  });

  it("getPreviewUrl returns relative URL when mock api is on", () => {
    vi.stubEnv("VITE_MOCK_API_ON", "true");

    expect(getPreviewUrl("p1")).toBe("/api/v1/resumes/preview/p1");
  });

  it("getDownloadUrl appends download flag", () => {
    vi.stubEnv("VITE_MOCK_API_ON", "false");

    expect(getDownloadUrl("p1")).toBe(
      "http://backend:3000/base/api/v1/resumes/preview/p1?download=1",
    );
  });
});
