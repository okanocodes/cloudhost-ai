import React, { useState } from "react";
import AuthShell from "../components/AuthShell";
import PrimaryButton from "../components/ui/PrimaryButton";
import { User, Mail, Lock } from "lucide-react";

export default function RegisterPage({ onRegister, goTo }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return (
        <AuthShell title="Hesap Oluştur" subtitle="Saniyeler içinde başlayın">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onRegister({ name: name || "Kullanıcı", email: email || "demo@cloudhost.ai" });
                }}
                className="space-y-3"
            >
                <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad"
                        className="w-full rounded-lg border border-token-light bg-canvas py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-faint" />
                </div>
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
                <PrimaryButton type="submit" className="w-full">Hesap Oluştur</PrimaryButton>
            </form>
            <p className="mt-4 text-center text-xs text-faint">Bu bir demo ortamıdır, gerçek kimlik doğrulama yapılmaz.</p>
            <p className="mt-3 text-center text-sm text-muted">
                Zaten hesabınız var mı?{" "}
                <button onClick={() => goTo("login")} className="text-brand hover:underline">Giriş Yap</button>
            </p>
        </AuthShell>
    );
}
