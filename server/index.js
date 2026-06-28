import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

// `.env` dosyasındaki çevre değişkenlerini (environment variables) belleğe yükler.
dotenv.config();

const app = express();
// Render.com veya diğer bulut sağlayıcılarının atayacağı portu dinler, yerelde ise 3000 portunu kullanır.
const PORT = process.env.PORT || 3000;

// CORS (Cross-Origin Resource Sharing) mekanizmasını etkinleştirir, böylece tarayıcıdan gelen istekler engellenmez.
app.use(cors());
// Gelen JSON formatındaki istek gövdelerini otomatik olarak ayrıştırıp (parse) `req.body` içerisine koyar.
app.use(express.json());

// Yapay zekâ asistanının davranış sınırlarını ve CloudHost AI bilgilerini belirleyen sistem talimatı.
const SYSTEM_PROMPT = `Sen CloudHost AI adlı bulut altyapı barındırma platformuna gömülü yapay zekâ destek asistanısın. Yalnızca aşağıdaki bilgileri kullanarak yanıt ver — asla teknik özellik, fiyat veya politika icat etme.

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

// Ön uç (frontend) uygulamasının mesajları göndererek yapay zekâ yanıtı talep ettiği ana API rotası.
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body || {};
  const messageList = messages || [];

  // Gelen verinin bir dizi (array) olup olmadığını doğrular.
  if (!Array.isArray(messageList)) {
    return res.status(400).json({ error: "messages must be an array" });
  }

  // HuggingFace API anahtarını güvenli bir şekilde sunucu tarafındaki çevre değişkenlerinden çeker.
  const token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "HuggingFace API key (HF_TOKEN) is not configured on the server" });
  }

  try {
    // Arayüzden gelen özel nitelikleri (streaming, error, metadata) temizleyerek temiz bir mesaj dizisi hazırlar.
    // HuggingFace API'si şema dışındaki ekstra özellikleri kabul etmediği için bu temizlik şarttır.
    const cleanMessages = messageList.map((m) => ({
      role: m.role || "user",
      content: m.content || "",
    }));

    // HuggingFace API istemcisini başlatır.
    const client = new InferenceClient(token);
    
    // Kelime akışını (streaming) başlatmak için chatCompletionStream çağrısı yapılır.
    const stream = client.chatCompletionStream({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleanMessages],
      max_tokens: 400,
      temperature: 0.4,
    });

    // Yanıt başlıklarında Server-Sent Events (SSE) kullanacağımızı belirterek bağlantıyı açık tutuyoruz.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Asenkron olarak üretilen her bir yapay zekâ kelime parçasını (chunk) anlık olarak tarayıcıya yazıyoruz.
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    // Akışın bittiğini belirten özel bayrağı yazıp yanıtı sonlandırıyoruz.
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Inference Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Render.com'un sunucunun açık ve sağlıklı çalışıp çalışmadığını kontrol etmek için kullandığı rota.
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
