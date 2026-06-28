import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CreditCard, ShieldCheck, Lock, RotateCw, CheckCircle } from "lucide-react";
import { SERVICES } from "../data/knowledgeBase";
import { addInstance } from "../store/myServicesSlice";
import PrimaryButton from "../components/ui/PrimaryButton";
import GhostButton from "../components/ui/GhostButton";
import { useParams, useNavigate } from "react-router-dom";

export default function PurchasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const services = useSelector((state) => state.services.list);
  const userEmail = useSelector((state) => state.auth.user?.email);
  const instances = useSelector((state) => state.myServices.instances);

  // Find the selected service from slice list or knowledge base fallback
  const service =
    services.find((s) => s.id === id) ||
    SERVICES.find((s) => s.id === id);

  useEffect(() => {
    if (service) {
      document.title = `${service.name} Satın Al | CloudHost AI`;
    } else {
      document.title = "Satın Al | CloudHost AI";
    }
  }, [service]);

  // Filter instances of the logged-in user to determine the next instance name
  const userInstances = instances.filter((i) => i.userEmail === userEmail);

  // Form states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: verifying, 1: capturing, 2: success
  const [errors, setErrors] = useState({});

  if (!service) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-danger">Satın alınacak hizmet bulunamadı.</p>
        <GhostButton onClick={() => navigate("/services")} className="mt-4">
          Hizmet Kataloğuna Dön
        </GhostButton>
      </div>
    );
  }

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // strip non-digits
    if (value.length > 16) value = value.slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  // Format Expiry Date (adds slash after month MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Format CVC (max 3 digits)
  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvc(value);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!cardName.trim()) newErrors.name = "Kart sahibi adı zorunludur.";
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.number = "Geçersiz kart numarası. (16 hane olmalıdır)";
    }
    const expiryParts = cardExpiry.split("/");
    if (
      cardExpiry.length !== 5 ||
      parseInt(expiryParts[0]) < 1 ||
      parseInt(expiryParts[0]) > 12
    ) {
      newErrors.expiry = "Geçersiz SKT. (AA/YY formatında olmalıdır)";
    }
    if (cardCvc.length !== 3) {
      newErrors.cvc = "Geçersiz CVC. (3 hane olmalıdır)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle purchase submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setLoadingStep(0); // Verifying details...

    // Simulate animated loading payment steps
    setTimeout(() => {
      setLoadingStep(1); // Capturing payment...
      setTimeout(() => {
        setLoadingStep(2); // Success!

        setTimeout(() => {
          // Add purchased service instance to myServicesSlice
          const newInstance = {
            id: Date.now(),
            name: `${service.id}-${userInstances.length + 1}`,
            service: service.name,
            status: "active",
            ip: `185.42.${Math.floor(Math.random() * 80) + 10}.${Math.floor(Math.random() * 200) + 10}`,
            userEmail: userEmail,
          };
          dispatch(addInstance(newInstance));
          if (window.showAppToast) {
            window.showAppToast(`${service.name} başarıyla satın alındı ve aktifleştirildi.`);
          }
          navigate("/myservices");
        }, 1200);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-ink text-center mb-2">Güvenli Ödeme</h1>
        <p className="text-muted text-center mb-8 max-w-lg mx-auto">
          Altyapı siparişinizi tamamlamak için kart bilgilerinizi giriniz.
        </p>

        {loading ? (
          <div className="rounded-2xl border border-token bg-card p-10 flex flex-col items-center justify-center text-center min-h-[400px] chai-fade-up">
            {loadingStep === 2 ? (
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-success-soft p-4 mb-4 text-success animate-bounce">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-xl font-semibold text-ink">Ödeme Başarılı!</h3>
                <p className="text-muted mt-2">Hizmetiniz hazırlanıyor, yönlendiriliyorsunuz...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <RotateCw size={40} className="text-brand animate-spin mb-4" />
                <h3 className="text-xl font-semibold text-ink">
                  {loadingStep === 0 ? "Kart Bilgileri Doğrulanıyor..." : "Ödeme Onaylanıyor..."}
                </h3>
                <p className="text-muted mt-2">
                  Lütfen bu sayfayı kapatmayın veya yenilemeyin.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Left Side: Dynamic Animated Credit Card & Summary */}
            <div className="md:col-span-5 space-y-6">
              {/* Card Container */}
              <div className="relative w-full h-48 sm:h-52 perspective-[1000px] mx-auto select-none ">
                <div
                  className={`relative w-full h-full rounded-2xl text-white transition-all duration-500 transform-3d ${isFlipped ? "transform-[rotateY(180deg)]" : ""
                    }`}
                >
                  {/* Card Front */}
                  <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-tr from-brand to-ai p-6 flex flex-col justify-between [backface-visibility:hidden] shadow-2xl shadow-brand/20 border-gray-500 border ">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-widest text-white/70">Kredi Kartı</span>
                        <div className="w-10 h-7 bg-amber-400/90 rounded-md mt-2 relative overflow-hidden flex items-center justify-between px-1">
                          {/* Card Chip Simulation */}
                          <div className="w-full h-0.5 bg-black/20 absolute top-2 left-0"></div>
                          <div className="w-full h-0.5 bg-black/20 absolute top-4 left-0"></div>
                          <div className="w-0.5 h-full bg-black/20 absolute left-3 top-0"></div>
                          <div className="w-0.5 h-full bg-black/20 absolute left-6 top-0"></div>
                        </div>
                      </div>
                      <CreditCard size={32} className="text-white/80" />
                    </div>

                    <div className="text-lg md:text-xl font-mono tracking-widest text-center my-4 font-semibold">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex flex-col max-w-[70%]">
                        <span className="text-[10px] uppercase text-white/60">Kart Sahibi</span>
                        <span className="text-xs font-mono font-medium truncate uppercase tracking-wider">
                          {cardName || "İSİM SOYİSİM"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-white/60">SKT</span>
                        <span className="text-xs font-mono font-medium">{cardExpiry || "AA/YY"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Back */}
                  <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-tr from-brand to-ai py-6 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl shadow-brand/20 flex flex-col justify-between border-gray-500 border">
                    <div className="w-full h-10 bg-black/80 mt-1"></div>
                    <div className="px-6 flex justify-between items-center mt-2">
                      <div className="flex-1 bg-white/20 h-8 rounded px-2 flex items-center justify-end">
                        <span className="text-black/80 font-mono italic font-semibold text-xs tracking-wider">
                          {cardCvc || "•••"}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/60 uppercase ml-4">Güvenlik Kodu</span>
                    </div>
                    <div className="px-6 flex justify-between items-center text-[8px] text-white/50 leading-none">
                      <span>Bu kart CloudHost AI demo ödeme sistemi için tasarlanmıştır.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-2xl border border-token bg-card p-5 space-y-4">
                <h3 className="text-sm font-display uppercase tracking-wider text-muted">Sipariş Özeti</h3>
                <div className="flex justify-between items-center border-b border-token pb-3">
                  <div>
                    <h4 className="font-medium text-ink text-sm">{service.name}</h4>
                    <p className="text-xs text-muted">{service.category}</p>
                  </div>
                  <span className="font-mono text-sm text-ink">${service.price}/ay</span>
                </div>
                <div className="flex justify-between items-center font-display text-sm">
                  <span className="text-muted">Toplam Tutar:</span>
                  <span className="text-success font-bold text-lg">${service.price}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:col-span-7 bg-card border border-token rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-muted mb-1.5">
                    Kart Üzerindeki İsim
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    onFocus={() => setIsFlipped(false)}
                    placeholder="KART SAHİBİ"
                    className={`w-full bg-card-soft border rounded-lg px-3 py-2 text-sm text-ink font-mono placeholder-faint focus:border-brand ${errors.name ? "border-danger" : "border-token"
                      }`}
                  />
                  {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-muted mb-1.5">
                    Kart Numarası
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsFlipped(false)}
                    placeholder="0000 0000 0000 0000"
                    className={`w-full bg-card-soft border rounded-lg px-3 py-2 text-sm text-ink font-mono placeholder-faint focus:border-brand ${errors.number ? "border-danger" : "border-token"
                      }`}
                  />
                  {errors.number && <p className="text-danger text-xs mt-1">{errors.number}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-display uppercase tracking-wider text-muted mb-1.5">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      onFocus={() => setIsFlipped(false)}
                      placeholder="AA/YY"
                      className={`w-full bg-card-soft border rounded-lg px-3 py-2 text-sm text-ink font-mono placeholder-faint focus:border-brand ${errors.expiry ? "border-danger" : "border-token"
                        }`}
                    />
                    {errors.expiry && <p className="text-danger text-xs mt-1">{errors.expiry}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-display uppercase tracking-wider text-muted mb-1.5">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      placeholder="000"
                      className={`w-full bg-card-soft border rounded-lg px-3 py-2 text-sm text-ink font-mono placeholder-faint focus:border-brand ${errors.cvc ? "border-danger" : "border-token"
                        }`}
                    />
                    {errors.cvc && <p className="text-danger text-xs mt-1">{errors.cvc}</p>}
                  </div>
                </div>

                <div className="flex gap-2 items-center bg-card-soft rounded-lg p-3 border border-token text-xs text-muted leading-relaxed">
                  <ShieldCheck className="text-success shrink-0" size={18} />
                  <span>
                    Kart bilgileriniz hiçbir şekilde sunucularımızda saklanmaz.
                  </span>
                </div>

                <div className="pt-4 flex gap-3">
                  <GhostButton
                    type="button"
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="flex-1"
                  >
                    Vazgeç
                  </GhostButton>
                  <PrimaryButton type="submit" className="flex-1 flex gap-2 justify-center items-center">
                    <Lock size={14} /> ${service.price} Öde
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
