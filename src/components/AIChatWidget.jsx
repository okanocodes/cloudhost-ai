import React, { useState, useRef, useEffect, useCallback } from "react";
import { InferenceClient } from "@huggingface/inference";

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

/* --------------------------- Knowledge base -------------------------------- */
/* Keep this in sync with your actual catalog/policies (mirrors SERVICES in
   CloudHostAI.jsx). This is what product cards are matched against. */
const PRODUCTS = [
    { id: "web-starter", title: "Web Hosting Starter", price: "$2/ay", specs: "1 Çekirdek (Paylaşımlı) · 1GB RAM · 20GB SSD" },
    { id: "vps-basic", title: "VPS Basic", price: "$5/ay", specs: "2 Çekirdek · 4GB RAM · 80GB SSD" },
    { id: "vps-pro", title: "VPS Pro", price: "$10/ay", specs: "4 Çekirdek · 8GB RAM · 160GB SSD" },
    { id: "cloud-enterprise", title: "Cloud Enterprise", price: "$25/ay", specs: "8 Çekirdek · 16GB RAM · 320GB NVMe" },
];

const SYSTEM_PROMPT = `Sen CloudHost AI adlı bulut altyapı barındırma platformuna gömülü yapay zekâ destek asistanısın. Yalnızca aşağıdaki bilgileri kullanarak yanıt ver — asla teknik özellik, fiyat veya politika icat etme.

ŞİRKET
- Ad: CloudHost AI
- Destek: 7/24/365 kesintisiz mühendislik destek katmanı; bir destek talebi açıldığında ortalama ilk yanıt süresi 15 dakikanın altındadır.
- İade Politikası: Tüm paketlerde 14 günlük kesin para iade garantisi sunuyoruz; karmaşık bir doğrulama kriteri aranmaz. Dashboard > Servislerim üzerinden ilgili faturayı seçip "İade Talep Et" adımını izlemeniz yeterlidir.
- Veri merkezleri: Frankfurt (DE), Amsterdam (NL), İstanbul (TR), New York (US).

PAKET KATALOĞU (bu isimleri tam olarak kullan)
1. Web Hosting Starter — $2/ay — 1 paylaşımlı CPU çekirdeği, 1GB RAM, 20GB SSD. Temel WordPress siteleri ve statik HTML portföyleri için ideal.
2. VPS Basic — $5/ay — 2 CPU çekirdeği, 4GB RAM, 80GB SSD. Küçük kişisel projeler, landing page'ler ve hafif Node.js backend süreçleri için ideal.
3. VPS Pro — $10/ay — 4 CPU çekirdeği, 8GB RAM, 160GB SSD. Orta ölçekli e-ticaret siteleri, Next.js dağıtımları ve veritabanı depolama aşamaları için uygun.
4. Cloud Enterprise — $25/ay — 8 CPU çekirdeği, 16GB RAM, 320GB NVMe. Yüksek trafikli uygulamalar, kurumsal ölçeklenme ve ağır veritabanı yükleri için tasarlandı.

SIKÇA SORULANLAR
- Sunucu yeniden başlatma: "Servislerim" sayfasında ilgili satırdaki "Yeniden Başlat" düğmesine tıklamak yeterli — kısa bir yeniden başlatma durumu gösterir, ardından otomatik olarak aktif duruma döner.
- Sunucu durdurma/başlatma: aynı satırdaki "Durdur" / "Başlat" düğmesiyle yapılır.
- Doğru paketi seçme: kullanıcıya ne tür bir proje yayınlayacağını sor, ardından iş yüküne en yakın katalog girdisiyle eşleştir.

YANIT VERME KURALLARI
- Kısa, samimi ve bilgili ol. Genellikle birkaç kısa cümle yeterlidir.
- Kullanıcının yazdığı dille yanıt ver (Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce).
- Sadece CloudHost AI'nin ürünleri, politikaları ve destek konularıyla ilgili konuş. İlgisiz bir şey sorulursa, nazikçe barındırma/altyapı konusuna yönlendir.
- Yalnızca ve sadece kataloğdaki belirli bir paketi gerçekten önerdiğinde, nedenini kendi cümlelerinle açıkladıktan sonra, önerdiğin her paket için ayrı bir satırda TAM OLARAK şu formatı ekle, o satırda başka hiçbir şey olmasın:
[[PRODUCT: <tam paket adı>]]
Örnek: [[PRODUCT: VPS Pro]]
Tam katalog adını kullan. Bu etiket formatından kullanıcıya asla bahsetme — otomatik olarak bir ürün kartına dönüştürülür.`;

/* --------------------------- Streamed-tag parsing --------------------------- */
const PRODUCT_TAG_RE = /\[\[PRODUCT:\s*([^\]]+)\]\]/g;

/** Splits raw streamed text into renderable segments, hiding an in-progress
 *  (not yet closed) tag at the very end so partial markup never flashes on screen. */
