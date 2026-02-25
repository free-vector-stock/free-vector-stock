// ===========================
// FREVECTOR - MAIN JAVASCRIPT
// ===========================

// Configuration
const CONFIG = {
    itemsPerPage: 20,
    apiBaseUrl: '/api',
    animationInterval: 5000, // 5 seconds for banner text rotation
};

// State Management
const state = {
    currentPage: 1,
    selectedCategory: null,
    searchQuery: '',
    dateFilter: 'all',
    allVectors: [],
    filteredVectors: [],
    currentCountdown: 3,
    countdownInterval: null,
};

// DOM Elements
const elements = {
    logo: document.querySelector('.logo'),
    categoryLinks: document.querySelectorAll('.category-link'),
    searchInput: document.getElementById('searchInput'),
    dateFilter: document.getElementById('dateFilter'),
    vectorsGrid: document.getElementById('vectorsGrid'),
    categoryTitle: document.getElementById('categoryTitle'),
    pageNumber: document.getElementById('pageNumber'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    downloadModal: document.getElementById('downloadModal'),
    modalClose: document.querySelector('.modal-close'),
    downloadButton: document.getElementById('downloadButton'),
    countdownNumber: document.getElementById('countdownNumber'),
    countdownDisplay: document.getElementById('countdownDisplay'),
    loaderSpinner: document.getElementById('loaderSpinner'),
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadVectors();
    startBannerAnimation();
});

// ===========================
// EVENT LISTENERS
// ===========================

function initializeEventListeners() {
    // Logo click - reload page
    elements.logo.addEventListener('click', (e) => {
        e.preventDefault();
        location.reload();
    });

    // Category links
    elements.categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            selectCategory(category);
        });
    });

    // Search input - real-time search
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        state.currentPage = 1;
        filterAndDisplayVectors();
    });

    // Date filter
    elements.dateFilter.addEventListener('change', (e) => {
        state.dateFilter = e.target.value;
        state.currentPage = 1;
        filterAndDisplayVectors();
    });

    // Pagination
    elements.prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            displayVectors();
            updatePagination();
        }
    });

    elements.nextBtn.addEventListener('click', () => {
        const maxPage = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
        if (state.currentPage < maxPage) {
            state.currentPage++;
            displayVectors();
            updatePagination();
        }
    });

    // Modal close
    elements.modalClose.addEventListener('click', closeDownloadModal);
    elements.downloadModal.addEventListener('click', (e) => {
        if (e.target === elements.downloadModal) {
            closeDownloadModal();
        }
    });

    // Download button
    elements.downloadButton.addEventListener('click', triggerDownload);

    // Infinite scroll
    window.addEventListener('scroll', handleInfiniteScroll);
}

// ===========================
// LOAD VECTORS FROM API
// ===========================

async function loadVectors() {
    try {
        showLoader(true);
        
        // Fetch vectors from Cloudflare Worker API
        const response = await fetch(`${CONFIG.apiBaseUrl}/vectors`);
        const data = await response.json();
        
        state.allVectors = data.vectors || [];
        state.filteredVectors = [...state.allVectors];
        
        // Set default category to first one
        if (state.allVectors.length > 0) {
            const firstCategory = state.allVectors[0].category;
            selectCategory(firstCategory);
        }
        
        showLoader(false);
    } catch (error) {
        console.error('Error loading vectors:', error);
        showLoader(false);
        displayErrorMessage('Failed to load vectors. Please refresh the page.');
    }
}

// ===========================
// CATEGORY SELECTION
// ===========================

