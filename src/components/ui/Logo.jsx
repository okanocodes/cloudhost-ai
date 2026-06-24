export default function Logo({ size = 28 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="#0B0F19" />
            <path
                d="M11 24a5.5 5.5 0 0 1 1.4-10.8A7 7 0 0 1 26 14.6 5 5 0 0 1 28.5 24H11Z"
                fill="#2563EB"
            />
            <circle cx="29" cy="13" r="2.4" fill="#8B5CF6" />
            <path d="M29 13v-3M27.5 13h3" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}