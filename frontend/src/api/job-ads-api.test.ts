import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  listJobAdsApi,
  getJobAdApi,
  createJobAdApi,
  updateJobAdApi,
  deleteJobAdApi,
} from "./job-ads-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("job-ads-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listJobAdsApi sends GET to /api/v1/job-ads", async () => {
    const ads = [{ id: "1", title: "Engineer" }];
    mockApi.get.mockResolvedValue({ data: ads });

    const result = await listJobAdsApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/job-ads");
    expect(result).toEqual(ads);
  });

  it("getJobAdApi sends GET with id", async () => {
    const ad = { id: "7", title: "Engineer" };
    mockApi.get.mockResolvedValue({ data: ad });

    const result = await getJobAdApi("7");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/job-ads/7");
    expect(result).toEqual(ad);
  });

  it("createJobAdApi sends POST with input", async () => {
    const input = {
      title: "Engineer",
      description: "d",
      requirements: "r",
      language: "en" as const,
    };
    const created = { id: "9", ...input };
    mockApi.post.mockResolvedValue({ data: created });

    const result = await createJobAdApi(input);

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/job-ads", input);
    expect(result).toEqual(created);
  });

  it("updateJobAdApi sends PATCH with id and partial data", async () => {
    const updated = { id: "3", title: "Senior Engineer" };
    mockApi.patch.mockResolvedValue({ data: updated });

    const result = await updateJobAdApi("3", { title: "Senior Engineer" });

    expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/job-ads/3", {
      title: "Senior Engineer",
    });
    expect(result).toEqual(updated);
  });

  it("deleteJobAdApi sends DELETE with id", async () => {
    mockApi.delete.mockResolvedValue({});

    await deleteJobAdApi("5");

    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/job-ads/5");
  });
});
