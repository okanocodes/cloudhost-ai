import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dns from "dns";

// macOS ve Windows üzerinde yerel Node.js süreçlerinde oluşan IPv6 / DNS yönlendirme hatalarını çözmek için
// DNS sorgularını öncelikli olarak IPv4 ile çözümleyecek şekilde yapılandırıyoruz.
dns.setDefaultResultOrder("ipv4first");

// Kurumsal ağlarda veya VPN arkasında çalışan SSL-inspection sertifika denetimlerini atlatmak için
// yerel geliştirme modunda TLS hata doğrulamalarını devre dışı bırakıyoruz.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default defineConfig(({ mode }) => {
  // Proje kök dizinindeki `.env` dosyasındaki çevre değişkenlerini yükler.
  const env = loadEnv(mode, process.cwd(), "");

  // Yapay zekâ asistanının davranışlarını ve CloudHost AI platformuna dair bilgileri içeren sistem yönergesi.
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

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "api-chat-middleware",
        // Vite yerel sunucusuna özel bir API istek yakalama (middleware) katmanı ekliyoruz.
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            // Sadece POST /api/chat isteklerini yakalıyoruz.
            if (req.url === "/api/chat" && req.method === "POST") {
              let body = "";
              // Gelen istek gövdesini (request stream) parça parça okuyup birleştiriyoruz.
              req.on("data", (chunk) => {
                body += chunk;
              });
              // İstek okuma tamamlandığında tetiklenen ana fonksiyon.
              req.on("end", async () => {
                try {
                  const { messages } = JSON.parse(body);
                  const token = env.VITE_HF_TOKEN;

                  // Çevre değişkenlerinde Hugging Face API anahtarı yoksa hata döndürüyoruz.
                  if (!token) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "VITE_HF_TOKEN is not configured in .env file" }));
                    return;
                  }

                  // Hugging Face Sunucusuna güvenli arka uç (backend) bağlantısı kurarak API anahtarını gizliyoruz.
                  const response = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7.2B-Instruct/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      model: "Qwen/Qwen2.5-7.2B-Instruct",
                      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
                      max_tokens: 400,
                      temperature: 0.4,
                      stream: true, // Cevabı kelime kelime akıtarak (stream) iletmek için aktif ediyoruz.
                    }),
                  });

                  // Eğer Hugging Face sunucusu olumsuz bir yanıt verirse yakalayıp hata fırlatıyoruz.
                  if (!response.ok) {
                    const errText = await response.text();
                    res.statusCode = response.status;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: errText }));
                    return;
                  }

                  // Tarayıcıya SSE (Server-Sent Events) veri akışı yapacağımızı bildiren başlıkları (headers) yazıyoruz.
                  res.setHeader("Content-Type", "text/event-stream");
                  res.setHeader("Cache-Control", "no-cache");
                  res.setHeader("Connection", "keep-alive");

                  // Hugging Face'den gelen veri akışını tarayıcıya doğrudan köprüleyip aktarıyoruz.
                  const reader = response.body.getReader();
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(value);
                  }
                  res.end();
                } catch (err) {
                  // Yerel geliştirme ortamında internet olmaması veya Hugging Face API erişiminin engellenmesi durumunda
                  // terminalde bir uyarı yazdırıp kullanıcı arayüzünü kilitlememek için simüle edilmiş yapay zekâ veri akışını başlatıyoruz.
                  console.warn("[Vite API Chat Proxy] HuggingFace fetch failed. Using local mock streaming response. Error:", err.message);

                  res.setHeader("Content-Type", "text/event-stream");
                  res.setHeader("Cache-Control", "no-cache");
                  res.setHeader("Connection", "keep-alive");

                  // Kullanıcının yazdığı mesaja göre dinamik simüle edilmiş metinler oluşturuyoruz.
                  let userMsgText = "";
                  try {
                    const parsed = JSON.parse(body);
                    const lastMsg = parsed.messages?.[parsed.messages.length - 1];
                    if (lastMsg) userMsgText = lastMsg.content.toLowerCase();
                  } catch {
                    // ignore
                  }

                  let mockText = "Merhaba! Şu anda yerel geliştirme modundasınız ve Hugging Face API bağlantısı kurulamadı. CloudHost AI hakkında size yardımcı olmaya hazırım!";
                  
                  if (userMsgText.includes("paket") || userMsgText.includes("ücret") || userMsgText.includes("fiyat") || userMsgText.includes("vps") || userMsgText.includes("hosting")) {
                    mockText = "CloudHost AI olarak size en uygun paketleri sunuyoruz. \n\nÖrneğin orta ölçekli Next.js projeleriniz ve landing page işleriniz için VPS Pro paketimiz mükemmel bir seçenektir.\n\n---\n{\"cards\":[{\"type\":\"product\",\"id\":\"vps-pro\"}]}";
                  } else if (userMsgText.includes("reboot") || userMsgText.includes("yeniden başlat") || userMsgText.includes("durdur")) {
                    mockText = "Sunucunuzu yeniden başlatmak veya durdurmak oldukça kolaydır. 'Servislerim' sayfasına giderek ilgili sunucunun yanındaki 'Yeniden Başlat' veya 'Durdur' düğmesine tıklamanız yeterlidir.";
                  } else if (userMsgText.includes("iade") || userMsgText.includes("para")) {
                    mockText = "Tüm paketlerimizde koşulsuz 14 günlük para iade garantisi sunuyoruz. Panelimizdeki Servislerim sayfasından iade talebinizi kolayca başlatabilirsiniz.";
                  }

                  // Simüle edilen metni 4'er karakterlik ufak akış paketlerine (chunks) bölüyoruz.
                  const chunks = [];
                  for (let i = 0; i < mockText.length; i += 4) {
                    chunks.push(mockText.slice(i, i + 4));
                  }

                  // 30 milisaniyede bir tarayıcıya kelime parçalarını akıtarak yapay zekâ yazma efekti veriyoruz.
                  let chunkIdx = 0;
                  const interval = setInterval(() => {
                    if (chunkIdx < chunks.length) {
                      const payload = {
                        choices: [{ delta: { content: chunks[chunkIdx] } }]
                      };
                      res.write(`data: ${JSON.stringify(payload)}\n\n`);
                      chunkIdx++;
                    } else {
                      res.write("data: [DONE]\n\n");
                      res.end();
                      clearInterval(interval);
                    }
                  }, 30);
                }
              });
            } else {
              // POST /api/chat dışındaki tüm diğer statik dosya ve sayfa isteklerini normal seyrine bırakıyoruz.
              next();
            }
          });
        },
      },
    ],
  };
});
