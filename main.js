// ==========================================
// FREVECTOR - DYNAMIC WORKER ENGINE (KV & R2)
// ==========================================

const CONFIG = {
    // Veriyi artık doğrudan kendi worker API'mizden çekiyoruz
    apiUrl: '/api/vectors', 
    itemsPerPage: 20
};

const state = {
    allVectors: [],
    selectedCategory: 'Food',
    currentPage: 1
};

async function init() {
    await loadFromKV();
    setupMenu();
}

async function loadFromKV() {
    const loader = document.getElementById('loaderSpinner');
    if(loader) loader.style.display = 'flex';

    try {
        // Bu istek az önce bağladığın KV Namespace'e gider
        const response = await fetch(`${CONFIG.apiUrl}?v=${Date.now()}`);
        const data = await response.json();
        state.allVectors = data.vectors || [];
        render();
    } catch (e) {
        console.error("KV Load Error:", e);
        // Hata durumunda yedek (fallback) gösterimi
        document.getElementById('vectorsGrid').innerHTML = "Veriler yüklenirken bir hata oluştu.";
    } finally {
        if(loader) loader.style.display = 'none';
    }
}

function render() {
    const grid = document.getElementById('vectorsGrid');
    if(!grid) return;
    grid.innerHTML = '';

    const filtered = state.allVectors.filter(v => v.category === state.selectedCategory);

    filtered.forEach(vector => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        // R2'den gelen görselleri doğru yolla gösterir
        card.innerHTML = `
            <img src="${vector.thumbnail}" alt="${vector.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
            <div class="vector-info"><div class="vector-title">${vector.title}</div></div>
        `;
        grid.appendChild(card);
    });
}

function setupMenu() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.selectedCategory = link.dataset.category;
            render();
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
