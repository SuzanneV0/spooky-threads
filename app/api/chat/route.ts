import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getProductCatalogForAssistant } from "@/lib/queries";
import { SITE_NAME } from "@/lib/site";
import { checkAndIncrementUsage, getRateLimitIdentity, type RateLimitIdentity } from "@/lib/rateLimit";
import { chatSchema, firstIssueMessage } from "@/lib/validation";

const CHAT_DAILY_LIMIT = 5;

function buildSystemPrompt(catalog: Awaited<ReturnType<typeof getProductCatalogForAssistant>>) {
  const productLines = catalog
    .map((p) => `- ${p.name}${p.is_new ? " (new)" : ""} — $${(p.price_cents / 100).toFixed(2)} — ${p.product_type} — slug: ${p.slug}`)
    .join("\n");

  return `You are the shopping assistant for ${SITE_NAME}, a playful Halloween apparel and home goods shop. Keep a warm, spooky-cute tone and keep replies short (2-4 sentences unless the customer asks for a list).

Only recommend products from this catalog — never invent products, prices, or slugs:
${productLines}

When you recommend a specific product, format it as a markdown link using its slug, like [Product Name](/products/slug-here), so the customer can click through.

This is a practice storefront built for a course, so checkout isn't live yet — if asked about placing a real order, say so honestly and suggest browsing or adding items to the cart instead.`;
}

function withAnonCookie(response: NextResponse, identity: RateLimitIdentity) {
  if (identity.anonCookie) {
    response.cookies.set(identity.anonCookie.name, identity.anonCookie.value, {
      maxAge: identity.anonCookie.maxAge,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return response;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "The shopping assistant isn't configured yet — add an ANTHROPIC_API_KEY to .env.local to turn it on.",
    });
  }

  const parsed = chatSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const { messages } = parsed.data;

  const identity = await getRateLimitIdentity();
  const allowed = await checkAndIncrementUsage(identity.identifier, "chat", CHAT_DAILY_LIMIT);

  if (!allowed) {
    return withAnonCookie(
      NextResponse.json({
        reply: `You've reached today's limit of ${CHAT_DAILY_LIMIT} messages — come back tomorrow for more spooky shopping advice!`,
        limited: true,
      }),
      identity
    );
  }

  const catalog = await getProductCatalogForAssistant();
  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: buildSystemPrompt(catalog),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply = response.content.find((block) => block.type === "text")?.text;
    return withAnonCookie(
      NextResponse.json({ reply: reply ?? "Sorry, I didn't catch that — could you try again?" }),
      identity
    );
  } catch (error) {
    console.error("Claude chat error:", error);
    return withAnonCookie(
      NextResponse.json(
        { reply: "Something went wrong reaching the assistant. Please try again in a moment." },
        { status: 502 }
      ),
      identity
    );
  }
}
