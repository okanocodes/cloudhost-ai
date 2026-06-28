import React, { useEffect } from "react";
import {
  ChevronRight,
  Cpu,
  Database,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";

import CategoryIcon from "../components/ui/CategoryIcon";
import AssistantWidget from "../components/AssistantWidget";
import PrimaryButton from "../components/ui/PrimaryButton";

import { assessSuitability } from "../lib/aiEngine";
import { fetchServicesData } from "../store/servicesSlice";
import { setActiveTab, setNotice } from "../store/authSlice";

export default function ServiceDetailPage() {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const services = useSelector((state) => state.services.list);
  const company = useSelector((state) => state.services.company);
  const selectedServiceId = useSelector(
    (state) => state.services.selectedServiceId
  );
  const status = useSelector((state) => state.services.status);
  const error = useSelector((state) => state.services.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchServicesData());
    }
  }, [status, dispatch]);

  const service = services.find((s) => s.id === selectedServiceId);

  const handlePurchase = () => {
    if (!isLoggedIn) {
      dispatch(setNotice("Satın almak için önce giriş yapmalısınız."));
      dispatch(setActiveTab("login"));
      return;
    }
    dispatch(setActiveTab("purchase"));
  };

  if (status === "loading") {
    return <p className="px-6 py-12 text-muted">Detay yükleniyor...</p>;
  }

  if (status === "failed") {
    return <p className="px-6 py-12 text-danger">Hata: {error}</p>;
  }

  if (!service || !company) return null;

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => dispatch(setActiveTab("services"))}
          className="text-sm text-muted hover:text-ink inline-flex items-center gap-1 mb-4"
        >
          <ChevronRight size={14} className="rotate-180" />
          Hizmetlere dön
        </button>

        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-ai-soft p-3">
            <CategoryIcon
              category={service.category}
              size={22}
              className="text-ai"
            />
          </span>

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-ink">
              {service.name}
            </h1>
            <p className="text-sm text-faint">{service.category}</p>
          </div>
        </div>

        <div className="chai-detail-grid mt-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-token bg-card p-6">
              <h2 className="text-sm font-display uppercase tracking-wider text-muted mb-4">
                Teknik Yapılandırma
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 font-display text-sm">
                <div className="flex items-center gap-2 border-b border-token pb-3">
                  <Cpu size={15} className="text-ai" />
                  {service.cpuLabel || `${service.cpu} Çekirdek`} CPU
                </div>

                <div className="flex items-center gap-2 border-b border-token pb-3">
                  <Database size={15} className="text-ai" />
                  {service.ram} GB RAM
                </div>

                <div className="flex items-center gap-2 border-b border-token pb-3">
                  <HardDrive size={15} className="text-ai" />
                  {service.storage} GB {service.storageType}
                </div>

                <div className="flex items-center gap-2 border-b border-token pb-3">
                  <ShieldCheck size={15} className="text-ai" />
                  {company.refundDays} gün iade garantisi
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted">
                {service.bestFor}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {company.datacenters.map((d) => (
                  <span
                    key={d.city}
                    className="inline-flex items-center gap-1 rounded-full border border-token-light px-2.5 py-1 text-xs text-muted"
                  >
                    <MapPin size={11} />
                    {d.city} ({d.country})
                  </span>
                ))}
              </div>
            </div>

          </div>

          <div className="rounded-2xl border border-brand bg-card p-6 h-fit sticky top-6">
            <p className="text-xs font-display uppercase tracking-wider text-muted">
              Aylık Ücret
            </p>

            <p className="mt-1 font-display text-3xl font-bold text-success">
              ${service.price}
              <span className="text-base text-muted">/ay</span>
            </p>

            <ul className="mt-5 space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                {company.support}
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                {company.refundDays} gün iade garantisi
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />4 veri merkezi
                seçeneği
              </li>
            </ul>

            <PrimaryButton
              onClick={handlePurchase}
              className="mt-6 w-full"
            >
              Satın Al (Demo)
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}