import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import VerifyEmail from "./verify-email";

const { mutateMock, mutationState } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  mutationState: {
    isPending: false,
    isSuccess: false,
    isError: false,
    error: undefined as unknown,
  },
}));

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock("@/hooks/use-auth-queries", () => ({
  useVerifyEmailMutation: () => ({ mutate: mutateMock, ...mutationState }),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

function renderPage(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/verify-email${search}`]}>
      <VerifyEmail />
    </MemoryRouter>,
  );
}

describe("VerifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationState.isPending = false;
    mutationState.isSuccess = false;
    mutationState.isError = false;
    mutationState.error = undefined;
  });

  it("fires the verify mutation once with the token", () => {
    renderPage("?token=abc123");

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith("abc123");
  });

  it("shows an error alert without verifying when no token is present", () => {
    renderPage();

    expect(
      screen.getByText("Invalid or missing verification token."),
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("shows a success message and navigates to login", async () => {
    const user = userEvent.setup({ delay: null });
    mutationState.isSuccess = true;

    renderPage("?token=abc123");

    expect(
      screen.getByText("Your email has been verified successfully!"),
    ).toBeInTheDocument();

    await user.click(screen.getByText("Go to Login"));

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("shows an already verified message on a 409 error", () => {
    mutationState.isError = true;
    mutationState.error = { response: { status: 409 } };

    renderPage("?token=abc123");

    expect(screen.getByText("Email is already verified")).toBeInTheDocument();
  });

  it("shows a generic error message for other errors", () => {
    mutationState.isError = true;
    mutationState.error = { response: { status: 400 } };

    renderPage("?token=abc123");

    expect(
      screen.getByText(
        "Failed to verify email. The link may be invalid or expired.",
      ),
    ).toBeInTheDocument();
  });
});
