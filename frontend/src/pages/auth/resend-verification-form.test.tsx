import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import ResendVerificationForm from "./resend-verification-form";

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
  return { mutateMock: vi.fn(), mutationState };
});

vi.mock("@/hooks/use-auth-queries", () => ({
  useResendVerificationMutation: () => ({
    mutate: mutateMock,
    ...mutationState,
  }),
}));

function renderForm() {
  return render(
    <MemoryRouter>
      <ResendVerificationForm />
    </MemoryRouter>,
  );
}

describe("ResendVerificationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationState.isPending = false;
    mutationState.isSuccess = false;
    mutationState.isError = false;
    mutationState.error = undefined;
  });

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Resend Verification" }));

    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("submits the email on valid input", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.click(screen.getByRole("button", { name: "Resend Verification" }));

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith("test@test.com");
  });

  it("shows a success alert when the mutation succeeds", () => {
    mutationState.isSuccess = true;

    renderForm();

    expect(
      screen.getByText("Verification email sent! Check your inbox."),
    ).toBeInTheDocument();
  });

  it("shows an error alert when the mutation fails", () => {
    mutationState.isError = true;

    renderForm();

    expect(
      screen.getByText("Failed to resend verification email"),
    ).toBeInTheDocument();
  });

  it("renders a back to login link", () => {
    renderForm();

    expect(screen.getByText("Back to Login")).toBeInTheDocument();
  });
});
