import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { FAQ } from "../data/knowledgeBase";
import FaqItem from "../components/ui/FaqItem";
import { normalize } from "../lib/aiEngine";

export default function FaqPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState([]);

    useEffect(() => {
        document.title = "Sıkça Sorulan Sorular | CloudHost AI";
    }, []);
    const filtered = FAQ.filter((f) => normalize(f.q + " " + f.a).includes(normalize(search)));
    return (
        <div className="px-6 py-12">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-semibold text-ink">Sıkça Sorulan Sorular</h1>
                <p className="text-muted mt-1">Politikalar, sunucu işlemleri ve veri merkezi bilgileri.</p>
                <div className="relative mt-6">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Soru veya konu ara…"
                        className="w-full rounded-lg border border-token-light bg-card py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-faint"
                    />
                </div>
                <div className="mt-5 space-y-3">
                    {filtered.map((f) => (
                        <FaqItem
                            key={f.id}
                            item={f}
                            open={open.includes(f.id)}
                            onToggle={() => setOpen((prev) =>
                                prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                            )}
                        />
                    ))}
                    {filtered.length === 0 && <p className="text-sm text-faint">Eşleşen bir sonuç bulunamadı.</p>}
                </div>
            </div>
        </div>
    );
}
