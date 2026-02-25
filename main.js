// FREVECTOR - GÖMÜLÜ VERİ MOTORU
const VECTOR_DATABASE = {
    "vectors": [
        {
            "id": "food-1",
            "title": "Modern Abstract Shapes",
            "category": "Abstract",
            "thumbnail": "https://raw.githubusercontent.com/free-vector-stock/frevector.com/main/thumbnails/abstract/shapes.jpg",
            "keywords": ["abstract", "modern"]
        }
        // Buraya kendi verilerini ekleyebilirsin
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('vectorsGrid');
    if(grid) {
        grid.innerHTML = '';
        VECTOR_DATABASE.vectors.forEach(v => {
            const card = document.createElement('div');
            card.className = 'vector-card';
            card.innerHTML = `<img src="${v.thumbnail}"> <div class="vector-title">${v.title}</div>`;
            grid.appendChild(card);
        });
    }
});
