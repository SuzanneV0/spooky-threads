import { NextResponse } from "next/server";

// TODO (course lesson): wire this up to OpenAI/Claude to build a shopping
// assistant that can answer questions about products and help with checkout.
export async function POST(request: Request) {
  const { message } = await request.json();

  return NextResponse.json({
    reply: `You said: "${message}". The AI chatbot isn't wired up yet — that's next lesson!`,
  });
}
