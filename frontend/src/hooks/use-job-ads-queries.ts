import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listJobAdsApi,
  getJobAdApi,
  createJobAdApi,
  updateJobAdApi,
  deleteJobAdApi,
  type JobAdInput,
} from "@/api/job-ads-api";
import { queryKeys } from "./query-keys";

// ─── Queries ────────────────────────────────────────────

export function useJobAdsQuery() {
  return useQuery({
    queryKey: queryKeys.jobAds.list(),
    queryFn: listJobAdsApi,
  });
}

export function useJobAdQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobAds.detail(id ?? ""),
    queryFn: () => getJobAdApi(id!),
    enabled: enabled && !!id,
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useCreateJobAdMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createJobAdApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.jobAds.all }),
  });
}

export function useUpdateJobAdMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<JobAdInput>) => updateJobAdApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.jobAds.all });
    },
  });
}

export function useDeleteJobAdMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteJobAdApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.jobAds.all }),
  });
}
