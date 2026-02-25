# Frevector Deployment Guide

## 📋 Tüm Dosyalar

Bu ZIP dosyası aşağıdaki dosyaları içerir:

### Frontend Dosyaları
- **index.html** - Ana sayfa (TAM KOD)
- **style.css** - Tüm CSS stilleri (TAM KOD)
- **main.js** - Tüm JavaScript işlevselliği (TAM KOD)

### Admin Paneli
- **admin.html** - Admin paneli arayüzü (TAM KOD)
- **admin-style.css** - Admin panel stilleri (TAM KOD)
- **admin.js** - Admin panel JavaScript (TAM KOD)

### Backend / API
- **worker.js** - Cloudflare Worker API (TAM KOD)
- **wrangler.toml** - Cloudflare konfigürasyonu

### Veri
- **data.json** - Örnek veri yapısı
- **REQUIREMENTS.md** - Teknik gereksinimler
- **DEPLOYMENT.md** - Bu dosya

---

## 🚀 Dağıtım Adımları

### 1. Text Editor Pro'da Dosyaları Yapıştırma

1. **index.html** dosyasını açın
2. Tüm kodu kopyalayıp Text Editor Pro'ya yapıştırın
3. Dosyayı `index.html` olarak kaydedin

4. **style.css** dosyasını açın
5. Tüm kodu kopyalayıp Text Editor Pro'ya yapıştırın
6. Dosyayı `style.css` olarak kaydedin

7. **main.js** dosyasını açın
8. Tüm kodu kopyalayıp Text Editor Pro'ya yapıştırın
9. Dosyayı `main.js` olarak kaydedin

10. **admin.html** dosyasını açın
11. Tüm kodu kopyalayıp Text Editor Pro'ya yapıştırın
12. Dosyayı `admin.html` olarak kaydedin

13. **admin-style.css** dosyasını açın
14. Tüm kodu kopyalayıp Text Editor Pro'ya yapıştırın
15. Dosyayı `admin-style.css` olarak kaydedin

16. **admin.js** dosyasını açın
17. Tüm kodu kopyalayıp Text Editor Pro'ya yapıştırın
18. Dosyayı `admin.js` olarak kaydedin

### 2. Cloudflare Workers Dağıtımı

1. Cloudflare Dashboard'a gidin: https://dash.cloudflare.com
2. **Workers & Pages** seçeneğine tıklayın
3. **Create** → **Create Worker** seçin
4. **worker.js** dosyasının kodunu yapıştırın
5. **Deploy** butonuna tıklayın

### 3. R2 Bucket Oluşturma

1. Cloudflare Dashboard'da **R2** seçeneğine gidin
2. **Create bucket** seçin
3. Bucket adı: `frevector-vectors`
4. **Create bucket** butonuna tıklayın

### 4. KV Namespace Oluşturma

1. Cloudflare Dashboard'da **Workers** → **KV** seçin
2. **Create namespace** seçin
3. Namespace adı: `frevector-kv`
4. **Add** butonuna tıklayın

### 5. Cloudflare Pages Dağıtımı

1. Cloudflare Dashboard'da **Workers & Pages** seçin
2. **Pages** seçeneğine tıklayın
3. **Create** → **Upload assets** seçin
4. Aşağıdaki dosyaları yükleyin:
   - index.html
   - style.css
   - main.js
   - admin.html
   - admin-style.css
   - admin.js

5. **Deploy** butonuna tıklayın

### 6. Custom Domain Bağlama

1. Cloudflare Dashboard'da **Pages** → **free-vector-stock** seçin
2. **Custom domains** seçeneğine tıklayın
3. **Add custom domain** seçin
4. `frevector.com` yazın
5. DNS ayarlarını takip edin

---

## 🔧 Konfigürasyon

### Environment Variables

`.env` dosyası oluşturun:

```env
VITE_API_URL=https://api.frevector.com
VITE_R2_BUCKET=frevector-vectors
VITE_KV_NAMESPACE=frevector-kv
ADMIN_TOKEN=your-secure-token-here
```

### Cloudflare Worker Bindings

