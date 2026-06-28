import React, { useState, useEffect } from "react";
import StatusPill from "../components/ui/StatusPill";
import AssistantWidget from "../components/AssistantWidget";
import { RotateCw, Power, LifeBuoy } from "lucide-react";
import { matchFAQ } from "../lib/aiEngine";
import { useSelector, useDispatch } from "react-redux";
import { rebootInstance, toggleStopInstance } from "../store/myServicesSlice";

export default function MyServicesPage() {
    const dispatch = useDispatch();
    const userEmail = useSelector((state) => state.auth.user?.email);
    const instances = useSelector((state) => state.myServices.instances);
    const userInstances = instances.filter((i) => i.userEmail === userEmail);
    const [helpOpen, setHelpOpen] = useState(false);
    const [highlight, setHighlight] = useState(false);

    useEffect(() => {
        document.title = "Servislerim | CloudHost AI";
    }, []);

    function triggerHighlight() {
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2400);
    }

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
                            {userInstances.map((inst) => (
                                <tr key={inst.id} className="border-b border-token last:border-0">
                                    <td className="px-5 py-4">
                                        <p className="text-ink font-medium">{inst.name}</p>
                                        <p className="text-xs text-faint">{inst.service}</p>
                                    </td>
                                    <td className="px-5 py-4"><StatusPill status={inst.status} /></td>
                                    <td className="px-5 py-4 font-display text-muted">{inst.ip}</td>
                                    <td className="px-5 py-4">
                                        <div className={`flex gap-2 ${highlight ? "action-focus" : ""}`}>
                                            <button
                                                onClick={() => dispatch(rebootInstance(inst.id))}
                                                disabled={inst.status === "rebooting"}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-token-light px-3 py-1.5 text-xs text-muted bg-card-hover hover:text-ink disabled:opacity-40"
                                            >
                                                <RotateCw size={13} /> Yeniden Başlat
                                            </button>
                                            <button
                                                onClick={() => dispatch(toggleStopInstance(inst.id))}
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
            </div>
        </div>
    );
}
