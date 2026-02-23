// 1. Upper Banner Slogan Rotation
const slogans = [
    "We operate our own in-house studio to produce graphic designs and offer them free of charge for both personal and commercial projects.",
    "Our goal is to provide a comprehensive and ideal platform for those seeking graphic resources.",
    "Our only and absolute rule is that our files may not be redistributed in any way.",
    "Sustainability depends on advertising revenue. Please disable blockers and refresh."
];
let currentSlide = 0;
function rotateSlogan() {
    const textEl = document.getElementById('announcement-text');
    if (textEl) {
        textEl.style.opacity = 0;
        setTimeout(() => {
            textEl.innerText = slogans[currentSlide];
            textEl.style.opacity = 1;
            currentSlide = (currentSlide + 1) % slogans.length;
        }, 500);
    }
}
setInterval(rotateSlogan, 6000); rotateSlogan();

// 2. Metadata Cleaning (No food-0000 codes)
function processAssetData(rawFileName, category) {
    const cleanTitle = rawFileName.split('-')[0].toUpperCase(); // food-000083 -> FOOD
    const mandatoryKeywords = "free vector, free svg, free svg icon, free eps, free jpeg, free, fre, vector eps, svg, jpeg, ";

    return {
        title: cleanTitle,
        description: `Download professional high-quality ${cleanTitle} vector graphics...`,
        keywords: mandatoryKeywords + category.toLowerCase()
    };
}

// 3. Countdown Timer for Download (3... 2... 1...)
function startDownloadCountdown() {
    let seconds = 3;
    const timerDisplay = document.getElementById('countdown-timer');
    const timerInterval = setInterval(() => {
        seconds--;
        if (timerDisplay) timerDisplay.innerText = seconds;
        if (seconds <= 0) {
            clearInterval(timerInterval);
            // Auto-trigger download logic here
        }
    }, 1000);
}