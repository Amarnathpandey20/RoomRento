/**
 * RoomRento • User Account & Visits Controller (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderUserProfile();
  renderBookedVisits();
  setupAccountListeners();
});

function renderUserProfile() {
  const user = AppState.currentUser || window.ROOM_DATA.INITIAL_USER;
  const nameEl = document.getElementById('account-user-name');
  const emailEl = document.getElementById('account-user-email');
  const phoneEl = document.getElementById('account-user-phone');
  const cityEl = document.getElementById('account-user-city');
  const avatarEl = document.getElementById('account-user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (phoneEl) phoneEl.textContent = user.phone || '+91 98123 45678';
  if (cityEl) cityEl.textContent = user.city || AppState.currentCity;
  if (avatarEl && user.avatar) avatarEl.src = user.avatar;
}

async function renderBookedVisits() {
  const container = document.getElementById('account-visits-list');
  const countEl = document.getElementById('account-visits-count');
  if (!container) return;

  const visits = await RoomRentoAPI.getVisits();
  if (countEl) countEl.textContent = visits.length;

  if (visits.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:2.5rem 1rem;background:var(--surface-dim);border-radius:var(--radius-lg);">
        <span class="material-symbols-outlined" style="font-size:42px;color:var(--text-light);margin-bottom:0.5rem;">calendar_month</span>
        <h4 style="font-weight:700;margin-bottom:0.25rem;">No scheduled visits yet</h4>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">Find your dream room and schedule a free in-person visit with the verified host.</p>
        <a href="index.html" class="btn-primary" style="display:inline-flex;">Explore Rooms</a>
      </div>
    `;
    return;
  }

  container.innerHTML = visits.map(v => `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;box-shadow:var(--shadow-sm);">
      <div style="display:flex;align-items:center;gap:1rem;">
        <div style="width:48px;height:48px;border-radius:var(--radius-md);background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;">
          <span class="material-symbols-outlined" style="font-size:26px;">event</span>
        </div>
        <div>
          <span style="display:inline-block;padding:2px 8px;border-radius:var(--radius-full);font-size:0.72rem;font-weight:700;background:var(--success-light);color:var(--success);margin-bottom:4px;">
            ${v.status || 'Confirmed'}
          </span>
          <h4 style="font-size:1.05rem;font-weight:700;margin-bottom:2px;">
            <a href="room-details.html?id=${v.propertyId}">${v.propertyTitle || 'Urban Luxe Studio'}</a>
          </h4>
          <p style="font-size:0.82rem;color:var(--text-muted);">
            <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">schedule</span>
            ${v.date} • ${v.timeSlot || 'Morning'}
          </p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <button class="btn-secondary" style="padding:0.4rem 0.85rem;font-size:0.82rem;" onclick="handleCancelVisit('${v.id}')">
          Cancel Visit
        </button>
        <a href="room-details.html?id=${v.propertyId}" class="btn-primary" style="padding:0.4rem 0.85rem;font-size:0.82rem;">
          View Property
        </a>
      </div>
    </div>
  `).join('');
}

async function handleCancelVisit(visitId) {
  if (confirm('Are you sure you want to cancel this scheduled visit?')) {
    await RoomRentoAPI.cancelVisit(visitId);
    showToast('Visit cancelled', 'event_busy');
    renderBookedVisits();
  }
}

function setupAccountListeners() {
  const logoutBtn = document.getElementById('account-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('room_rento_token');
      localStorage.removeItem('room_rento_user');
      showToast('Logged out successfully', 'logout');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }
}
