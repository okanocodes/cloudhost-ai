import { useState, useRef, useEffect, useCallback } from "react";
import { parseAssistantResponse } from "../lib/aiChatService";

export function useAIChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const streamReply = useCallback(async (history) => {
    setBusy(true);
    // Append a new assistant message that will store the stream
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: history,
        }),
      });

      if (!response.ok) {
        let errText = `HTTP error! status: ${response.status}`;
        try {
          const rawText = await response.text();
          try {
            const errJson = JSON.parse(rawText);
            if (errJson && errJson.error) {
              errText = typeof errJson.error === 'object' ? JSON.stringify(errJson.error) : errJson.error;
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let partialLine = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (cancelledRef.current) return;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split("\n");
        partialLine = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.slice(6);
            if (dataStr === "[DONE]") continue;
            try {
              const data = JSON.parse(dataStr);
              const delta = data.choices?.[0]?.delta?.content;
              if (delta) {
                acc += delta;
                const separator = "\n---\n";
                // Hide the metadata while streaming
                const visibleText = acc.includes(separator)
                  ? acc.split(separator)[0]
                  : acc;

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
              // Ignore invalid JSON parsing (e.g. keep-alive comments or partial payloads)
            }
          }
        }
      }

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
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `Üzgünüm, yapay zekâ servisine erişirken bir sorun oluştu:\n${err.message}`,
          error: true,
        };
        return next;
      });
      console.error("Local API chat stream failed:", err);
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
