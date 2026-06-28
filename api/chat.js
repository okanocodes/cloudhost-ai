export const config = {
  runtime: "edge",
};

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

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Try reading both Vercel custom variable (HF_TOKEN) and Vite standard variable (VITE_HF_TOKEN)
    let token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;

    // Check if the user accidentally copied "VITE_HF_TOKEN=" prefix into the dashboard
    if (token && token.startsWith("VITE_HF_TOKEN=")) {
      token = token.slice("VITE_HF_TOKEN=".length).trim();
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: "HF_TOKEN or VITE_HF_TOKEN is not configured on the server environment variables" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Strip custom frontend attributes (like metadata, error, streaming) from messages before forwarding to HuggingFace
    const cleanMessages = messages.map((m) => ({
      role: m.role || "user",
      content: m.content || "",
    }));

    const response = await fetch(
      "https://api-inference.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleanMessages],
          max_tokens: 400,
          temperature: 0.4,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
