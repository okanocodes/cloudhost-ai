
export default function SectionEyebrow({ icon: Icon, children, tone = "ai" }) {
    return (
        <div className={`inline-flex items-center gap-2 text-xs font-display uppercase tracking-wider ${tone === "ai" ? "text-ai" : "text-brand"}`}>
            {Icon && <Icon size={14} />} {children}
        </div>
    );
}
