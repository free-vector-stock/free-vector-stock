/**
 * frevector.com - Frontend Logic
 * Revised: detail panel opens below clicked card row, title from JSON, no filenames shown
 * Updated: tag limit (15 + expand), improved countdown, breadcrumb, related vectors
 */

const EXTRA_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];

// Categories list - MUST match categories-config.js exactly
const CATEGORIES = [
    'Abstract',
    'Animals/Wildlife',
    'The Arts',
    'Backgrounds/Textures',
    'Beauty/Fashion',
    'Buildings/Landmarks',
    'Business/Finance',
    'Celebrities',
    'Drink',
    'Education',
    'Font',
    'Food',
    'Healthcare/Medical',
    'Holidays',
    'Icon',
    'Industrial',
    'Interiors',
    'Logo',
    'Miscellaneous',
    'Nature',
    'Objects',
    'Parks/Outdoor',
    'People',
    'Religion',
    'Science',
    'Signs/Symbols',
    'Sports/Recreation',
    'Technology',
    'Transportation',
    'Vintage'
];

const MODAL_CONTENT = {
    about: `<h2>About Us</h2>
<p>Frevector.com is an independent design platform established to provide free access to high-quality, reliable, and completely original resources in the field of graphic design.</p>
<p>Our platform is managed by a team that produces in-house. All designs on our site are produced exclusively by Frevector artists. Our content is not taken from other platforms, copied, or rearranged. Every work is created from scratch and goes through an original production process.</p>
<p>Each design is published after going through idea development, drawing, vector editing, technical optimization, and quality control stages. Our goal is not only to provide free content, but also to create a long-term, reliable, and sustainable graphic archive.</p>
<p>Frevector.com features: Vector illustrations, Icon sets, Logo design elements, Graphic elements, Various design resources.</p>
<p>All files are available free of charge for both personal and commercial projects. Our only and absolute rule is: Files may not be redistributed, uploaded to other platforms, sold, or shared in archive/package form.</p>
<p>The sustainability of our site is provided by advertising revenue published on the site. This revenue enables us to produce new designs and grow our archive. When an ad blocker is active, some features may be restricted. In this case, the ad blocker must be disabled and the page refreshed.</p>
<p>Frevector is a platform that values original production, labor, and ethical design understanding.</p>`,
    privacy: `<h2>Privacy Policy</h2>
<p>At Frevector.com, we value user privacy. This policy explains what data may be collected when you visit our site and how it is used.</p>
<p><strong>1. Data Collected</strong><br>When you visit our site, some anonymous data may be automatically collected. This data does not directly identify you. Collectible data includes: Cookies, Browser and device information, IP address (for anonymous analysis), Page visit and interaction data, Analytical usage information.</p>
<p><strong>2. Purposes of Use</strong><br>Collected data is used to: Improve site performance, Enhance user experience, Detect technical errors, Ensure security, Optimize content development process.</p>
<p><strong>3. Personal Data</strong><br>Personal data (name, email, etc.) is only processed when voluntarily shared by the user. Frevector does not sell, rent, or share user data with third parties for commercial purposes.</p>
<p><strong>4. Cookie Policy</strong><br>Cookies are used on our site for functionality, remembering user preferences, and performance measurement. Users can limit or disable cookie usage through browser settings.</p>
<p><strong>5. Advertising Services</strong><br>Advertisements published on the site may be provided by third-party service providers. These providers may apply their own cookie policies.</p>
<p><strong>6. Data Security</strong><br>Necessary technical and administrative security measures are taken to protect data. However, it cannot be guaranteed that data transmission over the internet is completely secure.</p>`,
    terms: `<h2>Terms of Service</h2>
<p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
<p><strong>1. Content Ownership</strong><br>All graphic designs on the site are original works produced by Frevector artists. All copyrights belong to Frevector.</p>
<p><strong>2. Right of Use</strong><br>Downloaded files can be used free of charge in personal and commercial projects. Users can edit and integrate files into their own projects.</p>
<p><strong>3. Prohibited Uses</strong><br>The following actions are strictly prohibited: Redistribution of files, Uploading to other sites, Selling digitally or physically, Sharing in archive, package, or collection form, Presenting Frevector content as a free resource on other platforms.</p>
<p><strong>4. Disclaimer</strong><br>Frevector cannot be held responsible for direct or indirect damages arising from the use of content. Technical problems or temporary access issues may occasionally occur on the platform.</p>
<p><strong>5. Right to Change</strong><br>Frevector reserves the right to update the terms of service and site content without prior notice.</p>`,
    contact: `<h2>Contact</h2>
<p>For any questions, suggestions, collaboration requests, or copyright notices related to Frevector.com, please contact us.</p>
<p>Email: <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>
<p>Frevector values open and transparent communication with its users.</p>`,
    license: `<h2>License</h2>
<p>All designs on Frevector are original works produced by Frevector artists.</p>
<p><strong>Permitted Uses:</strong></p>
<ul><li>Use in personal projects</li><li>Use in commercial projects</li><li>Edit and integrate into projects</li></ul>
<p><strong>Prohibited Uses:</strong></p>
<ul><li>Sharing files as-is</li><li>Redistribution</li><li>Selling</li><li>Presenting as a resource on other sites</li><li>Sharing in bulk to create a free content archive</li></ul>
<p>The Frevector license only grants the right to use in end-user projects. It does not grant the right to share the file itself.</p>`,
    dmca: `<h2>DMCA & Copyright Notice</h2>
<p>Frevector values original production and respects copyrights.</p>
<p>All content on the site has been produced by Frevector artists. Nevertheless, if you believe any content infringes your copyright, you may contact us.</p>
<p>The notification must include: Information showing that you are the copyright holder, Link to the content you believe is infringing, Your contact information, A statement of the accuracy of your declaration.</p>
<p>Valid notifications will be reviewed and necessary action will be taken.</p>`
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    searchQuery: '',
    isLoading: false,
    openedVector: null,
    openedCardEl: null,
    picksOffset: 0,
    allPickVectors: []
};

