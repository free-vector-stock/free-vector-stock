// ===========================
// FREVECTOR ADMIN PANEL
// ===========================

// Configuration
const ADMIN_CONFIG = {
    apiBaseUrl: '/api/admin',
    storageKey: 'frevector_admin_session',
};

// Admin State
const adminState = {
    isAuthenticated: false,
    currentUser: null,
    vectors: [],
    categories: [],
    stats: {
        totalVectors: 0,
        totalCategories: 0,
        totalStorage: 0,
        recentUploads: 0,
    },
};

// DOM Elements
const adminElements = {
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.admin-section'),
    uploadForm: document.getElementById('uploadForm'),
    uploadStatus: document.getElementById('uploadStatus'),
    logoutBtn: document.getElementById('logoutBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    searchVectors: document.getElementById('searchVectors'),
    vectorsList: document.getElementById('vectorsList'),
    addCategoryForm: document.getElementById('addCategoryForm'),
    categoriesList: document.getElementById('categoriesList'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    initializeEventListeners();
    loadDashboard();
});

// ===========================
// AUTHENTICATION
// ===========================

function checkAuthentication() {
    const session = localStorage.getItem(ADMIN_CONFIG.storageKey);
    if (!session) {
        redirectToLogin();
    } else {
        adminState.isAuthenticated = true;
        adminState.currentUser = JSON.parse(session);
        document.getElementById('adminUsername').textContent = adminState.currentUser.username || 'Admin';
    }
}

function redirectToLogin() {
    // In production, redirect to login page
    console.warn('Not authenticated. Redirecting to login...');
    // window.location.href = '/login.html';
}

// ===========================
// EVENT LISTENERS
// ===========================

function initializeEventListeners() {
    // Navigation
    adminElements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });

    // Upload Form
    adminElements.uploadForm.addEventListener('submit', handleUploadSubmit);

    // Logout
    adminElements.logoutBtn.addEventListener('click', handleLogout);

    // Refresh Vectors
    adminElements.refreshBtn.addEventListener('click', loadVectors);

    // Search Vectors
    adminElements.searchVectors.addEventListener('input', filterVectors);

    // Add Category Form
    adminElements.addCategoryForm.addEventListener('submit', handleAddCategory);

    // Save Settings
    adminElements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
}

// ===========================
// SECTION SWITCHING
// ===========================

function switchSection(sectionName) {
    // Hide all sections
    adminElements.sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav links
    adminElements.navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
    }

    // Add active class to clicked nav link
    const navLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }

    // Load section data
    if (sectionName === 'manage') {
        loadVectors();
    } else if (sectionName === 'categories') {
        loadCategories();
    }
}

// ===========================
// DASHBOARD
// ===========================

async function loadDashboard() {
    try {
        // Load statistics
        const statsResponse = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/stats`);
        const statsData = await statsResponse.json();

        adminState.stats = statsData;

        // Update dashboard display
        document.getElementById('totalVectors').textContent = statsData.totalVectors || 0;
        document.getElementById('totalCategories').textContent = statsData.totalCategories || 0;
        document.getElementById('totalStorage').textContent = `${(statsData.totalStorage / 1024 / 1024).toFixed(2)} MB`;
        document.getElementById('recentUploads').textContent = statsData.recentUploads || 0;

        // Load activity log
        loadActivityLog();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadActivityLog() {
    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/activity`);
        const data = await response.json();

        const activityLog = document.getElementById('activityLog');
        activityLog.innerHTML = '';

        if (data.activities && data.activities.length > 0) {
            data.activities.forEach(activity => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <strong>${escapeHtml(activity.action)}</strong><br>
                    <small>${new Date(activity.timestamp).toLocaleString()}</small>
                `;
                activityLog.appendChild(item);
            });
        } else {
            activityLog.innerHTML = '<p>No recent activity</p>';
        }
    } catch (error) {
        console.error('Error loading activity log:', error);
    }
}

// ===========================
// UPLOAD VECTOR
// ===========================

async function handleUploadSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('vectorTitle').value);
    formData.append('description', document.getElementById('vectorDescription').value);
    formData.append('category', document.getElementById('vectorCategory').value);
    formData.append('keywords', document.getElementById('vectorKeywords').value);
    formData.append('fileSize', document.getElementById('vectorFileSize').value || '1.8 MB');
    formData.append('thumbnail', document.getElementById('vectorThumbnail').files[0]);
    formData.append('zipFile', document.getElementById('vectorZipFile').files[0]);

    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            showUploadStatus('Vector uploaded successfully!', 'success');
            adminElements.uploadForm.reset();
            loadDashboard();
        } else {
            showUploadStatus(data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus('Upload error: ' + error.message, 'error');
    }
}

function showUploadStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    
    setTimeout(() => {
        statusDiv.className = 'upload-status';
    }, 5000);
}

// ===========================
// MANAGE VECTORS
// ===========================

async function loadVectors() {
    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/vectors`);
        const data = await response.json();

        adminState.vectors = data.vectors || [];
        displayVectors(adminState.vectors);
    } catch (error) {
        console.error('Error loading vectors:', error);
        adminElements.vectorsList.innerHTML = '<p>Error loading vectors</p>';
    }
}

