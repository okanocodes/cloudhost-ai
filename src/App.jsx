import React, { useState, useEffect, useRef } from "react";
import { GLOBAL_STYLE } from './design-tokens'
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
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AiChatWidget from "./components/AIChatWidget";
import { setNotice } from "./store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";


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

/* Pages live under `src/pages/*` now. NavBar and Footer live under `src/components/*`. */

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
  const navigate = useNavigate();
  const location = useLocation();



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
      <NavBar />
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