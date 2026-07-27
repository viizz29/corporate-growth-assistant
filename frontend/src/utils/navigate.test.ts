import { describe, it, expect, vi, beforeEach } from "vitest";
import { setNavigate, navigate, clearAuthAndRedirect } from "./navigate";

describe("navigate utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("setNavigate stores the navigate function", () => {
    const mockNavigateFn = vi.fn();
    setNavigate(mockNavigateFn);
    navigate("/test");
    expect(mockNavigateFn).toHaveBeenCalledWith("/test");
  });

  it("navigate falls back to window.location.href when no navigateFn is set", () => {
    setNavigate(null as any);
    const spy = vi.spyOn(window, "location", "get").mockReturnValue({
      href: "",
    } as Location);
    navigate("/fallback");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("clearAuthAndRedirect navigates to login", () => {
    const mockNavigateFn = vi.fn();
    setNavigate(mockNavigateFn);

    clearAuthAndRedirect();

    expect(mockNavigateFn).toHaveBeenCalledWith("/login");
  });
});
