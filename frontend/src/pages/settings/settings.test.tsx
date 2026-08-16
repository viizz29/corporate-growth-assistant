import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import SettingsPage from "./settings";

vi.setConfig({ testTimeout: 30000 });

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const authState = {
  user: null as null | {
    userId: string;
    name: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    is2faEnabled: boolean;
    isEmailNotificationsEnabled: boolean;
    languagePreference?: "en" | "hi";
    themePreference?: "light" | "dark";
  },
};
const mockUpdateProfile = vi.fn();
const profileState = { mutate: vi.fn(), isPending: false };
const emailPrefsState = {
  data: null as null | { emailNotifications: boolean },
  isLoading: false,
};
const emailPrefsMutationState = { mutate: vi.fn(), isPending: false };
const toggle2faState = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null as null | { response?: { data?: { message?: string } } },
};

vi.mock("@/context/use-auth", () => ({
  useAuth: () => ({ user: authState.user, updateProfile: mockUpdateProfile }),
}));

vi.mock("@/hooks/use-auth-queries", () => ({
  useUpdateProfileMutation: () => profileState,
  useEmailPreferencesQuery: () => ({
    data: emailPrefsState.data,
    isLoading: emailPrefsState.isLoading,
  }),
  useUpdateEmailPreferencesMutation: () => emailPrefsMutationState,
  useToggle2faMutation: () => toggle2faState,
}));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layouts/page-header", () => ({
  default: () => <div data-testid="page-header" />,
}));

vi.mock("@/components/forms/form-card", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProfile.mockReset();
    authState.user = {
      userId: "u1",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "user",
      isEmailVerified: true,
      is2faEnabled: false,
      isEmailNotificationsEnabled: false,
    };
    profileState.isPending = false;
    profileState.mutate.mockReset();
    profileState.mutate.mockImplementation((_values, opts) =>
      opts?.onSuccess?.(authState.user)
    );
    emailPrefsState.data = { emailNotifications: false };
    emailPrefsState.isLoading = false;
    emailPrefsMutationState.isPending = false;
    emailPrefsMutationState.mutate.mockReset();
    emailPrefsMutationState.mutate.mockImplementation((_values, opts) =>
      opts?.onSuccess?.()
    );
    toggle2faState.isPending = false;
    toggle2faState.isError = false;
    toggle2faState.error = null;
    toggle2faState.mutate.mockReset();
    toggle2faState.mutate.mockImplementation((_values, opts) =>
      opts?.onSuccess?.()
    );
  });

  it("defaults the language select to English when no preference is set", () => {
    renderPage();

    expect(screen.getByRole("combobox", { name: "Language" })).toHaveTextContent(
      "English"
    );
  });

  it("defaults the language select to the user's language preference", () => {
    authState.user = { ...authState.user!, languagePreference: "hi" };
    renderPage();

    expect(screen.getByRole("combobox", { name: "Language" })).toHaveTextContent(
      "Hindi"
    );
  });

  it("updates the language preference when a new language is selected", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("combobox", { name: "Language" }));
    await user.click(await screen.findByRole("option", { name: "Hindi" }));

    expect(profileState.mutate).toHaveBeenCalledWith(
      { name: "Jane Doe", email: "jane@example.com", languagePreference: "hi" },
      expect.anything()
    );
    expect(mockUpdateProfile).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("profileUpdated");
  });

  it("disables the language select while the profile mutation is pending", () => {
    profileState.isPending = true;
    renderPage();

    expect(
      screen.getByRole("combobox", { name: "Language" })
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("defaults the theme select to light and updates it when dark is selected", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveTextContent(
      "Light"
    );

    await user.click(screen.getByRole("combobox", { name: "Theme" }));
    await user.click(await screen.findByRole("option", { name: "Dark" }));

    expect(profileState.mutate).toHaveBeenCalledWith(
      { name: "Jane Doe", email: "jane@example.com", themePreference: "dark" },
      expect.anything()
    );
    expect(mockUpdateProfile).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("profileUpdated");
  });

  it("shows a skeleton while email preferences are loading", () => {
    emailPrefsState.isLoading = true;
    const { container } = renderPage();

    expect(container.querySelector('[class*="MuiSkeleton"]')).toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "receiveEmailNotifications" })
    ).not.toBeInTheDocument();
  });

  it("reflects the email notifications preference", () => {
    emailPrefsState.data = { emailNotifications: true };
    renderPage();

    expect(
      screen.getByRole("switch", { name: "receiveEmailNotifications" })
    ).toBeChecked();
  });

  it("updates email notifications when toggled", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("switch", { name: "receiveEmailNotifications" })
    );

    expect(emailPrefsMutationState.mutate).toHaveBeenCalledWith(
      { emailNotifications: true },
      expect.anything()
    );
    expect(toast.success).toHaveBeenCalledWith("emailPreferencesUpdated");
  });

  it("toggles two-factor authentication", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("switch", { name: "Enable two-factor authentication" })
    );

    expect(toggle2faState.mutate).toHaveBeenCalledWith(true, expect.anything());
    expect(toast.success).toHaveBeenCalledWith("twoFactorEnabled");
  });

  it("shows the server error message when the 2fa mutation fails", () => {
    toggle2faState.isError = true;
    toggle2faState.error = { response: { data: { message: "2FA setup failed" } } };
    renderPage();

    expect(screen.getByText("2FA setup failed")).toBeInTheDocument();
  });

  it("shows a fallback message when the 2fa mutation fails without a server message", () => {
    toggle2faState.isError = true;
    toggle2faState.error = new Error("boom") as unknown as {
      response?: { data?: { message?: string } };
    };
    renderPage();

    expect(screen.getByText("failedToUpdate2faSetting")).toBeInTheDocument();
  });
});
