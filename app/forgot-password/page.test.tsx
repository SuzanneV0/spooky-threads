import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "@/app/forgot-password/page";

// This page previously had a real bug: it showed "check your email" no
// matter what the API responded with, so a genuine server error looked
// identical to a successful send. These tests pin down the fixed
// behavior so that regression can't come back unnoticed.

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the email field and submit button", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send reset link" })).toBeInTheDocument();
  });

  it("does not submit when the email field is empty", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(screen.getByLabelText("Email")).toBeInvalid();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows a generic confirmation on success, without revealing whether the account exists", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText("Email"), "shopper@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(
      screen.getByText("If an account exists for shopper@example.com, we sent a link to reset the password.")
    ).toBeInTheDocument();
  });

  it("shows an error instead of a false confirmation when the API call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText("Email"), "shopper@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(
      await screen.findByText("Something went wrong sending the reset link. Please try again.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();
  });

  it("shows an error when the request itself throws (network failure)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText("Email"), "shopper@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(
      await screen.findByText("Something went wrong sending the reset link. Please try again.")
    ).toBeInTheDocument();
  });
});
