import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

import {
  getProfileApi,
  updateProfileApi,
  toggle2faApi,
  logoutApi,
  loginApi,
  registerApi,
  resetPasswordApi,
  verifyOtpLoginApi,
  type UserProfileInfo,
} from "@/api/auth-api";

import {
  useProfileQuery,
  useUpdateProfileMutation,
  useToggle2faMutation,
  useLogoutMutation,
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useVerifyOtpLoginMutation,
} from "./use-auth-queries";
import { queryKeys } from "./query-keys";

vi.mock("@/api/auth-api", () => ({
  getProfileApi: vi.fn(),
  updateProfileApi: vi.fn(),
  getEmailPreferencesApi: vi.fn(),
  updateEmailPreferencesApi: vi.fn(),
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  forgotPasswordApi: vi.fn(),
  resetPasswordApi: vi.fn(),
  verifyEmailApi: vi.fn(),
  resendEmailVerificationLink: vi.fn(),
  verifyOtpLoginApi: vi.fn(),
  toggle2faApi: vi.fn(),
  logoutApi: vi.fn(),
}));

const mockGetProfileApi = vi.mocked(getProfileApi);
const mockUpdateProfileApi = vi.mocked(updateProfileApi);
const mockToggle2faApi = vi.mocked(toggle2faApi);
const mockLogoutApi = vi.mocked(logoutApi);
const mockLoginApi = vi.mocked(loginApi);
const mockRegisterApi = vi.mocked(registerApi);
const mockResetPasswordApi = vi.mocked(resetPasswordApi);
const mockVerifyOtpLoginApi = vi.mocked(verifyOtpLoginApi);

const profile: UserProfileInfo = {
  userId: "u1",
  name: "John",
  email: "john@test.com",
  role: "user",
  isEmailVerified: true,
  is2faEnabled: false,
  isEmailNotificationsEnabled: true,
};

function makeWrapper({ retry = false }: { retry?: number | boolean } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry, retryDelay: 0 },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

describe("useProfileQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the profile via getProfileApi", async () => {
    mockGetProfileApi.mockResolvedValue(profile);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useProfileQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(profile));
    expect(mockGetProfileApi).toHaveBeenCalledTimes(1);
  });

  it("does not retry when the server responds with 401", async () => {
    mockGetProfileApi.mockRejectedValue({ response: { status: 401 } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useProfileQuery(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(mockGetProfileApi).toHaveBeenCalledTimes(1);
  });

  it("retries up to 3 times when the server responds with 500", async () => {
    mockGetProfileApi.mockRejectedValue({ response: { status: 500 } });
    const { wrapper } = makeWrapper({ retry: 3 });
    const { result } = renderHook(() => useProfileQuery(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(mockGetProfileApi).toHaveBeenCalledTimes(4);
  });
});

describe("useUpdateProfileMutation", () => {
  it("writes the returned profile into the profile cache on success", async () => {
    const updated: UserProfileInfo = { ...profile, name: "Updated" };
    mockUpdateProfileApi.mockResolvedValue(updated);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.auth.profile(), profile);
    const { result } = renderHook(() => useUpdateProfileMutation(), { wrapper });

    result.current.mutate({ name: "Updated", email: "updated@test.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(queryKeys.auth.profile())).toEqual(updated);
  });
});

describe("useToggle2faMutation", () => {
  it("updates is2faEnabled in the profile cache on success", async () => {
    mockToggle2faApi.mockResolvedValue({ enabled: true });
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.auth.profile(), profile);
    const { result } = renderHook(() => useToggle2faMutation(), { wrapper });

    result.current.mutate(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const cached = queryClient.getQueryData<UserProfileInfo>(queryKeys.auth.profile());
    expect(cached?.is2faEnabled).toBe(true);
  });
});

describe("useLogoutMutation", () => {
  it("clears the entire query cache once settled", async () => {
    mockLogoutApi.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(["some", "key"], { value: 1 });
    const { result } = renderHook(() => useLogoutMutation(), { wrapper });

    result.current.mutate();

    await waitFor(() =>
      expect(queryClient.getQueryCache().getAll().length).toBe(0),
    );
    expect(mockLogoutApi).toHaveBeenCalledTimes(1);
  });
});

describe("useLoginMutation", () => {
  it("passes email and password to loginApi", async () => {
    mockLoginApi.mockResolvedValue({ token: "jwt" });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useLoginMutation(), { wrapper });

    result.current.mutate({ email: "a@b.com", password: "secret" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockLoginApi).toHaveBeenCalledWith("a@b.com", "secret");
  });
});

describe("useRegisterMutation", () => {
  it("passes name, email and password to registerApi", async () => {
    mockRegisterApi.mockResolvedValue({
      status: 201,
      statusText: "Created",
      headers: {},
      config: {},
      data: { message: "OK" },
    } as never);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useRegisterMutation(), { wrapper });

    result.current.mutate({ name: "John", email: "j@j.com", password: "secret" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRegisterApi).toHaveBeenCalledWith("John", "j@j.com", "secret");
  });
});

describe("useResetPasswordMutation", () => {
  it("passes token and password to resetPasswordApi", async () => {
    mockResetPasswordApi.mockResolvedValue({ message: "reset" });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useResetPasswordMutation(), { wrapper });

    result.current.mutate({ token: "tok123", password: "newpass" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockResetPasswordApi).toHaveBeenCalledWith("tok123", "newpass");
  });
});

describe("useVerifyOtpLoginMutation", () => {
  it("passes tempToken and otp to verifyOtpLoginApi", async () => {
    mockVerifyOtpLoginApi.mockResolvedValue({ token: "jwt" });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useVerifyOtpLoginMutation(), { wrapper });

    result.current.mutate({ tempToken: "temp-tok", otp: "123456" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockVerifyOtpLoginApi).toHaveBeenCalledWith("temp-tok", "123456");
  });
});
