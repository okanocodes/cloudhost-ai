/* ============================== AI ENGINE =============================== */
import { SERVICES, FAQ } from "../data/knowledgeBase";

export function normalize(str) {
  return (str || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[?.!,;:]/g, "")
    .trim();
}

export function scoreKeywords(text, keywords) {
  const t = normalize(text);
  return keywords.reduce(
    (score, k) => (t.includes(normalize(k)) ? score + 1 : score),
    0,
  );
}

export function matchService(query) {
  let best = null;
  let bestScore = 0;
  SERVICES.forEach((s) => {
    const score = scoreKeywords(query, s.keywords);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  });
  if (best) return best;
  const t = normalize(query);
  if (t.includes("ucuz") || t.includes("düşük bütçe") || t.includes("basit")) {
    return SERVICES.find((s) => s.id === "web-starter");
  }
  if (t.includes("büyük") || t.includes("hızlı") || t.includes("performans")) {
    return SERVICES.find((s) => s.id === "cloud-enterprise");
  }
  return SERVICES.find((s) => s.id === "vps-pro");
}

export function recommendationCopy(service) {
  return `${service.name} öneriliyor — ${service.cpu} Çekirdek CPU ve ${service.ram}GB RAM eşik haritalama kurallarına dayanarak isteğinizle eşleşti.`;
}

export function matchFAQ(query) {
  let best = null;
  let bestScore = 0;
  FAQ.forEach((f) => {
    const score = scoreKeywords(query, f.keywords);
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  });
  return bestScore > 0 ? best : null;
}

export const USE_CASE_TIERS = {
  "e-ticaret": 2,
  eticaret: 2,
  ecommerce: 2,
  "next.js": 2,
  nextjs: 2,
  react: 2,
  mağaza: 2,
  wordpress: 0,
  statik: 0,
  portföy: 0,
  "basit site": 0,
  kurumsal: 3,
  enterprise: 3,
  "yüksek trafik": 3,
  "büyük veritabanı": 3,
  ölçeklenme: 3,
};

export function assessSuitability(service, query) {
  const t = normalize(query);
  let requiredTier = 1;
  Object.entries(USE_CASE_TIERS).forEach(([k, v]) => {
    if (t.includes(normalize(k)) && v > requiredTier) requiredTier = v;
  });
  if (service.tier >= requiredTier) {
    return {
      text: `Evet, ${service.name} (${service.cpu} Çekirdek / ${service.ram}GB RAM) bu kullanım senaryosu için yeterli kaynaklara sahip.`,
      ok: true,
    };
  }
  const upgrade =
    SERVICES.find((s) => s.tier >= requiredTier) ||
    SERVICES[SERVICES.length - 1];
  return {
    text: `${service.name} bu kullanım senaryosu için sınırlı kalabilir; bunun yerine ${upgrade.name} (${upgrade.cpu} Çekirdek / ${upgrade.ram}GB RAM) yapısı şiddetle önerilir.`,
    ok: false,
    upgrade,
  };
}

export function aiRespond(query) {
  const faq = matchFAQ(query);
  if (faq) return { type: "faq", text: faq.a, faq };
  const service = matchService(query);
  return { type: "service", text: recommendationCopy(service), service };
}
