import { describe, it, expect } from "vitest";

import { getTheme } from "./theme";

describe("getTheme", () => {
  it("returns a light theme", () => {
    const theme = getTheme("light");

    expect(theme.palette.mode).toBe("light");
    expect(theme.palette.primary.main).toBe("#1976d2");
    expect(theme.palette.background.default).toBe("#f5f5f5");
    expect(theme.palette.background.paper).toBe("#ffffff");
    expect(theme.shape.borderRadius).toBe(12);
  });

  it("returns a dark theme", () => {
    const theme = getTheme("dark");

    expect(theme.palette.mode).toBe("dark");
    expect(theme.palette.primary.main).toBe("#90caf9");
    expect(theme.palette.background.default).toBe("#0f172a");
    expect(theme.palette.background.paper).toBe("#1e293b");
  });

  it("returns a stable theme object for the same mode", () => {
    expect(getTheme("light")).toBe(getTheme("light"));
    expect(getTheme("dark")).toBe(getTheme("dark"));
  });

  it("keeps typography and shape consistent across modes", () => {
    const light = getTheme("light");
    const dark = getTheme("dark");

    expect(light.typography.fontFamily).toBe(dark.typography.fontFamily);
    expect(light.shape.borderRadius).toBe(dark.shape.borderRadius);
    expect(light.components?.MuiButton?.styleOverrides?.root).toEqual(
      dark.components?.MuiButton?.styleOverrides?.root,
    );
  });
});
