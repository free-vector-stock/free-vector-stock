const state = { allVectors: [], selectedCategory: 'Food' };

async function init() {
    try {
        const response = await fetch('/api/vectors'); // Klasör yapısı sayesinde burası çalışacak
        const data = await response.json();
        state.allVectors = data.vectors || [];
        render();
    } catch (e) {
        console.error("Hata:", e);
    }
}

function render() {
    const grid = document.getElementById('vectorsGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const filtered = state.allVectors.filter(v => v.category === state.selectedCategory);
    filtered.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `<img src="${v.thumbnail}"><div class="vector-title">${v.title}</div>`;
        grid.appendChild(card);
    });
}
document.addEventListener('DOMContentLoaded', init);
