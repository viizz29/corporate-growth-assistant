import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getContactDetailApi,
  updateContactDetailApi,
  type ContactDetailInput,
} from "@/api/contact-details-api";

import { queryKeys } from "./query-keys";

// ─── Queries ────────────────────────────────────────────

export function useContactDetailsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.contactDetails(),
    queryFn: () => getContactDetailApi(),
    enabled: enabled,
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useUpdateContactDetailsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContactDetailInput>) =>
      updateContactDetailApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.contactDetails() });
    },
  });
}
