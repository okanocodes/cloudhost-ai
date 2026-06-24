export const GLOBAL_STYLE = `
  .chai-root, .chai-root * { box-sizing: border-box; }
  .chai-root {
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
    background-color: #0B0F19;
    color: #F8FAFC;
  }
  .font-display { font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace; }

  .bg-canvas{ background-color:#0B0F19; }
  .bg-card{ background-color:#1E293B; }
  .bg-card-soft{ background-color:#161F30; }
  .bg-card-hover:hover{ background-color:#24324A; }
  .text-ink{ color:#F8FAFC; }
  .text-muted{ color:#94A3B8; }
  .text-faint{ color:#64748B; }
  .border-token{ border-color:#27324A; }
  .border-token-light{ border-color:#33405C; }

  .text-brand{ color:#2563EB; }
  .bg-brand{ background-color:#2563EB; }
  .bg-brand-hover:hover{ background-color:#1D4ED8; }
  .border-brand{ border-color:#2563EB; }
  .bg-brand-soft{ background-color:rgba(37,99,235,0.12); }

  .text-ai{ color:#8B5CF6; }
  .bg-ai{ background-color:#8B5CF6; }
  .bg-ai-hover:hover{ background-color:#7C3AED; }
  .border-ai{ border-color:#8B5CF6; }
  .bg-ai-soft{ background-color:rgba(139,92,246,0.12); }

  .text-success{ color:#10B981; }
  .bg-success{ background-color:#10B981; }
  .border-success{ border-color:#10B981; }
  .bg-success-soft{ background-color:rgba(16,185,129,0.14); }

  .text-danger{ color:#EF4444; }
  .bg-danger{ background-color:#EF4444; }
  .bg-danger-hover:hover{ background-color:#DC2626; }
  .border-danger{ border-color:#EF4444; }
  .bg-danger-soft{ background-color:rgba(239,68,68,0.14); }

  .text-amber{ color:#F59E0B; }
  .bg-amber-soft{ background-color:rgba(245,158,11,0.16); }
  .border-amber{ border-color:#F59E0B; }

  .chai-scroll::-webkit-scrollbar{ width:8px; height:8px; }
  .chai-scroll::-webkit-scrollbar-track{ background:transparent; }
  .chai-scroll::-webkit-scrollbar-thumb{ background:#33405C; border-radius:8px; }
  .chai-scroll::-webkit-scrollbar-thumb:hover{ background:#8B5CF6; }

  .chai-root button, .chai-root input, .chai-root textarea, .chai-root select, .chai-root a[tabindex] {
    outline: none;
  }
  .chai-root button:focus-visible, .chai-root input:focus-visible,
  .chai-root textarea:focus-visible, .chai-root select:focus-visible,
  .chai-root a:focus-visible, .chai-root [tabindex]:focus-visible {
    outline: 2px solid #8B5CF6;
    outline-offset: 2px;
    border-radius: 6px;
  }

  @keyframes chaiPulseAmber {
    0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.55); }
    50% { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
  }
  .status-rebooting { animation: chaiPulseAmber 1s ease-out infinite; }

  @keyframes chaiShine {
    0%,100% { box-shadow: 0 0 0 1px rgba(139,92,246,0.55), 0 0 0px rgba(139,92,246,0.0); }
    50% { box-shadow: 0 0 0 1px rgba(139,92,246,0.85), 0 0 28px rgba(139,92,246,0.45); }
  }
  .ai-recommended { animation: chaiShine 1.8s ease-in-out infinite; border-color: #8B5CF6 !important; }

  @keyframes chaiFocusRing {
    0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.65); }
    50% { box-shadow: 0 0 0 5px rgba(139,92,246,0.0); }
  }
  .action-focus { animation: chaiFocusRing 0.7s ease-out 3; border-radius: 8px; }

  @keyframes chaiFadeUp {
    from { opacity:0; transform: translateY(6px); }
    to { opacity:1; transform: translateY(0); }
  }
  .chai-fade-up { animation: chaiFadeUp 0.25s ease-out; }

  @keyframes chaiToastIn {
    from { opacity:0; transform: translateY(8px); }
    to { opacity:1; transform: translateY(0); }
  }
  .chai-toast { animation: chaiToastIn 0.2s ease-out; }

  .chai-accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
  .chai-accordion-body.open { max-height: 480px; }

  .chai-grid-bg {
    background-image:
      linear-gradient(rgba(37,99,235,0.10) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.10) 1px, transparent 1px);
    background-size: 36px 36px;
  }

  .chai-detail-grid { display:grid; gap:1.5rem; }
  @media (min-width: 1024px) { .chai-detail-grid { grid-template-columns: 1fr 340px; } }

  .chai-chat-grid { display:grid; gap:1.5rem; }
  @media (min-width: 768px) { .chai-chat-grid { grid-template-columns: 220px 1fr; } }

  @media (prefers-reduced-motion: reduce) {
    .chai-root *, .chai-root *::before, .chai-root *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;
