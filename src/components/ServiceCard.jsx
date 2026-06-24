import React from "react";
import { Cpu, ArrowRight } from "lucide-react";
import CategoryIcon from "./ui/CategoryIcon";
import GhostButton from "./ui/GhostButton";

export default function ServiceCard({ service, onSelect, highlighted }) {
    return (
        <div
            className={`flex flex-col rounded-2xl border bg-card p-5 transition ${highlighted ? "ai-recommended border-ai" : "border-token"
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ai-soft px-2.5 py-1 font-display text-xs text-ai">
                    <Cpu size={12} /> {service.cpuLabel || `${service.cpu} Çekirdek`} CPU
                </span>
                <CategoryIcon category={service.category} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-ink">{service.name}</h3>
            <p className="mt-1 text-xs text-faint">{service.category}</p>

            <div className="mt-4 space-y-2 font-display text-sm">
                <div className="flex justify-between border-b border-token pb-2">
                    <span className="text-muted">RAM</span><span className="text-ink">{service.ram} GB</span>
                </div>
                <div className="flex justify-between border-b border-token pb-2">
                    <span className="text-muted">Depolama</span><span className="text-ink">{service.storage} GB {service.storageType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted">Aylık Ücret</span><span className="text-success font-semibold">${service.price}/ay</span>
                </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted flex-1">{service.bestFor}</p>

            <GhostButton onClick={() => onSelect(service.id)} className="mt-4 w-full hover:border-brand">
                İncele <ArrowRight size={14} />
            </GhostButton>
        </div>
    );
}
