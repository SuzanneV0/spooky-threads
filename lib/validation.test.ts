import { describe, expect, it } from "vitest";
import {
  addressSchema,
  chatSchema,
  checkoutSchema,
  contactMessageSchema,
  forgotPasswordSchema,
  productFormSchema,
  quizCompleteSchema,
  reviewSchema,
  subscribeSchema,
  welcomeEmailSchema,
} from "@/lib/validation";

// A schema that fails should surface a useful message, and one that
// passes should hand back cleaned (trimmed/coerced) data — since every
// form and API route in the app trusts these schemas as the single
// source of truth for "is this input safe to act on".

describe("contactMessageSchema", () => {
  it("accepts a well-formed contact message", () => {
    const result = contactMessageSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      messageType: "general",
      message: "Hello!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const result = contactMessageSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      messageType: "general",
      message: "Hello!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message type outside the known dropdown options", () => {
    const result = contactMessageSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      messageType: "bogus",
      message: "Hello!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the 4000 character cap", () => {
    const result = contactMessageSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      messageType: "general",
      message: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = contactMessageSchema.safeParse({
      name: "   ",
      email: "ada@example.com",
      messageType: "general",
      message: "Hello!",
    });
    expect(result.success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  const validItem = { productId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", quantity: 1, size: "M" };

  it("accepts a cart with a valid item", () => {
    expect(checkoutSchema.safeParse({ items: [validItem] }).success).toBe(true);
  });

  it("rejects an empty cart", () => {
    expect(checkoutSchema.safeParse({ items: [] }).success).toBe(false);
  });

  it("rejects a quantity above the 20-unit cap", () => {
    const result = checkoutSchema.safeParse({ items: [{ ...validItem, quantity: 21 }] });
    expect(result.success).toBe(false);
  });

  it("rejects a quantity of zero or negative", () => {
    expect(checkoutSchema.safeParse({ items: [{ ...validItem, quantity: 0 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ items: [{ ...validItem, quantity: -1 }] }).success).toBe(false);
  });

  it("rejects a product id that isn't a UUID", () => {
    const result = checkoutSchema.safeParse({ items: [{ ...validItem, productId: "drop-table-products" }] });
    expect(result.success).toBe(false);
  });

  it("rejects a size outside the known apparel sizes", () => {
    const result = checkoutSchema.safeParse({ items: [{ ...validItem, size: "<script>" }] });
    expect(result.success).toBe(false);
  });

  it("allows a null or omitted size for non-apparel products", () => {
    expect(checkoutSchema.safeParse({ items: [{ ...validItem, size: null }] }).success).toBe(true);
    const { size, ...withoutSize } = validItem;
    expect(checkoutSchema.safeParse({ items: [withoutSize] }).success).toBe(true);
  });
});

describe("subscribeSchema", () => {
  it("accepts a non-empty tier slug", () => {
    expect(subscribeSchema.safeParse({ tierSlug: "wicked-witch" }).success).toBe(true);
  });

  it("rejects a missing or empty tier slug", () => {
    expect(subscribeSchema.safeParse({ tierSlug: "" }).success).toBe(false);
    expect(subscribeSchema.safeParse({}).success).toBe(false);
  });
});

describe("quizCompleteSchema", () => {
  it("accepts a non-empty trope", () => {
    expect(quizCompleteSchema.safeParse({ trope: "witch" }).success).toBe(true);
  });

  it("rejects an empty trope", () => {
    expect(quizCompleteSchema.safeParse({ trope: "" }).success).toBe(false);
  });
});

describe("chatSchema", () => {
  it("accepts a normal conversation", () => {
    const result = chatSchema.safeParse({
      messages: [
        { role: "user", content: "What sweaters do you have?" },
        { role: "assistant", content: "We've got a few spooky options!" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message list", () => {
    expect(chatSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it("rejects more than 40 messages (abuse guard)", () => {
    const messages = Array.from({ length: 41 }, () => ({ role: "user" as const, content: "hi" }));
    expect(chatSchema.safeParse({ messages }).success).toBe(false);
  });

  it("rejects a message over 2000 characters (cost-abuse guard)", () => {
    const result = chatSchema.safeParse({ messages: [{ role: "user", content: "x".repeat(2001) }] });
    expect(result.success).toBe(false);
  });

  it("rejects a role outside user/assistant", () => {
    const result = chatSchema.safeParse({ messages: [{ role: "system", content: "hi" }] });
    expect(result.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("accepts a rating with title and body", () => {
    expect(reviewSchema.safeParse({ rating: 5, title: "Great!", body: "Loved it." }).success).toBe(true);
  });

  it("defaults title and body to empty strings when omitted", () => {
    const result = reviewSchema.safeParse({ rating: 4 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("");
      expect(result.data.body).toBe("");
    }
  });

  it("rejects a rating outside 1-5", () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it("rejects a body over the 2000 character cap", () => {
    expect(reviewSchema.safeParse({ rating: 5, body: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("addressSchema", () => {
  const validAddress = {
    label: "Home",
    full_name: "Ada Lovelace",
    line1: "1 Main St",
    line2: "",
    city: "Springfield",
    state: "IL",
    postal_code: "62704",
    country: "US",
  };

  it("accepts a well-formed US address", () => {
    expect(addressSchema.safeParse(validAddress).success).toBe(true);
  });

  it("accepts a ZIP+4 postal code", () => {
    expect(addressSchema.safeParse({ ...validAddress, postal_code: "62704-1234" }).success).toBe(true);
  });

  it("rejects a malformed postal code", () => {
    expect(addressSchema.safeParse({ ...validAddress, postal_code: "not-a-zip" }).success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { line1, ...withoutLine1 } = validAddress;
    expect(addressSchema.safeParse(withoutLine1).success).toBe(false);
  });
});

describe("productFormSchema", () => {
  const validProduct = {
    slug: "spooky-tee",
    name: "Spooky Tee",
    description: "",
    price_cents: 2500,
    wash_instructions: "",
    product_type: "shirt",
    is_new: false,
  };

  it("accepts a well-formed product", () => {
    expect(productFormSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects a slug with spaces or uppercase letters", () => {
    expect(productFormSchema.safeParse({ ...validProduct, slug: "Spooky Tee!" }).success).toBe(false);
  });

  it("rejects a zero or negative price", () => {
    expect(productFormSchema.safeParse({ ...validProduct, price_cents: 0 }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...validProduct, price_cents: -100 }).success).toBe(false);
  });

  it("rejects a price over the $1,000 cap", () => {
    expect(productFormSchema.safeParse({ ...validProduct, price_cents: 100_001 }).success).toBe(false);
  });

  it("rejects a product type outside the known dropdown options", () => {
    expect(productFormSchema.safeParse({ ...validProduct, product_type: "cauldron" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema and welcomeEmailSchema", () => {
  it("accepts a valid email for password reset", () => {
    expect(forgotPasswordSchema.safeParse({ email: "ada@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email for password reset", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });

  it("accepts a valid user id for the welcome email", () => {
    expect(welcomeEmailSchema.safeParse({ userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }).success).toBe(true);
  });

  it("rejects a non-UUID user id for the welcome email", () => {
    expect(welcomeEmailSchema.safeParse({ userId: "not-a-uuid" }).success).toBe(false);
  });
});
