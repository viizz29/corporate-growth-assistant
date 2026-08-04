import { useMutation, useQuery } from "@tanstack/react-query";
import {
  listResumeTemplatesApi,
  listGeneratedResumesApi,
  generateResumeApi,
  fetchResumePreviewApi,
  getPreviewUrl,
} from "@/api/resumes-api";
import { queryKeys } from "./query-keys";

// ─── Queries ────────────────────────────────────────────

export function useResumeTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.templates(),
    queryFn: listResumeTemplatesApi,
  });
}

export function useGeneratedResumesQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.list(),
    queryFn: listGeneratedResumesApi,
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useGenerateResumeMutation() {
  return useMutation({
    mutationFn: generateResumeApi,
  });
}

// ─── Helpers ────────────────────────────────────────────

export { getPreviewUrl, fetchResumePreviewApi };
