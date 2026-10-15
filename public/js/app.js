/**
 * RoomRento • Global Application Controller (Vanilla JS)
 */

// Global State
window.AppState = {
  savedRooms: JSON.parse(localStorage.getItem('room_rento_saved') || '[]'),
  compareRooms: JSON.parse(localStorage.getItem('room_rento_compare') || '["prop-101", "prop-102"]'),
  currentUser: JSON.parse(localStorage.getItem('room_rento_user') || 'null') || window.ROOM_DATA.INITIAL_USER,
  currentCity: localStorage.getItem('room_rento_city') || 'Bengaluru',
  token: localStorage.getItem('room_rento_token') || 'demo_token_123',
  theme: localStorage.getItem('room_rento_theme') || 'light'
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateBadgeCounters();
  renderHeaderUser();
  setupGlobalListeners();
});

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    themeToggle.innerHTML = AppState.theme === 'dark' 
      ? '<span class="material-symbols-outlined">light_mode</span>'
      : '<span class="material-symbols-outlined">dark_mode</span>';
  }
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('room_rento_theme', AppState.theme);
  initTheme();
  showToast(`Switched to ${AppState.theme} theme`, 'palette');
}

// Badge Counters Update
function updateBadgeCounters() {
  const savedCount = AppState.savedRooms.length;
  const compareCount = AppState.compareRooms.length;

  document.querySelectorAll('.saved-count-badge').forEach(el => {
    el.textContent = savedCount;
    el.style.display = savedCount > 0 ? 'inline-flex' : 'none';
  });

  document.querySelectorAll('.compare-count-badge').forEach(el => {
    el.textContent = compareCount;
    el.style.display = compareCount > 0 ? 'inline-flex' : 'none';
  });

  updateFloatingCompareTray();
}

// Wishlist Toggling
function toggleWishlist(roomId) {
  const index = AppState.savedRooms.indexOf(roomId);
  const room = (window.ROOM_DATA.INITIAL_ROOMS || []).find(r => r.id === roomId);
  const title = room ? room.title : 'Property';

  if (index > -1) {
    AppState.savedRooms.splice(index, 1);
    showToast(`Removed "${title}" from wishlist`, 'favorite_border');
  } else {
    AppState.savedRooms.push(roomId);
    showToast(`Saved "${title}" to wishlist!`, 'favorite');
  }

  localStorage.setItem('room_rento_saved', JSON.stringify(AppState.savedRooms));
  updateBadgeCounters();

  // Re-render heart buttons on page
  document.querySelectorAll(`[data-heart-id="${roomId}"]`).forEach(btn => {
    btn.classList.toggle('saved', AppState.savedRooms.includes(roomId));
    btn.innerHTML = AppState.savedRooms.includes(roomId)
      ? '<span class="material-symbols-outlined" style="color:#e11d48;font-variation-settings:\'FILL\' 1;">favorite</span>'
      : '<span class="material-symbols-outlined">favorite</span>';
  });

  // If on saved.html, refresh view
  if (typeof renderSavedRooms === 'function') {
    renderSavedRooms();
  }
}

// Compare Toggling
function toggleCompare(roomId) {
  const index = AppState.compareRooms.indexOf(roomId);
  const room = (window.ROOM_DATA.INITIAL_ROOMS || []).find(r => r.id === roomId);
  const title = room ? room.title : 'Property';

  if (index > -1) {
    AppState.compareRooms.splice(index, 1);
    showToast(`Removed from comparison`, 'remove_circle_outline');
  } else {
    if (AppState.compareRooms.length >= 4) {
      showToast('You can compare maximum 4 properties at once', 'warning');
      return false;
    }
    AppState.compareRooms.push(roomId);
    showToast(`Added "${title}" to comparison tray`, 'compare_arrows');
  }

  localStorage.setItem('room_rento_compare', JSON.stringify(AppState.compareRooms));
  updateBadgeCounters();

  // Re-sync checkboxes
  document.querySelectorAll(`[data-compare-id="${roomId}"] input`).forEach(cb => {
    cb.checked = AppState.compareRooms.includes(roomId);
  });

  // If on compare.html, refresh table
  if (typeof renderComparisonMatrix === 'function') {
    renderComparisonMatrix();
  }
  return true;
}

// Floating Compare Tray
function updateFloatingCompareTray() {
  const tray = document.getElementById('floating-compare-tray');
  if (!tray) return;

  const count = AppState.compareRooms.length;
  if (count > 0 && !window.location.pathname.includes('compare')) {
    tray.classList.add('visible');
    const container = document.getElementById('compare-tray-thumbs');
    if (container) {
      container.innerHTML = AppState.compareRooms.map(id => {
        const room = (window.ROOM_DATA.INITIAL_ROOMS || []).find(r => r.id === id);
        const img = room && room.images ? room.images[0] : '';
        return `
          <div class="compare-thumb-slot" title="${room ? room.title : id}">
            <img src="${img}" alt="room">
            <span class="compare-thumb-remove" onclick="toggleCompare('${id}')">×</span>
          </div>
        `;
      }).join('');
    }
    const countEl = document.getElementById('compare-tray-count');
    if (countEl) countEl.textContent = count;
  } else {
    tray.classList.remove('visible');
  }
}

// Header User & Avatar
function renderHeaderUser() {
  const user = AppState.currentUser;
  const userContainer = document.getElementById('header-user-slot');
  if (!userContainer) return;

  if (user) {
    userContainer.innerHTML = `
      <a href="account.html" class="user-avatar-pill" title="My Account">
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="user-avatar-img" alt="${user.name}">
        <span>${user.name.split(' ')[0]}</span>
      </a>
    `;
  } else {
    userContainer.innerHTML = `
      <a href="login.html" class="btn-primary" style="padding:0.45rem 0.95rem;font-size:0.85rem;">Sign In</a>
    `;
  }
}

// Global Toast System
function showToast(message, icon = 'check_circle', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  container.innerHTML = `
    <div class="toast-pill">
      <span class="material-symbols-outlined" style="font-size:20px;color:var(--primary-fixed);">${icon}</span>
      <span>${message}</span>
    </div>
  `;
  container.classList.add('show');

  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    container.classList.remove('show');
  }, duration);
}

// Global Modal Helpers
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
}

// Global Listeners
function setupGlobalListeners() {
  // Theme button
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // City selector triggers
  const cityBtn = document.getElementById('city-selector-btn');
  if (cityBtn) {
    cityBtn.addEventListener('click', () => openModal('city-selector-modal'));
  }

  // Close modals when clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });
}
