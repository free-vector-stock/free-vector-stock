# 🎨 Frevector - Free Vector, SVG & EPS Downloads

Frevector, **Cloudflare R2, KV ve Worker API** kullanarak inşa edilmiş, profesyonel vektör grafik indirme platformudur.

---

## 📦 İçindekiler

Bu paket, frevector.com sitesini revize etmek için gereken **tüm kodları** içerir:

### 🎯 Frontend Dosyaları
- **index.html** - Ana sayfa (TAM KOD, hazır kullanım)
- **style.css** - Tüm CSS stilleri (TAM KOD, hazır kullanım)
- **main.js** - Tüm JavaScript (TAM KOD, hazır kullanım)

### 🔐 Admin Paneli
- **admin.html** - Admin arayüzü (TAM KOD, hazır kullanım)
- **admin-style.css** - Admin stilleri (TAM KOD, hazır kullanım)
- **admin.js** - Admin JavaScript (TAM KOD, hazır kullanım)

### ⚙️ Backend / API
- **worker.js** - Cloudflare Worker API (TAM KOD, hazır kullanım)
- **wrangler.toml** - Cloudflare konfigürasyonu

### 📚 Dokümantasyon
- **data.json** - Örnek veri yapısı
- **REQUIREMENTS.md** - Teknik gereksinimler
- **DEPLOYMENT.md** - Dağıtım kılavuzu
- **README.md** - Bu dosya

---

## 🚀 Hızlı Başlangıç

### Adım 1: Dosyaları Text Editor Pro'ya Yapıştırın

1. **index.html** kodunu kopyalayın ve Text Editor Pro'ya yapıştırın
2. **style.css** kodunu kopyalayın ve Text Editor Pro'ya yapıştırın
3. **main.js** kodunu kopyalayın ve Text Editor Pro'ya yapıştırın
4. **admin.html** kodunu kopyalayın ve Text Editor Pro'ya yapıştırın
5. **admin-style.css** kodunu kopyalayın ve Text Editor Pro'ya yapıştırın
6. **admin.js** kodunu kopyalayın ve Text Editor Pro'ya yapıştırın

### Adım 2: Cloudflare'e Dağıtın

1. https://dash.cloudflare.com adresine gidin
2. **Workers & Pages** → **Create deployment** seçin
3. Dosyaları yükleyin
4. **Deploy** butonuna tıklayın

### Adım 3: Custom Domain Bağlayın

1. Cloudflare Dashboard'da **Domains** seçin
2. `frevector.com` bağlayın
3. DNS ayarlarını tamamlayın

---

## 🎨 Özellikler

### ✅ Ana Sayfa
- **Siyah üst banner** - Animasyonlu yazılar (5 adet beyaz çizgi)
- **Sol sidebar** - 34 kategori (A-Z sırayla)
- **Merkez grid** - Vektör görselleri (sonsuz kaydırma)
- **Gerçek zamanlı arama** - Keywords bazlı
- **Sayfa sayacı** - `← 1 →` şeklinde alt banner'da
- **Responsive tasarım** - Mobil uyumlu

### ✅ İndirme Sayfası
- **Büyütülmüş görsel** - Vektör önizlemesi
- **Vector Details tablosu** - Format, Category, Resolution, License, Size
- **Geri sayım** - "Your download will start in: 3... 2... 1..."
- **Otomatik indirme** - Sayım bittiğinde dosya indirilir

### ✅ Admin Paneli
- **Dashboard** - İstatistikler ve aktivite günlüğü
- **Vektör yükleme** - R2'ye dosya yükleme
- **Vektör yönetimi** - Düzenleme ve silme
- **Kategori yönetimi** - Kategori oluşturma ve silme
- **Ayarlar** - Cloudflare konfigürasyonu

### ✅ Backend / API
- **Cloudflare Worker** - RESTful API endpoints
- **R2 Storage** - Dosya depolama
- **KV Namespace** - Veri depolama
- **Authentication** - Token-based security

---

## 📋 Gereksinimler

### Cloudflare Hesabı
- Cloudflare Free/Pro plan
- R2 bucket erişimi
- KV namespace erişimi
- Workers erişimi

