import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "./client";

describe("API client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an axios instance with correct baseURL", () => {
    expect(api).toBeDefined();
    expect(api.defaults.baseURL).toBeDefined();
  });

  it("does not set a default Content-Type header", () => {
    expect(api.defaults.headers["Content-Type"]).toBeUndefined();
  });

  it("sets withCredentials to true", () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("does not redirect on 401 response", async () => {
    const spy = vi.spyOn(window, "location", "get").mockReturnValue({
      href: "",
    } as Location);
    const error = { response: { status: 401 } };

    try {
      await api.interceptors.response.handlers![0].rejected!(error);
    } catch {
      // expected rejection
    }

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not redirect on non-401 error", async () => {
    const spy = vi.spyOn(window, "location", "get").mockReturnValue({
      href: "",
    } as Location);
    const error = { response: { status: 500 } };

    try {
      await api.interceptors.response.handlers![0].rejected!(error);
    } catch {
      // expected rejection
    }

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("rejects the promise on error", async () => {
    const error = { response: { status: 500 }, message: "Server Error" };

    await expect(
      api.interceptors.response.handlers![0].rejected!(error)
    ).rejects.toEqual(error);
  });
});
