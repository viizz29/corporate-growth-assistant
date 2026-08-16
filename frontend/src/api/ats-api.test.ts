import { describe, it, expect, vi, beforeEach } from "vitest";

import { computeAtsScoreApi, getAtsScoreApi, listAtsScoresApi } from "./ats-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("ats-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computeAtsScoreApi sends POST with jobAdId", async () => {
    const score = { atsScore: 85, jobAdId: "job1" };
    mockApi.post.mockResolvedValue({ data: score });

    const result = await computeAtsScoreApi("job1");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/ats/score", {
      jobAdId: "job1",
    });
    expect(result).toEqual(score);
  });

  it("getAtsScoreApi sends GET to score endpoint with id", async () => {
    const score = { atsScore: 70, jobAdId: "job1" };
    mockApi.get.mockResolvedValue({ data: score });

    const result = await getAtsScoreApi("job1");

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/ats/score/job1");
    expect(result).toEqual(score);
  });

  it("listAtsScoresApi sends GET to scores endpoint", async () => {
    const scores = [{ atsScore: 70 }, { atsScore: 40 }];
    mockApi.get.mockResolvedValue({ data: scores });

    const result = await listAtsScoresApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/ats/scores");
    expect(result).toEqual(scores);
  });

  it("propagates errors from the api client", async () => {
    mockApi.post.mockRejectedValue(new Error("Network Error"));

    await expect(computeAtsScoreApi("job1")).rejects.toThrow("Network Error");
  });
});
