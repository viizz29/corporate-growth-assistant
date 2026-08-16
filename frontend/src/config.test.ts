import { describe, it, expect, vi, afterEach } from "vitest";

describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses fallback values when env vars are not set", async () => {
    vi.stubEnv("VITE_APP_NAME", "");
    vi.stubEnv("VITE_MOCK_API_ON", "");
    vi.stubEnv("VITE_BACKEND_SERVER", "");
    vi.stubEnv("VITE_API_BASE_URL", "");
    vi.stubEnv("VITE_SOCKETIO_ENABLED", "");
    vi.stubEnv("VITE_SOCKETIO_ENDPOINT", "");

    vi.resetModules();
    const config = await import("./config");

    expect(config.APP_NAME).toBe("Corporate Growth Assistant");
    expect(config.MOCK_API_ON).toBe(false);
    expect(config.BACKEND_SERVER).toBe("http://localhost:3000");
    expect(config.API_BASE_URL).toBe("");
    expect(config.SOCKETIO_ENABLED).toBe(false);
    expect(config.SOCKETIO_ENDPOINT).toBe("/ws");
  });

  it("uses env values when provided", async () => {
    vi.stubEnv("VITE_APP_NAME", "My App");
    vi.stubEnv("VITE_MOCK_API_ON", "true");
    vi.stubEnv("VITE_BACKEND_SERVER", "http://api.example.com");
    vi.stubEnv("VITE_API_BASE_URL", "/api");
    vi.stubEnv("VITE_SOCKETIO_ENABLED", "true");
    vi.stubEnv("VITE_SOCKETIO_ENDPOINT", "http://sock.example.com");

    vi.resetModules();
    const config = await import("./config");

    expect(config.APP_NAME).toBe("My App");
    expect(config.MOCK_API_ON).toBe(true);
    expect(config.BACKEND_SERVER).toBe("http://api.example.com");
    expect(config.API_BASE_URL).toBe("/api");
    expect(config.SOCKETIO_ENABLED).toBe(true);
    expect(config.SOCKETIO_ENDPOINT).toBe("http://sock.example.com");
  });

  it("treats non-'true' boolean env values as false", async () => {
    vi.stubEnv("VITE_MOCK_API_ON", "1");
    vi.stubEnv("VITE_SOCKETIO_ENABLED", "yes");

    vi.resetModules();
    const config = await import("./config");

    expect(config.MOCK_API_ON).toBe(false);
    expect(config.SOCKETIO_ENABLED).toBe(false);
  });
});
