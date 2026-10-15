/**
 * RoomRento • Room Details View Controller (Vanilla JS)
 */

let currentRoom = null;
let activeImageIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id') || 'prop-101';

  currentRoom = await RoomRentoAPI.getListingById(roomId);
  if (!currentRoom) {
    currentRoom = (window.ROOM_DATA.INITIAL_ROOMS || [])[0];
  }

  renderRoomDetails(currentRoom);
  setupDetailsListeners();
});

function renderRoomDetails(room) {
  if (!room) return;

  // Title & Header
  document.title = `${room.title} • RoomRento`;
  const titleEl = document.getElementById('details-title');
  if (titleEl) titleEl.textContent = room.title;

  const locEl = document.getElementById('details-location');
  if (locEl) locEl.textContent = `${room.address || room.locality} • ${room.distanceText || 'Near Tech Parks'}`;

  const rentEl = document.getElementById('details-rent');
  if (rentEl) rentEl.textContent = `₹${(room.price || 16500).toLocaleString('en-IN')}`;

  const ratingEl = document.getElementById('details-rating');
  if (ratingEl) ratingEl.textContent = `${room.rating || 4.9} (${room.reviewCount || 128} verified reviews)`;

  // Gallery
  const images = (room.images && room.images.length > 0) ? room.images : [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200'
  ];

  const mainImg = document.getElementById('gallery-main-img');
  if (mainImg) mainImg.src = images[0];

  const thumbsContainer = document.getElementById('gallery-thumbs-container');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = images.map((img, i) => `
      <div class="gallery-thumb-item ${i === 0 ? 'active' : ''}" onclick="selectGalleryImage(${i})">
        <img src="${img}" alt="Thumbnail ${i + 1}">
      </div>
    `).join('');
  }

  // Specifications Grid
  const specsContainer = document.getElementById('details-specs-grid');
  if (specsContainer) {
    specsContainer.innerHTML = `
      <div class="amenity-item-card"><span class="material-symbols-outlined icon">square_foot</span><div><strong>Carpet Area</strong><p>${room.carpetArea || '280 sq.ft'}</p></div></div>
      <div class="amenity-item-card"><span class="material-symbols-outlined icon">layers</span><div><strong>Floor</strong><p>${room.floor || '3rd of 4 Floors'}</p></div></div>
      <div class="amenity-item-card"><span class="material-symbols-outlined icon">balcony</span><div><strong>Balcony</strong><p>${room.balcony || 'Private Balcony'}</p></div></div>
      <div class="amenity-item-card"><span class="material-symbols-outlined icon">explore</span><div><strong>Facing</strong><p>${room.facing || 'East Facing'}</p></div></div>
      <div class="amenity-item-card"><span class="material-symbols-outlined icon">chair</span><div><strong>Furnishing</strong><p>${room.furnishing || 'Fully Furnished'}</p></div></div>
      <div class="amenity-item-card"><span class="material-symbols-outlined icon">schedule</span><div><strong>Lock-in</strong><p>${room.lockIn || '3 Months'}</p></div></div>
    `;
  }

  // Pricing & Terms Breakdown
  const depositEl = document.getElementById('details-deposit');
  if (depositEl) depositEl.textContent = room.securityDeposit || '₹16,500 (1 Month)';

  const maintEl = document.getElementById('details-maintenance');
  if (maintEl) maintEl.textContent = room.maintenance || 'Included in rent';

  const noticeEl = document.getElementById('details-notice');
  if (noticeEl) noticeEl.textContent = room.noticePeriod || '1 Month Notice';

  // Amenities Tab Content (Default In-Room)
  switchAmenityTab('inRoom');

  // Wishlist Heart Button
  const heartBtn = document.getElementById('details-wishlist-btn');
  if (heartBtn) {
    const isSaved = AppState.savedRooms.includes(room.id);
    heartBtn.classList.toggle('saved', isSaved);
    heartBtn.innerHTML = isSaved
      ? '<span class="material-symbols-outlined" style="color:#e11d48;font-variation-settings:\'FILL\' 1;">favorite</span>'
      : '<span class="material-symbols-outlined">favorite</span>';
  }
}

function selectGalleryImage(index) {
  if (!currentRoom || !currentRoom.images) return;
  activeImageIndex = index;
  const mainImg = document.getElementById('gallery-main-img');
  if (mainImg) mainImg.src = currentRoom.images[index];

  document.querySelectorAll('.gallery-thumb-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
}

function switchAmenityTab(categoryKey) {
  document.querySelectorAll('.amenity-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === categoryKey);
  });

  const container = document.getElementById('amenity-tab-content');
  if (!container || !currentRoom) return;

  const cats = currentRoom.amenityCategories || {};
  const list = cats[categoryKey] || [];

  if (list.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);padding:1rem;">Information available upon visit request.</p>`;
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

function setupDetailsListeners() {
  // Amenity Tab Buttons
  document.querySelectorAll('.amenity-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchAmenityTab(btn.dataset.tab));
  });

  // Wishlist Button
  const heartBtn = document.getElementById('details-wishlist-btn');
  if (heartBtn && currentRoom) {
    heartBtn.addEventListener('click', () => {
      toggleWishlist(currentRoom.id);
      const isSaved = AppState.savedRooms.includes(currentRoom.id);
      heartBtn.classList.toggle('saved', isSaved);
      heartBtn.innerHTML = isSaved
        ? '<span class="material-symbols-outlined" style="color:#e11d48;font-variation-settings:\'FILL\' 1;">favorite</span>'
        : '<span class="material-symbols-outlined">favorite</span>';
    });
  }

  // 360 Virtual Tour Button
  const tourBtn = document.getElementById('open-virtual-tour-btn');
  if (tourBtn) {
    tourBtn.addEventListener('click', () => openModal('virtual-tour-modal'));
  }

  // Schedule Visit Trigger
  const scheduleBtn = document.getElementById('open-schedule-visit-btn');
  if (scheduleBtn && currentRoom) {
    scheduleBtn.addEventListener('click', () => {
      document.getElementById('modal-visit-property-id').value = currentRoom.id;
      document.getElementById('modal-visit-property-title').textContent = currentRoom.title;
      openModal('schedule-visit-modal');
    });
  }

  // Schedule Visit Form Submit
  const visitForm = document.getElementById('schedule-visit-form');
  if (visitForm) {
    visitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const date = document.getElementById('visit-date-input').value;
      const slot = document.querySelector('input[name="visit-slot"]:checked')?.value || 'Morning (10:00 AM - 1:00 PM)';
      const phone = document.getElementById('visit-phone-input').value;

      if (!date) {
        showToast('Please select a visit date', 'calendar_today');
        return;
      }

      await RoomRentoAPI.scheduleVisit({
        propertyId: currentRoom.id,
        propertyTitle: currentRoom.title,
        locality: currentRoom.locality,
        date,
        timeSlot: slot,
        phone
      });

      closeModal('schedule-visit-modal');
      showToast('Free visit scheduled successfully! Host will call to confirm.', 'event_available');
    });
  }
}
