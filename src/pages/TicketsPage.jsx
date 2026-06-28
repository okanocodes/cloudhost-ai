import React, { useState } from "react";
import { Plus } from "lucide-react";
import PrimaryButton from "../components/ui/PrimaryButton";
import Badge from "../components/ui/Badge";
import { useDispatch, useSelector } from "react-redux";
import { createTicket } from "../store/ticketSlice";

export default function TicketsPage() {
    const dispatch = useDispatch();
    const allTickets = useSelector((state) => state.tickets.tickets);
    const currentUser = useSelector((state) => state.auth.user);
    const userEmail = currentUser ? currentUser.email : "";

    const ticketRegistry = allTickets.filter((t) => t.userEmail === userEmail);

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    function submitTicket(e) {
        e.preventDefault();
        if (!message.trim()) return;
        dispatch(createTicket({ subject: subject || "Genel Talep", message, userEmail }));
        setSubject("");
        setMessage("");
    }

    return (
        <div className="px-6 py-12">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-semibold text-ink">Destek Merkezi</h1>
                <p className="text-muted mt-1">Sorununuzu kısaca yazın.</p>

                <form onSubmit={submitTicket} className="chai-fade-up mt-4 rounded-2xl border border-token bg-card p-5 space-y-3">
                    <div>
                        <label className="text-xs text-muted">Konu</label>
                        <input value={subject} onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-token-light bg-canvas px-3 py-2 text-sm text-ink" />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Talep İçeriği </label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                            className="mt-1 w-full rounded-lg border border-token-light bg-canvas px-3 py-2 text-sm text-ink" required />
                    </div>
                    <PrimaryButton type="submit"><Plus size={14} /> Talep Oluştur</PrimaryButton>
                </form>

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
