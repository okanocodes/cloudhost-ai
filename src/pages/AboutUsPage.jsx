import React, { useEffect } from "react";
import { Sparkles, Shield, Cpu, MapPin, CheckCircle, Server } from "lucide-react";
import { COMPANY } from "../data/knowledgeBase";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useNavigate } from "react-router-dom";

export default function AboutUsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Hakkımızda | ${COMPANY.name}`;
  }, []);
  return (
    <div className="px-6 py-12 md:py-20">
      <div className="mx-auto max-w-4xl space-y-16">

        {/* Hero Section */}
        <section className="text-center space-y-4">
          <SectionEyebrow icon={Sparkles} tone="brand">
            Biz Kimiz?
          </SectionEyebrow>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-ink">
            Bulut Yönetimini <span className="text-brand">Yapay Zekâ</span> ile Yeniden Tanımlıyoruz
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted leading-relaxed">
            {COMPANY.name}, geleneksel bulut altyapısı karmaşıklığını ortadan kaldırmak için kuruldu.
            Güçlü VPS, Cloud Server ve Web Hosting servislerimizi gömülü yapay zekâ asistanımızla birleştirerek,
            altyapınızı izleme ve yönetme süreçlerini zahmetsiz hale getiriyoruz.
          </p>
        </section>

        {/* Key Pillars */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-token bg-card p-6 space-y-3">
            <div className="rounded-lg bg-ai-soft p-3 text-ai w-fit">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-semibold text-ink">Yapay Zekâ Desteği</h3>
            <p className="text-xs text-muted leading-relaxed">
              En doğru paketi seçmekten sunucu hatalarını anında gidermeye kadar her adımda
              yanınızda olan akıllı asistan ile bulut süreçlerinizi otomatikleştirin.
            </p>
          </div>

          <div className="rounded-2xl border border-token bg-card p-6 space-y-3">
            <div className="rounded-lg bg-brand-soft p-3 text-brand w-fit">
              <Server size={24} />
            </div>
            <h3 className="text-lg font-semibold text-ink">Modern Küresel Ağ</h3>
            <p className="text-xs text-muted leading-relaxed">
              SSD ve yüksek hızlı NVMe depolama teknolojileriyle donatılmış, kesintisiz
              bulut sunucu deneyimini dünya standartlarında yaşayın.
            </p>
          </div>

          <div className="rounded-2xl border border-token bg-card p-6 space-y-3">
            <div className="rounded-lg bg-success-soft p-3 text-success w-fit">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-semibold text-ink">Güvenilirlik ve İade</h3>
            <p className="text-xs text-muted leading-relaxed">
              Tüm altyapı hizmetlerimizde {COMPANY.refundDays} günlük şartsız para iade garantisi
              ve PCI-DSS uyumlu güvenli ödeme sistemleri sunuyoruz.
            </p>
          </div>
        </section>

        {/* Global Datacenters */}
        <section className="rounded-2xl border border-token bg-card p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-ink">Küresel Veri Merkezlerimiz</h2>
            <p className="text-xs text-muted">
              Uygulamalarınızı hedef kitlenize en yakın konumda çalıştırarak gecikme sürelerini minimuma indirin.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {COMPANY.datacenters.map((dc) => (
              <div
                key={dc.city}
                className="flex items-center gap-3 rounded-xl border border-token-light p-4 bg-card-soft transition hover:border-brand/40"
              >
                <div className="rounded-full bg-brand-soft p-2 text-brand">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-ink">{dc.city}</h4>
                  <p className="text-[10px] text-muted">{dc.country.toUpperCase()} Veri Merkezi</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Guarantee / Support */}
        <section className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-ink">Sizin İçin Buradayız</h2>
            <p className="text-sm text-muted leading-relaxed">
              Bulut yönetiminin sadece sunuculardan ibaret olmadığının farkındayız. Bu nedenle
              donanımımız kadar destek süreçlerimizi de yapay zekâ asistanımız ve uzman kadromuzla
              kesintisiz kılacak şekilde tasarladık.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle size={14} className="text-success shrink-0" />
                {COMPANY.support}
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle size={14} className="text-success shrink-0" />
                15 dakikanın altında ortalama destek talebi yanıt süresi
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle size={14} className="text-success shrink-0" />
                Kolay fatura iade talepleri
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-tr from-brand/10 to-ai/10 border border-token p-8 text-center space-y-4">
            <h3 className="text-lg font-semibold text-ink">Bulut Yolculuğunuza Bugün Başlayın</h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
              CloudHost AI altyapısının hızını ve yapay zekâ asistanımızın pratikliğini hemen test edin.
            </p>
            <div className="flex justify-center gap-3">
              <div className="w-full max-w-xs">
                <PrimaryButton className="w-full" onClick={() => navigate("/register")}>
                  Kayıt Ol ve Başla
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
