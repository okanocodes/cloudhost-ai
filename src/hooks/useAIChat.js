import { useState, useRef, useEffect, useCallback } from "react";
import {
  getInferenceClient,
  SYSTEM_PROMPT,
  parseAssistantResponse,
} from "../lib/aiChatService";

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
      const client = getInferenceClient();
      const stream = client.chatCompletionStream({
        model: "meta-llama/Llama-3.1-8B-Instruct",
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
          content:
            "Üzgünüm, şu anda yapay zekâ servisine erişemedim. Lütfen birazdan tekrar deneyin.",
          error: true,
        };
        return next;
      });
      console.error("HF chat stream failed:", err);
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
