export default function PrimaryButton({ children, onClick, className = "", type = "button", disabled }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand bg-brand-hover px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}