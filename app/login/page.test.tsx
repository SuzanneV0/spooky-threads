import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const signInWithPasswordMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
      signInWithOAuth: vi.fn(),
    },
  }),
}));

import LoginPage from "@/app/login/page";

// LoginPage hands credentials straight to Supabase and only decides what
// to render based on whether that call returns an error — these tests
// check both branches, plus that empty/native-invalid fields never reach
// Supabase at all.

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    signInWithPasswordMock.mockReset();
  });

  it("renders the email, password fields, and submit button", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("does not attempt to log in when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByLabelText("Email")).toBeInvalid();
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("shows Supabase's error message when credentials are rejected", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "shopper@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid login credentials")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("redirects to /account on a successful login", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "shopper@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "shopper@example.com",
      password: "correct-password",
    });
    expect(pushMock).toHaveBeenCalledWith("/account");
    expect(refreshMock).toHaveBeenCalled();
  });
});
