import React from "react";

export default function MetricCard({ icon: Icon, label, value, tone = "brand" }) {
    return (
        <div className="rounded-2xl border border-token bg-card p-5">
            <div className={`inline-flex rounded-lg p-2 mb-3 ${tone === "brand" ? "bg-brand-soft" : tone === "success" ? "bg-success-soft" : "bg-amber-soft"}`}>
                <Icon size={16} className={tone === "brand" ? "text-brand" : tone === "success" ? "text-success" : "text-amber"} />
            </div>
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
        </div>
    );
}
