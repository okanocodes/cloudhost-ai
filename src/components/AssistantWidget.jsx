import React, { useEffect, useRef } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { aiRespond } from "../lib/aiEngine";
import { useAIChat } from "../hooks/useAIChat";
import { findProduct } from "../lib/aiChatService";
import { Link } from "react-router-dom";

export default function AssistantWidget({
  title = "AI Asistan",
  intro = "Merhaba! Size nasıl yardımcı olabilirim?",
  quickQuestions = [],
  respond = aiRespond,
  variant = "mini",
  placeholder = "Bir soru yazın…",
  onResult,
}) {
  const {
    messages,
    setMessages,
    input,
    setInput,
    busy,
    streamReply,
  } = useAIChat([{ role: "ai", text: intro }]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Prepared answer path (when user clicks a quick question)
  function handleQuickQuestion(q) {
    if (busy) return;
    const result = respond(q);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "ai", text: result.text, service: result.service, faq: result.faq }
    ]);
    if (onResult) onResult(result, q);
  }

  // AI path (when user types a question in the input and submits)
  function send() {
    const q = input.trim();
    if (!q || busy) return;

    const userMessage = { role: "user", content: q };
    setInput("");

    // Calculate history directly from current messages + new user message
    const history = [
      ...messages
        .filter((m) => !m.error)
        .map((m) => ({
          role: m.role === "ai" || m.role === "assistant" ? "assistant" : "user",
          content: m.content || m.text || "",
        })),
      userMessage
    ].slice(-12);

    setMessages((prev) => [...prev, userMessage]);
    streamReply(history);
  }

  const isFull = variant === "full";

  return (
    <div className={`flex flex-col rounded-2xl border border-ai bg-card overflow-hidden ${isFull ? "h-full" : ""}`}>
      <div className="flex items-center gap-2 border-b border-token bg-ai-soft px-4 py-3">
        <Bot size={16} className="text-ai" />
        <span className="text-sm font-medium text-ink">{title}</span>
        <Sparkles size={13} className="text-ai ml-auto" />
      </div>

      <div
        ref={scrollRef}
        className="chai-scroll flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={isFull ? { minHeight: "360px", maxHeight: "480px" } : { maxHeight: "260px" }}
      >
        {messages.map((m, i) => {
          return (
            <div key={i} className={`chai-fade-up flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                style={{ maxWidth: "85%" }}
                className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user"
                  ? "bg-brand text-white"
                  : m.error
                    ? "bg-danger-soft border border-danger text-danger"
                    : "bg-card-soft border border-token text-ink"
                  }`}
              >
                {m.role !== "user" && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-ai font-display">
                    <Bot size={11} /> AI
                  </div>
                )}
                {m.streaming && !(m.content || m.text) ? (
                  <div className="flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-ai animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-ai animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-ai animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : (
                  m.content || m.text
                )}
                {m.service && (
                  <div className="mt-2 rounded-lg border border-ai bg-ai-soft px-3 py-2 font-display text-xs">
                    <div className="text-ai font-medium">{m.service.name}</div>
                    <div className="text-muted">{m.service.cpu} Çekirdek · {m.service.ram}GB RAM · ${m.service.price}/ay</div>
                    <a href={`/services/${m.service.id}`} className="inline-flex items-center gap-1 mt-2 font-semibold text-ai hover:underline">
                      Paketi incele →
                    </a>
                  </div>
                )}
                {m.metadata?.cards?.map((card) => {
                  const possibleId = card.id || card.productId || card.type;
                  const product = findProduct(possibleId);
                  if (!product) return null;
                  return (
                    <div key={product.id} className="mt-2.5 p-3 border border-ai rounded-xl bg-ai-soft text-xs font-display">
                      <div className="text-ai font-medium">{product.title}</div>
                      <div className="text-muted mt-0.5">{product.specs}</div>
                      <div className="text-muted mt-0.5">{product.price}</div>
                      <Link to={`/services/${product.id}`} className="inline-flex items-center gap-1 mt-2 font-semibold text-ai hover:underline">
                        Paketi incele →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {quickQuestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-token px-3 py-2.5">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickQuestion(q)}
              disabled={busy}
              className="rounded-full border border-token-light bg-card-hover px-2.5 py-1 text-xs text-muted hover:text-ink hover:border-ai transition disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-token p-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={busy}
          className="flex-1 rounded-lg border border-token-light bg-canvas px-3 py-2 text-sm text-ink placeholder:text-faint disabled:opacity-50"
        />
        <button type="submit" disabled={busy || !input.trim()} className="bg-ai bg-ai-hover rounded-lg p-2.5 text-white transition disabled:opacity-40">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}