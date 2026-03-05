/**
 * Frevector Admin Panel - Frontend Logic
 * Revised: English duplicate warning, validation checklist, System Health tab
 */

const ADMIN_KEY = "Frevector@2026!";
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
// Total: 30 categories

const state = {
    vectors: [],
    filteredVectors: [],
    managePage: 1,
    manageLimit: 20,
    searchQuery: '',
    filterCat: ''
};

/* ===========================
   INIT
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (sessionStorage.getItem('fv_admin') === ADMIN_KEY) {
        showApp();
    }

    // Login
    document.getElementById('loginBtn').addEventListener('click', doLogin);
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('fv_admin');
        location.reload();
    });

    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });

    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);

    // File input change - show validation preview
    document.getElementById('vectorJson').addEventListener('change', previewValidation);
    document.getElementById('vectorJpeg').addEventListener('change', previewValidation);
    document.getElementById('vectorZip').addEventListener('change', previewValidation);

    // Manage search/filter
    document.getElementById('searchManage').addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        state.managePage = 1;
        filterAndRenderManage();
    });

    document.getElementById('filterCategory').addEventListener('change', (e) => {
        state.filterCat = e.target.value;
        state.managePage = 1;
        filterAndRenderManage();
    });

    // Populate category filter
    const filterSel = document.getElementById('filterCategory');
    CATEGORIES.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterSel.appendChild(opt);
    });

    // System Health refresh
    document.getElementById('refreshHealthBtn')?.addEventListener('click', loadHealthReport);
});

/* ===========================
   LOGIN
   =========================== */
function doLogin() {
    const pw = document.getElementById('loginPassword').value;
    if (pw === ADMIN_KEY) {
        sessionStorage.setItem('fv_admin', pw);
        document.getElementById('loginError').style.display = 'none';
        showApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('loginPassword').value = '';
    }
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    loadDashboard();
    loadManageVectors();
}

/* ===========================
   NAVIGATION
   =========================== */
function switchSection(name) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    document.querySelector(`[data-section="${name}"]`).classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        upload: 'Upload Vector',
        manage: 'Manage Vectors',
        health: 'System Health'
    };
    document.getElementById('sectionTitle').textContent = titles[name] || name;

    if (name === 'health') {
        loadHealthReport();
    }
}

/* ===========================
   DASHBOARD
   =========================== */
