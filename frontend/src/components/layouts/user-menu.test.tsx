import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import UserMenu from "./user-menu";

const { authState } = vi.hoisted(() => ({
  authState: {
    user: null as Record<string, unknown> | null,
    isAuthReady: false,
    logout: vi.fn(),
  },
}));

const { i18nMock } = vi.hoisted(() => ({
  i18nMock: { language: "en", changeLanguage: vi.fn() },
}));

const { storageMock } = vi.hoisted(() => ({
  storageMock: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}));

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock("@/context/use-auth", () => ({
  useAuth: () => authState,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      key === "hello" ? `Hello, ${options?.name ?? "User"}` : key,
    i18n: i18nMock,
  }),
}));

vi.mock("@/providers/local-storage-provider", () => ({
  useStorage: () => storageMock,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.get.mockReturnValue("");
    authState.user = null;
    authState.isAuthReady = true;
    i18nMock.language = "en";

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost/" },
    });
  });

  it("shows a login button when logged out and redirects on click", async () => {
    const user = userEvent.setup({ delay: null });
    render(<UserMenu />);

    const loginButton = screen.getByRole("button", { name: "login" });
    expect(loginButton).toBeInTheDocument();

    await user.click(loginButton);

    expect(window.location.href).toBe("/login");
  });

  it("opens the menu with a greeting using the user name when logged in", async () => {
    const user = userEvent.setup({ delay: null });
    authState.user = { name: "John Doe" };

    render(<UserMenu />);

    await user.click(screen.getByTestId("PersonIcon"));

    expect(screen.getByText("Hello, John Doe")).toBeInTheDocument();
  });

  it("navigates to the profile page when Profile is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    authState.user = { name: "John Doe" };

    render(<UserMenu />);

    await user.click(screen.getByTestId("PersonIcon"));
    await user.click(screen.getByText("Profile"));

    expect(navigateMock).toHaveBeenCalledWith("/profile");
  });

  it("applies the stored language on mount", () => {
    storageMock.get.mockReturnValue("hi");

    render(<UserMenu />);

    expect(i18nMock.changeLanguage).toHaveBeenCalledWith("hi");
  });

  it("changes the language and persists it to storage", async () => {
    const user = userEvent.setup({ delay: null });
    authState.user = { name: "John Doe" };

    render(<UserMenu />);

    await user.click(screen.getByTestId("PersonIcon"));
    await user.click(screen.getByText("हिंदी"));

    expect(i18nMock.changeLanguage).toHaveBeenCalledWith("hi");
    expect(storageMock.set).toHaveBeenCalledWith("lang", "hi");
  });

  it("calls logout when the logout item is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    authState.user = { name: "John Doe" };

    render(<UserMenu />);

    await user.click(screen.getByTestId("PersonIcon"));
    await user.click(screen.getByText("logout"));

    expect(authState.logout).toHaveBeenCalled();
  });
});
