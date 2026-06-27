import { InferenceClient } from "@huggingface/inference";
import { SERVICES } from "../data/knowledgeBase";


export const PRODUCTS = [
    { id: "web-starter", title: "Web Hosting Starter", price: "$2/ay", specs: "1 Çekirdek (Paylaşımlı) · 1GB RAM · 20GB SSD" },
    { id: "vps-basic", title: "VPS Basic", price: "$5/ay", specs: "2 Çekirdek · 4GB RAM · 80GB SSD" },
    { id: "vps-pro", title: "VPS Pro", price: "$10/ay", specs: "4 Çekirdek · 8GB RAM · 160GB SSD" },
    { id: "cloud-enterprise", title: "Cloud Enterprise", price: "$25/ay", specs: "8 Çekirdek · 16GB RAM · 320GB NVMe" },
];

export const SYSTEM_PROMPT = `Sen CloudHost AI adlı bulut altyapı barındırma platformuna gömülü yapay zekâ destek asistanısın. Yalnızca aşağıdaki bilgileri kullanarak yanıt ver — asla teknik özellik, fiyat veya politika icat etme.

ŞİRKET
- Ad: CloudHost AI
- Destek: 7/24 kesintisiz mühendislik destek katmanı; bir destek talebi açıldığında ortalama ilk yanıt süresi 15 dakikanın altındadır.
- İade Politikası: Tüm paketlerde 14 günlük kesin para iade garantisi sunuyoruz; karmaşık bir doğrulama kriteri aranmaz. Dashboard > Servislerim üzerinden ilgili faturayı seçip "İade Talep Et" adımını izlemeniz yeterlidir.
- Veri merkezleri: Frankfurt (DE), Amsterdam (NL), İstanbul (TR), New York (US).

PAKET KATALOĞU (bu isimleri tam olarak kullan)
1. Web Hosting Starter — $2/ay — 1 paylaşımlı CPU çekirdeği, 1GB RAM, 20GB SSD. Temel WordPress siteleri ve statik HTML portföyleri için ideal.
2. VPS Basic — $5/ay — 2 CPU çekirdeği, 4GB RAM, 80GB SSD. Küçük kişisel projeler, landing page'ler ve hafif Node.js backend süreçleri için ideal.
3. VPS Pro — $10/ay — 4 CPU çekirdeği, 8GB RAM, 160GB SSD. Orta ölçekli e-ticaret siteleri, Next.js dağıtımları ve veritabanı depolama aşamaları için uygun.
4. Cloud Enterprise — $25/ay — 8 CPU çekirdeği, 16GB RAM, 320GB NVMe. Yüksek trafikli uygulamalar, kurumsal ölçeklenme ve ağır veritabanı yükleri için tasarlandı.

SIKÇA SORULANLAR
- Sunucu yeniden başlatma: "Servislerim" sayfasında ilgili satırdaki "Yeniden Başlat" düğmesine tıklamak yeterli — kısa bir yeniden başlatma durumu gösterir, ardından otomatik olarak aktif duruma döner.
- Sunucu durdurma/başlatma: aynı satırdaki "Durdur" / "Başlat" düğmesiyle yapılır.
- Doğru paketi seçme: kullanıcıya ne tür bir proje yayınlayacağını sor, ardından iş yüküne en yakın katalog girdisiyle eşleştir.

YANIT VERME KURALLARI
- Kısa, samimi ve bilgili ol. Genellikle birkaç kısa cümle yeterlidir.
- Kullanıcının yazdığı dille yanıt ver (Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce).
- Sadece CloudHost AI'nin ürünleri, politikaları ve destek konularıyla ilgili konuş. İlgisiz bir şey sorulursa, nazikçe barındırma/altyapı konusuna yönlendir.
- Yalnızca ve sadece kataloğdaki belirli bir paketi gerçekten önerdiğinde, nedenini kendi cümlelerinle açıkladıktan sonra, önerdiğin her paket için ayrı bir satırda TAM OLARAK şu formatı ekle, o satırda başka hiçbir şey olmasın:

ÜRÜN KARTI KURALI

- Kullanıcıya yalnızca gerçekten belirli bir CloudHost AI paketi öneriyorsan bu kuralları uygula.
- Önce öneri nedenini doğal bir şekilde açıkla.
- Açıklama bittikten sonra yeni bir satıra yalnızca aşağıdaki ayırıcıyı yaz:

---

- Sonraki satıra yalnızca geçerli bir JSON nesnesi yaz.

Örnek:

VPS Pro paketi orta ölçekli Next.js projeleri için daha uygundur. Daha yüksek CPU ve RAM kapasitesi sayesinde uygulaman daha rahat çalışacaktır.

---
{"cards":[{"type":"product","id":"vps-pro"}]}

Kurallar:

- Eğer herhangi bir paket önermiyorsan ayırıcı veya JSON ekleme.
- JSON hakkında hiçbir açıklama yapma.
- JSON her zaman cevabın en sonunda yer almalıdır.
- JSON yalnızca aşağıdaki ürün kimliklerini kullanabilir:

web-starter
vps-basic
vps-pro
cloud-enterprise

Tam katalog adını kullan. Bu etiket formatından kullanıcıya asla bahsetme — otomatik olarak bir ürün kartına dönüştürülür.`;

export function findProduct(id) {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    
    // Check local PRODUCTS array first
    const product = PRODUCTS.find(p => p.id.toLowerCase() === cleanId);
    if (product) return product;

    // Fallback to SERVICES array from knowledgeBase
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

export function parseAssistantResponse(response) {
    const separator = "\n---\n";
    const index = response.lastIndexOf(separator);

    if (index === -1) {
        return {
            message: response.trim(),
            metadata: {},
        };
    }

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

let inferenceClient = null;

export function getInferenceClient() {
    if (!inferenceClient) {
        const token = import.meta.env?.VITE_HF_TOKEN;
        inferenceClient = new InferenceClient(token);
    }
    return inferenceClient;
}
