import { useMutation, useQuery } from "@tanstack/react-query";
import {
  listResumeTemplatesApi,
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

// ─── Mutations ──────────────────────────────────────────

export function useGenerateResumeMutation() {
  return useMutation({
    mutationFn: generateResumeApi,
  });
}

// ─── Helpers ────────────────────────────────────────────

export { getPreviewUrl, fetchResumePreviewApi };
