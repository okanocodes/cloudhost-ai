import React, { useState } from "react";
import { CheckCircle2, Search, Sparkles } from "lucide-react";
import PrimaryButton from "./ui/PrimaryButton";
import { matchService } from "../lib/aiEngine";

export default function ServiceFinderBar({ onMatch }) {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);

    function run(e) {
        e.preventDefault();
        if (!query.trim()) return;
        const service = matchService(query);
        setResult(service);
        onMatch(service);
    }

    return (
        <div className="rounded-2xl border border-ai bg-ai-soft p-4 md:p-5">
            <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ai" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Dağıtım çerçevenizi tanımlayın, size en uygun altyapı seviyesini bulalım…"
                        className="w-full rounded-lg border border-ai bg-canvas py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-faint"
                    />
                </div>
                <PrimaryButton type="submit" className="bg-ai bg-ai-hover whitespace-nowrap">
                    <Sparkles size={15} /> Önerini Bul
                </PrimaryButton>
            </form>
            {result && (
                <div className="chai-fade-up mt-3 flex items-start gap-2 text-sm text-ink">
                    <CheckCircle2 size={16} className="text-ai mt-0.5 flex-shrink-0" />
                    <span>
                        <strong className="text-ai">{result.name}</strong> öneriliyor — {result.cpu} Çekirdek ve {result.ram}GB RAM
                        eşik haritalama kurallarına dayanarak isteğinizle eşleşti.
                    </span>
                </div>
            )}
        </div>
    );
}