`wrangler.toml` dosyasında şunları güncelleyin:

```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "frevector-vectors"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
```

---

## 📝 API Endpoints

### Public Endpoints

```
GET /api/vectors              - Tüm vektörleri getir
GET /api/vectors/:id          - Belirli vektörü getir
GET /api/categories           - Tüm kategorileri getir
```

### Admin Endpoints (Protected)

```
POST /api/admin/upload        - Vektör yükle
GET /api/admin/vectors        - Tüm vektörleri getir (admin)
DELETE /api/admin/vectors/:id - Vektörü sil
GET /api/admin/stats          - İstatistikleri getir
GET /api/admin/activity       - Aktivite günlüğü
POST /api/admin/categories    - Kategori ekle
DELETE /api/admin/categories/:id - Kategoriyi sil
POST /api/admin/settings      - Ayarları kaydet
```

---

## 🔐 Güvenlik

### Admin Kimlik Doğrulama

1. Admin paneline erişmek için token gereklidir
2. Token, localStorage'da saklanır
3. Her API isteğine `Authorization: Bearer {token}` header'ı eklenir

### R2 Bucket Güvenliği

1. R2 bucket'ını private yapın
2. Cloudflare Worker'dan erişim sağlayın
3. Public URL'ler, signed URL'ler olarak oluşturun

---

## 🧪 Test Etme

### Frontend Test

1. `index.html`'i tarayıcıda açın
2. Kategorileri tıklayın
3. Arama yapın
4. Görsellere tıklayıp indirme sayfasını açın

### Admin Panel Test

1. `admin.html`'i tarayıcıda açın
2. Admin kimlik bilgilerini girin
3. Vektör yükleyin
4. Kategorileri yönetin

### API Test

```bash
# Tüm vektörleri getir
curl https://api.frevector.com/api/vectors

# Vektör yükle
curl -X POST https://api.frevector.com/api/admin/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Vector" \
  -F "description=Test Description" \
  -F "category=Food" \
  -F "keywords=test,vector" \
  -F "thumbnail=@thumbnail.jpg" \
  -F "zipFile=@vector.zip"
```

---

## 🐛 Sorun Giderme

### CORS Hataları

Worker'da CORS headers'ı kontrol edin:

```javascript
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### R2 Upload Hataları

1. R2 bucket adını kontrol edin
2. Credentials'ı doğrulayın
3. File size limitlerini kontrol edin

### KV Namespace Hataları

1. Namespace ID'sini doğrulayın
2. KV quota'sını kontrol edin
3. Key naming conventions'ı takip edin

---

## 📊 Monitoring

### Cloudflare Analytics

1. Dashboard'da **Analytics** seçin
2. Traffic, errors, ve performance'ı izleyin

### Worker Logs

```bash
wrangler tail
```

### KV Usage

1. Dashboard'da **KV** seçin
2. Namespace'i seçin
3. Usage statistics'i görün

---

## 🔄 Güncelleme Süreci

1. Dosyaları Text Editor Pro'da düzenleyin
2. Cloudflare Dashboard'a gidin
3. **Workers & Pages** → **free-vector-stock** seçin
4. **Create deployment** seçin
5. Güncellenmiş dosyaları yükleyin
6. **Deploy** butonuna tıklayın

---

## 📞 Destek

Sorunlar için:
1. Browser console'u kontrol edin
2. Cloudflare Worker logs'u kontrol edin
3. Network tab'ında API çağrılarını kontrol edin

---

## ✅ Checklist

- [ ] index.html yüklendi
- [ ] style.css yüklendi
- [ ] main.js yüklendi
- [ ] admin.html yüklendi
- [ ] admin-style.css yüklendi
- [ ] admin.js yüklendi
- [ ] worker.js dağıtıldı
- [ ] R2 bucket oluşturuldu
- [ ] KV namespace oluşturuldu
- [ ] Custom domain bağlandı
- [ ] Admin token ayarlandı
- [ ] CORS headers kontrol edildi
- [ ] API endpoints test edildi
- [ ] Admin paneli test edildi
- [ ] Frontend test edildi

