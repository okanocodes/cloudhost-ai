import React, { useState } from "react";
import AuthShell from "../components/AuthShell";
import PrimaryButton from "../components/ui/PrimaryButton";
import { Mail, Lock, AlertTriangle } from "lucide-react";

export default function LoginPage({ onLogin, goTo, notice }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return (
        <AuthShell title="Giriş Yap" subtitle="CloudHost AI hesabınıza erişin">
            {notice && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber bg-amber-soft px-3 py-2 text-xs text-amber">
                    <AlertTriangle size={14} /> {notice}
                </div>
            )}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onLogin({ name: email.split("@")[0] || "Kullanıcı", email: email || "demo@cloudhost.ai" });
                }}
                className="space-y-3"
            >
                <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-posta adresi"
                        className="w-full rounded-lg border border-token-light bg-canvas py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-faint" />
                </div>
                <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Şifre"
                        className="w-full rounded-lg border border-token-light bg-canvas py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-faint" />
                </div>
                <PrimaryButton type="submit" className="w-full">Giriş Yap</PrimaryButton>
            </form>
            <p className="mt-4 text-center text-xs text-faint">Bu bir demo ortamıdır, gerçek kimlik doğrulama yapılmaz.</p>
            <p className="mt-3 text-center text-sm text-muted">
                Hesabınız yok mu?{" "}
                <button onClick={() => goTo("register")} className="text-brand hover:underline">Kayıt Ol</button>
            </p>
        </AuthShell>
    );
}