async function loadDashboard() {
    try {
        const res = await fetch('/api/admin?action=stats', {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const data = await res.json();

        document.getElementById('totalVectors').textContent = data.totalVectors || 0;
        document.getElementById('totalDownloads').textContent = data.totalDownloads || 0;
        document.getElementById('totalCategories').textContent = (data.categories || []).length;

        const tbody = document.getElementById('catTableBody');
        tbody.innerHTML = '';
        (data.categories || []).forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escHtml(cat.name)}</td>
                <td>${cat.count}</td>
                <td>${cat.downloads}</td>
            `;
            tbody.appendChild(tr);
        });

        if (!data.categories || data.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#666;">No data available</td></tr>';
        }
    } catch (e) {
        console.error('Dashboard load error:', e);
    }
}

/* ===========================
   PRE-UPLOAD VALIDATION PREVIEW
   =========================== */
async function previewValidation() {
    const jsonFile = document.getElementById('vectorJson').files[0];
    const jpegFile = document.getElementById('vectorJpeg').files[0];
    const zipFile = document.getElementById('vectorZip').files[0];

    if (!jsonFile && !jpegFile && !zipFile) return;

    const checklist = document.getElementById('validationChecklist');
    const checkItems = document.getElementById('checkItems');
    checklist.style.display = 'block';
    checkItems.innerHTML = '';

    const checks = [];

    // JSON validation
    if (jsonFile) {
        try {
            const text = await jsonFile.text();
            const meta = JSON.parse(text);
            const required = ['title', 'category', 'description', 'keywords'];
            const missing = required.filter(f => !meta[f] || (Array.isArray(meta[f]) && meta[f].length === 0));

            if (missing.length === 0) {
                checks.push({ status: 'pass', msg: `JSON valid — Title: "${meta.title}"` });
            } else {
                checks.push({ status: 'fail', msg: `JSON missing fields: ${missing.join(', ')}` });
            }

            if (meta.category && !CATEGORIES.includes(meta.category)) {
                checks.push({ status: 'fail', msg: `Invalid category: "${meta.category}"` });
            } else if (meta.category) {
                checks.push({ status: 'pass', msg: `Category valid: ${meta.category}` });
            }
        } catch (err) {
            checks.push({ status: 'fail', msg: 'JSON parse error — invalid JSON format' });
        }
    } else {
        checks.push({ status: 'warn', msg: 'JSON file not selected' });
    }

    // JPEG validation
    if (jpegFile) {
        if (jpegFile.type === 'image/jpeg' || jpegFile.name.toLowerCase().endsWith('.jpg')) {
            checks.push({ status: 'pass', msg: `JPEG valid — ${(jpegFile.size / 1024).toFixed(0)} KB` });
        } else {
            checks.push({ status: 'fail', msg: 'File is not a valid JPEG image' });
        }
    } else {
        checks.push({ status: 'warn', msg: 'JPEG file not selected' });
    }

    // ZIP validation
    if (zipFile) {
        if (zipFile.type === 'application/zip' || zipFile.name.toLowerCase().endsWith('.zip')) {
            checks.push({ status: 'pass', msg: `ZIP valid — ${(zipFile.size / 1024 / 1024).toFixed(2)} MB` });
        } else {
            checks.push({ status: 'fail', msg: 'File is not a valid ZIP archive' });
        }
    } else {
        checks.push({ status: 'warn', msg: 'ZIP file not selected' });
    }

    // Render checks
    checks.forEach(c => {
        const div = document.createElement('div');
        div.className = `check-item ${c.status}`;
        const icon = c.status === 'pass' ? '&#10003;' : c.status === 'fail' ? '&#10007;' : '&#9679;';
        div.innerHTML = `<span class="check-icon">${icon}</span><span>${escHtml(c.msg)}</span>`;
        checkItems.appendChild(div);
    });
}

/* ===========================
   UPLOAD
   =========================== */
async function handleUpload(e) {
    e.preventDefault();

    const jsonFile = document.getElementById('vectorJson').files[0];
    const jpegFile = document.getElementById('vectorJpeg').files[0];
    const zipFile = document.getElementById('vectorZip').files[0];

    if (!jsonFile || !jpegFile || !zipFile) {
        showStatus('error', 'Please select all three files (JSON, JPEG, ZIP).');
        return;
    }

    // Validate JSON
    let metadata;
    try {
        const jsonText = await jsonFile.text();
        metadata = JSON.parse(jsonText);
    } catch (err) {
        showStatus('error', 'Invalid JSON file. Please check the file format.');
        return;
    }

    // Validate required fields
    const requiredFields = ['title', 'category', 'description', 'keywords'];
    const missingFields = requiredFields.filter(f => !metadata[f] || (Array.isArray(metadata[f]) && metadata[f].length === 0));
    if (missingFields.length > 0) {
        showStatus('error', `JSON is missing required fields: ${missingFields.join(', ')}. Upload rejected.`);
        return;
    }

    // Validate category
    if (!CATEGORIES.includes(metadata.category)) {
        showStatus('error', `Invalid category: "${metadata.category}". Must be one of: ${CATEGORIES.join(', ')}`);
        return;
    }

    // Validate JPEG
    if (jpegFile.type !== 'image/jpeg' && !jpegFile.name.toLowerCase().endsWith('.jpg')) {
        showStatus('error', 'The preview image must be a valid JPEG file (.jpg).');
        return;
    }

    // Validate ZIP
    if (zipFile.type !== 'application/zip' && !zipFile.name.toLowerCase().endsWith('.zip')) {
        showStatus('error', 'The archive must be a valid ZIP file (.zip).');
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    showStatus('info', 'Validating and uploading to Cloudflare... Please wait.');
    showProgress(true, 10, 'Preparing upload...');

    try {
        const formData = new FormData();
        formData.append('json', jsonFile);
        formData.append('jpeg', jpegFile);
        formData.append('zip', zipFile);

        showProgress(true, 30, 'Uploading files...');

        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'X-Admin-Key': ADMIN_KEY },
            body: formData
        });

        showProgress(true, 80, 'Processing...');

        const data = await res.json();

        if (res.status === 409) {
            // DUPLICATE WARNING - English, prominent
            showStatus('duplicate',
                '⚠ DUPLICATE UPLOAD DETECTED\n\n' +
                'This file has already been uploaded. Duplicate upload is not allowed.\n\n' +
                'The system detected that a vector with the same title or slug already exists in the database. ' +
                'Please check the Manage Vectors section to find the existing entry.'
            );
            showProgress(false);
            uploadBtn.disabled = false;
            return;
        }

        if (!res.ok || data.error) {
            showStatus('error', 'Upload failed: ' + (data.error || 'Unknown error'));
            showProgress(false);
            uploadBtn.disabled = false;
            return;
        }

        showProgress(true, 100, 'Upload complete!');
        showStatus('success',
            '✓ Successfully uploaded: ' + (metadata.title || jsonFile.name.replace('.json', '')) +
            '\n\nThe vector is now live on the site.'
        );

        // Reset form and checklist
        document.getElementById('uploadForm').reset();
        document.getElementById('validationChecklist').style.display = 'none';
        uploadBtn.disabled = false;

        // Refresh dashboard and manage
        setTimeout(() => {
            showProgress(false);
            loadDashboard();
            loadManageVectors();
        }, 1500);

    } catch (err) {
        showStatus('error', 'Network error: ' + err.message);
        showProgress(false);
        uploadBtn.disabled = false;
    }
}

function showStatus(type, msg) {
    const box = document.getElementById('uploadStatus');
    box.className = 'status-box ' + type;
    // Support newlines
    box.style.whiteSpace = 'pre-line';
    box.textContent = msg;
}

function showProgress(show, pct, text) {
    pct = pct || 0;
    text = text || '';
    const wrap = document.getElementById('progressWrap');
    wrap.style.display = show ? 'block' : 'none';
    if (show) {
        document.getElementById('progressFill').style.width = pct + '%';
        document.getElementById('progressText').textContent = text;
    }
}

/* ===========================
   MANAGE VECTORS
   =========================== */
async function loadManageVectors() {
    try {
        const res = await fetch('/api/admin', {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.filteredVectors = state.vectors.slice();
        filterAndRenderManage();
    } catch (e) {
        document.getElementById('vectorsTableBody').innerHTML =
            '<tr class="loading-row"><td colspan="6">Failed to load vectors.</td></tr>';
    }
}

function filterAndRenderManage() {
    var filtered = state.vectors.slice();

    if (state.searchQuery) {
        filtered = filtered.filter(function(v) {
            var text = [v.name, v.title, v.category].concat(v.keywords || []).join(' ').toLowerCase();
            return text.indexOf(state.searchQuery) !== -1;
        });
    }

    if (state.filterCat) {
        filtered = filtered.filter(function(v) { return v.category === state.filterCat; });
    }

    state.filteredVectors = filtered;
    renderManageTable();
}

function renderManageTable() {
    var tbody = document.getElementById('vectorsTableBody');
    var total = state.filteredVectors.length;
    var totalPages = Math.max(1, Math.ceil(total / state.manageLimit));
    var offset = (state.managePage - 1) * state.manageLimit;
    var page = state.filteredVectors.slice(offset, offset + state.manageLimit);

    tbody.innerHTML = '';

    if (!page.length) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="6">No vectors found.</td></tr>';
        document.getElementById('managePagination').innerHTML = '';
        return;
    }

    page.forEach(function(v) {
        var tr = document.createElement('tr');
        var thumbUrl = '/api/asset?key=assets/' + encodeURIComponent(v.category) + '/' + encodeURIComponent(v.name) + '.jpg';
        // Show title (not slug/filename)
        var displayTitle = (v.title && !isFileSlug(v.title)) ? v.title : v.name;
        tr.innerHTML =
            '<td><img class="vt-thumb" src="' + thumbUrl + '" alt="" onerror="this.style.opacity=\'0.3\'"></td>' +
            '<td class="vt-name" title="' + escHtml(displayTitle) + '">' + escHtml(displayTitle) + '</td>' +
            '<td class="vt-cat">' + escHtml(v.category || '-') + '</td>' +
            '<td class="vt-date">' + (v.date || '-') + '</td>' +
            '<td class="vt-dl">' + (v.downloads || 0) + '</td>' +
            '<td><button class="btn-delete" data-slug="' + escHtml(v.name) + '">Delete</button></td>';
        tbody.appendChild(tr);
    });

    // Delete handlers
    tbody.querySelectorAll('.btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() { deleteVector(btn.dataset.slug); });
    });

    renderManagePagination(totalPages);
}

function renderManagePagination(totalPages) {
    var pag = document.getElementById('managePagination');
    pag.innerHTML = '';

    if (totalPages <= 1) return;

    var prevBtn = document.createElement('button');
    prevBtn.className = 'pag-admin-btn';
    prevBtn.textContent = '\u2039';
    prevBtn.disabled = state.managePage === 1;
    prevBtn.addEventListener('click', function() {
        if (state.managePage > 1) { state.managePage--; renderManageTable(); }
    });
    pag.appendChild(prevBtn);

    var info = document.createElement('span');
    info.className = 'pag-admin-info';
    info.textContent = 'Page ' + state.managePage + ' / ' + totalPages + ' (' + state.filteredVectors.length + ' vectors)';
    pag.appendChild(info);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'pag-admin-btn';
    nextBtn.textContent = '\u203a';
    nextBtn.disabled = state.managePage === totalPages;
    nextBtn.addEventListener('click', function() {
        if (state.managePage < totalPages) { state.managePage++; renderManageTable(); }
    });
    pag.appendChild(nextBtn);
}

async function deleteVector(slug) {
    if (!confirm('Are you sure you want to delete "' + slug + '"? This action cannot be undone.')) return;

    try {
        var res = await fetch('/api/admin?slug=' + encodeURIComponent(slug), {
            method: 'DELETE',
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        var data = await res.json();

        if (data.success) {
            state.vectors = state.vectors.filter(function(v) { return v.name !== slug; });
            filterAndRenderManage();
            loadDashboard();
        } else {
            alert('Delete failed: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        alert('Network error: ' + e.message);
    }
}

/* ===========================
   SYSTEM HEALTH
   =========================== */
async function loadHealthReport() {
    const grid = document.getElementById('healthGrid');
    const issuesBody = document.getElementById('healthIssuesBody');
    grid.innerHTML = '<div class="health-card"><div class="health-icon">&#9203;</div><div class="health-label">Loading...</div><div class="health-value">-</div></div>';
    issuesBody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#666;">Running health check...</td></tr>';

    try {
        const res = await fetch('/api/admin?action=stats', {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const data = await res.json();

        const vectorsRes = await fetch('/api/admin', {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const vectorsData = await vectorsRes.json();
        const vectors = vectorsData.vectors || [];

        // Analyze issues
        const issues = [];
        let brokenImages = 0;
        let missingTitles = 0;
        let duplicateSlugs = 0;
        let categoryMismatches = 0;

        const slugSet = new Set();
        vectors.forEach(v => {
            // Check for duplicate slugs
            if (slugSet.has(v.name)) {
                duplicateSlugs++;
                issues.push({ slug: v.name, problem: 'Duplicate Slug', fix: 'Delete one of the duplicate entries' });
            }
            slugSet.add(v.name);

            // Check for missing/bad title
            if (!v.title || isFileSlug(v.title)) {
                missingTitles++;
                issues.push({ slug: v.name, problem: 'Missing or invalid title (shows filename)', fix: 'Update JSON metadata with proper title' });
            }

            // Check for invalid category
            if (!CATEGORIES.includes(v.category)) {
                categoryMismatches++;
                issues.push({ slug: v.name, problem: `Invalid category: "${v.category}"`, fix: 'Update category to a valid value' });
            }
        });

        // Render health cards
        const totalVectors = data.totalVectors || 0;
        const totalDownloads = data.totalDownloads || 0;
        const totalIssues = issues.length;

        grid.innerHTML = `
            <div class="health-card ${totalVectors > 0 ? 'ok' : 'warn'}">
                <div class="health-icon">&#128248;</div>
                <div class="health-label">Total Vectors</div>
                <div class="health-value">${totalVectors}</div>
            </div>
            <div class="health-card ${totalDownloads >= 0 ? 'ok' : 'warn'}">
                <div class="health-icon">&#11015;</div>
                <div class="health-label">Total Downloads</div>
                <div class="health-value">${totalDownloads}</div>
            </div>
            <div class="health-card ${duplicateSlugs === 0 ? 'ok' : 'error'}">
                <div class="health-icon">&#128260;</div>
                <div class="health-label">Duplicates</div>
                <div class="health-value">${duplicateSlugs}</div>
            </div>
            <div class="health-card ${missingTitles === 0 ? 'ok' : 'warn'}">
                <div class="health-icon">&#128462;</div>
                <div class="health-label">Missing Titles</div>
                <div class="health-value">${missingTitles}</div>
            </div>
            <div class="health-card ${categoryMismatches === 0 ? 'ok' : 'error'}">
                <div class="health-icon">&#128193;</div>
                <div class="health-label">Category Errors</div>
                <div class="health-value">${categoryMismatches}</div>
            </div>
            <div class="health-card ${totalIssues === 0 ? 'ok' : 'error'}">
                <div class="health-icon">${totalIssues === 0 ? '&#10003;' : '&#9888;'}</div>
                <div class="health-label">Total Issues</div>
                <div class="health-value">${totalIssues}</div>
            </div>
        `;

        // Render issues table
        issuesBody.innerHTML = '';
        if (issues.length === 0) {
            issuesBody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#38a169;font-weight:600;">&#10003; No issues detected. System is healthy.</td></tr>';
        } else {
            issues.slice(0, 100).forEach(issue => {
                const tr = document.createElement('tr');
                const badgeClass = issue.problem.includes('Duplicate') ? 'badge-red' :
                                   issue.problem.includes('category') ? 'badge-red' : 'badge-orange';
                tr.innerHTML = `
                    <td><code style="font-size:11px;">${escHtml(issue.slug)}</code></td>
                    <td><span class="badge ${badgeClass}">${escHtml(issue.problem)}</span></td>
                    <td style="color:#666;">${escHtml(issue.fix)}</td>
                `;
                issuesBody.appendChild(tr);
            });
        }

    } catch (e) {
        grid.innerHTML = '<div class="health-card error"><div class="health-icon">&#10007;</div><div class="health-label">Error</div><div class="health-value">!</div></div>';
        issuesBody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#c53030;">Failed to load health report: ' + escHtml(e.message) + '</td></tr>';
    }
}

/* ===========================
   UTILS
   =========================== */
function isFileSlug(str) {
    if (!str) return true;
    return /\d{5,}/.test(str);
}

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
