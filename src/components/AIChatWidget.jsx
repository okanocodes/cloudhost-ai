import React, { useState, useRef, useEffect } from "react";
import { useAIChat } from "../hooks/useAIChat";
import { findProduct } from "../lib/aiChatService";
import { Link } from "react-router-dom";
import { Bot, Send, X } from "lucide-react";


/* =============================================================================
   AiChatWidget.jsx
   -----------------------------------------------------------------------------
   A single drop-in component: a floating launcher icon (bottom-right) that
   opens an AI support chat panel. Streams tokens from a Hugging Face chat
   model and renders inline "product cards" whenever the model recommends a
   specific CloudHost AI package.

   NOTE: the system prompt and all user-facing strings below are in Turkish
   to match the rest of the CloudHostAI app. Code comments stay in English
   for maintainability.

   USAGE
   -----
   1. npm install @huggingface/inference
   2. Add your token to .env (Vite):  VITE_HF_TOKEN=hf_xxxxxxxxxxxx
      (Create React App: REACT_APP_HF_TOKEN, then swap the import.meta.env
      line below for process.env.REACT_APP_HF_TOKEN)
   3. Mount it ONCE near the root of your app (e.g. App.jsx), outside/alongside
      your router, so it persists across every page instead of remounting:

        function App() {
          return (
            <>
              <YourRoutes />
              <AiChatWidget />
            </>
          );
        }

   ⚠️ SECURITY NOTE: this calls Hugging Face directly from the browser, which
   means your HF token ships inside the client bundle and is visible to anyone
   who opens devtools. That's fine for prototyping. Before shipping to real
   users, put this behind a tiny backend/serverless proxy that holds the token
   and forwards the chat request — keep this component's UI, just point
   `streamReply()` at your own endpoint instead of calling HF directly.
   ============================================================================= */

// Knowledge base and utility helper functions have been moved to src/lib/aiChatService.js

/* ------------------------------- UI bits ------------------------------------ */
const WIDGET_STYLE = `
  .hfchat-launcher {
    position: fixed; bottom: 24px; right: 24px; z-index: 999998;
    width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
    background: #8B5CF6; color: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(139,92,246,0.45); transition: transform 0.15s ease;
  }
  .hfchat-launcher:hover { transform: scale(1.06); }
  .hfchat-launcher:active { transform: scale(0.96); }

  .hfchat-panel {
    position: fixed; bottom: 92px; right: 24px; z-index: 999999;
    width: 450px; max-width: calc(100vw - 32px);
    height: 540px; max-height: calc(100vh - 120px);
    background: #0B0F19; border: 1px solid #27324A; border-radius: 16px;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
    animation: hfchatIn 0.18s ease-out;
  }
  @keyframes hfchatIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .hfchat-header {
    display: flex; align-items: center; gap: 8px; padding: 14px 16px;
    background: rgba(139,92,246,0.12); border-bottom: 1px solid #27324A; color: #F8FAFC;
  }
  .hfchat-header strong { font-size: 14px; font-weight: 600; }
  .hfchat-header span { font-size: 11px; color: #94A3B8; }
  .hfchat-close { margin-left: auto; background: none; border: none; color: #94A3B8; cursor: pointer; padding: 4px; }
  .hfchat-close:hover { color: #F8FAFC; }

  .hfchat-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .hfchat-messages::-webkit-scrollbar { width: 6px; }
  .hfchat-messages::-webkit-scrollbar-thumb { background: #33405C; border-radius: 6px; }

  .hfchat-row { display: flex; }
  .hfchat-row.user { justify-content: flex-end; }
  .hfchat-bubble {
    max-width: 84%; padding: 9px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.5;
    white-space: pre-wrap; word-break: break-word;
  }
  .hfchat-bubble.user { background: #2563EB; color: #fff; }
  .hfchat-bubble.assistant { background: #1E293B; color: #F8FAFC; border: 1px solid #27324A; }
  .hfchat-bubble.error { background: rgba(239,68,68,0.14); color: #EF4444; border: 1px solid #EF4444; }

  .hfchat-dots { display: inline-flex; gap: 3px; padding: 2px 0; }
  .hfchat-dots span { width: 5px; height: 5px; border-radius: 50%; background: #8B5CF6; animation: hfchatBlink 1.1s infinite ease-in-out; }
  .hfchat-dots span:nth-child(2) { animation-delay: 0.15s; }
  .hfchat-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes hfchatBlink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }

  .hfchat-card {
    margin-top: 6px; padding: 10px 12px; border: 1px solid #8B5CF6; border-radius: 10px;
    background: rgba(139,92,246,0.10);
  }
  .hfchat-card-title { font-size: 13px; font-weight: 600; color: #F8FAFC; }
  .hfchat-card-meta { font-size: 11.5px; color: #94A3B8; margin-top: 2px; font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .hfchat-card-link {
    display: inline-flex; align-items: center; gap: 4px; margin-top: 8px;
    font-size: 12px; font-weight: 500; color: #8B5CF6; text-decoration: none;
  }
  .hfchat-card-link:hover { text-decoration: underline; }

  .hfchat-inputbar { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #27324A; }
  .hfchat-input {
    flex: 1; resize: none; background: #0B0F19; color: #F8FAFC; border: 1px solid #33405C;
    border-radius: 10px; padding: 9px 11px; font-size: 13.5px; font-family: inherit; max-height: 90px;
  }
  .hfchat-input:focus { outline: 2px solid #8B5CF6; outline-offset: 1px; }
  .hfchat-send {
    width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px; border: none; cursor: pointer;
    background: #8B5CF6; color: #fff; display: flex; align-items: center; justify-content: center;
  }
  .hfchat-send:disabled { opacity: 0.45; cursor: not-allowed; }

  @media (max-width: 480px) {
    .hfchat-panel { right: 16px; left: 16px; width: auto; bottom: 88px; }
    .hfchat-launcher { right: 16px; bottom: 16px; }
  }
`;





