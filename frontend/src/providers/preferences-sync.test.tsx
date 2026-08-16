import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import PreferencesSync from "./preferences-sync";

const { i18nMock } = vi.hoisted(() => ({
  i18nMock: { language: "en", changeLanguage: vi.fn() },
}));

const { themeState } = vi.hoisted(() => ({
  themeState: { mode: "light", toggleTheme: vi.fn() },
}));

const { authState } = vi.hoisted(() => ({
  authState: { user: null as Record<string, unknown> | null },
}));

vi.mock("@/context/use-auth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/theme/theme-context", () => ({
  useThemeController: () => themeState,
}));

vi.mock("@/i18n/config", () => ({
  default: i18nMock,
}));

describe("PreferencesSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    i18nMock.language = "en";
    themeState.mode = "light";
  });

  it("renders nothing", () => {
    const { container } = render(<PreferencesSync />);

    expect(container).toBeEmptyDOMElement();
  });

  it("calls changeLanguage when the user language preference differs", () => {
    authState.user = { languagePreference: "hi" };

    render(<PreferencesSync />);

    expect(i18nMock.changeLanguage).toHaveBeenCalledWith("hi");
  });

  it("does not change language when the preferences match", () => {
    authState.user = { languagePreference: "en" };

    render(<PreferencesSync />);

    expect(i18nMock.changeLanguage).not.toHaveBeenCalled();
  });

  it("does not change language when no preference is set", () => {
    authState.user = {};

    render(<PreferencesSync />);

    expect(i18nMock.changeLanguage).not.toHaveBeenCalled();
  });

  it("toggles the theme when the user theme preference differs", () => {
    authState.user = { themePreference: "dark" };

    render(<PreferencesSync />);

    expect(themeState.toggleTheme).toHaveBeenCalled();
  });

  it("does not toggle the theme when the preferences match", () => {
    themeState.mode = "dark";
    authState.user = { themePreference: "dark" };

    render(<PreferencesSync />);

    expect(themeState.toggleTheme).not.toHaveBeenCalled();
  });
});
