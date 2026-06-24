export default function Badge({ children, tone = "muted" }) {
    const toneClass = {
        success: "bg-success-soft text-success border-success",
        danger: "bg-danger-soft text-danger border-danger",
        amber: "bg-amber-soft text-amber border-amber",
        ai: "bg-ai-soft text-ai border-ai",
        brand: "bg-brand-soft text-brand border-brand",
        muted: "border-token-light text-muted",
    }[tone];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-display ${toneClass}`}>
            {children}
        </span>
    );
}