// ===========================
// FREVECTOR - FINAL STABLE JAVASCRIPT
// ===========================

const CONFIG = {
    itemsPerPage: 20,
    // Site nerede çalışırsa çalışsın data.json'u otomatik bulur
    apiBaseUrl: window.location.origin, 
    animationInterval: 5000, 
};

const state = {
    currentPage: 1,
    selectedCategory: null,
    searchQuery: '',
    allVectors: [],
    filteredVectors: [],
    currentCountdown: 3,
};

const elements = {
    categoryLinks: document.querySelectorAll('.category-link'),
    vectorsGrid: document.getElementById('vectorsGrid'),
    categoryTitle: document.getElementById('categoryTitle'),
    pageNumber: document.getElementById('pageNumber'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    downloadModal: document.getElementById('downloadModal'),
    loaderSpinner: document.getElementById('loaderSpinner'),
    searchInput: document.getElementById('searchInput'),
};

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadVectors();
    initializeEventListeners();
});

// ===========================
// LOAD DATA
// ===========================
async function loadVectors() {
    try {
        if(elements.loaderSpinner) elements.loaderSpinner.style.display = 'flex';
        
        // Cache sorunlarını önlemek için sonuna benzersiz bir ID ekliyoruz
        const response = await fetch(`${CONFIG.apiBaseUrl}/data.json?cache_bust=${Date.now()}`);
        if (!response.ok) throw new Error('Data file could not be loaded');
        
        const data = await response.json();
        state.allVectors = data.vectors || [];
        state.filteredVectors = [...state.allVectors];

        if (state.allVectors.length > 0) {
            // İlk açılışta 'Food' kategorisini yükle
            selectCategory('Food');
        } else {
            displayError("No data found in data.json");
        }
    } catch (error) {
        console.error('Error:', error);
        displayError("Failed to load vectors. Please ensure data.json exists in your root folder.");
    } finally {
        if(elements.loaderSpinner) elements.loaderSpinner.style.display = 'none';
    }
}

// ===========================
// CORE FUNCTIONS
// ===========================
function selectCategory(category) {
    state.selectedCategory = category;
    state.currentPage = 1;
    
    // Aktif linki güncelle
    elements.categoryLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });

    if(elements.categoryTitle) {
        elements.categoryTitle.textContent = `Free ${category} Vector, SVG, EPS & JPEG Downloads`;
    }
    
    filterAndDisplay();
}

function filterAndDisplay() {
    let filtered = state.allVectors;

    // Kategoriye göre filtrele
    if (state.selectedCategory) {
        filtered = filtered.filter(v => v.category === state.selectedCategory);
    }

    // Aramaya göre filtrele
    if (state.searchQuery) {
        filtered = filtered.filter(v => 
            v.title.toLowerCase().includes(state.searchQuery) || 
            v.keywords.some(kw => kw.toLowerCase().includes(state.searchQuery))
        );
    }

    state.filteredVectors = filtered;
    renderGrid();
}

function renderGrid() {
    if(!elements.vectorsGrid) return;
    elements.vectorsGrid.innerHTML = '';
    
    const start = (state.currentPage - 1) * CONFIG.itemsPerPage;
    const items = state.filteredVectors.slice(start, start + CONFIG.itemsPerPage);

    if (items.length === 0) {
        elements.vectorsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px;">No items found.</div>';
        updatePaginationUI();
        return;
    }

    items.forEach(vector => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <img src="${vector.thumbnail}" alt="${vector.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="vector-info">
                <div class="vector-title">${vector.title}</div>
            </div>
        `;
        card.onclick = () => openDownloadModal(vector);
        elements.vectorsGrid.appendChild(card);
    });
    
    updatePaginationUI();
}

function updatePaginationUI() {
    if(elements.pageNumber) elements.pageNumber.textContent = state.currentPage;
    const maxPage = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
    
    if(elements.prevBtn) elements.prevBtn.disabled = state.currentPage === 1;
    if(elements.nextBtn) elements.nextBtn.disabled = state.currentPage >= maxPage || maxPage === 0;
}

function initializeEventListeners() {
    // Kategori Linkleri
    elements.categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectCategory(link.dataset.category);
        });
    });

    // Sayfalama
    elements.prevBtn?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderGrid();
            window.scrollTo(0, 0);
        }
    });

    elements.nextBtn?.addEventListener('click', () => {
        const maxPage = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
        if (state.currentPage < maxPage) {
            state.currentPage++;
            renderGrid();
            window.scrollTo(0, 0);
        }
    });

    // Arama Çubuğu
    elements.searchInput?.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        state.currentPage = 1;
        filterAndDisplay();
    });
}

function displayError(msg) {
    if(elements.vectorsGrid) {
        elements.vectorsGrid.innerHTML = `<div style="grid-column: 1/-1; color: #d32f2f; text-align: center; padding: 40px;">${msg}</div>`;
    }
}

// Modal fonksiyonlarınızı (openDownloadModal vb.) dosyanın sonuna olduğu gibi ekleyebilirsiniz.
