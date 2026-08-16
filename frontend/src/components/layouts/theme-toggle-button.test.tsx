import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeContext } from "@/theme/theme-context";

import { ThemeToggleButton } from "./theme-toggle-button";

function renderToggle(mode: "light" | "dark", toggleTheme = vi.fn()) {
  return render(
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeToggleButton />
    </ThemeContext.Provider>
  );
}

describe("ThemeToggleButton", () => {
  it("renders LightModeIcon with light-mode tooltip when mode is dark", () => {
    renderToggle("dark");

    const button = screen.getByRole("button", { name: "Switch to light mode" });
    expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    expect(screen.getByTestId("LightModeIcon")).toBeInTheDocument();
    expect(screen.queryByTestId("DarkModeIcon")).not.toBeInTheDocument();
  });

  it("renders DarkModeIcon with dark-mode tooltip when mode is light", () => {
    renderToggle("light");

    const button = screen.getByRole("button", { name: "Switch to dark mode" });
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    expect(screen.getByTestId("DarkModeIcon")).toBeInTheDocument();
    expect(screen.queryByTestId("LightModeIcon")).not.toBeInTheDocument();
  });

  it("calls toggleTheme on click", async () => {
    const toggleTheme = vi.fn();
    const user = userEvent.setup();

    renderToggle("light", toggleTheme);

    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
