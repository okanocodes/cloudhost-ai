import React, { useState } from "react";
import { Bot, Search, CheckCircle2, XCircle, AlertTriangle, Plus } from "lucide-react";
import PrimaryButton from "../components/ui/PrimaryButton";
import GhostButton from "../components/ui/GhostButton";
import Badge from "../components/ui/Badge";
import { matchFAQ } from "../lib/aiEngine";

export default function TicketsPage({ ticketRegistry, onCreateTicket }) {
    const [draft, setDraft] = useState("");
    const [triage, setTriage] = useState(null); // null | { faq } | 'none'
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    function submitDraft(e) {
        e.preventDefault();
        if (!draft.trim()) return;
        const faq = matchFAQ(draft);
        setSubject(draft.slice(0, 60));
        setMessage(draft);
        if (faq) {
            setTriage({ faq });
            setShowForm(false);
        } else {
            setTriage("none");
            setShowForm(true);
        }
    }

    function resetFlow() {
        setDraft("");
        setTriage(null);
        setShowForm(false);
        setSubject("");
        setMessage("");
    }

    function submitTicket(e) {
        e.preventDefault();
        onCreateTicket({ subject: subject || "Genel Talep", message });
        resetFlow();
    }

    return (
        <div className="px-6 py-12">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-semibold text-ink">Destek Merkezi</h1>
                <p className="text-muted mt-1">Önce sorununuzu yazın, AI asistanımız mevcut bir çözüm olup olmadığını kontrol etsin.</p>

                {!triage && (
                    <form onSubmit={submitDraft} className="mt-6 rounded-2xl border border-token bg-card p-5">
                        <label className="text-sm text-muted">Sorununuzu kısaca yazın.</label>
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={3}
                            placeholder="Örn: Sunucum yeniden başlamıyor…"
                            className="mt-2 w-full rounded-lg border border-token-light bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-faint"
                        />
                        <PrimaryButton type="submit" className="mt-3"><Search size={14} /> Çözüm Ara</PrimaryButton>
                    </form>
                )}

                {triage && triage !== "none" && (
                    <div className="chai-fade-up mt-6 rounded-2xl border border-ai bg-ai-soft p-5">
                        <div className="flex items-center gap-2 text-ai text-sm font-medium mb-2"><Bot size={15} /> AI Destek Özeti</div>
                        <p className="text-sm text-ink leading-relaxed">{triage.faq.a}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <PrimaryButton onClick={resetFlow} className="bg-success border-success">
                                <CheckCircle2 size={14} /> Bu çözdü, teşekkürler
                            </PrimaryButton>
                            <GhostButton onClick={() => setShowForm(true)}>
                                <XCircle size={14} /> Hayır, destek talebi oluştur
                            </GhostButton>
                        </div>
                    </div>
                )}

                {triage === "none" && (
                    <div className="chai-fade-up mt-6 flex items-center gap-2 rounded-lg border border-amber bg-amber-soft px-4 py-3 text-sm text-amber">
                        <AlertTriangle size={15} /> Otomatik bir çözüm bulunamadı, lütfen talebinizi detaylandırın.
                    </div>
                )}

                {showForm && (
                    <form onSubmit={submitTicket} className="chai-fade-up mt-4 rounded-2xl border border-token bg-card p-5 space-y-3">
                        <div>
                            <label className="text-xs text-muted">Konu</label>
                            <input value={subject} onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-token-light bg-canvas px-3 py-2 text-sm text-ink" />
                        </div>
                        <div>
                            <label className="text-xs text-muted">Talep İçeriği (Markdown desteklenir)</label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                                className="mt-1 w-full rounded-lg border border-token-light bg-canvas px-3 py-2 text-sm text-ink" />
                        </div>
                        <PrimaryButton type="submit"><Plus size={14} /> Talep Oluştur</PrimaryButton>
                    </form>
                )}

                <h2 className="mt-10 text-sm font-display uppercase tracking-wider text-muted">Talep Geçmişi</h2>
                <div className="mt-3 space-y-3">
                    {ticketRegistry.length === 0 && <p className="text-sm text-faint">Henüz bir destek talebiniz yok.</p>}
                    {ticketRegistry.map((t) => (
                        <div key={t.id} className="rounded-xl border border-token bg-card p-4 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-ink">#{t.id} · {t.subject}</p>
                                <p className="text-xs text-muted mt-1">{t.message}</p>
                            </div>
                            <Badge tone={t.status === "open" ? "amber" : "success"}>{t.status === "open" ? "AÇIK" : "ÇÖZÜLDÜ"}</Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
