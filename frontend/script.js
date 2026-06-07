let currentSearchResults = [];
const API_BASE_URL = 'https://wiki-info.onrender.com/';

document.addEventListener('DOMContentLoaded', () => {
    setupSearchListener();
    setupThemeToggle();
    loadTheme();
});

function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            clearSearchResults();
            return;
        }
        searchWiki(query);
    });
}

async function searchWiki(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/wiki/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!response.ok) {
            console.error('Xato:', data.error || 'Qidiruvda xato');
            return;
        }

        currentSearchResults = data;
        displaySearchResults(data);
    } catch (error) {
        console.error('Xato:', error);
    }
}

function displaySearchResults(results) {
    clearSearchResults();

    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'searchResults';

    if (!results || results.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.textContent = 'Natija topilmadi';
        resultsContainer.appendChild(emptyItem);
    } else {
        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.textContent = item.title;
            resultItem.addEventListener('click', () => {
                searchInput.value = item.title;
                clearSearchResults();
                showDetail(item.title);
            });
            resultsContainer.appendChild(resultItem);
        });
    }

    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(resultsContainer);
}

function clearSearchResults() {
    const oldResults = document.getElementById('searchResults');
    if (oldResults) oldResults.remove();
}

async function showDetail(title) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/wiki/page?title=${encodeURIComponent(title)}`);
        const data = await response.json();
        if (!response.ok) {
            console.error('Xato:', data.error || 'Sahifa ko\'rsatishda xato');
            return;
        }

        displayDetail(data.title, data.content);
    } catch (error) {
        console.error('Xato:', error);
    }
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        updateToggleIcon();
        saveTheme();
    });
}

function updateToggleIcon() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    const isDark = document.body.classList.contains('dark-mode');
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
}

function saveTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateToggleIcon();
}

function displayDetail(name, content) {
    const detailSection = document.querySelector('.first-page');
    if (!detailSection) return;

    const isDark = document.body.classList.contains('dark-mode');
    const bgGradient = isDark
        ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    const textColor = isDark ? '#e0e0e0' : '#1a1a1a';

    detailSection.innerHTML = `
        <style>
            body {
                background: ${bgGradient} !important;
            }
            .detail-container {
                animation: slideUp 0.4s ease;
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        </style>
        <button class="back-button" onclick="location.reload()">← Back</button>
        <div class="detail-container" style="max-width: 700px; padding: 60px 40px; text-align: center;">
            <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 2.5em; font-weight: 700; margin-bottom: 40px; letter-spacing: -1px;">${name}</h1>
            <div style="height: 2px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); margin-bottom: 40px;"></div>
            <p style="color: ${textColor}; line-height: 1.8; font-size: 1.05em; text-align: left; white-space: pre-wrap; font-weight: 400;">${content}</p>
        </div>
    `;
}

