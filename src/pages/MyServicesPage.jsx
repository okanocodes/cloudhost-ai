import React, { useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import AssistantWidget from "../components/AssistantWidget";
import GhostButton from "../components/ui/GhostButton";
import { RotateCw, Power, LifeBuoy } from "lucide-react";
import { matchFAQ } from "../lib/aiEngine";

export default function MyServicesPage({ instances, onReboot, onToggleStop, highlightActions }) {
    const [helpOpen, setHelpOpen] = useState(false);
    return (
        <div className="px-6 py-12">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-semibold text-ink">Servislerim</h1>
                <p className="text-muted mt-1">Aktif sunucu filonuzu buradan yönetin.</p>

                <div className="mt-6 overflow-x-auto rounded-2xl border border-token bg-card">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-token text-left text-xs font-display uppercase tracking-wider text-muted">
                                <th className="px-5 py-3">Servis Adı</th>
                                <th className="px-5 py-3">Durum</th>
                                <th className="px-5 py-3">IP Adresi</th>
                                <th className="px-5 py-3">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instances.map((inst) => (
                                <tr key={inst.id} className="border-b border-token last:border-0">
                                    <td className="px-5 py-4">
                                        <p className="text-ink font-medium">{inst.name}</p>
                                        <p className="text-xs text-faint">{inst.service}</p>
                                    </td>
                                    <td className="px-5 py-4"><StatusPill status={inst.status} /></td>
                                    <td className="px-5 py-4 font-display text-muted">{inst.ip}</td>
                                    <td className="px-5 py-4">
                                        <div className={`flex gap-2 ${highlightActions.value ? "action-focus" : ""}`}>
                                            <button
                                                onClick={() => onReboot(inst.id)}
                                                disabled={inst.status === "rebooting"}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-token-light px-3 py-1.5 text-xs text-muted bg-card-hover hover:text-ink disabled:opacity-40"
                                            >
                                                <RotateCw size={13} /> Yeniden Başlat
                                            </button>
                                            <button
                                                onClick={() => onToggleStop(inst.id)}
                                                disabled={inst.status === "rebooting"}
                                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40 ${inst.status === "stopped"
                                                    ? "border-success text-success bg-success-soft"
                                                    : "border-danger text-danger bg-danger-soft"
                                                    }`}
                                            >
                                                <Power size={13} /> {inst.status === "stopped" ? "Başlat" : "Durdur"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => setHelpOpen((v) => !v)}
                        className="inline-flex items-center gap-2 text-sm text-ai hover:underline mb-3"
                    >
                        <LifeBuoy size={15} /> Canlı Sistem Yardım Terminali {helpOpen ? "▲" : "▼"}
                    </button>
                    {helpOpen && (
                        <div className="max-w-lg chai-fade-up">
                            <AssistantWidget
                                title="Sistem Yardım Terminali"
                                intro="Sunucu işlemleriyle ilgili bir komut yazın, örn: “Sunucumu nasıl yeniden başlatırım?”"
                                quickQuestions={["Sunucumu nasıl yeniden başlatırım?", "Sunucumu nasıl durdurabilirim?"]}
                                respond={(q) => {
                                    const faq = matchFAQ(q);
                                    if (faq) return { type: "faq", text: faq.a, faq };
                                    return { type: "faq", text: "Bunun için Servislerim tablosundaki İşlemler sütunundaki düğmeleri kullanabilirsiniz.", faq: null };
                                }}
                                onResult={(result) => {
                                    if (result.faq && (result.faq.id === "faq-reboot" || result.faq.id === "faq-stop")) {
                                        highlightActions.trigger();
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
