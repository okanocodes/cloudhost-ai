export default function GhostButton({ children, onClick, className = "", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-token-light px-4 py-2.5 text-sm font-medium text-ink bg-card-hover transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
