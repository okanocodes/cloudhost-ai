import React, { useState } from "react";
import { COMPANY, SERVICES, FAQ } from "../data/knowledgeBase";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import ServiceCard from "../components/ServiceCard";
import AssistantWidget from "../components/AssistantWidget";
import PrimaryButton from "../components/ui/PrimaryButton";
import GhostButton from "../components/ui/GhostButton";
import FaqItem from "../components/ui/FaqItem";
import { HelpCircle, Server, Sparkles } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { decrement, increment } from "../store/counterSlice";
import { setSelectedServiceId } from "../store/servicesSlice";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const [openFaq, setOpenFaq] = useState(["faq-reboot"]);
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSelectService = (id) => {
        dispatch(setSelectedServiceId(id));
        navigate(`/services/${id}`);
    };

    return (
        <div>
            <section className="chai-grid-bg relative overflow-hidden border-b border-token px-6 py-16 md:py-24">
                <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
                    <div>
                        <SectionEyebrow icon={Sparkles}>{COMPANY.tagline}</SectionEyebrow>
                        <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight text-ink">
                            Bulut altyapınızı <span className="text-brand">yapay zekâ</span> ile yönetin
                        </h1>
                        <p className="mt-5 max-w-md text-muted leading-relaxed">
                            VPS, Cloud Server ve Web Hosting paketlerinizi tek panelden izleyin; gömülü yapay zekâ
                            asistanı doğru paketi seçmenizden sunucu sorunlarını çözmenize kadar her adımda yanınızda.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <PrimaryButton onClick={() => navigate("/services")}>
                                Paketleri Gör
                            </PrimaryButton>
                            <GhostButton onClick={() => navigate("/register")}>Ücretsiz Hesap Oluştur</GhostButton>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-4 text-xs font-display text-muted">
                            <span className="inline-flex items-center gap-1.5">{COMPANY.support}</span>
                            <span className="inline-flex items-center gap-1.5">4 Veri Merkezi</span>
                            <span className="inline-flex items-center gap-1.5">{COMPANY.refundDays} Gün İade</span>
                        </div>
                        <div >
                            <h1>Count: {count} (redux kullanımı için örnektir. sonra sil.)</h1>
                            <div className="flex gap-5">
                                <PrimaryButton onClick={() => dispatch(increment())}>+</PrimaryButton>
                                <PrimaryButton onClick={() => dispatch(decrement())}>-</PrimaryButton>
                            </div>
                        </div>
                    </div>

                    <AssistantWidget 
                        title="Hangi Paketi Seçmeliyim?"
                        intro="Projenizi anlatın, size uygun altyapıyı önereyim. Örn: “Hangi paketi almalıyım?”"
                        quickQuestions={["Hangi paketi almalıyım?", "React uygulamam için hangisi uygun?", "En ucuz seçenek nedir?"]}
                    />
                </div>
            </section>

            <section className="px-6 py-16">
                <div className="mx-auto max-w-6xl">
                    <SectionEyebrow icon={Server} tone="brand">Hizmet Vitrini</SectionEyebrow>
                    <h2 className="mt-2 text-2xl font-semibold text-ink">Her ölçek için bir altyapı katmanı</h2>
                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                        {["vps-pro", "cloud-enterprise", "web-starter"].map((id) => (
                            <ServiceCard key={id} service={SERVICES.find((s) => s.id === id)} onSelect={handleSelectService} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 border-t border-token">
                <div className="mx-auto max-w-3xl">
                    <SectionEyebrow icon={HelpCircle}>Sıkça Sorulanlar</SectionEyebrow>
                    <h2 className="mt-2 text-2xl font-semibold text-ink mb-6">Hızlı yanıtlar</h2>
                    <div className="space-y-3">
                        {FAQ.slice(0, 4).map((f) => (
                            <FaqItem
                                key={f.id}
                                item={f}
                                open={openFaq.includes(f.id)}
                                onToggle={() => setOpenFaq((prev) =>
                                    prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                                )}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
