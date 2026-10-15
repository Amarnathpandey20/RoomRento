/**
 * RoomRento • Explore & Search View Controller (Vanilla JS)
 */

let activeLocality = 'Koramangala';
let activeRoomType = 'all';
let maxBudget = 50000;
let activeSort = 'recommended';
let activeGender = 'all';
let isMapView = false;

document.addEventListener('DOMContentLoaded', () => {
  setupExploreControls();
  fetchAndRenderProperties();
});

function setupExploreControls() {
  // Search input live filter
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      fetchAndRenderProperties();
    });
  }

  // Locality Chips
  document.querySelectorAll('.locality-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.locality-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLocality = btn.dataset.locality || btn.textContent.trim();
      if (searchInput) searchInput.value = `${activeLocality}, ${AppState.currentCity}`;
      fetchAndRenderProperties();
    });
  });

  // Room Type Segmented Pills
  document.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRoomType = btn.dataset.type || 'all';
      fetchAndRenderProperties();
    });
  });

  // Sort Dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      fetchAndRenderProperties();
    });
  }

  // View Toggle (Grid / Map)
  const viewToggleBtn = document.getElementById('view-toggle-btn');
  if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', () => {
      isMapView = !isMapView;
      viewToggleBtn.classList.toggle('active', isMapView);
      viewToggleBtn.innerHTML = isMapView 
        ? '<span class="material-symbols-outlined">grid_view</span> List View'
        : '<span class="material-symbols-outlined">map</span> Map View';
      
      const mapContainer = document.getElementById('map-split-container');
      if (mapContainer) {
        mapContainer.style.display = isMapView ? 'block' : 'none';
      }
    });
  }

  // GPS Button
  const gpsBtn = document.getElementById('gps-button');
  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      gpsBtn.classList.add('animating');
      showToast('Detecting your GPS location...', 'my_location');
      setTimeout(() => {
        gpsBtn.classList.remove('animating');
        activeLocality = 'Koramangala';
        if (searchInput) searchInput.value = 'Koramangala, Bengaluru';
        showToast('Located: Koramangala 4th Block, Bengaluru', 'near_me');
        fetchAndRenderProperties();
      }, 700);
    });
  }

  // Filter Drawer Trigger
  const openFilterBtn = document.getElementById('open-filter-btn');
  if (openFilterBtn) {
    openFilterBtn.addEventListener('click', () => openModal('filter-drawer-modal'));
  }

  // Budget Slider
  const budgetSlider = document.getElementById('budget-slider');
  const budgetVal = document.getElementById('budget-slider-val');
  if (budgetSlider && budgetVal) {
    budgetSlider.addEventListener('input', (e) => {
      maxBudget = Number(e.target.value);
      budgetVal.textContent = `₹${maxBudget.toLocaleString('en-IN')}`;
    });
  }

  // Filter Apply Button
  const applyFilterBtn = document.getElementById('apply-filter-btn');
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', () => {
      const genderInputs = document.querySelectorAll('input[name="filter-gender"]:checked');
      if (genderInputs.length) activeGender = genderInputs[0].value;
      closeModal('filter-drawer-modal');
      fetchAndRenderProperties();
      showToast('Filters applied', 'tune');
    });
  }

  // Filter Reset Button
  const resetFilterBtn = document.getElementById('reset-filter-btn');
  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      maxBudget = 50000;
      activeGender = 'all';
      if (budgetSlider && budgetVal) {
        budgetSlider.value = 50000;
        budgetVal.textContent = '₹50,000';
      }
      closeModal('filter-drawer-modal');
      fetchAndRenderProperties();
      showToast('Filters reset', 'refresh');
    });
  }
}

