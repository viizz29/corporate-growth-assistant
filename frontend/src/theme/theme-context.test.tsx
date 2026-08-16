import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ThemeContext, useThemeController } from "./theme-context";

function ThemeConsumer() {
  const { mode, toggleTheme } = useThemeController();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button data-testid="toggle" onClick={toggleTheme} />
    </div>
  );
}

describe("ThemeContext", () => {
  it("defaults to light mode", () => {
    render(<ThemeConsumer />);
    expect(screen.getByTestId("mode")).toHaveTextContent("light");
  });

  it("provides the toggleTheme function from the context", () => {
    const toggleTheme = vi.fn();
    render(
      <ThemeContext.Provider value={{ mode: "dark", toggleTheme }}>
        <ThemeConsumer />
      </ThemeContext.Provider>,
    );

    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
    screen.getByTestId("toggle").click();
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