/* ===========================
   INIT
   =========================== */
async function init() {
    setupCategories();
    setupEventListeners();
    await fetchVectors();
}

/* ===========================
   CATEGORIES
   =========================== */
function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item active';
    allLink.dataset.cat = 'all';
    allLink.textContent = 'All';
    allLink.addEventListener('click', (e) => { e.preventDefault(); selectCategory('all'); });
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item';
        a.dataset.cat = cat;
        a.textContent = cat;
        a.addEventListener('click', (e) => { e.preventDefault(); selectCategory(cat); });
        list.appendChild(a);
    });
}

function selectCategory(cat) {
    state.selectedCategory = cat;
    state.currentPage = 1;
    state.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    closeDetailPanel();
    document.querySelectorAll('.category-item').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === cat);
    });
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    const cat = state.selectedCategory === 'all' ? 'Vector' : state.selectedCategory;
    el.textContent = `Free ${cat} Vector, SVG, EPS & JPEG Downloads`;
}

/* ===========================
   FETCH VECTORS
   =========================== */
async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        const sortVal = document.getElementById('sortFilter')?.value || 'newest';
        if (sortVal === 'oldest') url.searchParams.set('sort', 'oldest');
        else url.searchParams.set('sort', 'newest');

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        if (!state.vectors.length && state.total > 0 && state.currentPage > 1) {
            state.currentPage = Math.max(1, state.totalPages);
            return fetchVectors();
        }

        if (state.currentPage > state.totalPages && state.totalPages > 0) {
            state.currentPage = state.totalPages;
            return fetchVectors();
        }

        renderVectors();
        updatePagination();

        if (state.currentPage === 1) {
            renderOurPicks();
            renderKeywordTags();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
        const grid = document.getElementById('vectorsGrid');
        if (grid) grid.innerHTML = '<div class="no-results">Unable to load vectors. Please try again.</div>';
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

/* ===========================
   RENDER VECTORS
   =========================== */
function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No vectors found matching your criteria.</div>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.setAttribute('data-slug', v.name);

        // Title: use JSON title, never show filename/slug
        const displayTitle = v.title && !isFileSlug(v.title) ? v.title : '';

        // Keywords: extra + vector keywords
        const extraKws = EXTRA_KEYWORDS.join(', ');
        const mainKws = (v.keywords || []).slice(0, 3).join(', ');
        const displayKws = mainKws ? `${extraKws}, ${mainKws}` : extraKws;

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(displayTitle || 'Free Vector')}" loading="lazy"
                     onerror="this.src='https://placehold.co/280x210/f5f5f5/999?text=Preview'">
            </div>
            <div class="vc-info">
                ${displayTitle ? `<div class="vc-title">${escHtml(displayTitle)}</div>` : ''}
                <div class="vc-keywords">${escHtml(displayKws)}</div>
            </div>
        `;

        card.addEventListener('click', () => openDetailPanel(v, card));
        grid.appendChild(card);
    });
}

/**
 * Check if a string looks like a file slug (contains numeric codes like 00000)
 */
function isFileSlug(str) {
    if (!str) return true;
    return /\d{5,}/.test(str) || /^(food|abstract|sports|animals|the-arts|backgrounds|beauty|buildings|business|celebrities|drink|education|font|healthcare|holidays|icon|industrial|interiors|logo|miscellaneous|nature|objects|parks|people|religion|science|signs|technology|transportation|vintage)-\d/.test(str);
}

/* ===========================
   DETAIL PANEL (inline - opens below clicked card row)
   =========================== */
function openDetailPanel(v, cardEl) {
    state.openedVector = v;
    state.openedCardEl = cardEl;

    const panel = document.getElementById('detailPanel');
    if (!panel) return;

    // Populate panel content
    const img = document.getElementById('detailImage');
    img.src = v.thumbnail;
    img.alt = (v.title && !isFileSlug(v.title)) ? v.title : 'Free Vector';
    img.onerror = function() {
        this.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview';
    };

    // Title: use JSON title, never slug
    const displayTitle = (v.title && !isFileSlug(v.title)) ? v.title : '';
    document.getElementById('detailTitle').textContent = displayTitle;
    document.getElementById('detailDescription').textContent = v.description || '';
    document.getElementById('detailCategory').textContent = v.category || '-';
    document.getElementById('detailFileSize').textContent = v.fileSize || '-';

    // Breadcrumb
    updateBreadcrumb(v, displayTitle);

    // Keywords with 15-tag limit + expand
    renderDetailKeywords(v);

    // Insert panel AFTER the row containing the clicked card
    const grid = document.getElementById('vectorsGrid');
    if (grid && cardEl) {
        if (panel.parentNode) panel.parentNode.removeChild(panel);

        const cards = Array.from(grid.querySelectorAll('.vector-card'));
        const cardIndex = cards.indexOf(cardEl);

        const cardTop = cardEl.offsetTop;
        let lastInRow = cardIndex;
        for (let i = cardIndex + 1; i < cards.length; i++) {
            if (cards[i].offsetTop === cardTop) {
                lastInRow = i;
            } else {
                break;
            }
        }

        const afterCard = cards[lastInRow];
        afterCard.after(panel);
    }

    panel.style.display = 'block';

    // Mark active card
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    if (cardEl) cardEl.classList.add('card-active');

    // Render related vectors
    renderRelatedVectors(v);

    // Scroll panel into view smoothly
    setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
}

/* ===========================
   BREADCRUMB
   =========================== */
function updateBreadcrumb(v, displayTitle) {
    const catEl = document.getElementById('breadcrumbCategory');
    const titleEl = document.getElementById('breadcrumbTitle');
    const homeEl = document.getElementById('breadcrumbHome');

    if (homeEl) {
        homeEl.addEventListener('click', (e) => {
            e.preventDefault();
            state.selectedCategory = 'all';
            state.currentPage = 1;
            state.searchQuery = '';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            document.querySelectorAll('.category-item').forEach(el => {
                el.classList.toggle('active', el.dataset.cat === 'all');
            });
            closeDetailPanel();
            updateCategoryTitle();
            fetchVectors();
        });
    }

    if (catEl) {
        catEl.textContent = v.category || 'All';
        catEl.onclick = (e) => {
            e.preventDefault();
            if (v.category) {
                selectCategory(v.category);
            }
        };
    }

    if (titleEl) {
        titleEl.textContent = displayTitle || v.name || '';
    }
}

/* ===========================
   DETAIL KEYWORDS (max 15 + expand)
   =========================== */
function renderDetailKeywords(v) {
    const kwContainer = document.getElementById('detailKeywords');
    if (!kwContainer) return;
    kwContainer.innerHTML = '';

    const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
    const MAX_VISIBLE = 15;

    allKws.forEach((kw, index) => {
        const span = document.createElement('span');
        span.className = 'kw-tag';
        if (index >= MAX_VISIBLE) {
            span.classList.add('kw-tags-hidden');
        }
        span.textContent = kw;
        span.addEventListener('click', () => {
            document.getElementById('searchInput').value = kw;
            state.searchQuery = kw;
            state.currentPage = 1;
            closeDetailPanel();
            fetchVectors();
        });
        kwContainer.appendChild(span);
    });

    // Add "+X more" button if needed
    if (allKws.length > MAX_VISIBLE) {
        const remaining = allKws.length - MAX_VISIBLE;
        const moreBtn = document.createElement('button');
        moreBtn.className = 'kw-more-btn';
        moreBtn.textContent = `+${remaining} more`;
        moreBtn.setAttribute('data-expanded', 'false');
        moreBtn.addEventListener('click', () => {
            const isExpanded = moreBtn.getAttribute('data-expanded') === 'true';
            const hiddenTags = kwContainer.querySelectorAll('.kw-tags-hidden');
            if (isExpanded) {
                hiddenTags.forEach(t => t.classList.add('kw-tags-hidden'));
                moreBtn.textContent = `+${remaining} more`;
                moreBtn.setAttribute('data-expanded', 'false');
            } else {
                hiddenTags.forEach(t => t.classList.remove('kw-tags-hidden'));
                moreBtn.textContent = 'Show less';
                moreBtn.setAttribute('data-expanded', 'true');
            }
        });
        kwContainer.appendChild(moreBtn);
    }
}

/* ===========================
   RELATED VECTORS
   =========================== */
function renderRelatedVectors(currentVector) {
    const section = document.getElementById('relatedVectorsSection');
    const grid = document.getElementById('relatedVectorsGrid');
    if (!section || !grid) return;

    // Get all vectors from state
    const allVectors = state.vectors;
    if (!allVectors || allVectors.length === 0) {
        section.style.display = 'none';
        return;
    }

    // Algorithm: first same category, then same tags, max 12
    const currentSlug = currentVector.name;
    const currentCategory = currentVector.category || '';
    const currentKeywords = new Set((currentVector.keywords || []).map(k => k.toLowerCase()));

    // Score each vector
    const scored = allVectors
        .filter(v => v.name !== currentSlug)
        .map(v => {
            let score = 0;
            if ((v.category || '') === currentCategory) score += 10;
            const vKws = (v.keywords || []).map(k => k.toLowerCase());
            vKws.forEach(kw => {
                if (currentKeywords.has(kw)) score += 1;
            });
            return { v, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

    if (scored.length === 0) {
        section.style.display = 'none';
        return;
    }

    grid.innerHTML = '';
    scored.forEach(({ v }) => {
        const card = document.createElement('div');
        card.className = 'related-card';
        const relTitle = (v.title && !isFileSlug(v.title)) ? v.title : 'Free Vector';
        card.innerHTML = `
            <img class="related-card-img" src="${v.thumbnail}" alt="${escHtml(relTitle)}" loading="lazy"
                 onerror="this.src='https://placehold.co/160x120/f5f5f5/999?text=Preview'">
            <div class="related-card-title">${escHtml(relTitle)}</div>
        `;
        card.addEventListener('click', () => {
            // Find the card in the main grid
            const mainGrid = document.getElementById('vectorsGrid');
            const cards = mainGrid ? mainGrid.querySelectorAll('.vector-card') : [];
            let found = null;
            cards.forEach(c => { if (c.dataset.slug === v.name) found = c; });
            if (found) {
                openDetailPanel(v, found);
            } else {
                openDetailPanel(v, null);
            }
        });
        grid.appendChild(card);
    });

    section.style.display = 'block';
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) {
        panel.style.display = 'none';
        // Move panel back to its original position in the DOM (after vectorsGrid)
        const grid = document.getElementById('vectorsGrid');
        if (grid && panel.parentNode !== grid.parentNode) {
            grid.after(panel);
        }
    }
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    state.openedVector = null;
    state.openedCardEl = null;
}

/* ===========================
   OUR PICKS (page 1 only)
   =========================== */
function renderOurPicks() {
    const section = document.getElementById('ourPicksSection');
    if (!section) return;

    if (state.currentPage !== 1 || state.vectors.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    state.allPickVectors = [...state.vectors].sort(() => Math.random() - 0.5);
    state.picksOffset = 0;
    renderPicksTrack();
}

function renderPicksTrack() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    track.innerHTML = '';

    const visible = 9;
    const items = state.allPickVectors.slice(state.picksOffset, state.picksOffset + visible);

    items.forEach(v => {
        const div = document.createElement('div');
        div.className = 'pick-item';
        const displayTitle = (v.title && !isFileSlug(v.title)) ? v.title : 'Free Vector';
        div.innerHTML = `<img src="${v.thumbnail}" alt="${escHtml(displayTitle)}" loading="lazy"
            onerror="this.src='https://placehold.co/160x120/f5f5f5/999?text=Preview'">`;
        div.addEventListener('click', () => {
            const grid = document.getElementById('vectorsGrid');
            const cards = grid ? grid.querySelectorAll('.vector-card') : [];
            let found = null;
            cards.forEach(c => { if (c.dataset.slug === v.name) found = c; });
            if (found) {
                openDetailPanel(v, found);
            } else {
                openDetailPanel(v, null);
            }
        });
        track.appendChild(div);
    });
}

/* ===========================
   KEYWORD TAGS
   =========================== */
function renderKeywordTags() {
    const section = document.getElementById('keywordTagsSection');
    const list = document.getElementById('keywordTagsList');
    if (!section || !list) return;

    if (state.currentPage !== 1 || state.vectors.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    const kwCount = {};
    state.vectors.forEach(v => {
        (v.keywords || []).forEach(kw => {
            kwCount[kw] = (kwCount[kw] || 0) + 1;
        });
    });

    const topKws = Object.entries(kwCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([kw]) => kw);

    topKws.forEach(kw => {
        const btn = document.createElement('button');
        btn.className = 'ktag';
        btn.textContent = kw;
        btn.addEventListener('click', () => {
            document.getElementById('searchInput').value = kw;
            state.searchQuery = kw;
            state.currentPage = 1;
            closeDetailPanel();
            fetchVectors();
        });
        list.appendChild(btn);
    });
}

/* ===========================
   PAGINATION
   =========================== */
function updatePagination() {
    const pageNum = document.getElementById('pageNumber');
    const pageTotal = document.getElementById('pageTotal');
    const nextBtn = document.getElementById('nextPageBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextNavBtn = document.getElementById('nextBtn');

    if (pageNum) pageNum.textContent = state.currentPage;
    if (pageTotal) pageTotal.textContent = `/ ${state.totalPages}`;
    if (nextBtn) nextBtn.style.display = state.currentPage < state.totalPages ? 'inline-block' : 'none';
    if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
    if (nextNavBtn) nextNavBtn.disabled = state.currentPage >= state.totalPages;
}

/* ===========================
   DOWNLOAD PAGE
   =========================== */
function openDownloadPage(v) {
    const page = document.getElementById('downloadPage');
    if (!page) return;

    // Header info
    const cat = v.category || 'Vector';
    document.getElementById('dpHeaderTitle').textContent = `Free ${cat} Vector, SVG, EPS & JPEG Downloads`;
    document.getElementById('dpHeaderDesc').textContent =
        `Download professional high-quality ${cat.toLowerCase()} vector graphics for your creative projects. ` +
        `Our collection features premium EPS, SVG, and JPEG files that are fully scalable and perfect for web design, print, and digital applications. ` +
        `All assets at Frevector are provided under a free license for both personal and commercial use.`;

    // Image - always show
    const img = document.getElementById('dpImage');
    img.src = v.thumbnail;
    img.alt = (v.title && !isFileSlug(v.title)) ? v.title : 'Free Vector';
    img.onerror = function() {
        this.src = 'https://placehold.co/420x315/f5f5f5/999?text=Preview';
    };

    // Title: use JSON title, NEVER slug/filename
    const displayTitle = (v.title && !isFileSlug(v.title)) ? v.title : '';
    document.getElementById('dpTitle').textContent = displayTitle;

    // Description
    const dpDesc = document.getElementById('dpDescription');
    if (dpDesc) dpDesc.textContent = v.description || '';

    // Keywords (all shown in download page)
    const kwContainer = document.getElementById('dpKeywords');
    kwContainer.innerHTML = '';
    const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
    allKws.forEach(kw => {
        const span = document.createElement('span');
        span.className = 'dp-kw';
        span.textContent = kw;
        kwContainer.appendChild(span);
    });

    // Table
    document.getElementById('dpCategory').textContent = v.category || '-';
    document.getElementById('dpFileSize').textContent = v.fileSize || '-';

    page.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Countdown
    startCountdown(v);
}

function closeDownloadPage() {
    const page = document.getElementById('downloadPage');
    if (page) page.style.display = 'none';
    document.body.style.overflow = '';
    if (window._countdownTimer) {
        clearInterval(window._countdownTimer);
        window._countdownTimer = null;
    }
}

function startCountdown(v) {
    const el = document.getElementById('dpCountdown');
    const statusEl = document.getElementById('dpCountdownStatus');
    if (!el) return;

    let count = 3;
    el.textContent = count;
    if (statusEl) statusEl.textContent = 'Preparing download...';

    if (window._countdownTimer) clearInterval(window._countdownTimer);

    window._countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            el.textContent = count;
            if (statusEl) statusEl.textContent = 'Preparing download...';
        } else {
            el.textContent = '';
            if (statusEl) statusEl.textContent = 'Download starting...';
            clearInterval(window._countdownTimer);
            window._countdownTimer = null;
            // Trigger download
            const a = document.createElement('a');
            a.href = `/api/download?slug=${encodeURIComponent(v.name)}`;
            a.download = `${v.name}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }, 1000);
}

