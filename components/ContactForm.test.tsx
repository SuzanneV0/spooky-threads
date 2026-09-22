import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@/components/ContactForm";

async function fillValidRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.selectOptions(screen.getByLabelText("What's this about?"), "general");
  await user.type(screen.getByLabelText("Message"), "Do you ship internationally?");
}

describe("ContactForm", () => {
  it("renders the name, email, topic, and message fields plus a submit button", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("What's this about?")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("does not submit and marks required fields invalid when submitted empty", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();

    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByLabelText("Name")).toBeInvalid();
    expect(screen.getByLabelText("Email")).toBeInvalid();
    expect(screen.getByLabelText("What's this about?")).toBeInvalid();
    expect(screen.getByLabelText("Message")).toBeInvalid();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects an invalid email address", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();

    render(<ContactForm />);
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.selectOptions(screen.getByLabelText("What's this about?"), "general");
    await user.type(screen.getByLabelText("Message"), "Do you ship internationally?");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByLabelText("Email")).toBeInvalid();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows a confirmation message after a successful submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ sent: true }) } as Response)
    );
    const user = userEvent.setup();

    render(<ContactForm />);
    await fillValidRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Message sent!")).toBeInTheDocument();
    expect(
      screen.getByText(/thanks for reaching out/i)
    ).toBeInTheDocument();
  });
});
