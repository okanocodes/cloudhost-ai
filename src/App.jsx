import React, { useState, useEffect, useRef } from "react";
import {
  Server, Cloud, Globe, Cpu, HardDrive, Bot, User, LogOut,
  Ticket, HelpCircle, LayoutDashboard, CheckCircle2, XCircle, RotateCw,
  Power, Search, Send, ChevronDown, ShieldCheck, MapPin, Mail, Lock,
  ArrowRight, Sparkles, Activity, DollarSign, Database, AlertTriangle,
  Loader2, LifeBuoy, Plus, ChevronRight, Menu, X,
} from "lucide-react";

import { COMPANY, FAQ, SERVICES } from "./data/knowledgeBase";
import { GLOBAL_STYLE } from './design-tokens'
import Logo from "./components/ui/Logo";
import GhostButton from "./components/ui/GhostButton";
import PrimaryButton from "./components/ui/PrimaryButton";
import Toast from "./components/ui/Toast";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MyServicesPage from "./pages/MyServicesPage";
import TicketsPage from "./pages/TicketsPage";
import FaqPage from "./pages/FaqPage";
import PurchasePage from "./pages/PurchasePage";
import AboutUsPage from "./pages/AboutUsPage";
import AiChatWidget from "./components/AIChatWidget";
import { logout as authLogout, setNotice } from "./store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";


/* ======================================================================
   CONCEPTUAL FILE MAP (single-file artifact — sections mirror what would
   be separate files in a real Vite project)
   ----------------------------------------------------------------------
   /design-tokens            -> COLORS + global <style> block
   /data/knowledgeBase.js     -> COMPANY, SERVICES, FAQ
   /lib/aiEngine.js           -> normalize, matchService, matchFAQ,
                                  assessSuitability, aiRespond
   /state/slices              -> useState slices inside <CloudHostAI>
                                  (session, instances, ticketRegistry, nav)
   /components/ui             -> Logo, Badge, StatusPill, Toast, FaqItem
   /components/AssistantWidget-> reusable AI chat unit (mini + full variant)
   /components/ServiceFinderBar
   /pages/*                   -> HomePage, ServicesPage, ServiceDetailPage,
                                  LoginPage, RegisterPage, DashboardPage,
                                  MyServicesPage, TicketsPage, ChatPage,
                                  FaqPage
   /App                       -> NavBar + router switch + Footer
   ====================================================================== */

/* ---------------------------- DESIGN TOKENS --------------------------- */
// const GLOBAL_STYLE = `
//   .chai-root, .chai-root * { box-sizing: border-box; }
//   .chai-root {
//     font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
//     background-color: #0B0F19;
//     color: #F8FAFC;
//   }
//   .font-display { font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace; }

//   .bg-canvas{ background-color:#0B0F19; }
//   .bg-card{ background-color:#1E293B; }
//   .bg-card-soft{ background-color:#161F30; }
//   .bg-card-hover:hover{ background-color:#24324A; }
//   .text-ink{ color:#F8FAFC; }
/* --------------------------------- Pages --------------------------------- */
// Pages have been moved to `src/pages/*`. Imports above provide implementations.

/* --------------------------------- NavBar --------------------------------- */
function NavBar({ session, onLogout }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
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

function Footer() {
  return (
    <footer className="border-t border-token px-6 py-8">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint">
        <span className="flex items-center gap-2"><Logo size={18} /> {COMPANY.name} · {COMPANY.support}</span>
        <span>© 2026 {COMPANY.name}. Demo amaçlı oluşturulmuştur.</span>
      </div>
    </footer>
  );
}

/* ==================================== APP ======================= */
function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  if (!isLoggedIn) {
    dispatch(setNotice("Bu sayfayı görüntülemek için giriş yapmalısınız."));
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function CloudHostAI() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const session = {
    isLoggedIn: auth.isLoggedIn,
    name: auth.user ? (auth.user.name || auth.user.email.split("@")[0]) : "",
    email: auth.user ? auth.user.email : ""
  };

  const prevIsLoggedInRef = useRef(auth.isLoggedIn);

  useEffect(() => {
    if (prevIsLoggedInRef.current !== auth.isLoggedIn) {
      if (auth.isLoggedIn) {
        const displayName = auth.user ? (auth.user.name || auth.user.email.split("@")[0]) : "Kullanıcı";
        showToast(`Tekrar hoş geldin, ${displayName}!`);
      } else {
        showToast("Çıkış yapıldı.");
        navigate("/");
      }
      prevIsLoggedInRef.current = auth.isLoggedIn;
    }
  }, [auth.isLoggedIn, auth.user, navigate]);

  const [toast, setToast] = useState("");

  // Expose toast to window so it can be called from other pages if necessary
  window.showAppToast = showToast;

  function showToast(msg) {
    setToast(msg);
    window.clearTimeout(window.__chaiToastTimer);
    window.__chaiToastTimer = window.setTimeout(() => setToast(""), 2800);
  }

  return (
    <div className="chai-root min-h-screen">
      <style>{GLOBAL_STYLE}</style>
      <NavBar session={session} onLogout={() => dispatch(authLogout())} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/purchase/:id" element={<ProtectedRoute><PurchasePage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/myservices" element={<ProtectedRoute><MyServicesPage /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <Toast message={toast} />
      {location.pathname !== "/" && <AiChatWidget />}
    </div>
  );
}

// Pages live under `src/pages/*` now.