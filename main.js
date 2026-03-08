/**
 * frevector.com - Frontend Logic
 * Fixed: Detail panel IDs, pagination sync, and download button.
 */

const EXTRA_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];

const CATEGORIES = [
    'Abstract', 'Animals/Wildlife', 'The Arts', 'Backgrounds/Textures', 'Beauty/Fashion',
    'Buildings/Landmarks', 'Business/Finance', 'Celebrities', 'Drink', 'Education',
    'Font', 'Food', 'Healthcare/Medical', 'Holidays', 'Icon', 'Industrial',
    'Interiors', 'Logo', 'Miscellaneous', 'Nature', 'Objects', 'Parks/Outdoor',
    'People', 'Religion', 'Science', 'Signs/Symbols', 'Sports/Recreation',
    'Technology', 'Transportation', 'Vintage'
];

const MODAL_CONTENTS = {
    about: {
        title: 'About Us',
        content: `<h2>About Us</h2>
<p>Frevector.com, grafik tasarım alanında özgün kaynaklara erişim sağlamak amacıyla oluşturulmuş bağımsız bir tasarım platformudur.</p>
<p>Platform, kendi iç stüdyosunda üretim yapan bir ekip tarafından yürütülmektedir. Sitede yer alan tüm tasarımlar yalnızca Frevector sanatçıları tarafından hazırlanır. İçerikler başka platformlardan alınmaz, kopyalanmaz veya yeniden düzenlenmez. Her çalışma baştan oluşturulur ve özgün bir üretim sürecinden geçer.</p>
<p>Her tasarım; fikir geliştirme, çizim, vektörel düzenleme, teknik düzenlemeler ve kalite kontrol aşamalarından sonra paylaşılır. Amacımız, zaman içinde büyüyen ve güvenle kullanılabilecek bir grafik arşivi oluşturmaktır.</p>
<p><strong>Frevector.com'da aşağıdaki içerikler yer alır:</strong></p>
<ul>
<li>Vektör illüstrasyonlar</li>
<li>İkon setleri</li>
<li>Logo tasarım öğeleri</li>
<li>Grafik elementler</li>
<li>Çeşitli tasarım kaynakları</li>
</ul>
<p>Tüm dosyalar kişisel ve ticari projelerde kullanılabilir.</p>
<p>Tek kuralımız şudur: Dosyalar yeniden dağıtılamaz, başka platformlara yüklenemez, satılamaz veya paket halinde tekrar paylaşılamaz.</p>
<p>Frevector, emeğe, özgün üretime ve etik tasarım anlayışına değer veren bir platformdur.</p>`
    },
    privacy: {
        title: 'Privacy Policy',
        content: `<h2>Privacy Policy</h2>
<p>Frevector.com olarak kullanıcı gizliliğine önem veriyoruz. Bu politika, siteyi ziyaret ettiğinizde hangi verilerin toplanabileceğini ve nasıl kullanılabileceğini açıklar.</p>
<h3>1. Toplanan Veriler</h3>
<p>Siteyi ziyaret ettiğinizde bazı anonim veriler otomatik olarak toplanabilir. Bu veriler kimliğinizi doğrudan belirlemez.</p>
<p><strong>Toplanabilecek veriler:</strong></p>
<ul>
<li>Çerezler (cookies)</li>
<li>Tarayıcı ve cihaz bilgileri</li>
<li>IP adresi (anonim analiz amaçlı)</li>
<li>Sayfa ziyaret ve etkileşim verileri</li>
<li>Analitik kullanım bilgileri</li>
</ul>
<h3>2. Verilerin Kullanım Amaçları</h3>
<p>Toplanan veriler şu amaçlarla kullanılabilir:</p>
<ul>
<li>Site performansını iyileştirmek</li>
<li>Kullanıcı deneyimini geliştirmek</li>
<li>Teknik sorunları tespit etmek</li>
<li>Güvenliği sağlamak</li>
<li>İçerik geliştirme sürecini desteklemek</li>
</ul>
<h3>3. Kişisel Veriler</h3>
<p>Kişisel veriler (isim, e-posta vb.) yalnızca kullanıcı tarafından gönüllü olarak paylaşıldığında işlenir. Örneğin iletişim amacıyla gönderilen e-postalar bu kapsamdadır.</p>
<p>Frevector kullanıcı verilerini üçüncü kişilerle satmaz veya ticari amaçla paylaşmaz.</p>
<h3>4. Çerez Politikası</h3>
<p>Sitede çerezler kullanılabilir. Çerezler site işlevlerini desteklemek, kullanıcı tercihlerini hatırlamak ve performansı ölçmek amacıyla kullanılabilir.</p>
<p>Kullanıcılar tarayıcı ayarlarından çerez kullanımını sınırlandırabilir veya devre dışı bırakabilir.</p>
<h3>5. Veri Güvenliği</h3>
<p>Verilerin korunması için gerekli teknik ve idari önlemler alınmaktadır. Ancak internet üzerinden yapılan veri iletiminin tamamen güvenli olduğu garanti edilemez.</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2>Terms of Service</h2>
<p>Frevector.com'u kullanan her ziyaretçi aşağıdaki şartları kabul etmiş sayılır.</p>
<h3>1. İçerik Sahipliği</h3>
<p>Sitede yer alan tüm grafik tasarımlar Frevector sanatçıları tarafından hazırlanmış özgün çalışmalardır. Tüm haklar Frevector'a aittir.</p>
<h3>2. Kullanım Hakkı</h3>
<p>İndirilen dosyalar kişisel ve ticari projelerde kullanılabilir. Kullanıcı, dosyaları kendi projeleri için düzenleyebilir ve çalışmalarına dahil edebilir.</p>
<h3>3. Yasaklanan Kullanımlar</h3>
<p><strong>Aşağıdaki işlemler yasaktır:</strong></p>
<ul>
<li>Dosyaların yeniden dağıtılması</li>
<li>Başka sitelere yüklenmesi</li>
<li>Dijital veya fiziksel olarak satılması</li>
<li>Arşiv, paket veya koleksiyon halinde paylaşılması</li>
<li>Frevector içeriğinin başka platformlarda kaynak olarak sunulması</li>
</ul>
<h3>4. Sorumluluk</h3>
<p>Frevector, içeriklerin kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz. Platformda zaman zaman teknik aksaklıklar veya geçici erişim sorunları yaşanabilir.</p>
<h3>5. Değişiklik Hakkı</h3>
<p>Frevector, hizmet şartlarını ve site içeriğini gerektiğinde güncelleme hakkını saklı tutar.</p>`
    },
    contact: {
        title: 'Contact',
        content: `<h2>Contact</h2>
<p>Frevector.com ile ilgili sorularınız veya iletmek istediğiniz bir konu varsa bizimle iletişime geçebilirsiniz.</p>
<p><strong>E-posta:</strong> hakankacar2014@gmail.com</p>
<p>Frevector, kullanıcılarıyla açık ve anlaşılır bir iletişim kurmaya önem verir.</p>`
    }
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
    countdownInterval: null
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    await fetchVectors();
}

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
        
        const res = await fetch(url);
        const data = await res.json();

        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No vectors found.</div>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.setAttribute('data-slug', v.name);

        const extraKws = EXTRA_KEYWORDS.join(', ');
        const mainKws = (v.keywords || []).slice(0, 3).join(', ');
        const displayKws = mainKws ? `${extraKws}, ${mainKws}` : extraKws;

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy"
                     onerror="this.src='https://placehold.co/280x210/f5f5f5/999?text=Preview'">
            </div>
            <div class="vc-info">
                <div class="vc-title">${escHtml(v.title)}</div>
                <div class="vc-keywords">${escHtml(displayKws)}</div>
            </div>
        `;

        card.addEventListener('click', () => openDetailPanel(v, card));
        grid.appendChild(card);
    });
}

function openDetailPanel(v, cardEl) {
    state.openedVector = v;
    state.openedCardEl = cardEl;
    const panel = document.getElementById('detailPanel');
    if (!panel) {
        console.error('Detail panel element not found');
        return;
    }
    
    // Close any existing detail panel first (without clearing state)
    panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));;

    const img = document.getElementById('detailImage');
    if (img) {
        img.src = v.thumbnail;
        img.alt = v.title;
        img.onerror = () => { img.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview'; };
    }

    const titleEl = document.getElementById('detailTitle');
    const descEl = document.getElementById('detailDescription');
    const catEl = document.getElementById('detailCategory');
    const sizeEl = document.getElementById('detailFileSize');
    
    if (titleEl) titleEl.textContent = v.title;
    if (descEl) descEl.textContent = v.description || '';
    if (catEl) catEl.textContent = v.category || '-';
    if (sizeEl) sizeEl.textContent = v.fileSize || '-';

    // Breadcrumb
    const breadcrumbCatEl = document.getElementById('breadcrumbCategory');
    const breadcrumbTitleEl = document.getElementById('breadcrumbTitle');
    if (breadcrumbCatEl) {
        breadcrumbCatEl.textContent = v.category || 'All';
        breadcrumbCatEl.onclick = (e) => { e.preventDefault(); selectCategory(v.category); };
    }
    if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = v.title;

    // Keywords
    const kwContainer = document.getElementById('detailKeywords');
    if (kwContainer) {
        kwContainer.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'kw-tag';
            span.textContent = kw;
            span.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = kw;
                state.searchQuery = kw;
                state.currentPage = 1;
                closeDetailPanel();
                fetchVectors();
            });
            kwContainer.appendChild(span);
        });
    }

    const grid = document.getElementById('vectorsGrid');
    if (grid && cardEl) {
        // Find all cards currently in the grid
        const cards = Array.from(grid.querySelectorAll('.vector-card'));
        const cardIndex = cards.indexOf(cardEl);
        
        if (cardIndex !== -1) {
            // Find the last card in the same row
            const cardTop = cardEl.offsetTop;
            let lastInRowIndex = cardIndex;
            for (let i = cardIndex + 1; i < cards.length; i++) {
                if (cards[i].offsetTop === cardTop) {
                    lastInRowIndex = i;
                } else {
                    break;
                }
            }
            
            // Insert panel after the last card in the row
            if (lastInRowIndex < cards.length) {
                cards[lastInRowIndex].after(panel);
            } else {
                grid.appendChild(panel);
            }
        } else {
            grid.appendChild(panel);
        }
    } else if (grid) {
        grid.appendChild(panel);
    }

    panel.style.display = 'block';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    if (cardEl) cardEl.classList.add('card-active');

    setTimeout(() => { 
        try {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
        } catch (e) {
            console.error('Scroll error:', e);
        }
    }, 50);
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    state.openedVector = null;
    state.openedCardEl = null;
}

function updatePagination() {
    const pageNumEl = document.getElementById('pageNumber');
    const pageTotalEl = document.getElementById('pageTotal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (pageNumEl) pageNumEl.textContent = state.currentPage;
    if (pageTotalEl) pageTotalEl.textContent = `/ ${state.totalPages}`;
    
    if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = state.currentPage >= state.totalPages;
}

function setupEventListeners() {
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        state.searchQuery = searchInput ? searchInput.value.trim() : '';
        state.currentPage = 1;
        fetchVectors();
    });
    document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            state.searchQuery = e.target.value.trim();
            state.currentPage = 1;
            fetchVectors();
        }
    });
    
    document.getElementById('detailCloseBtn')?.addEventListener('click', closeDetailPanel);
    
    document.getElementById('detailDownloadBtn')?.addEventListener('click', () => {
        if (!state.openedVector) {
            console.error('No vector selected');
            return;
        }
        openDownloadPage(state.openedVector);
    });

    document.getElementById('dpClose')?.addEventListener('click', closeDownloadPage);

    document.getElementById('dpDownloadBtn')?.addEventListener('click', () => {
        if (!state.openedVector) {
            console.error('No vector selected for download');
            return;
        }
        startDownloadCountdown();
    });

    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            fetchVectors();
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            fetchVectors();
        }
    });

    document.getElementById('breadcrumbHome')?.addEventListener('click', (e) => {
        e.preventDefault();
        selectCategory('all');
    });
}

function setupModalHandlers() {
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const infoModal = document.getElementById('infoModal');
    const infoModalClose = document.getElementById('infoModalClose');
    const infoModalBody = document.getElementById('infoModalBody');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalKey = trigger.dataset.modal;
            const content = MODAL_CONTENTS[modalKey];
            if (content && infoModalBody) {
                infoModalBody.innerHTML = content.content;
                if (infoModal) infoModal.style.display = 'flex';
            }
        });
    });

    infoModalClose?.addEventListener('click', () => {
        if (infoModal) infoModal.style.display = 'none';
    });

    infoModal?.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });
}

function openDownloadPage(vector) {
    const page = document.getElementById('downloadPage');
    if (!page) return;

    // Set content
    const titleEl = document.getElementById('dpTitle');
    const descEl = document.getElementById('dpDescription');
    const imgEl = document.getElementById('dpImage');
    const catEl = document.getElementById('dpCategory');
    const sizeEl = document.getElementById('dpFileSize');
    const kwContainer = document.getElementById('dpKeywords');

    if (titleEl) titleEl.textContent = vector.title;
    if (descEl) descEl.textContent = vector.description || '';
    
    // Update header info
    const headerTitleEl = document.getElementById('dpHeaderTitle');
    const headerDescEl = document.getElementById('dpHeaderDesc');
    if (headerTitleEl) headerTitleEl.textContent = `Free ${vector.category || ''} Vector, SVG, EPS & JPEG Downloads`;
    if (headerDescEl) headerDescEl.textContent = vector.description || '';
    
    if (imgEl) {
        imgEl.src = vector.thumbnail;
        imgEl.alt = vector.title;
        imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview'; };
    }
    if (catEl) catEl.textContent = vector.category || '-';
    if (sizeEl) sizeEl.textContent = vector.fileSize || '-';

    // Keywords
    if (kwContainer) {
        kwContainer.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(vector.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'dp-kw';
            span.textContent = kw;
            kwContainer.appendChild(span);
        });
    }

    // Reset countdown box
    const countdownBox = document.getElementById('dpCountdownBox');
    const countdownNum = document.getElementById('dpCountdown');
    const downloadBtn = document.getElementById('dpDownloadBtn');
    const countdownStatus = document.getElementById('dpCountdownStatus');
    if (countdownBox) countdownBox.style.display = 'none';
    if (countdownNum) countdownNum.textContent = '4';
    if (countdownStatus) countdownStatus.textContent = 'Your download will start in';
    if (downloadBtn) downloadBtn.style.display = 'block';

    // Show download page
    page.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDownloadPage() {
    const page = document.getElementById('downloadPage');
    if (page) page.style.display = 'none';
    document.body.style.overflow = '';
    
    // Stop countdown if running
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
    }
    state.openedVector = null;
}

function startDownloadCountdown() {
    if (!state.openedVector) {
        console.error('No vector for countdown');
        return;
    }

    const downloadBtn = document.getElementById('dpDownloadBtn');
    const countdownBox = document.getElementById('dpCountdownBox');
    const countdownNum = document.getElementById('dpCountdown');
    const countdownStatus = document.getElementById('dpCountdownStatus');

    if (downloadBtn) downloadBtn.style.display = 'none';
    if (countdownBox) countdownBox.style.display = 'block';
    if (countdownStatus) countdownStatus.textContent = 'Your download will start in';

    let count = 4;
    if (countdownNum) countdownNum.textContent = count;

    // Stop any existing countdown
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }

    state.countdownInterval = setInterval(() => {
        count--;
        if (countdownNum) countdownNum.textContent = count;

        if (count <= 0) {
            clearInterval(state.countdownInterval);
            state.countdownInterval = null;
            
            // Trigger download
            if (state.openedVector) {
                triggerDownload(state.openedVector);
            }
        }
    }, 1000);
}

function triggerDownload(vector) {
    try {
        // Use the download API endpoint which increments counter
        const downloadUrl = `/api/download?slug=${encodeURIComponent(vector.name)}`;
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        const fileName = vector.name || 'vector';
        a.download = fileName + '.zip';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            try { document.body.removeChild(a); } catch (e) {}
        }, 100);
    } catch (err) {
        console.error('Download error:', err);
        alert('Download could not be started. Please try again.');
    }
}

function showLoader(show) {
    const l = document.getElementById('loader');
    if (l) l.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
