import React from "react";
import { Server } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";

import SectionEyebrow from "../components/ui/SectionEyebrow";
import ServiceFinderBar from "../components/ServiceFinderBar";
import ServiceCard from "../components/ServiceCard";

import {
  setSelectedCategory,
  setHighlightedService,
} from "../store/servicesSlice";

export default function ServicesPage({ selectService }) {
  const dispatch = useDispatch();

  // Redux store içinden services state'ini alıyoruz
  const services = useSelector((state) => state.services.list);
  const categories = useSelector((state) => state.services.categories);
  const selectedCategory = useSelector(
    (state) => state.services.selectedCategory
  );
  const highlightedServiceId = useSelector(
    (state) => state.services.highlightedServiceId
  );

  // Seçilen kategoriye göre servisleri filtreliyoruz
  const filtered = services.filter(
    (service) =>
      selectedCategory === "Tümü" || service.category === selectedCategory
  );

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow icon={Server} tone="brand">
          Hizmetler
        </SectionEyebrow>

        <h1 className="mt-2 text-3xl font-semibold text-ink">
          Modüler Altyapı Kataloğu
        </h1>

        <p className="mt-2 max-w-2xl text-muted">
          Tüm VPS, Cloud Server ve Web Hosting katmanlarını karşılaştırın.
        </p>

        <div className="mt-6">
          <ServiceFinderBar
            onMatch={(service) =>
              dispatch(setHighlightedService(service.id))
            }
          />
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => dispatch(setSelectedCategory(category))}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-brand border-brand text-white"
                  : "border-token-light text-muted bg-card-hover"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={selectService}
              highlighted={highlightedServiceId === service.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};