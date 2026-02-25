# Frevector.com Revize Gereksinimleri

## 🎯 Ana Hedefler

1. **Var olan frevector.com sitesini revize etmek** (yeni site değil)
2. **Cloudflare R2, KV ve Worker API** entegrasyonu
3. **Admin paneli** ile dosya yönetimi
4. **Tüm kodları tam olarak vermek** (index.html, style.css, main.js, admin.html, vb.)

---

## 📋 Teknik Gereksinimler

### Frontend
- **index.html** - Ana sayfa
- **style.css** - Tüm stiller
- **main.js** - Tüm JavaScript işlevselliği
- **admin.html** - Admin paneli
- **admin.js** - Admin panel işlevselliği

### Backend
- **Cloudflare Worker API** - API endpoints
- **Cloudflare R2** - Dosya depolama
- **Cloudflare KV** - Veri depolama

---

## 🎨 Tasarım Gereksinimleri

### Üst Banner (Siyah)
- Ortada 5 adet beyaz çizgi
- Altında animasyonlu yazılar (dönüşümlü görüntü)
- Yazılar:
  1. "We operate our own in-house studio..."
  2. "Our goal is to provide a comprehensive..."
  3. "We aim to offer a wide archive..."
  4. "Our only and absolute rule..."
  5. "The advertisements on our website..."

### Ana Sayfa Yapısı
- **Sol Sidebar:** 34 kategori (A-Z sırayla)
- **Merkez:** Sonsuz kaydırma ile görseller
- **Arama:** Gerçek zamanlı arama (keywords bazlı)
- **Sayfa Sayacı:** Alt ortada `← 1 →` şeklinde

### Kategori Sayfası
- **H1 Başlığı:** Kategori adı (SEO uyumlu)
- **Açıklama:** Kategori açıklaması (İngilizce)
- **Görseller:** Grid layout
- **Bilgiler:** Başlık, anahtar kelimeler, format (EPS, SVG, JPEG)

### İndirme Sayfası
- **Görsel:** Büyütülmüş gösterim
- **Vector Details:** Tablo (Format, Category, Resolution, License, Size)
- **Geri Sayım:** "Your download will start in: 3... 2... 1..."
- **Mobil Uyumlu:** Responsive tasarım

### Footer
- **Sol:** "2026 © frevector.com"
- **Sağ:** "About Us | Privacy Policy | Terms of Service | Contact"

---

## 📂 Kategoriler (34 adet)

1. Abstract
2. Animals/Wildlife
3. The Arts
4. Backgrounds/Textures
5. Beauty/Fashion
6. Buildings/Landmarks
7. Business/Finance
8. Celebrities
9. Education
10. Food
11. Drink
12. Healthcare/Medical
13. Holidays
14. Industrial
15. Interiors
16. Miscellaneous
17. Nature
18. Objects
19. Parks/Outdoor
20. People
21. Religion
22. Science
23. Signs/Symbols
24. Sports/Recreation
25. Technology
26. Transportation
27. Vintage
28. Logo
29. Font
30. Icon
31. (Ek kategoriler)

---

## 🔍 Arama Sistemi

- **Gerçek zamanlı arama** (keywords bazlı)
- **Büyük/küçük harf duyarsız**
- **Kısmi eşleşme** destekleme
- **Birden fazla kelime** destekleme
- **Relevance sırasına göre** sonuçlar
- **10.000+ veri performansı**
- **Sayfa yenilenmez**

---

## 📊 JSON Yapısı (Her görsel için)

```json
{
  "id": "food-00000",
  "title": "Vector Title",
  "description": "Description from JSON",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "Food",
  "formats": ["EPS", "SVG", "JPEG"],
  "resolution": "High Quality / Fully Scalable",
  "license": "Free for Personal & Commercial Use",
  "fileSize": "1.8 MB",
  "thumbnail": "url_to_thumbnail.jpg",
  "zipFile": "url_to_zip.zip"
}
```

---

## 🚀 Admin Paneli Özellikleri

- **Dosya Yükleme:** R2'ye yükleme
- **Metadata Yönetimi:** JSON düzenleme
- **Kategori Yönetimi:** Kategoriler oluştur/düzenle
- **KV Entegrasyonu:** Verileri KV'de sakla
- **Sadece Admin:** Yalnızca yönetici erişimi

---

## ⚠️ Önemli Kurallar

1. **Hiçbir yerde dosya adı görünmeyecek** (food-00000 gibi)
2. **Sadece başlık ve anahtar kelimeler** gösterilecek
3. **Mouse hover yazısı olmayacak**
4. **Reklam alanları olmayacak**
5. **Mobil uyumlu olmalı**
6. **Tüm içerik İngilizce**
7. **AI'dan bahsedilmeyecek**
8. **Anahtar kelimelere "free", "vector", "svg", "eps" eklenecek**

---

## 📦 Teslim Edilecek Dosyalar

```
frevector-codes/
├── index.html          (Ana sayfa - TAM KOD)
├── style.css           (Tüm stiller - TAM KOD)
├── main.js             (Tüm JavaScript - TAM KOD)
├── admin.html          (Admin paneli - TAM KOD)
├── admin.js            (Admin JS - TAM KOD)
├── worker.js           (Cloudflare Worker - TAM KOD)
├── wrangler.toml       (Cloudflare konfigürasyonu)
├── data.json           (Örnek veri yapısı)
└── REQUIREMENTS.md     (Bu dosya)
```

---

## 🔗 Cloudflare Entegrasyonu

- **R2 Bucket:** Dosya depolama
- **KV Namespace:** Veri depolama
- **Worker Routes:** API endpoints
- **Environment Variables:** Konfigürasyon

