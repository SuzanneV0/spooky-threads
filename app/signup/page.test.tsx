import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const signUpMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: signUpMock,
      signInWithOAuth: vi.fn(),
    },
  }),
}));

import SignupPage from "@/app/signup/page";

// Supabase signUp() can come back three ways that this page has to handle
// differently: an error, a real session (email confirmation off), or a
// user with no session (email confirmation required) — plus a best-effort
// welcome email that must never block account creation if it fails.

describe("SignupPage", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    signUpMock.mockReset();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("renders the full name, email, password fields, and submit button", () => {
    render(<SignupPage />);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("does not attempt to sign up when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(screen.getByLabelText("Full name")).toBeInvalid();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("shows Supabase's error message when signup fails", async () => {
    signUpMock.mockResolvedValue({ data: { user: null, session: null }, error: { message: "User already registered" } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText("User already registered")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a 'check your email' state and fires the welcome email when confirmation is required", async () => {
    signUpMock.mockResolvedValue({ data: { user: { id: "user-123" }, session: null }, error: null });
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/emails/welcome",
      expect.objectContaining({ body: JSON.stringify({ userId: "user-123" }) })
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("redirects to /account when signup returns a session immediately", async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: "user-123" }, session: { access_token: "token" } },
      error: null,
    });
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(pushMock).toHaveBeenCalledWith("/account");
    expect(refreshMock).toHaveBeenCalled();
  });
});
