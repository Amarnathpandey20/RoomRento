/**
 * RoomRento • Saved Wishlist Controller (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderSavedRooms();
});

function renderSavedRooms() {
  const container = document.getElementById('saved-properties-grid');
  const emptyState = document.getElementById('saved-empty-state');
  const countLabel = document.getElementById('saved-count-label');
  if (!container) return;

  const savedIds = AppState.savedRooms || [];
  const allRooms = window.ROOM_DATA.INITIAL_ROOMS || [];
  const rooms = savedIds.map(id => allRooms.find(r => r.id === id)).filter(Boolean);

  if (countLabel) {
    countLabel.textContent = `${rooms.length} ${rooms.length === 1 ? 'room' : 'rooms'} saved`;
  }

  if (rooms.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  container.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = rooms.map(room => {
    const isCompared = AppState.compareRooms.includes(room.id);
    const mainImage = (room.images && room.images.length > 0) ? room.images[0] : '';
    return `
      <article class="property-card" id="saved-card-${room.id}">
        <div class="card-media">
          <img src="${mainImage}" alt="${room.title}" class="card-img" loading="lazy">
          <div class="badge-overlay-left">
            <span class="badge-tag verified">Verified</span>
            <span class="badge-tag room-type">${room.type || 'Room'}</span>
          </div>
          <div class="action-overlay-right">
            <button class="heart-btn saved" onclick="toggleWishlist('${room.id}')" title="Remove from saved">
              <span class="material-symbols-outlined" style="font-size:20px;color:#e11d48;font-variation-settings:'FILL' 1;">favorite</span>
            </button>
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
            <span>${room.locality} • ${room.distanceText || 'Near Transit'}</span>
          </div>
          <div class="card-footer">
            <div class="price-container">
              <div>
                <span class="price-main">₹${(room.price || 0).toLocaleString('en-IN')}</span>
                <span class="price-period">/mo</span>
              </div>
            </div>
            <div class="card-actions-group">
              <button class="btn-card-visit" onclick="openScheduleVisitModal('${room.id}', '${room.title.replace(/'/g, "\\'")}')">
                Schedule Visit
              </button>
              <button class="icon-btn" onclick="openRoomDetailsModal('${room.id}')" title="View room details">
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}
