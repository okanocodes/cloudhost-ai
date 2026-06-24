import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqItem({ item, open, onToggle }) {
  return (
    <div className="rounded-xl border border-token bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3 text-sm font-medium text-ink">
          <HelpCircle size={16} className="text-ai flex-shrink-0" /> {item.q}
        </span>
        <ChevronDown size={16} className={`text-muted flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`chai-accordion-body ${open ? "open" : ""}`}>
        <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
      </div>
    </div>
  );
}