import { SERVICES } from "../data/knowledgeBase";

// Yapay zeka kartlarında gösterilebilecek yerel statik ürün şablonları dizisi.
export const PRODUCTS = [
    { id: "web-starter", title: "Web Hosting Starter", price: "$2/ay", specs: "1 Çekirdek (Paylaşımlı) · 1GB RAM · 20GB SSD" },
    { id: "vps-basic", title: "VPS Basic", price: "$5/ay", specs: "2 Çekirdek · 4GB RAM · 80GB SSD" },
    { id: "vps-pro", title: "VPS Pro", price: "$10/ay", specs: "4 Çekirdek · 8GB RAM · 160GB SSD" },
    { id: "cloud-enterprise", title: "Cloud Enterprise", price: "$25/ay", specs: "8 Çekirdek · 16GB RAM · 320GB NVMe" },
];

// Kimlik değerine (id) göre ürün detaylarını arayan ve geriye ürün kartı formatında obje döndüren fonksiyon.
export function findProduct(id) {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    
    // Önce yerel PRODUCTS dizisinde eşleşen ürün var mı diye kontrol eder.
    const product = PRODUCTS.find(p => p.id.toLowerCase() === cleanId);
    if (product) return product;

    // Bulunamazsa veritabanı (knowledgeBase) üzerindeki SERVICES dizisinden arama yapar.
    const service = SERVICES.find(s => s.id.toLowerCase() === cleanId);
    if (service) {
        return {
            id: service.id,
            title: service.name,
            price: `$${service.price}/ay`,
            specs: `${service.cpuLabel || `${service.cpu} Çekirdek`} · ${service.ram}GB RAM · ${service.storage}GB ${service.storageType}`
        };
    }

    return null;
}

// Yapay zekadan gelen metin cevabını ayrıştırarak (parse), mesajı ve varsa ekindeki JSON metadata kart bilgilerini ayırır.
export function parseAssistantResponse(response) {
    const separator = "\n---\n";
    const index = response.lastIndexOf(separator);

    // Eğer ayırıcı çizgi yoksa mesaj düz metindir, ekinde kart bulunmuyor demektir.
    if (index === -1) {
        return {
            message: response.trim(),
            metadata: {},
        };
    }

    // Metnin ilk kısmını asıl mesaj olarak, ayırıcıdan sonraki kısmı ise JSON kart verisi olarak ayırır.
    const message = response.slice(0, index).trim();
    const json = response.slice(index + separator.length).trim();

    try {
        const metadata = JSON.parse(json);
        return {
            message,
            metadata,
        };
    } catch (err) {
        console.warn("Failed to parse AI metadata:", err);
        return {
            message,
            metadata: {},
        };
    }
}

// Güvenlik ve API anahtarının gizliliği için yerel yapay zeka istemcisi kaldırılmış, API işlemleri Render.com üzerindeki Node.js sunucusuna taşınmıştır.
