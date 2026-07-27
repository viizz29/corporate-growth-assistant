import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { AuthProvider, AuthContext } from "./auth-provider";
import { useContext } from "react";
import { renderWithClient } from "@/test-utils";

vi.mock("@/api/auth-api", () => ({
  getProfileApi: vi.fn().mockRejectedValue(new Error("Network")),
  logoutApi: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/utils/navigate", () => ({
  clearAuthAndRedirect: vi.fn(),
}));

function TestConsumer() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="is-auth-ready">{String(ctx?.isAuthReady)}</span>
      <span data-testid="is-authenticated">{String(ctx?.isAuthenticated)}</span>
      <span data-testid="user">{JSON.stringify(ctx?.user)}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders children after auth is ready with no stored token", async () => {
    renderWithClient(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-auth-ready")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
  });

  it("provides updateProfile function via context", async () => {
    let updateProfileFn: ((profile: any) => void) | undefined;

    function CaptureUpdateProfile() {
      const ctx = useContext(AuthContext);
      updateProfileFn = ctx?.updateProfile;
      return <div data-testid="ready">{String(ctx?.isAuthReady)}</div>;
    }

    renderWithClient(
      <AuthProvider>
        <CaptureUpdateProfile />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });

    expect(updateProfileFn).toBeDefined();
  });

  it("provides logout function via context", async () => {
    let logoutFn: (() => void) | undefined;

    function CaptureLogout() {
      const ctx = useContext(AuthContext);
      logoutFn = ctx?.logout;
      return <div data-testid="ready">{String(ctx?.isAuthReady)}</div>;
    }

    renderWithClient(
      <AuthProvider>
        <CaptureLogout />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });

    expect(logoutFn).toBeDefined();
  });
});