### Tarayıcı Desteği
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

---

## 🔧 Konfigürasyon

### 1. R2 Bucket Oluşturma

```bash
wrangler r2 bucket create frevector-vectors
```

### 2. KV Namespace Oluşturma

```bash
wrangler kv:namespace create frevector-kv
```

### 3. Environment Variables

```env
VITE_API_URL=https://api.frevector.com
R2_BUCKET=frevector-vectors
KV_NAMESPACE=frevector-kv
ADMIN_TOKEN=your-secure-token
```

---

## 📊 Veri Yapısı

### Vector Object

```json
{
  "id": "food-00001",
  "title": "Fresh Vegetables",
  "description": "A collection of fresh vegetables...",
  "keywords": ["free", "vector", "svg", "eps", "vegetables"],
  "category": "Food",
  "formats": ["EPS", "SVG", "JPEG"],
  "resolution": "High Quality / Fully Scalable",
  "license": "Free for Personal & Commercial Use",
  "fileSize": "2.1 MB",
  "thumbnail": "https://...",
  "zipFile": "https://...",
  "uploadDate": "2026-02-25T00:00:00Z"
}
```

### Category Object

```json
{
  "id": "category-food",
  "name": "Food",
  "description": "Food-related vectors..."
}
```

---

## 🔐 Güvenlik

### Admin Authentication
- Token-based authentication
- localStorage session storage
- Authorization headers

### R2 Security
- Private bucket configuration
- Signed URLs for downloads
- CORS headers

### HTTPS
- Tüm bağlantılar HTTPS üzerinden
- Secure cookies
- CSP headers

---

## 📱 Responsive Tasarım

- **Desktop** (1024px+): Grid layout, sidebar visible
- **Tablet** (768px-1023px): Adjusted grid, collapsible sidebar
- **Mobile** (480px-767px): Single column, touch-optimized
- **Small Mobile** (<480px): Minimal layout, optimized buttons

---

## 🧪 Test Etme

### Frontend Test

```bash
# Localhost'ta test edin
python3 -m http.server 8000

# http://localhost:8000/index.html
```

### API Test

```bash
# Vektörleri getir
curl https://api.frevector.com/api/vectors

# Admin endpoint
curl -H "Authorization: Bearer TOKEN" \
  https://api.frevector.com/api/admin/stats
```

---

## 🐛 Sorun Giderme

### Görseller yüklenmiyor
- R2 bucket URL'sini kontrol edin
- CORS headers'ı doğrulayın
- Browser console'u kontrol edin

### Admin paneline erişilemiyor
- Token'ı kontrol edin
- localStorage'ı temizleyin
- Browser console'u kontrol edin

### İndirme çalışmıyor
- ZIP dosyasının URL'sini kontrol edin
- File size'ı kontrol edin
- Browser indirme ayarlarını kontrol edin

---

## 📞 Destek

### Sorular için:
1. Browser console'u kontrol edin (F12)
2. Network tab'ında API çağrılarını kontrol edin
3. Cloudflare Worker logs'u kontrol edin

### Hata bildirimi:
- Error message'ı not edin
- Screenshot alın
- Adımları tekrarlayın

---

## 📄 Lisans

Frevector, tüm içeriği **Free for Personal & Commercial Use** lisansı altında sunmaktadır.

---

## 🎯 Sonraki Adımlar

1. ✅ Tüm dosyaları Text Editor Pro'ya yapıştırın
2. ✅ Cloudflare'e dağıtın
3. ✅ Custom domain bağlayın
4. ✅ Admin panelinde vektör yükleyin
5. ✅ Siteyi test edin
6. ✅ Go live!

---

## 📝 Notlar

- **Tüm kodlar hazır kullanıma sunulmuştur** - Hiçbir ek kod yazmanız gerekmez
- **Tam responsive tasarım** - Mobil, tablet ve desktop'ta çalışır
- **Cloudflare entegrasyonu** - R2 ve KV ile tam entegrasyon
- **Admin paneli dahil** - Vektör yönetimi için hazır arayüz
- **SEO optimized** - Arama motorları için optimize edilmiş

---

**Frevector - Premium Vektör Grafik Platformu** 🎨✨

