import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Server, Ticket, LogOut, Menu, X } from "lucide-react";
import Logo from "./ui/Logo";
import GhostButton from "./ui/GhostButton";
import PrimaryButton from "./ui/PrimaryButton";
import { logout as authLogout } from "../store/authSlice";
import { COMPANY } from "../data/knowledgeBase";

export default function NavBar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const session = {
    isLoggedIn: auth.isLoggedIn,
    name: auth.user ? (auth.user.name || auth.user.email.split("@")[0]) : "",
    email: auth.user ? auth.user.email : ""
  };

  const onLogout = () => {
    dispatch(authLogout());
  };

  const publicLinks = [
    { id: "home", path: "/", label: "Ana Sayfa" },
    { id: "services", path: "/services", label: "Hizmetler" },
    { id: "about", path: "/about", label: "Hakkımızda" },
    { id: "faq", path: "/faq", label: "SSS" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-token bg-canvas backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <Logo /> <span className="font-display text-sm font-semibold text-ink">{COMPANY.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {publicLinks.map((l) => (
            <Link
              key={l.id}
              to={l.path}
              className={`rounded-lg px-3 py-2 text-sm transition ${isActive(l.path) ? "text-ink bg-card" : "text-muted hover:text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-2">
          {session.isLoggedIn ? (
            <>
              <Link to="/dashboard"><GhostButton className="py-2"><LayoutDashboard size={14} /> Panel</GhostButton></Link>
              <Link to="/myservices"><GhostButton className="py-2"><Server size={14} /> Servislerim</GhostButton></Link>
              <Link to="/tickets"><GhostButton className="py-2"><Ticket size={14} /> Destek</GhostButton></Link>
              <button onClick={onLogout} className="ml-1 flex items-center gap-1.5 rounded-lg border border-token-light px-3 py-2 text-sm text-muted hover:text-danger">
                <LogOut size={14} /> {session.name}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><GhostButton className="py-2">Giriş Yap</GhostButton></Link>
              <Link to="/register"><PrimaryButton className="py-2">Kayıt Ol</PrimaryButton></Link>
            </>
          )}
        </div>

        <button className="ml-auto md:hidden text-ink" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-token px-4 py-3 space-y-1">
          {[
            ...publicLinks,
            ...(session.isLoggedIn 
              ? [
                  { id: "dashboard", path: "/dashboard", label: "Panel" },
                  { id: "myservices", path: "/myservices", label: "Servislerim" },
                  { id: "tickets", path: "/tickets", label: "Destek Merkezi" }
                ] 
              : [
                  { id: "login", path: "/login", label: "Giriş Yap" },
                  { id: "register", path: "/register", label: "Kayıt Ol" }
                ])
          ].map((l) => (
            <Link
              key={l.id}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${isActive(l.path) ? "text-ink bg-card" : "text-muted"}`}
            >
              {l.label}
            </Link>
          ))}
          {session.isLoggedIn && (
            <button onClick={() => { onLogout(); setMobileOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger">Çıkış Yap</button>
          )}
        </div>
      )}
    </header>
  );
}
