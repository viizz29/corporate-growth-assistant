import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

import {
  listJobAdsApi,
  getJobAdApi,
  createJobAdApi,
  updateJobAdApi,
  deleteJobAdApi,
  type JobAd,
  type JobAdInput,
} from "@/api/job-ads-api";

import {
  useJobAdsQuery,
  useJobAdQuery,
  useCreateJobAdMutation,
  useUpdateJobAdMutation,
  useDeleteJobAdMutation,
} from "./use-job-ads-queries";
import { queryKeys } from "./query-keys";

vi.mock("@/api/job-ads-api", () => ({
  listJobAdsApi: vi.fn(),
  getJobAdApi: vi.fn(),
  createJobAdApi: vi.fn(),
  updateJobAdApi: vi.fn(),
  deleteJobAdApi: vi.fn(),
}));

const mockListJobAdsApi = vi.mocked(listJobAdsApi);
const mockGetJobAdApi = vi.mocked(getJobAdApi);
const mockCreateJobAdApi = vi.mocked(createJobAdApi);
const mockUpdateJobAdApi = vi.mocked(updateJobAdApi);
const mockDeleteJobAdApi = vi.mocked(deleteJobAdApi);

const jobAd: JobAd = {
  id: "j1",
  title: "Frontend Engineer",
  description: "Build UIs",
  requirements: "React, TypeScript",
  location: "Remote",
  language: "en",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const jobAdInput: JobAdInput = {
  title: "Frontend Engineer",
  description: "Build UIs",
  requirements: "React, TypeScript",
  location: "Remote",
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

describe("useJobAdsQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all job ads", async () => {
    mockListJobAdsApi.mockResolvedValue([jobAd]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useJobAdsQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([jobAd]));
    expect(mockListJobAdsApi).toHaveBeenCalledTimes(1);
  });
});

describe("useJobAdQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the job ad when an id is provided", async () => {
    mockGetJobAdApi.mockResolvedValue(jobAd);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useJobAdQuery("j1"), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(jobAd));
    expect(mockGetJobAdApi).toHaveBeenCalledWith("j1");
  });

  it("does not run when id is undefined", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useJobAdQuery(undefined), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(mockGetJobAdApi).not.toHaveBeenCalled();
  });
});

describe("useCreateJobAdMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job ad and invalidates the job ads list on success", async () => {
    mockCreateJobAdApi.mockResolvedValue(jobAd);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.jobAds.list(), []);
    const { result } = renderHook(() => useCreateJobAdMutation(), { wrapper });

    result.current.mutate(jobAdInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateJobAdApi).toHaveBeenCalledWith(jobAdInput, expect.anything());
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.jobAds.list())?.isInvalidated).toBe(
        true,
      ),
    );
  });
});

describe("useUpdateJobAdMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the job ad with its id and data and invalidates the list on success", async () => {
    mockUpdateJobAdApi.mockResolvedValue({ ...jobAd, title: "New Title" });
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.jobAds.list(), []);
    const { result } = renderHook(() => useUpdateJobAdMutation("j1"), { wrapper });

    result.current.mutate({ title: "New Title" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateJobAdApi).toHaveBeenCalledWith("j1", { title: "New Title" });
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.jobAds.list())?.isInvalidated).toBe(
        true,
      ),
    );
  });
});

describe("useDeleteJobAdMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the job ad and invalidates the list on success", async () => {
    mockDeleteJobAdApi.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.jobAds.list(), []);
    const { result } = renderHook(() => useDeleteJobAdMutation(), { wrapper });

    result.current.mutate("j1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteJobAdApi).toHaveBeenCalledWith("j1", expect.anything());
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.jobAds.list())?.isInvalidated).toBe(
        true,
      ),
    );
  });
});
