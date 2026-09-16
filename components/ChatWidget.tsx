"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! 🎃 I'm the Spooky Threads shopping assistant — ask me about products, sizing, or what's new.",
};

const LINK_PATTERN = /\[([^\]]+)\]\((\/(?:products|collections)\/[a-z0-9-]+)\)/g;

function renderMessageContent(text: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <Link key={key++} href={match[2]} className="chat-message-link">
        {match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limited, setLimited] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: data.reply ?? "Sorry, something went wrong." }]);
      if (data.limited) setLimited(true);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel card">
          <div className="chat-header">
            <span>Ask Spooky Threads 🎃</span>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message chat-message-${m.role}`}>
                {renderMessageContent(m.content)}
              </div>
            ))}
            {loading && <div className="chat-message chat-message-assistant chat-message-loading">Thinking…</div>}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder={limited ? "Daily limit reached — try again tomorrow" : "Ask about a product…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || limited}
            />
            <button type="submit" className="button small" disabled={loading || limited || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle chat">
        {open ? "✕" : "🎃"}
      </button>
    </div>
  );
}
