import React from "react";
import AssistantWidget from "../components/AssistantWidget";

export default function ChatPage() {
    const quick = [
        "İade politikanız nedir?",
        "Hangi VPS paketini almalıyım?",
        "Destek saatleri nedir?",
        "Sunucumu nasıl yeniden başlatırım?",
        "Veri merkezleriniz nerede?",
    ];
    return (
        <div className="px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-2xl font-semibold text-ink mb-1">AI Destek Asistanı</h1>
                <p className="text-muted mb-6">Bilgi bankamızla beslenen asistanımıza sorularınızı sorun.</p>
                <div className="chai-chat-grid">
                    <div className="hidden md:block space-y-2">
                        <p className="text-xs font-display uppercase tracking-wider text-muted mb-2">Hazır Sorular</p>
                        {quick.map((q) => (
                            <div key={q} className="rounded-lg border border-token-light bg-card px-3 py-2 text-xs text-muted">{q}</div>
                        ))}
                    </div>
                    <div style={{ height: "560px" }}>
                        <AssistantWidget
                            title="CloudHost AI Asistanı"
                            intro="Merhaba! Paketler, faturalama veya sunucu işlemleri hakkında sorabilirsiniz."
                            quickQuestions={quick}
                            variant="full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
