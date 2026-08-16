import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import ResetPasswordForm from "./reset-password-form";

const { mutateMock, mutationState } = vi.hoisted(() => {
  const mutationState: {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: unknown;
    data: unknown;
  } = {
    isPending: false,
    isSuccess: false,
    isError: false,
    error: undefined,
    data: undefined,
  };
  const mutateMock = vi.fn(
    (
      _args?: unknown,
      options?: { onSuccess?: () => void; onError?: () => void },
    ) => {
      if (mutationState.isSuccess) options?.onSuccess?.();
      if (mutationState.isError) options?.onError?.();
    },
  );
  return { mutateMock, mutationState };
});

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock("@/hooks/use-auth-queries", () => ({
  useResetPasswordMutation: () => ({ mutate: mutateMock, ...mutationState }),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

function renderForm(search = "?token=abc") {
  return render(
    <MemoryRouter initialEntries={[`/reset-password${search}`]}>
      <ResetPasswordForm />
    </MemoryRouter>,
  );
}

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationState.isPending = false;
    mutationState.isSuccess = false;
    mutationState.isError = false;
    mutationState.error = undefined;
  });

  it("shows an error alert and reset link request when no token is present", () => {
    renderForm("");

    expect(
      screen.getByText("Invalid or missing reset token."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request a new reset link")).toBeInTheDocument();
    expect(screen.queryByLabelText("New Password")).not.toBeInTheDocument();
  });

  it("renders the password fields when a token is present", () => {
    renderForm("?token=abc");

    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(screen.getByText("Back to Login")).toBeInTheDocument();
  });

  it("shows a validation error for a weak password", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm("?token=abc");

    await user.type(screen.getByLabelText("New Password"), "abc");
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("shows a validation error when the passwords do not match", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm("?token=abc");

    await user.type(screen.getByLabelText("New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm New Password"), "StrongPass2!");
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(screen.getByText("Passwords must match")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("submits the token and password on valid input", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm("?token=abc");

    await user.type(screen.getByLabelText("New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm New Password"), "StrongPass1!");
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock.mock.calls[0][0]).toEqual({
      token: "abc",
      password: "StrongPass1!",
    });
  });

  it("shows a success alert and navigates to login after reset", async () => {
    const user = userEvent.setup({ delay: null });
    mutationState.isSuccess = true;
    renderForm("?token=abc");

    await user.type(screen.getByLabelText("New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm New Password"), "StrongPass1!");
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(
      screen.getByText("Your password has been successfully reset."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go to Login" }));

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("shows an error alert when the mutation fails", () => {
    mutationState.isError = true;

    renderForm("?token=abc");

    expect(screen.getByText("Failed to reset password")).toBeInTheDocument();
  });
});
