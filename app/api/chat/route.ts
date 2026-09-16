import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getProductCatalogForAssistant } from "@/lib/queries";
import { SITE_NAME } from "@/lib/site";

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildSystemInstruction(catalog: Awaited<ReturnType<typeof getProductCatalogForAssistant>>) {
  const productLines = catalog
    .map((p) => `- ${p.name}${p.is_new ? " (new)" : ""} — $${(p.price_cents / 100).toFixed(2)} — ${p.product_type} — slug: ${p.slug}`)
    .join("\n");

  return `You are the shopping assistant for ${SITE_NAME}, a playful Halloween apparel and home goods shop. Keep a warm, spooky-cute tone and keep replies short (2-4 sentences unless the customer asks for a list).

Only recommend products from this catalog — never invent products, prices, or slugs:
${productLines}

When you recommend a specific product, format it as a markdown link using its slug, like [Product Name](/products/slug-here), so the customer can click through.

This is a practice storefront built for a course, so checkout isn't live yet — if asked about placing a real order, say so honestly and suggest browsing or adding items to the cart instead.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "The shopping assistant isn't configured yet — add a GEMINI_API_KEY to .env.local to turn it on.",
    });
  }

  const { messages } = (await request.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const catalog = await getProductCatalogForAssistant();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: buildSystemInstruction(catalog),
      },
    });

    return NextResponse.json({ reply: response.text ?? "Sorry, I didn't catch that — could you try again?" });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return NextResponse.json(
      { reply: "Something went wrong reaching the assistant. Please try again in a moment." },
      { status: 502 }
    );
  }
}
