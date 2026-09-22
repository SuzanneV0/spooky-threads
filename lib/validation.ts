import { z } from "zod";
import { APPAREL_SIZES } from "@/lib/sizes";

export const PRODUCT_TYPES = ["sweater", "shirt", "hat", "mug", "tumbler", "blanket"] as const;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Enter a valid email address");

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: emailSchema,
  messageType: z.enum(["general", "orders", "subscriptions", "other"]),
  message: z.string().trim().min(1, "Message is required").max(4000, "Message is too long"),
  recaptchaToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const welcomeEmailSchema = z.object({
  userId: z.string().uuid("Invalid user id"),
});

export const checkoutItemSchema = z.object({
  productId: z.string().uuid("Invalid product id"),
  quantity: z.coerce.number().int().min(1).max(20),
  size: z.enum(APPAREL_SIZES).nullable().optional(),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty.").max(50, "Too many items in cart."),
});

export const subscribeSchema = z.object({
  tierSlug: z.string().trim().min(1, "A subscription tier is required"),
});

export const quizCompleteSchema = z.object({
  trope: z.string().trim().min(1, "A trope is required"),
});

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000, "Message is too long"),
});

export const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "No messages provided.").max(40, "Conversation is too long."),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  title: z.string().trim().max(120, "Title is too long").optional().default(""),
  body: z.string().trim().max(2000, "Review is too long").optional().default(""),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(40, "Label is too long"),
  full_name: z.string().trim().min(1, "Full name is required").max(120, "Full name is too long"),
  line1: z.string().trim().min(1, "Address line 1 is required").max(200, "Address is too long"),
  line2: z.string().trim().max(200, "Address is too long").optional().default(""),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  state: z.string().trim().min(1, "State is required").max(50, "State is too long"),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code (e.g. 12345 or 12345-6789)"),
  country: z.string().trim().min(1, "Country is required").max(56, "Country is too long"),
});

export const productFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug is too long")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().trim().min(1, "Name is required").max(150, "Name is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional().default(""),
  price_cents: z.coerce
    .number()
    .int("Price must be a whole number of cents")
    .min(1, "Price must be greater than $0")
    .max(100000, "Price must be $1,000 or less"),
  wash_instructions: z.string().trim().max(500, "Wash instructions are too long").optional().default(""),
  product_type: z.enum(PRODUCT_TYPES),
  is_new: z.boolean().optional().default(false),
});

/** Returns the first validation error message from a failed Zod safeParse result. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
