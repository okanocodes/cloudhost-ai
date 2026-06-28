import React from "react";
import MetricCard from "../components/MetricCard";
import { Server, DollarSign, Ticket, HelpCircle } from "lucide-react";
import { SERVICES } from "../data/knowledgeBase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
    const navigate = useNavigate();
    const auth = useSelector((state) => state.auth);
    const displayName = auth.user ? (auth.user.name || auth.user.email.split("@")[0]) : "";
    const userEmail = auth.user ? auth.user.email : "";

    const instances = useSelector((state) => state.myServices.instances);
    const userInstances = instances.filter((i) => i.userEmail === userEmail);

    const activeCount = userInstances.filter((i) => i.status !== "stopped").length;
    const monthlyTotal = userInstances.reduce((sum, i) => {
        const svc = SERVICES.find((s) => s.name === i.service);
        return sum + (svc ? svc.price : 0);
    }, 0);

    const allTickets = useSelector((state) => state.tickets.tickets);
    const ticketRegistry = allTickets.filter((t) => t.userEmail === userEmail);
    const openTickets = ticketRegistry.filter((t) => t.status === "open").length;

    const shortcuts = [
        { id: "myservices", title: "Servislerim", desc: "Sunucularını başlat, durdur veya yeniden başlat.", icon: Server },
        { id: "tickets", title: "Destek Merkezi", desc: "Yeni destek talebi oluştur veya mevcutları gör.", icon: Ticket },
        { id: "faq", title: "Bilgi Bankası", desc: "Sıkça sorulan soruları incele.", icon: HelpCircle },
    ];

    return (
        <div className="px-6 py-12">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-semibold text-ink">Tekrar hoş geldin, {displayName} 👋</h1>
                <p className="text-muted mt-1">Altyapı durumunun genel görünümü.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <MetricCard icon={Server} label="Aktif Altyapı Modülleri" value={activeCount} tone="success" />
                    <MetricCard icon={DollarSign} label="Aylık Toplam Fatura" value={`$${monthlyTotal}`} tone="brand" />
                    <MetricCard icon={Ticket} label="Açık Destek Talebi" value={openTickets} tone="amber" />
                </div>

                <h2 className="mt-10 text-sm font-display uppercase tracking-wider text-muted">Hızlı Erişim</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {shortcuts.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => navigate("/" + s.id)}
                            className="text-left rounded-2xl border border-token bg-card p-5 bg-card-hover transition"
                        >
                            <s.icon size={18} className="text-ai" />
                            <p className="mt-3 text-sm font-medium text-ink">{s.title}</p>
                            <p className="mt-1 text-xs text-muted leading-relaxed">{s.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
