import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";

import App from "./App";

vi.mock("@/i18n/config", () => ({
  default: { language: "en", changeLanguage: vi.fn() },
}));

vi.mock("@/providers/preferences-sync", () => ({
  default: () => null,
}));

vi.mock("@/components/navigate-setter", () => ({
  default: () => null,
}));

vi.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@mui/x-date-pickers/AdapterDayjs", () => ({
  AdapterDayjs: {},
}));

vi.mock("react-toastify", () => ({
  ToastContainer: () => null,
  Slide: () => null,
}));

vi.mock("@mui/material", async () => {
  const { ThemeProvider } = await import("@mui/material/styles");
  const CssBaseline = (await import("@mui/material/CssBaseline")).default;
  const GlobalStyles = (await import("@mui/material/GlobalStyles")).default;
  const IconButton = (await import("@mui/material/IconButton")).default;
  const Tooltip = (await import("@mui/material/Tooltip")).default;
  return { ThemeProvider, CssBaseline, GlobalStyles, IconButton, Tooltip };
});

vi.mock("@/routes/app-routes", async () => {
  const { ThemeToggleButton } = await vi.importActual<
    typeof import("@/components/layouts/theme-toggle-button")
  >("@/components/layouts/theme-toggle-button");
  return {
    default: () => (
      <div>
        <div data-testid="routes">routes</div>
        <ThemeToggleButton />
      </div>
    ),
  };
});

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
  });

  it("renders the routes within the app shell", () => {
    render(<App />);

    expect(screen.getByTestId("routes")).toBeInTheDocument();
  });

  it("initializes light theme when no dark preference is stored", () => {
    render(<App />);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("app-theme-mode")).toBe("light");
  });

  it("initializes dark theme from localStorage", () => {
    localStorage.setItem("app-theme-mode", "dark");

    render(<App />);

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("app-theme-mode")).toBe("dark");
  });

  it("toggles the theme and persists the new mode", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    await user.click(screen.getByRole("button"));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("app-theme-mode")).toBe("dark");

    await user.click(screen.getByRole("button"));

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("app-theme-mode")).toBe("light");
  });
});
