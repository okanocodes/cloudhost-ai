import { useState, useRef, useEffect, useCallback } from "react";
import { parseAssistantResponse } from "../lib/aiChatService";

// Mesaj geçmişi durumunu (messages), girdi kutusunu (input) ve bekleme durumunu (busy) yöneten React kancası (hook).
export function useAIChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages); // Sohbet pencerisindeki mesaj geçmişi
  const [input, setInput] = useState(""); // Kullanıcının yazdığı anlık girdi metni
  const [busy, setBusy] = useState(false); // Sunucudan yanıt beklenip beklenmediği durumu
  const cancelledRef = useRef(false); // Bileşenin (component) kaldırılması durumunda akışı iptal etmek için referans

  // Bileşen sonlandığında (unmount) asenkron akışı durdurmak için temizlik yapar.
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  // Mesaj geçmişini kullanarak Express API sunucumuza bağlanan ve yanıtı kelime kelime akıtan (stream) fonksiyon.
  const streamReply = useCallback(async (history) => {
    setBusy(true);
    // Yapay zekanın yazmaya başlaması için boş bir asistan mesaj kutusu ekler.
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      // Yerelde http://localhost:3000, üretim ortamında (Vercel) ise çevre değişkenindeki Render URL'ini kullanır.
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: history,
        }),
      });

      // Eğer sunucudan olumsuz bir yanıt döndüyse detaylı hata mesajını yakalar.
      if (!response.ok) {
        let errText = `HTTP error! status: ${response.status}`;
        try {
          const rawText = await response.text();
          try {
            const errJson = JSON.parse(rawText);
            if (errJson && errJson.error) {
              errText =
                typeof errJson.error === "object"
                  ? JSON.stringify(errJson.error)
                  : errJson.error;
            } else {
              errText = rawText;
            }
          } catch {
            errText = rawText || errText;
          }
        } catch {
          // ignore
        }
        throw new Error(errText);
      }

      // Sunucudan gelen veri akışını (stream) okumak için okuyucu başlatır.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = ""; // Gelen tüm kelimelerin biriktiği değişken
      let partialLine = ""; // Tamamlanmamış veri satırlarını birleştirmek için tampon

      // SSE (Server-Sent Events) veri akışını satır satır okuyan döngü.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (cancelledRef.current) return; // Bileşen kaldırıldıysa döngüden çık

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split("\n");
        partialLine = lines.pop() || ""; // Son yarım kalmış satırı bir sonraki döngüye saklar

        for (const line of lines) {
          const cleanLine = line.trim();
          // SSE standartlarında veri satırları "data: " ile başlar
          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.slice(6);
            if (dataStr === "[DONE]") continue; // Akış bittiğinde döngüyü sürdürür
            try {
              const data = JSON.parse(dataStr);
              // HuggingFace veya OpenAI formatındaki delta içeriğini (yeni kelimeyi) çeker
              const delta = data.choices?.[0]?.delta?.content;
              if (delta) {
                acc += delta;
                const separator = "\n---\n";
                // JSON veri kartlarını akış esnasında gizlemek için sadece görünür metni ayırır
                const visibleText = acc.includes(separator)
                  ? acc.split(separator)[0]
                  : acc;

                // Anlık olarak arayüzdeki son mesaj kutusunu günceller (kelime yazma efekti)
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: "assistant",
                    content: visibleText,
                    streaming: true,
                  };
                  return next;
                });
              }
            } catch {
              // Hatalı JSON satırlarını yoksay
            }
          }
        }
      }

      // Akış bittiğinde son biriken metni parse ederek varsa önerilen ürün kartı JSON verisini ayrıştırır.
      setMessages((prev) => {
        const next = [...prev];
        const parsed = parseAssistantResponse(acc);
        next[next.length - 1] = {
          role: "assistant",
          content: parsed.message,
          metadata: parsed.metadata,
          streaming: false,
        };
        return next;
      });
    } catch (err) {
      // Bir hata oluştuğunda arayüzde hata bildirim kutusunu gösterir.
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `Üzgünüm, yapay zekâ servisine erişirken bir sorun oluştu`,
          error: true,
        };
        return next;
      });
      console.error("Express API chat stream failed:", err);
    } finally {
      if (!cancelledRef.current) setBusy(false);
    }
  }, []);

  return {
    messages,
    setMessages,
    input,
    setInput,
    busy,
    setBusy,
    streamReply,
  };
}
