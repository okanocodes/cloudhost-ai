# CloudHost AI — Detaylı Proje Raporu (PROJECT.md)

Bu belge, **CloudHost AI** bulut altyapı barındırma panelinin tasarım hedeflerini, kapsamını, teknik mimarisini ve grubumuzun proje boyunca edindiği teknik kazanımları detaylandırmak amacıyla hazırlanmıştır.

---

## 1. Proje Hakkında Genel Bilgi

**CloudHost AI**, modern web teknolojileriyle geliştirilmiş, kullanıcıların bulut altyapı hizmetlerini (Web Hosting, VPS, Enterprise Bulut Sunucuları) simüle edilmiş bir panel üzerinden izlemesine, yönetmesine ve yeni servisler satın almasına olanak tanıyan interaktif bir web uygulamasıdır. 

Uygulama, sadece bir yönetim paneli olmakla kalmayıp, sisteme entegre edilmiş **Yapay Zekâ Destek Asistanı (AI Chatbot)** sayesinde kullanıcılara 7/24 rehberlik hizmeti sunmaktadır.

---

## 2. Temel Arayüz Özellikleri ve Sayfalar

Uygulama, kullanıcı deneyimini (UX) en üst düzeyde tutmak amacıyla tek sayfa uygulama (SPA) mimarisinde tasarlanmış olup şu sayfalardan oluşmaktadır:

*   **Kontrol Paneli (Dashboard / Ana Sayfa):** Kullanıcının aktif sunucularının sayısını, toplam aylık harcamasını ve kaynak kullanımlarını (CPU, RAM, Disk) grafiksel olarak izleyebildiği merkezi ekrandır.
*   **Servislerim (My Services):** Kullanıcının sahip olduğu bulut sunucularını listelediği alandır. Kullanıcı bu sayfada sunucularını anlık olarak **Yeniden Başlatabilir (Reboot)**, **Durdurabilir (Stop)** veya **Başlatabilir (Start)**. Tüm bu işlemler Redux durum yönetimi vasıtasıyla dinamik olarak güncellenir.
*   **Satın Alma (Purchase):** CloudHost AI'nin güncel paket kataloğunun listelendiği sayfadır. Kullanıcılar iş yüklerine göre tasarlanmış paketleri (Starter, VPS Basic, VPS Pro, Enterprise) inceleyebilir ve tek tıkla satın alım simülasyonunu tamamlayabilirler.
*   **Hakkımızda (About Us):** Şirketin vizyonu, veri merkezi lokasyonları (Frankfurt, Amsterdam, İstanbul, New York) ve müşteri destek ilkelerinin açıklandığı kurumsal tanıtım sayfasıdır.

---

## 3. Yapay Zekâ Destek Asistanı (AI Widget)

Sohbet penceresi (widget), platformun en dikkat çekici yenilikçi özelliğidir. Klasik chatbotlardan farklı olarak şu yeteneklere sahiptir:

1.  **Bağlamsal Bilgi Bankası (Contextual Knowledge):** Asistan, yalnızca CloudHost AI şirket kuralları, iade politikaları, sunucu yönetim adımları ve paket kataloğu dahilinde yanıt verir. Bilmediği konularda kullanıcıyı nazikçe platform sınırlarına yönlendirir.
2.  **Ürün Kartı Dönüştürme:** Yapay zekâ, kullanıcıya belirli bir bulut paketini önerdiğinde arka planda özel bir JSON nesnesi üretir. React ön uç kodumuz bu JSON verisini yakalar ve sohbet akışında otomatik olarak tıklanabilir interaktif bir **Ürün Kartı** bileşenine dönüştürür.
3.  **Hata Toleransı ve Çevrimdışı Mod:** Eğer sunucu tarafında internet erişimi kesilirse veya HuggingFace DNS sorunları yaşanırsa, asistan sohbeti kilitlememek için anında yerel simülasyon moduna geçer ve gerçekçi bir yazma efektiyle kullanıcıya rehberlik etmeye devam eder.

---

## 4. Teknik Altyapı ve Teknoloji Yığını

Projemiz modern, ölçeklenebilir ve performans odaklı kütüphaneler kullanılarak inşa edilmiştir:

*   **Ön Üç (Frontend):**
    *   **React 19:** Kullanıcı arayüz bileşenlerinin modüler yapıda geliştirilmesini sağlar.
    *   **Redux Toolkit:** Sunucu durumları, satın alınan paketler ve kullanıcı verilerinin tüm sayfalarda tutarlı bir şekilde senkronize kalmasını sağlar.
    *   **React Router DOM:** Sayfalar arasında yenilenmeden, hızlı yönlendirme yapılmasını destekler.
    *   **Tailwind CSS:** Modern, duyarlı (responsive) ve estetik tasarım şablonlarının hızlıca kodlanmasını sağlar.
*   **Arka Uç (Backend Proxy):**
    *   **Node.js & Express:** Tarayıcı isteklerini karşılayan hafif bir HTTP API sunucusudur.
    *   **@huggingface/inference:** Hugging Face sunucularıyla haberleşerek yapay zekâ metin tamamlama akışını (stream) yöneten resmi SDK'dir.
    *   **CORS & Dotenv:** Güvenli köprüleme ve çevre değişkenleri yönetimini gerçekleştirir.
*   **Yapay Zekâ Modeli:**
    *   **Qwen/Qwen2.5-7B-Instruct:** Hugging Face üzerinden sunucusuz (serverless) olarak çağrılan, Türkçe anlama ve mantıksal çıkarım yeteneği yüksek 7 milyar parametreli dil modelidir.

---

## 5. Güvenlik ve Mimari Yaklaşım

Projenin ilk versiyonlarında yapay zekâ doğrudan ön uçtan (frontend) çağrılıyordu. Bu durum tarayıcının ağ (network) sekmesinde gizli API anahtarlarımızın (Hugging Face Token) üçüncü şahıslar tarafından görünmesine neden oluyordu.

Bu güvenlik açığını kapatmak için mimariyi ayırdık:
*   API anahtarı sadece Render.com üzerinde çalışan **Node.js** sunucusunda saklanır.
*   Kullanıcı mesajı gönderdiğinde istek önce bizim Express sunucumuza gider. Sunucu, isteği temizler, API anahtarını güvenli bir şekilde ekler, Hugging Face'e iletir ve gelen yanıt akışını kullanıcıya yönlendirir.
*   Böylece istemci tarafında hiçbir gizli anahtar barındırılmamış olur.

---

## 6. Ödev Grubumuzun Kazanımları

Bu projeyi geliştirirken grup olarak edindiğimiz başlıca tecrübeler:

*   **Decoupled (Ayrık) Mimari:** Frontend ve Backend projelerinin bağımsız geliştirilip farklı sunucularda (Vercel ve Render) nasıl konuşturulacağını deneyimledik.
*   **State Management (Durum Yönetimi):** Redux Toolkit kullanarak karmaşık sunucu durum aksiyonlarının (başlatma, durdurma, silme, ekleme) tek bir kaynaktan nasıl yönetildiğini öğrendik.
*   **Server-Sent Events (SSE):** Yapay zekanın kelime kelime yazma efektini taklit eden veri akışlarının (data streams) asenkron JavaScript ve HTTP protokolleri üzerinde nasıl işlendiğini kavradık.