async function fetchAndRenderProperties() {
  const container = document.getElementById('properties-grid');
  const countLabel = document.getElementById('results-count-label');
  if (!container) return;

  const searchInput = document.getElementById('main-search-input');
  const query = searchInput ? searchInput.value.trim() : '';

  const params = {
    city: AppState.currentCity,
    locality: activeLocality === 'All' ? '' : activeLocality,
    roomType: activeRoomType === 'all' ? '' : activeRoomType,
    maxPrice: maxBudget,
    search: query
  };

  let rooms = await RoomRentoAPI.getListings(params);

  // Client sorting
  if (activeSort === 'price-asc') {
    rooms.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-desc') {
    rooms.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'rating') {
    rooms.sort((a, b) => b.rating - a.rating);
  }

  if (countLabel) {
    countLabel.innerHTML = `Showing <strong>${rooms.length}</strong> verified rooms in <strong>${AppState.currentCity}</strong>`;
  }

  if (rooms.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <span class="material-symbols-outlined" style="font-size: 56px; color: var(--text-light); margin-bottom: 1rem;">search_off</span>
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">No matching rooms found</h3>
        <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 1.5rem;">
          Try expanding your price range, clearing locality filters, or searching for other Bangalore tech hubs.
        </p>
        <button class="btn-primary" onclick="resetAllFilters()">Clear All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = rooms.map(room => renderPropertyCard(room)).join('');
}

function renderPropertyCard(room) {
  const isSaved = AppState.savedRooms.includes(room.id);
  const isCompared = AppState.compareRooms.includes(room.id);
  const mainImage = (room.images && room.images.length > 0) 
    ? room.images[0] 
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';

  return `
    <article class="property-card" id="card-${room.id}">
      <div class="card-media">
        <img src="${mainImage}" alt="${room.title}" class="card-img" loading="lazy">
        
        <div class="badge-overlay-left">
          ${room.isVerified ? '<span class="badge-tag verified"><span class="material-symbols-outlined" style="font-size:14px;">verified</span> Verified</span>' : ''}
          ${room.offerTag ? `<span class="badge-tag zero-deposit">${room.offerTag}</span>` : ''}
          <span class="badge-tag room-type">${room.type || room.roomCategory || 'Room'}</span>
        </div>

        <div class="action-overlay-right">
          <button class="heart-btn ${isSaved ? 'saved' : ''}" data-heart-id="${room.id}" onclick="toggleWishlist('${room.id}')" title="Save to wishlist">
            <span class="material-symbols-outlined" style="font-size:20px;${isSaved ? 'color:#e11d48;font-variation-settings:\'FILL\' 1;' : ''}">favorite</span>
          </button>
          
          <label class="compare-checkbox-label" data-compare-id="${room.id}">
            <input type="checkbox" ${isCompared ? 'checked' : ''} onchange="toggleCompare('${room.id}')">
            <span>Compare</span>
          </label>
        </div>
      </div>

      <div class="card-body">
        <div class="card-header-line">
          <h3 class="property-title">
            <a href="#room-${room.id}" onclick="openRoomDetailsModal('${room.id}'); return false;">${room.title}</a>
          </h3>
          <span class="rating-pill">
            <span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:'FILL' 1;">star</span>
            ${room.rating || 4.8}
          </span>
        </div>

        <div class="property-location">
          <span class="material-symbols-outlined" style="font-size:15px;color:var(--primary);">location_on</span>
          <span>${room.locality || 'Koramangala'} • ${room.distanceText || 'Close to transit'}</span>
        </div>

        <div class="property-specs">
          <span><span class="material-symbols-outlined" style="font-size:14px;">square_foot</span> ${room.carpetArea || '260 sq.ft'}</span>
          <span class="spec-divider">•</span>
          <span><span class="material-symbols-outlined" style="font-size:14px;">chair</span> ${room.furnishing || 'Furnished'}</span>
          <span class="spec-divider">•</span>
          <span><span class="material-symbols-outlined" style="font-size:14px;">meeting_room</span> ${room.balcony || 'Balcony'}</span>
        </div>

        <div class="card-amenities-row">
          ${(room.amenities || []).slice(0, 3).map(a => `
            <span class="amenity-micro-pill">${typeof a === 'string' ? a : a.label}</span>
          `).join('')}
          ${(room.amenities && room.amenities.length > 3) ? `<span class="amenity-micro-pill">+${room.amenities.length - 3} more</span>` : ''}
        </div>

        <div class="card-footer">
          <div class="price-container">
            <div>
              <span class="price-main">₹${(room.price || 15000).toLocaleString('en-IN')}</span>
              <span class="price-period">/mo</span>
            </div>
            <span class="price-sub">Zero Brokerage • Deposit: 1 mo</span>
          </div>

          <div class="card-actions-group">
            <button class="btn-card-visit" onclick="openScheduleVisitModal('${room.id}', '${room.title.replace(/'/g, "\\'")}')">
              Schedule Visit
            </button>
            <button class="icon-btn" onclick="openRoomDetailsModal('${room.id}')" title="View full specifications">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function resetAllFilters() {
  activeLocality = 'All';
  activeRoomType = 'all';
  maxBudget = 50000;
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.locality-chip').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
  fetchAndRenderProperties();
}

function openScheduleVisitModal(roomId, roomTitle) {
  const m = document.getElementById('schedule-visit-modal');
  if (!m) return;
  document.getElementById('modal-visit-property-id').value = roomId;
  document.getElementById('modal-visit-property-title').textContent = roomTitle;
  openModal('schedule-visit-modal');
}
