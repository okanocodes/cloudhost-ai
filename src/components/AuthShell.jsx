import React from "react";
import Logo from "./ui/Logo";

export default function AuthShell({ children, title, subtitle }) {
    return (
        <div className="chai-grid-bg flex items-center justify-center px-6 py-16" style={{ minHeight: "70vh" }}>
            <div className="w-full max-w-sm rounded-2xl border border-token bg-card p-7">
                <div className="flex justify-center mb-4"><Logo size={36} /></div>
                <h1 className="text-center text-xl font-semibold text-ink">{title}</h1>
                <p className="text-center text-sm text-muted mt-1 mb-6">{subtitle}</p>
                {children}
            </div>
        </div>
    );
}