function selectCategory(category) {
    state.selectedCategory = category;
    state.currentPage = 1;
    state.searchQuery = '';
    elements.searchInput.value = '';

    // Update active category link
    elements.categoryLinks.forEach(link => {
        if (link.dataset.category === category) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update category title
    updateCategoryTitle(category);

    // Filter and display vectors
    filterAndDisplayVectors();
}

function updateCategoryTitle(category) {
    const titles = {
        'Abstract': 'Free Abstract Vector, SVG, EPS & JPEG Downloads',
        'Animals/Wildlife': 'Free Animals & Wildlife Vector, SVG, EPS & JPEG Downloads',
        'The Arts': 'Free The Arts Vector, SVG, EPS & JPEG Downloads',
        'Backgrounds/Textures': 'Free Backgrounds & Textures Vector, SVG, EPS & JPEG Downloads',
        'Beauty/Fashion': 'Free Beauty & Fashion Vector, SVG, EPS & JPEG Downloads',
        'Buildings/Landmarks': 'Free Buildings & Landmarks Vector, SVG, EPS & JPEG Downloads',
        'Business/Finance': 'Free Business & Finance Vector, SVG, EPS & JPEG Downloads',
        'Celebrities': 'Free Celebrities Vector, SVG, EPS & JPEG Downloads',
        'Education': 'Free Education Vector, SVG, EPS & JPEG Downloads',
        'Food': 'Free Food Vector, SVG, EPS & JPEG Downloads',
        'Drink': 'Free Drink Vector, SVG, EPS & JPEG Downloads',
        'Healthcare/Medical': 'Free Healthcare & Medical Vector, SVG, EPS & JPEG Downloads',
        'Holidays': 'Free Holidays Vector, SVG, EPS & JPEG Downloads',
        'Industrial': 'Free Industrial Vector, SVG, EPS & JPEG Downloads',
        'Interiors': 'Free Interiors Vector, SVG, EPS & JPEG Downloads',
        'Miscellaneous': 'Free Miscellaneous Vector, SVG, EPS & JPEG Downloads',
        'Nature': 'Free Nature Vector, SVG, EPS & JPEG Downloads',
        'Objects': 'Free Objects Vector, SVG, EPS & JPEG Downloads',
        'Parks/Outdoor': 'Free Parks & Outdoor Vector, SVG, EPS & JPEG Downloads',
        'People': 'Free People Vector, SVG, EPS & JPEG Downloads',
        'Religion': 'Free Religion Vector, SVG, EPS & JPEG Downloads',
        'Science': 'Free Science Vector, SVG, EPS & JPEG Downloads',
        'Signs/Symbols': 'Free Signs & Symbols Vector, SVG, EPS & JPEG Downloads',
        'Sports/Recreation': 'Free Sports & Recreation Vector, SVG, EPS & JPEG Downloads',
        'Technology': 'Free Technology Vector, SVG, EPS & JPEG Downloads',
        'Transportation': 'Free Transportation Vector, SVG, EPS & JPEG Downloads',
        'Vintage': 'Free Vintage Vector, SVG, EPS & JPEG Downloads',
        'Logo': 'Free Logo Vector, SVG, EPS & JPEG Downloads',
        'Font': 'Free Font Vector, SVG, EPS & JPEG Downloads',
        'Icon': 'Free Icon Vector, SVG, EPS & JPEG Downloads',
    };

    elements.categoryTitle.textContent = titles[category] || `Free ${category} Vector, SVG, EPS & JPEG Downloads`;
}

// ===========================
// FILTER VECTORS
// ===========================

function filterAndDisplayVectors() {
    let filtered = state.allVectors;

    // Filter by category
    if (state.selectedCategory) {
        filtered = filtered.filter(v => v.category === state.selectedCategory);
    }

    // Filter by search query (keywords)
    if (state.searchQuery) {
        filtered = filtered.filter(v => {
            const keywords = v.keywords.join(' ').toLowerCase();
            const title = v.title.toLowerCase();
            const description = v.description.toLowerCase();
            
            // Support multiple keywords
            const searchTerms = state.searchQuery.split(' ');
            return searchTerms.every(term => 
                keywords.includes(term) || 
                title.includes(term) || 
                description.includes(term)
            );
        });
    }

    // Filter by date
    if (state.dateFilter !== 'all') {
        const days = parseInt(state.dateFilter);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        filtered = filtered.filter(v => {
            const vectorDate = new Date(v.uploadDate);
            return vectorDate >= cutoffDate;
        });
    }

    state.filteredVectors = filtered;
    state.currentPage = 1;
    displayVectors();
    updatePagination();
}

// ===========================
// DISPLAY VECTORS
// ===========================

function displayVectors() {
    const startIndex = (state.currentPage - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const paginatedVectors = state.filteredVectors.slice(startIndex, endIndex);

    elements.vectorsGrid.innerHTML = '';

    if (paginatedVectors.length === 0) {
        elements.vectorsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No vectors found. Try a different search.</div>';
        return;
    }

    paginatedVectors.forEach(vector => {
        const card = createVectorCard(vector);
        elements.vectorsGrid.appendChild(card);
    });
}

function createVectorCard(vector) {
    const card = document.createElement('div');
    card.className = 'vector-card';

    const keywordsHTML = vector.keywords
        .slice(0, 3)
        .map(kw => `<span class="vector-keyword-tag">${escapeHtml(kw)}</span>`)
        .join('');

    card.innerHTML = `
        <img src="${escapeHtml(vector.thumbnail)}" alt="${escapeHtml(vector.title)}" class="vector-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
        <div class="vector-info">
            <div class="vector-title">${escapeHtml(vector.title)}</div>
            <div class="vector-keywords">${keywordsHTML}</div>
        </div>
    `;

    card.addEventListener('click', () => openDownloadModal(vector));
    return card;
}

// ===========================
// DOWNLOAD MODAL
// ===========================

function openDownloadModal(vector) {
    document.getElementById('modalImage').src = escapeHtml(vector.thumbnail);
    document.getElementById('modalTitle').textContent = escapeHtml(vector.title);
    document.getElementById('modalDescription').textContent = escapeHtml(vector.description);
    document.getElementById('modalCategory').textContent = escapeHtml(vector.category);
    document.getElementById('modalFileSize').textContent = vector.fileSize || '1.8 MB';

    // Display keywords
    const keywordsContainer = document.getElementById('modalKeywords');
    keywordsContainer.innerHTML = vector.keywords
        .map(kw => `<span class="keyword-badge">${escapeHtml(kw)}</span>`)
        .join('');

    // Reset countdown
    state.currentCountdown = 3;
    startCountdown(vector);

    elements.downloadModal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function closeDownloadModal() {
    elements.downloadModal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    
    // Clear countdown
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }
}

function startCountdown(vector) {
    elements.countdownNumber.textContent = state.currentCountdown;

    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }

    state.countdownInterval = setInterval(() => {
        state.currentCountdown--;
        elements.countdownNumber.textContent = state.currentCountdown;

        if (state.currentCountdown <= 0) {
            clearInterval(state.countdownInterval);
            triggerDownload(vector);
        }
    }, 1000);
}

function triggerDownload(vector) {
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = vector.zipFile;
    link.download = `${vector.id}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Close modal after download
    setTimeout(() => {
        closeDownloadModal();
    }, 500);
}

// ===========================
// PAGINATION
// ===========================

function updatePagination() {
    const maxPage = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
    elements.pageNumber.textContent = state.currentPage;

    elements.prevBtn.disabled = state.currentPage === 1;
    elements.nextBtn.disabled = state.currentPage === maxPage;

    // Update button styles
    elements.prevBtn.style.opacity = state.currentPage === 1 ? '0.5' : '1';
    elements.nextBtn.style.opacity = state.currentPage === maxPage ? '0.5' : '1';
}

// ===========================
// INFINITE SCROLL
// ===========================

function handleInfiniteScroll() {
    const scrollPercentage = (window.innerHeight + window.scrollY) / document.body.offsetHeight;

    if (scrollPercentage > 0.8) {
        const maxPage = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
        if (state.currentPage < maxPage) {
            state.currentPage++;
            displayVectors();
            updatePagination();
        }
    }
}

// ===========================
// BANNER ANIMATION
// ===========================

function startBannerAnimation() {
    const texts = document.querySelectorAll('.animated-text');
    let currentIndex = 0;

    setInterval(() => {
        texts.forEach(text => text.classList.remove('active'));
        texts[currentIndex].classList.add('active');
        currentIndex = (currentIndex + 1) % texts.length;
    }, CONFIG.animationInterval);
}

// ===========================
// UTILITIES
// ===========================

function showLoader(show) {
    elements.loaderSpinner.style.display = show ? 'flex' : 'none';
}

function displayErrorMessage(message) {
    elements.vectorsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #d32f2f;">${escapeHtml(message)}</div>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// SAMPLE DATA FOR TESTING
// ===========================

// If API is not available, use sample data
async function loadSampleData() {
    const sampleVectors = [
        {
            id: 'food-00001',
            title: 'Fresh Vegetables',
            description: 'A collection of fresh vegetables including tomatoes, peppers, and leafy greens.',
            keywords: ['free', 'vector', 'svg', 'eps', 'vegetables', 'food', 'fresh', 'organic'],
            category: 'Food',
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23e8f5e9%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2216%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3EVegetables%3C/text%3E%3C/svg%3E',
            zipFile: '#',
            fileSize: '2.1 MB',
            uploadDate: new Date().toISOString(),
        },
        {
            id: 'food-00002',
            title: 'Tropical Fruits',
            description: 'Colorful tropical fruits including mangoes, pineapples, and coconuts.',
            keywords: ['free', 'vector', 'svg', 'eps', 'fruits', 'tropical', 'food'],
            category: 'Food',
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23fff3e0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2216%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3ETropical Fruits%3C/text%3E%3C/svg%3E',
            zipFile: '#',
            fileSize: '1.9 MB',
            uploadDate: new Date().toISOString(),
        },
    ];

    state.allVectors = sampleVectors;
    state.filteredVectors = [...state.allVectors];
    selectCategory('Food');
}

// Fallback to sample data if API fails
window.addEventListener('error', () => {
    if (state.allVectors.length === 0) {
        loadSampleData();
    }
});