function ProductCard({ productId }) {
    const product = findProduct(productId);

    if (!product) return null;
    return (
        <div className="hfchat-card">
            <div className="hfchat-card-title">
                {product.title}
            </div>
            {product && (
                <>
                    <div className="hfchat-card-meta">{product.specs}</div>
                    <div className="hfchat-card-meta">{product.price}</div>
                </>
            )}
            <Link to={`/services/${product?.id}`} className="hfchat-card-link">
                Paketi incele →
            </Link>
        </div>
    );
}

function MessageBubble({ message }) {
    if (message.role === "user") {
        return (
            <div className="hfchat-row user">
                <div className="hfchat-bubble user">{message.content}</div>
            </div>
        );
    }
    if (message.error) {
        return (
            <div className="hfchat-row">
                <div className="hfchat-bubble error">{message.content}</div>
            </div>
        );
    }
    const showTyping =
        message.streaming &&
        message.content.length === 0;
    return (
        <div className="hfchat-row">
            <div className="hfchat-bubble assistant">
                {showTyping ? (
                    <span className="hfchat-dots"><span /><span /><span /></span>
                ) : (
                    <>
                        {message.content}

                        {message.metadata?.cards?.map((card) => {
                            const possibleId = card.id || card.productId || card.type;
                            const product = findProduct(possibleId);
                            if (!product) return null;
                            return (
                                <ProductCard
                                    key={product.id}
                                    productId={product.id}
                                />
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}

/* -------------------------------- Widget ------------------------------------ */
export default function AiChatWidget() {
    const [open, setOpen] = useState(false);
    const {
        messages,
        setMessages,
        input,
        setInput,
        busy,
        streamReply
    } = useAIChat([
        { role: "assistant", content: "Merhaba! Ben CloudHost AI asistanıyım. Paketlerimiz, fiyatlandırma ya da sunucularınızı nasıl yöneteceğiniz hakkında soru sorabilirsiniz." },
    ]);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, open]);

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    function handleSend() {
        const text = input.trim();
        if (!text || busy) return;
        const userMessage = { role: "user", content: text };
        const history = [...messages.filter((m) => !m.error).map(({ role, content }) => ({ role, content })), userMessage].slice(-12);
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        streamReply(history);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <>
            <style>{WIDGET_STYLE}</style>

            {open && (
                <div className="hfchat-panel" role="dialog" aria-label="Yapay zekâ destek sohbeti">
                    <div className="hfchat-header">
                        <Bot />
                        <div>
                            <strong>CloudHost AI Asistanı</strong>
                            <div><span>Genellikle saniyeler içinde yanıt verir</span></div>
                        </div>
                        <button className="hfchat-close" onClick={() => setOpen(false)} aria-label="Sohbeti kapat">
                            <X />
                        </button>
                    </div>

                    <div className="hfchat-messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <MessageBubble key={i} message={m} />

                        ))}
                    </div>

                    <div className="hfchat-inputbar">
                        <textarea
                            className="hfchat-input"
                            rows={1}
                            placeholder="Paketler, fiyatlandırma, sunucular hakkında sorun…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={busy}
                        />
                        <button className="hfchat-send" onClick={handleSend} disabled={busy || !input.trim()} aria-label="Mesaj gönder">
                            <Send />
                        </button>
                    </div>
                </div>
            )}

            <button className="hfchat-launcher" onClick={() => setOpen((v) => !v)} aria-label="Yapay zekâ destek sohbetini aç">
                {open ? <X /> : <Bot />}
            </button>
        </>
    );
}