/* ===========================
   INFO MODAL
   =========================== */
function openInfoModal(type) {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('infoModalBody');
    if (!modal || !body) return;
    body.innerHTML = MODAL_CONTENT[type] || '';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

/* ===========================
   EVENT LISTENERS
   =========================== */
function setupEventListeners() {
    // Search - real-time, case-insensitive, partial match
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            state.currentPage = 1;
            clearTimeout(window._searchTimer);
            window._searchTimer = setTimeout(() => {
                closeDetailPanel();
                fetchVectors();
            }, 350);
        });
    }

    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.value = 'newest';
        sortFilter.addEventListener('change', () => {
            state.currentPage = 1;
            closeDetailPanel();
            fetchVectors();
        });
    }

    // Pagination
    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            closeDetailPanel();
            fetchVectors();
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            closeDetailPanel();
            fetchVectors();
        }
    });

    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            closeDetailPanel();
            fetchVectors();
        }
    });

    // Detail panel download button
    document.getElementById('detailDownloadBtn')?.addEventListener('click', () => {
        if (state.openedVector) openDownloadPage(state.openedVector);
    });

    // Detail panel close button
    document.getElementById('detailCloseBtn')?.addEventListener('click', closeDetailPanel);

    // Download page close
    document.getElementById('dpClose')?.addEventListener('click', closeDownloadPage);

    // Our picks arrows
    document.getElementById('picksPrev')?.addEventListener('click', () => {
        if (state.picksOffset > 0) {
            state.picksOffset = Math.max(0, state.picksOffset - 9);
            renderPicksTrack();
        }
    });

    document.getElementById('picksNext')?.addEventListener('click', () => {
        if (state.picksOffset + 9 < state.allPickVectors.length) {
            state.picksOffset += 9;
            renderPicksTrack();
        }
    });

    // Footer modal links
    document.querySelectorAll('.modal-trigger').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openInfoModal(link.dataset.modal);
        });
    });

    // Info modal close
    document.getElementById('infoModalClose')?.addEventListener('click', closeInfoModal);
    document.getElementById('infoModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeInfoModal();
    });

    // Logo click - refresh to home
    document.getElementById('logoLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        state.selectedCategory = 'all';
        state.currentPage = 1;
        state.searchQuery = '';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.category-item').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === 'all');
        });
        closeDetailPanel();
        updateCategoryTitle();
        fetchVectors();
    });

    // Keyboard ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDownloadPage();
            closeInfoModal();
            closeDetailPanel();
        }
    });
}

/* ===========================
   UTILITIES
   =========================== */
function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ===========================
   START
   =========================== */
document.addEventListener('DOMContentLoaded', init);
