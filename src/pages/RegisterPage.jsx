import React, { useState } from "react";
import AuthShell from "../components/AuthShell";
import PrimaryButton from "../components/ui/PrimaryButton";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/authSlice";
import { Link, Navigate } from "react-router-dom";

export default function RegisterPage() {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();

    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AuthShell title="Hesap Oluştur" subtitle="Saniyeler içinde başlayın">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    dispatch(register({ 
                        name: name || "Kullanıcı", 
                        email: email || "demo@cloudhost.ai",
                        password: password || "0000"
                    }));
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
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Şifre"
                        className="w-full rounded-lg border border-token-light bg-canvas py-2.5 pl-9 pr-10 text-sm text-ink placeholder:text-faint" />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink cursor-pointer focus:outline-none flex items-center justify-center"
                        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
                <PrimaryButton type="submit" className="w-full">Hesap Oluştur</PrimaryButton>
            </form>
            <p className="mt-4 text-center text-xs text-faint">Bu bir demo ortamıdır, gerçek kimlik doğrulama yapılmaz.</p>
            <p className="mt-3 text-center text-sm text-muted">
                Zaten hesabınız var mı?{" "}
                <Link to="/login" className="text-brand hover:underline font-medium">Giriş Yap</Link>
            </p>
        </AuthShell>
    );
}
