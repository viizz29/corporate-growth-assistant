import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LanguageSwitcher from "./language-switcher";

const { i18nState, changeLanguage, mockGet, mockSet } = vi.hoisted(() => {
  const i18nState = { language: "en" };
  return {
    i18nState,
    changeLanguage: vi.fn((lang: string) => {
      i18nState.language = lang;
    }),
    mockGet: vi.fn(),
    mockSet: vi.fn(),
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: i18nState.language, changeLanguage },
  }),
}));

vi.mock("@/providers/local-storage-provider", () => ({
  useStorage: () => ({
    get: mockGet,
    set: mockSet,
    remove: vi.fn(),
    clear: vi.fn(),
  }),
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18nState.language = "en";
    mockGet.mockReturnValue(null);
  });

  it("renders select with en and hi options only", async () => {
    const user = userEvent.setup();

    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("combobox"));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Eng");
    expect(options[1]).toHaveTextContent("हिंदी");
  });

  it("loads persisted lang value on mount", async () => {
    mockGet.mockReturnValue("hi");

    const { rerender } = render(<LanguageSwitcher />);

    expect(changeLanguage).toHaveBeenCalledWith("hi");
    rerender(<LanguageSwitcher />);
    expect(screen.getByText("हिंदी")).toBeInTheDocument();
  });

  it("changes language and persists value on selection", async () => {
    const user = userEvent.setup();

    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "हिंदी" }));

    expect(changeLanguage).toHaveBeenCalledWith("hi");
    expect(mockSet).toHaveBeenCalledWith("lang", "hi");
  });

  it("defaults to en when nothing is stored", () => {
    render(<LanguageSwitcher />);

    expect(changeLanguage).toHaveBeenCalledWith("en");
    expect(screen.getByText("Eng")).toBeInTheDocument();
  });
});
