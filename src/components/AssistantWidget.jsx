import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { aiRespond } from "../lib/aiEngine";

export default function AssistantWidget({
  title = "AI Asistan",
  intro = "Merhaba! Size nasıl yardımcı olabilirim?",
  quickQuestions = [],
  respond = aiRespond,
  variant = "mini",
  placeholder = "Bir soru yazın…",
  onResult,
}) {
  const [messages, setMessages] = useState([{ role: "ai", text: intro }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function send(text) {
    const q = (text ?? input).trim();
    if (!q) return;
    const result = respond(q);
    setMessages((prev) => [...prev, { role: "user", text: q }, { role: "ai", text: result.text, service: result.service }]);
    setInput("");
    if (onResult) onResult(result, q);
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
        {messages.map((m, i) => (
          <div key={i} className={`chai-fade-up flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              style={{ maxWidth: "85%" }}
              className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-brand text-white" : "bg-card-soft border border-token text-ink"
                }`}
            >
              {m.role === "ai" && (
                <div className="flex items-center gap-1.5 mb-1 text-xs text-ai font-display">
                  <Bot size={11} /> AI
                </div>
              )}
              {m.text}
              {m.service && (
                <div className="mt-2 rounded-lg border border-ai bg-ai-soft px-3 py-2 font-display text-xs">
                  <div className="text-ai font-medium">{m.service.name}</div>
                  <div className="text-muted">{m.service.cpu} Çekirdek · {m.service.ram}GB RAM · ${m.service.price}/ay</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {quickQuestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-token px-3 py-2.5">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-token-light bg-card-hover px-2.5 py-1 text-xs text-muted hover:text-ink hover:border-ai transition"
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
          className="flex-1 rounded-lg border border-token-light bg-canvas px-3 py-2 text-sm text-ink placeholder:text-faint"
        />
        <button type="submit" className="bg-ai bg-ai-hover rounded-lg p-2.5 text-white transition">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}