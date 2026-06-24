import Badge from './Badge'
import { Loader2 } from "lucide-react";

export default function StatusPill({ status }) {
  if (status === "active") {
    return (
      <Badge tone="success">
        <span className="h-1.5 w-1.5 rounded-full bg-current" /> AKTİF
      </Badge>
    );
  }
  if (status === "rebooting") {
    return (
      <span className="status-rebooting inline-flex items-center gap-1.5 rounded-full border border-amber px-2.5 py-1 text-xs font-display bg-amber-soft text-amber">
        <Loader2 size={12} className="animate-spin" /> YENİDEN BAŞLATILIYOR
      </span>
    );
  }
  return (
    <Badge tone="muted">
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> DURDURULDU
    </Badge>
  );
}