import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuth } from "./use-auth";
import { AuthContext } from "./auth-provider";
import { type ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: {
          userId: "1",
          name: "Test User",
          email: "test@test.com",
          role: "user",
          isEmailVerified: true,
          is2faEnabled: false,
          isEmailNotificationsEnabled: true,
        },
        isAuthenticated: true,
        // isEmailVerified: true,
        logout: vi.fn(),
        isAuthReady: true,
        updateProfile: vi.fn(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function TestConsumer() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="email">{user?.email}</span>
      <span data-testid="is-auth">{String(isAuthenticated)}</span>
    </div>
  );
}

describe("useAuth", () => {
  it("returns auth context values when used inside AuthProvider", () => {
    render(<TestConsumer />, { wrapper: Wrapper });

    expect(screen.getByTestId("email")).toHaveTextContent("test@test.com");
    expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
  });

  it("throws error when used outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

    function BadConsumer() {
      useAuth();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      "useAuth must be used within AuthProvider"
    );

    consoleSpy.mockRestore();
  });
});
