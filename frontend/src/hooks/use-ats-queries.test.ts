import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

import {
  computeAtsScoreApi,
  getAtsScoreApi,
  listAtsScoresApi,
  type AtsScore,
} from "@/api/ats-api";

import {
  useAtsScoreQuery,
  useAtsScoresQuery,
  useComputeAtsScoreMutation,
} from "./use-ats-queries";
import { queryKeys } from "./query-keys";

vi.mock("@/api/ats-api", () => ({
  computeAtsScoreApi: vi.fn(),
  getAtsScoreApi: vi.fn(),
  listAtsScoresApi: vi.fn(),
}));

const mockComputeAtsScoreApi = vi.mocked(computeAtsScoreApi);
const mockGetAtsScoreApi = vi.mocked(getAtsScoreApi);
const mockListAtsScoresApi = vi.mocked(listAtsScoresApi);

const score: AtsScore = {
  userId: "u1",
  jobAdId: "job1",
  atsScore: 85,
  recommendations: [],
  aiFeedback: null,
  computedAt: "2026-01-01T00:00:00Z",
  atsThreshold: 70,
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

describe("useAtsScoreQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the ATS score for the given job ad", async () => {
    mockGetAtsScoreApi.mockResolvedValue(score);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAtsScoreQuery("job1"), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(score));
    expect(mockGetAtsScoreApi).toHaveBeenCalledWith("job1");
  });

  it("does not run when jobAdId is undefined", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAtsScoreQuery(undefined), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(mockGetAtsScoreApi).not.toHaveBeenCalled();
  });
});

describe("useAtsScoresQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all ATS scores", async () => {
    mockListAtsScoresApi.mockResolvedValue([score]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAtsScoresQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([score]));
    expect(mockListAtsScoresApi).toHaveBeenCalledTimes(1);
  });
});

describe("useComputeAtsScoreMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes the computed score into the per-job cache on success", async () => {
    mockComputeAtsScoreApi.mockResolvedValue(score);
    const { queryClient, wrapper } = makeWrapper();
    const { result } = renderHook(() => useComputeAtsScoreMutation(), { wrapper });

    result.current.mutate("job1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(queryKeys.ats.score("job1"))).toEqual(score);
  });

  it("invalidates the scores list on success", async () => {
    mockComputeAtsScoreApi.mockResolvedValue(score);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.ats.scores(), []);
    const { result } = renderHook(() => useComputeAtsScoreMutation(), { wrapper });

    result.current.mutate("job1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.ats.scores())?.isInvalidated).toBe(
        true,
      ),
    );
  });
});
