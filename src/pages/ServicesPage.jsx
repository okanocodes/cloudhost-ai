import React, { useState } from "react";
import { Server } from "lucide-react";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import ServiceFinderBar from "../components/ServiceFinderBar";
import ServiceCard from "../components/ServiceCard";
import { SERVICES } from "../data/knowledgeBase";

export default function ServicesPage({ selectService }) {
    const [category, setCategory] = useState("Tümü");
    const [highlightId, setHighlightId] = useState(null);
    const cats = ["Tümü", "VPS", "Cloud Server", "Web Hosting"];
    const filtered = SERVICES.filter((s) => category === "Tümü" || s.category === category);

    return (
        <div className="px-6 py-12">
            <div className="mx-auto max-w-6xl">
                <SectionEyebrow icon={Server} tone="brand">Hizmetler</SectionEyebrow>
                <h1 className="mt-2 text-3xl font-semibold text-ink">Modüler Altyapı Kataloğu</h1>
                <p className="mt-2 max-w-2xl text-muted">Tüm VPS, Cloud Server ve Web Hosting katmanlarını karşılaştırın.</p>

                <div className="mt-6">
                    <ServiceFinderBar onMatch={(s) => setHighlightId(s.id)} />
                </div>

                <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
                    {cats.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${category === c ? "bg-brand border-brand text-white" : "border-token-light text-muted bg-card-hover"
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((s) => (
                        <ServiceCard key={s.id} service={s} onSelect={selectService} highlighted={highlightId === s.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
