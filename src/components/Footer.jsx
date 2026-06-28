import React from "react";
import Logo from "./ui/Logo";
import { COMPANY } from "../data/knowledgeBase";

export default function Footer() {
  return (
    <footer className="border-t border-token px-6 py-8">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint">
        <span className="flex items-center gap-2"><Logo size={18} /> {COMPANY.name} · {COMPANY.support}</span>
        <span>© 2026 {COMPANY.name}. Demo amaçlı oluşturulmuştur.</span>
      </div>
    </footer>
  );
}
