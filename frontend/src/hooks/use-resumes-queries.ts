import { useMutation, useQuery } from "@tanstack/react-query";
import {
  listResumeTemplatesApi,
  listGeneratedResumesApi,
  generateResumeApi,
  fetchResumePreviewApi,
  getPreviewUrl,
  getDownloadUrl,
} from "@/api/resumes-api";
import { queryKeys } from "./query-keys";

// ─── Queries ────────────────────────────────────────────

export function useResumeTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.templates(),
    queryFn: listResumeTemplatesApi,
  });
}

export function useGeneratedResumesQuery(jobAdId?: string) {
  return useQuery({
    queryKey: jobAdId
      ? queryKeys.resumes.byJob(jobAdId)
      : queryKeys.resumes.list(),
    queryFn: () => listGeneratedResumesApi(jobAdId),
  });
}

export function useGeneratedResumesByJobQuery(
  jobAdId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.resumes.byJob(jobAdId ?? ""),
    queryFn: () => listGeneratedResumesApi(jobAdId),
    enabled: enabled && !!jobAdId,
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useGenerateResumeMutation() {
  return useMutation({
    mutationFn: generateResumeApi,
  });
}

// ─── Helpers ────────────────────────────────────────────

export { getPreviewUrl, getDownloadUrl, fetchResumePreviewApi };
