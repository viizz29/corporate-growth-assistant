import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import PersonalInfoPage from "./personal-info";

vi.setConfig({ testTimeout: 30000 });

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

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
  },
};
const mockUpdateProfile = vi.fn();
const profileState = {
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
      <PersonalInfoPage />
    </MemoryRouter>
  );
}

describe("PersonalInfoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
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
    profileState.isError = false;
    profileState.error = null;
    profileState.mutate.mockReset();
    profileState.mutate.mockImplementation((_values, opts) =>
      opts?.onSuccess?.(authState.user)
    );
  });

  it("pre-fills the form with the user's name and email", () => {
    renderPage();

    expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
  });

  it("shows validation errors when submitting empty values", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(screen.getByLabelText("Name"));
    await user.clear(screen.getByLabelText("Email"));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows an invalid email error", async () => {
    const user = userEvent.setup();
    renderPage();

    const emailInput = screen.getByLabelText("Email");
    await user.clear(emailInput);
    await user.type(emailInput, "not-an-email");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Invalid email")).toBeInTheDocument();
  });

  it("submits the updated values, updates the profile, and navigates back on success", async () => {
    const user = userEvent.setup();
    renderPage();

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "John Smith");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(profileState.mutate).toHaveBeenCalledWith(
      { name: "John Smith", email: "jane@example.com" },
      expect.anything()
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(authState.user);
    expect(toast.success).toHaveBeenCalledWith("Profile updated successfully");
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("disables the Save button until the form is dirty", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();

    await user.type(screen.getByLabelText("Name"), "X");

    expect(
      screen.getByRole("button", { name: "Save Changes" })
    ).toBeEnabled();
  });

  it("disables the Save button while the mutation is pending", () => {
    profileState.isPending = true;
    renderPage();

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("shows the server error message when the mutation fails", () => {
    profileState.isError = true;
    profileState.error = { response: { data: { message: "Email already in use" } } };
    renderPage();

    expect(screen.getByText("Email already in use")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
