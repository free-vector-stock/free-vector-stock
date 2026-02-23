// 1. Slogan Rotation (İngilizce Metinler)
const messages = [
    "We operate our own in-house studio to produce graphic designs offered 100% free.",
    "Our goal is to provide a comprehensive platform for graphic resources.",
    "Our absolute rule: files may not be redistributed in any way.",
    "Sustainability depends on advertising revenue. Please disable ad blockers."
];
let msgIdx = 0;
function rotateText() {
    const el = document.getElementById('animated-slogan');
    if(el) el.innerText = messages[msgIdx];
    msgIdx = (msgIdx + 1) % messages.length;
}
setInterval(rotateText, 5000); rotateText();

// 2. Data Fetching (KV Binding Kullanımı)
async function loadVectors() {
    // Burada Cloudflare Pages Function veya API'nizden veri çektiğinizi varsayıyoruz
    // Örnek temizleme mantığı:
    const rawName = "food-000083"; 
    const cleanTitle = rawName.split('-')[0].toUpperCase(); // Sadece FOOD kalır
    
    const mandatoryKeywords = "free vector, free svg, free svg icon, free eps, free jpeg, free, fre, vector eps, svg, jpeg";
    // Ekrana basarken bu 'cleanTitle' ve 'mandatoryKeywords' kullanılacak.
}

// 3. Download Timer (3... 2... 1...)
function startDownload() {
    let timeLeft = 3;
    const timer = setInterval(() => {
        timeLeft--;
        if(timeLeft <= 0) {
            clearInterval(timer);
            // İndirme başlat
        }
    }, 1000);
}
