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
import ChatPage from "./pages/ChatPage";
import FaqPage from "./pages/FaqPage";
import PurchasePage from "./pages/PurchasePage";
import AiChatWidget from "./components/AIChatWidget";
import { logout as authLogout, setActiveTab, setNotice } from "./store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedServiceId } from "./store/servicesSlice";


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
  const activeTab = useSelector((state) => state.auth.activeTab);
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const publicLinks = [
    { id: "home", label: "Ana Sayfa" },
    { id: "services", label: "Hizmetler" },
    { id: "chat", label: "AI Destek" },
    { id: "faq", label: "SSS" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-token bg-canvas backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3.5">
        <button onClick={() => dispatch(setActiveTab("home"))} className="flex items-center gap-2">
          <Logo /> <span className="font-display text-sm font-semibold text-ink">{COMPANY.name}</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {publicLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => dispatch(setActiveTab(l.id))}
              className={`rounded-lg px-3 py-2 text-sm transition ${activeTab === l.id ? "text-ink bg-card" : "text-muted hover:text-ink"}`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-2">
          {session.isLoggedIn ? (
            <>
              <GhostButton onClick={() => dispatch(setActiveTab("dashboard"))} className="py-2"><LayoutDashboard size={14} /> Panel</GhostButton>
              <GhostButton onClick={() => dispatch(setActiveTab("myservices"))} className="py-2"><Server size={14} /> Servislerim</GhostButton>
              <GhostButton onClick={() => dispatch(setActiveTab("tickets"))} className="py-2"><Ticket size={14} /> Destek</GhostButton>
              <button onClick={onLogout} className="ml-1 flex items-center gap-1.5 rounded-lg border border-token-light px-3 py-2 text-sm text-muted hover:text-danger">
                <LogOut size={14} /> {session.name}
              </button>
            </>
          ) : (
            <>
              <GhostButton onClick={() => dispatch(setActiveTab("login"))} className="py-2">Giriş Yap</GhostButton>
              <PrimaryButton onClick={() => dispatch(setActiveTab("register"))} className="py-2">Kayıt Ol</PrimaryButton>
            </>
          )}
        </div>

        <button className="ml-auto md:hidden text-ink" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-token px-4 py-3 space-y-1">
          {[...publicLinks, ...(session.isLoggedIn ? [{ id: "dashboard", label: "Panel" }, { id: "myservices", label: "Servislerim" }, { id: "tickets", label: "Destek Merkezi" }] : [{ id: "login", label: "Giriş Yap" }, { id: "register", label: "Kayıt Ol" }])].map((l) => (
            <button
              key={l.id}
              onClick={() => { dispatch(setActiveTab(l.id)); setMobileOpen(false); }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${activeTab === l.id ? "text-ink bg-card" : "text-muted"}`}
            >
              {l.label}
            </button>
          ))}
          {session.isLoggedIn && (
            <button onClick={onLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger">Çıkış Yap</button>
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

/* ==================================== APP ==================================== */

export default function CloudHostAI() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

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
      }
      prevIsLoggedInRef.current = auth.isLoggedIn;
    }
  }, [auth.isLoggedIn, auth.user]);

  const [toast, setToast] = useState("");
  const allTickets = useSelector((state) => state.tickets.tickets);
  const ticketRegistry = allTickets.filter((t) => t.userEmail === session.email);
  const [highlight, setHighlight] = useState(false);

  // Expose toast to window so it can be called from other pages if necessary
  window.showAppToast = showToast;

  function showToast(msg) {
    setToast(msg);
    window.clearTimeout(window.__chaiToastTimer);
    window.__chaiToastTimer = window.setTimeout(() => setToast(""), 2800);
  }

  function selectService(id) {
    dispatch(setSelectedServiceId(id));
    dispatch(setActiveTab("detail"));
  } 

  function handlePurchase() {
    if (!session.isLoggedIn) {
      dispatch(setNotice("Satın almak için önce giriş yapmalısınız."));
      dispatch(setActiveTab("login"));
      return;
    }
    dispatch(setActiveTab("purchase"));
  }


  function triggerHighlight() {
    setHighlight(true);
    setTimeout(() => setHighlight(false), 2400);
  }

  let page;
  if (auth.activeTab === "home") page = <HomePage selectService={selectService} />;
  else if (auth.activeTab === "services") page = <ServicesPage />;
 
  else if (auth.activeTab === "detail") page = <ServiceDetailPage onPurchase={handlePurchase} />;
  else if (auth.activeTab === "purchase") page = <PurchasePage />;
  else if (auth.activeTab === "login") page = <LoginPage />;
  else if (auth.activeTab === "register") page = <RegisterPage />;

  else if (auth.activeTab === "dashboard") page = <DashboardPage session={session} ticketRegistry={ticketRegistry} />;
  else if (auth.activeTab === "myservices")
    page = (
      <MyServicesPage
        highlightActions={{ value: highlight, trigger: triggerHighlight }}
      />
    );
  else if (auth.activeTab === "tickets") page = <TicketsPage />;
  else if (auth.activeTab === "chat") page = <ChatPage />;
  else if (auth.activeTab === "faq") page = <FaqPage />;
  else page = <HomePage selectService={selectService} />;

  return (
    <div className="chai-root min-h-screen">
      <style>{GLOBAL_STYLE}</style>
      <NavBar session={session} onLogout={() => dispatch(authLogout())} />
      {page}
      <Footer />
      <Toast message={toast} />
      {auth.activeTab !== "home" && <AiChatWidget />}
    </div>
  );
}

// Pages live under `src/pages/*` now.