function parseAssistantContent(raw) {
    const lastOpen = raw.lastIndexOf("[[PRODUCT:");
    const safeRaw = lastOpen !== -1 && raw.indexOf("]]", lastOpen) === -1 ? raw.slice(0, lastOpen) : raw;

    const segments = [];
    let lastIndex = 0;
    let match;
    PRODUCT_TAG_RE.lastIndex = 0;
    while ((match = PRODUCT_TAG_RE.exec(safeRaw)) !== null) {
        if (match.index > lastIndex) segments.push({ type: "text", value: safeRaw.slice(lastIndex, match.index) });
        segments.push({ type: "product", title: match[1].trim() });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < safeRaw.length) segments.push({ type: "text", value: safeRaw.slice(lastIndex) });
    return segments;
}

function findProduct(title) {
    const t = title.toLowerCase();
    return PRODUCTS.find((p) => p.title.toLowerCase() === t) || null;
}

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
    width: 372px; max-width: calc(100vw - 32px);
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

function BotIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="8" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="3" r="1.4" fill="currentColor" />
            <circle cx="8.5" cy="13.5" r="1.3" fill="currentColor" />
            <circle cx="15.5" cy="13.5" r="1.3" fill="currentColor" />
        </svg>
    );
}
function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function SendIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 11l18-8-8 18-2-8-8-2z" fill="currentColor" />
        </svg>
    );
}

function ProductCard({ title }) {
    const product = findProduct(title);
    return (
        <div className="hfchat-card">
            <div className="hfchat-card-title">{product ? product.title : title}</div>
            {product && (
                <>
                    <div className="hfchat-card-meta">{product.specs}</div>
                    <div className="hfchat-card-meta">{product.price}</div>
                </>
            )}
            {/* TODO: swap href="#" for a real route, e.g. `/services/${product?.id}` */}
            <a href={`/hizmetler/${product?.id}`} className="hfchat-card-link">
                Paketi incele →
            </a>
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
    const segments = parseAssistantContent(message.content);
    const showTyping = message.streaming && message.content.length === 0;
    return (
        <div className="hfchat-row">
            <div className="hfchat-bubble assistant">
                {showTyping ? (
                    <span className="hfchat-dots"><span /><span /><span /></span>
                ) : (
                    segments.map((seg, i) =>
                        seg.type === "text" ? <React.Fragment key={i}>{seg.value}</React.Fragment> : <ProductCard key={i} title={seg.title} />
                    )
                )}
            </div>
        </div>
    );
}

/* -------------------------------- Widget ------------------------------------ */
export default function AiChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Merhaba! Ben CloudHost AI asistanıyım. Paketlerimiz, fiyatlandırma ya da sunucularınızı nasıl yöneteceğiniz hakkında soru sorabilirsiniz." },
    ]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);

    const scrollRef = useRef(null);
    const clientRef = useRef(null);
    const cancelledRef = useRef(false);

    if (!clientRef.current) {
        const token = import.meta.env?.VITE_HF_TOKEN; // CRA: process.env.REACT_APP_HF_TOKEN
        clientRef.current = new InferenceClient(token);
    }

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

    useEffect(() => {
        cancelledRef.current = false; // reset in case StrictMode double-invoked this
        return () => { cancelledRef.current = true; };
    }, []);

    const streamReply = useCallback(async (history) => {
        setBusy(true);
        setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

        try {
            const stream = clientRef.current.chatCompletionStream({
                model: "meta-llama/Llama-3.1-8B-Instruct", // swap for any HF-hosted chat model you have access to
                provider: "auto",
                messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
                max_tokens: 400,
                temperature: 0.4,
            });

            let acc = "";
            for await (const chunk of stream) {
                if (cancelledRef.current) return;
                const delta = chunk.choices?.[0]?.delta?.content;
                if (delta) {
                    acc += delta;
                    setMessages((prev) => {
                        const next = [...prev];
                        next[next.length - 1] = { role: "assistant", content: acc, streaming: true };
                        return next;
                    });
                }
            }
            setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: acc, streaming: false };
                return next;
            });
        } catch (err) {
            setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                    role: "assistant",
                    content: "Üzgünüm, şu anda yapay zekâ servisine erişemedim. Lütfen birazdan tekrar deneyin.",
                    error: true,
                };
                return next;
            });
            console.error("HF chat stream failed:", err);
        } finally {
            if (!cancelledRef.current) setBusy(false);
        }
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
                        <BotIcon />
                        <div>
                            <strong>CloudHost AI Asistanı</strong>
                            <div><span>Genellikle saniyeler içinde yanıt verir</span></div>
                        </div>
                        <button className="hfchat-close" onClick={() => setOpen(false)} aria-label="Sohbeti kapat">
                            <CloseIcon />
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
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}

            <button className="hfchat-launcher" onClick={() => setOpen((v) => !v)} aria-label="Yapay zekâ destek sohbetini aç">
                {open ? <CloseIcon /> : <BotIcon />}
            </button>
        </>
    );
}