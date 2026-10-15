/**
 * RoomRento • Unified Single Page Application (SPA) Controller (Vanilla JS)
 */

// Global State
window.AppState = {
  savedRooms: JSON.parse(localStorage.getItem('room_rento_saved') || '[]'),
  compareRooms: JSON.parse(localStorage.getItem('room_rento_compare') || '["prop-101", "prop-102"]'),
  currentUser: JSON.parse(localStorage.getItem('room_rento_user') || 'null') || window.ROOM_DATA.INITIAL_USER,
  currentCity: localStorage.getItem('room_rento_city') || 'Bengaluru',
  token: localStorage.getItem('room_rento_token') || 'demo_token_123',
  theme: localStorage.getItem('room_rento_theme') || 'light',
  currentRoom: null,
  activeView: 'explore'
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRouting();
  updateBadgeCounters();
  renderHeaderUser();
  setupGlobalListeners();
  checkApiHealth();
});

// SPA Hash Routing
function initRouting() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'explore';

  if (hash.startsWith('room-')) {
    const roomId = hash.replace('room-', '');
    openRoomDetailsModal(roomId);
    return;
  }

  if (hash === 'login') {
    openModal('auth-modal');
    return;
  }

  navigateToView(hash);
}

function navigateToView(viewName) {
  const validViews = ['explore', 'compare', 'saved', 'enquiries', 'account', 'admin'];
  if (!validViews.includes(viewName)) viewName = 'explore';

  AppState.activeView = viewName;

  // Toggle active view container
  document.querySelectorAll('.app-view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
    targetView.style.display = 'block';
  }

  // Update navigation active states
  document.querySelectorAll('[data-view]').forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });

  // Re-render specific view if needed
  if (viewName === 'compare' && typeof renderComparisonMatrix === 'function') renderComparisonMatrix();
  if (viewName === 'saved' && typeof renderSavedRooms === 'function') renderSavedRooms();
  if (viewName === 'account' && typeof renderBookedVisits === 'function') {
    renderUserProfile();
    renderBookedVisits();
  }
  if (viewName === 'admin' && typeof renderAdminListings === 'function') {
    renderAdminStats();
    renderAdminListings();
  }
  if (viewName === 'explore' && typeof fetchAndRenderProperties === 'function') {
    fetchAndRenderProperties();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// API Health Check Ping
async function checkApiHealth() {
  const pill = document.getElementById('api-health-pill');
  if (!pill) return;

  try {
    const res = await fetch('/api/v1/health');
    if (res.ok) {
      const data = await res.json();
      pill.innerHTML = `
        <span class="api-pulse"></span>
        <span>API Online (${data.totalListings || 6} rooms)</span>
      `;
      pill.style.display = 'inline-flex';
      return;
    }
  } catch (e) {
    // API server offline fallback
  }

  pill.innerHTML = `
    <span class="api-pulse" style="background:#0284c7;"></span>
    <span>Local Engine Ready</span>
  `;
  pill.style.display = 'inline-flex';
}

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

  document.querySelectorAll(`[data-heart-id="${roomId}"]`).forEach(btn => {
    btn.classList.toggle('saved', AppState.savedRooms.includes(roomId));
    btn.innerHTML = AppState.savedRooms.includes(roomId)
      ? '<span class="material-symbols-outlined" style="color:#e11d48;font-variation-settings:\'FILL\' 1;">favorite</span>'
      : '<span class="material-symbols-outlined">favorite</span>';
  });

  if (AppState.activeView === 'saved' && typeof renderSavedRooms === 'function') {
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

  document.querySelectorAll(`[data-compare-id="${roomId}"] input`).forEach(cb => {
    cb.checked = AppState.compareRooms.includes(roomId);
  });

  if (AppState.activeView === 'compare' && typeof renderComparisonMatrix === 'function') {
    renderComparisonMatrix();
  }
  return true;
}

// Floating Compare Tray
function updateFloatingCompareTray() {
  const tray = document.getElementById('floating-compare-tray');
  if (!tray) return;

  const count = AppState.compareRooms.length;
  if (count > 0 && AppState.activeView !== 'compare') {
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
      <a href="#account" class="user-avatar-pill" title="My Account" data-view="account">
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="user-avatar-img" alt="${user.name}">
        <span>${user.name.split(' ')[0]}</span>
      </a>
    `;
  } else {
    userContainer.innerHTML = `
      <button class="btn-primary" style="padding:0.45rem 0.95rem;font-size:0.85rem;" onclick="openModal('auth-modal')">Sign In</button>
    `;
  }
}

// Room Details Modal Handler
async function openRoomDetailsModal(roomId) {
  const room = await RoomRentoAPI.getListingById(roomId);
  if (!room) return;
  AppState.currentRoom = room;

  // Fill Modal Elements
  document.getElementById('modal-details-title').textContent = room.title;
  document.getElementById('modal-details-location').innerHTML = `
    <span class="material-symbols-outlined" style="color:var(--primary);font-size:18px;">location_on</span>
    ${room.address || room.locality} • ${room.distanceText || 'Near Transit'}
  `;
  document.getElementById('modal-details-rent').textContent = `₹${(room.price || 16500).toLocaleString('en-IN')}`;
  document.getElementById('modal-details-rating').innerHTML = `
    <span class="material-symbols-outlined" style="font-size:16px;">star</span>
    ${room.rating || 4.9} (${room.reviewCount || 128} verified reviews)
  `;

  // Gallery
  const images = (room.images && room.images.length > 0) ? room.images : [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200'
  ];
  document.getElementById('modal-gallery-main-img').src = images[0];
  document.getElementById('modal-gallery-thumbs').innerHTML = images.map((img, i) => `
    <div class="gallery-thumb-item ${i === 0 ? 'active' : ''}" onclick="selectModalGalleryImage('${img}', this)">
      <img src="${img}" alt="Thumb">
    </div>
  `).join('');

  // Specs
  document.getElementById('modal-details-specs-grid').innerHTML = `
    <div class="amenity-item-card"><span class="material-symbols-outlined icon">square_foot</span><div><strong>Carpet Area</strong><p>${room.carpetArea || '280 sq.ft'}</p></div></div>
    <div class="amenity-item-card"><span class="material-symbols-outlined icon">layers</span><div><strong>Floor</strong><p>${room.floor || '3rd of 4 Floors'}</p></div></div>
    <div class="amenity-item-card"><span class="material-symbols-outlined icon">balcony</span><div><strong>Balcony</strong><p>${room.balcony || 'Private Balcony'}</p></div></div>
    <div class="amenity-item-card"><span class="material-symbols-outlined icon">chair</span><div><strong>Furnishing</strong><p>${room.furnishing || 'Fully Furnished'}</p></div></div>
    <div class="amenity-item-card"><span class="material-symbols-outlined icon">schedule</span><div><strong>Lock-in</strong><p>${room.lockIn || '3 Months'}</p></div></div>
    <div class="amenity-item-card"><span class="material-symbols-outlined icon">verified_user</span><div><strong>Deposit</strong><p>${room.securityDeposit || '1 Month'}</p></div></div>
  `;

  // Deposit & Notice
  document.getElementById('modal-details-deposit').textContent = room.securityDeposit || '1 Month';
  document.getElementById('modal-details-maintenance').textContent = room.maintenance || 'Included in rent';
  document.getElementById('modal-details-notice').textContent = room.noticePeriod || '1 Month Notice';

  // Amenities Tab
  switchModalAmenityTab('inRoom');

  // WhatsApp & Call host buttons
  const waBtn = document.getElementById('modal-host-whatsapp-btn');
  if (waBtn) waBtn.href = `https://wa.me/919876543210?text=Hi%20Priya,%20I%20am%20interested%20in%20${encodeURIComponent(room.title)}`;

  // Wishlist Heart Button
  const heartBtn = document.getElementById('modal-details-wishlist-btn');
  if (heartBtn) {
    const isSaved = AppState.savedRooms.includes(room.id);
    heartBtn.classList.toggle('saved', isSaved);
    heartBtn.onclick = () => toggleWishlist(room.id);
  }

  // Open the Modal
  openModal('room-details-modal');
}

function selectModalGalleryImage(imgUrl, el) {
  document.getElementById('modal-gallery-main-img').src = imgUrl;
  document.querySelectorAll('#modal-gallery-thumbs .gallery-thumb-item').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function switchModalAmenityTab(catKey) {
  document.querySelectorAll('.modal-amenity-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === catKey);
  });

  const container = document.getElementById('modal-amenity-tab-content');
  if (!container || !AppState.currentRoom) return;

  const cats = AppState.currentRoom.amenityCategories || {};
  const list = cats[catKey] || [];

  if (list.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);padding:1rem;">Information available upon scheduling a visit.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="amenity-cards-grid">
      ${list.map(item => `
        <div class="amenity-item-card">
          <span class="material-symbols-outlined icon">${item.icon || 'check_circle'}</span>
          <div>
            <strong>${item.name}</strong>
            <p style="font-size:0.78rem;color:var(--text-muted);">${item.desc || ''}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
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

// Modal Helpers
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
  if (modalId === 'room-details-modal' && window.location.hash.startsWith('#room-')) {
    history.replaceState(null, null, `#${AppState.activeView}`);
  }
}

// Global Event Listeners
function setupGlobalListeners() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const cityBtn = document.getElementById('city-selector-btn');
  if (cityBtn) cityBtn.addEventListener('click', () => openModal('city-selector-modal'));

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Modal schedule visit trigger
  const modalSchedBtn = document.getElementById('modal-open-schedule-visit-btn');
  if (modalSchedBtn) {
    modalSchedBtn.addEventListener('click', () => {
      if (!AppState.currentRoom) return;
      openScheduleVisitModal(AppState.currentRoom.id, AppState.currentRoom.title);
    });
  }

  // Modal 360 Tour trigger
  const tourBtn = document.getElementById('modal-open-tour-btn');
  if (tourBtn) {
    tourBtn.addEventListener('click', () => openModal('virtual-tour-modal'));
  }
}
