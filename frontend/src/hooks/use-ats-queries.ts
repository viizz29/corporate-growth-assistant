import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAtsScoreApi,
  computeAtsScoreApi,
  listAtsScoresApi,
} from "@/api/ats-api";
import { queryKeys } from "./query-keys";

// ─── Queries ────────────────────────────────────────────

export function useAtsScoreQuery(jobAdId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ats.score(jobAdId ?? ""),
    queryFn: () => getAtsScoreApi(jobAdId!),
    enabled: enabled && !!jobAdId,
  });
}

export function useAtsScoresQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.ats.scores(),
    queryFn: listAtsScoresApi,
    enabled,
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useComputeAtsScoreMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: computeAtsScoreApi,
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.ats.score(data.jobAdId), data);
      qc.invalidateQueries({ queryKey: queryKeys.ats.scores() });
    },
  });
}