function displayVectors(vectors) {
    adminElements.vectorsList.innerHTML = '';

    if (vectors.length === 0) {
        adminElements.vectorsList.innerHTML = '<p>No vectors found</p>';
        return;
    }

    vectors.forEach(vector => {
        const item = document.createElement('div');
        item.className = 'vector-item';
        item.innerHTML = `
            <img src="${escapeHtml(vector.thumbnail)}" alt="${escapeHtml(vector.title)}" class="vector-thumbnail">
            <div class="vector-item-info">
                <div class="vector-item-title">${escapeHtml(vector.title)}</div>
                <div class="vector-item-meta">
                    Category: ${escapeHtml(vector.category)} | Size: ${vector.fileSize || 'N/A'}
                </div>
            </div>
            <div class="vector-item-actions">
                <button class="btn-edit" onclick="editVector('${vector.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteVector('${vector.id}')">Delete</button>
            </div>
        `;
        adminElements.vectorsList.appendChild(item);
    });
}

function filterVectors() {
    const query = adminElements.searchVectors.value.toLowerCase();
    const filtered = adminState.vectors.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query) ||
        v.keywords.some(kw => kw.toLowerCase().includes(query))
    );
    displayVectors(filtered);
}

async function editVector(vectorId) {
    // TODO: Implement edit functionality
    console.log('Edit vector:', vectorId);
}

async function deleteVector(vectorId) {
    if (!confirm('Are you sure you want to delete this vector?')) {
        return;
    }

    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/vectors/${vectorId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadVectors();
            loadDashboard();
        } else {
            alert('Error deleting vector');
        }
    } catch (error) {
        console.error('Error deleting vector:', error);
        alert('Error deleting vector');
    }
}

// ===========================
// MANAGE CATEGORIES
// ===========================

async function loadCategories() {
    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/categories`);
        const data = await response.json();

        adminState.categories = data.categories || [];
        displayCategories(adminState.categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        adminElements.categoriesList.innerHTML = '<p>Error loading categories</p>';
    }
}

function displayCategories(categories) {
    adminElements.categoriesList.innerHTML = '';

    if (categories.length === 0) {
        adminElements.categoriesList.innerHTML = '<p>No categories found</p>';
        return;
    }

    categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-item-name">${escapeHtml(category.name)}</div>
            <div class="category-item-actions">
                <button class="btn-edit" onclick="editCategory('${category.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteCategory('${category.id}')">Delete</button>
            </div>
        `;
        adminElements.categoriesList.appendChild(item);
    });
}

async function handleAddCategory(e) {
    e.preventDefault();

    const categoryName = document.getElementById('categoryName').value;
    const categoryDescription = document.getElementById('categoryDescription').value;

    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: categoryName,
                description: categoryDescription,
            }),
        });

        if (response.ok) {
            adminElements.addCategoryForm.reset();
            loadCategories();
        } else {
            alert('Error adding category');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category');
    }
}

async function editCategory(categoryId) {
    // TODO: Implement edit functionality
    console.log('Edit category:', categoryId);
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }

    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/categories/${categoryId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadCategories();
        } else {
            alert('Error deleting category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
    }
}

// ===========================
// SETTINGS
// ===========================

async function handleSaveSettings() {
    const r2Bucket = document.getElementById('r2Bucket').value;
    const kvNamespace = document.getElementById('kvNamespace').value;
    const workerUrl = document.getElementById('workerUrl').value;
    const adminPassword = document.getElementById('adminPassword').value;

    try {
        const response = await fetch(`${ADMIN_CONFIG.apiBaseUrl}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                r2Bucket,
                kvNamespace,
                workerUrl,
                adminPassword: adminPassword || undefined,
            }),
        });

        if (response.ok) {
            alert('Settings saved successfully');
            document.getElementById('adminPassword').value = '';
        } else {
            alert('Error saving settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings');
    }
}

// ===========================
// LOGOUT
// ===========================

function handleLogout() {
    localStorage.removeItem(ADMIN_CONFIG.storageKey);
    window.location.href = '/login.html';
}

// ===========================
// UTILITIES
// ===========================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
