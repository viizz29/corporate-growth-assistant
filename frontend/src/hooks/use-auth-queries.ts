import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfileApi,
  updateProfileApi,
  getEmailPreferencesApi,
  updateEmailPreferencesApi,
  loginApi,
  registerApi,
  forgotPasswordApi,
  resetPasswordApi,
  verifyEmailApi,
  resendEmailVerificationLink,
  verifyOtpLoginApi,
  toggle2faApi,
  logoutApi,
  type UserProfileInfo,
  type EmailPreferences,
} from "@/api/auth-api";
import { queryKeys } from "./query-keys";

// ─── Queries ────────────────────────────────────────────

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: getProfileApi,
  });
}

export function useEmailPreferencesQuery() {
  return useQuery({
    queryKey: queryKeys.auth.emailPreferences(),
    queryFn: getEmailPreferencesApi,
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.profile(), data);
    },
  });
}

export function useUpdateEmailPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmailPreferencesApi,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.emailPreferences(), data);
    },
  });
}

export function useToggle2faMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggle2faApi,
    onSuccess: (_data, enabled) => {
      queryClient.setQueryData<UserProfileInfo | undefined>(
        queryKeys.auth.profile(),
        (prev) => (prev ? { ...prev, is2faEnabled: enabled } : prev),
      );
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => registerApi(name, email, password),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPasswordApi,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) => resetPasswordApi(token, password),
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: verifyEmailApi,
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: resendEmailVerificationLink,
  });
}

export function useVerifyOtpLoginMutation() {
  return useMutation({
    mutationFn: ({
      tempToken,
      otp,
    }: {
      tempToken: string;
      otp: string;
    }) => verifyOtpLoginApi(tempToken, otp),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      queryClient.clear();
    },
  });
}
