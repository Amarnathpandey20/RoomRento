/**
 * RoomRento • Admin Dashboard Controller (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderAdminStats();
  renderAdminListings();
  setupAdminListeners();
});

function renderAdminStats() {
  const rooms = window.ROOM_DATA.INITIAL_ROOMS || [];
  const elListings = document.getElementById('admin-stat-listings');
  const elTenants = document.getElementById('admin-stat-tenants');
  const elVisits = document.getElementById('admin-stat-visits');

  if (elListings) elListings.textContent = rooms.length;
  if (elTenants) elTenants.textContent = '1,420';
  if (elVisits) elVisits.textContent = '384';
}

function renderAdminListings() {
  const tbody = document.getElementById('admin-listings-table-body');
  if (!tbody) return;

  const rooms = window.ROOM_DATA.INITIAL_ROOMS || [];
  tbody.innerHTML = rooms.map(room => `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:1rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <img src="${(room.images && room.images[0]) || ''}" style="width:48px;height:38px;border-radius:var(--radius-sm);object-fit:cover;">
          <div>
            <strong>${room.title}</strong>
            <p style="font-size:0.75rem;color:var(--text-muted);">${room.locality} • ${room.type}</p>
          </div>
        </div>
      </td>
      <td style="padding:1rem;font-weight:700;color:var(--primary);">₹${(room.price || 0).toLocaleString('en-IN')}</td>
      <td style="padding:1rem;">
        <span class="badge-tag ${room.isVerified ? 'verified' : 'zero-deposit'}">
          ${room.isVerified ? 'Verified' : 'Pending'}
        </span>
      </td>
      <td style="padding:1rem;">
        <div style="display:flex;gap:0.4rem;">
          <button class="btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.75rem;" onclick="toggleAdminVerify('${room.id}')">
            ${room.isVerified ? 'Unverify' : 'Verify'}
          </button>
          <button class="btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.75rem;color:var(--error);" onclick="deleteAdminListing('${room.id}')">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleAdminVerify(id) {
  const room = (window.ROOM_DATA.INITIAL_ROOMS || []).find(r => r.id === id);
  if (room) {
    room.isVerified = !room.isVerified;
    showToast(`Updated verification status for ${room.title}`, 'verified');
    renderAdminListings();
  }
}

function deleteAdminListing(id) {
  if (confirm('Are you sure you want to delete this listing?')) {
    const idx = (window.ROOM_DATA.INITIAL_ROOMS || []).findIndex(r => r.id === id);
    if (idx > -1) {
      window.ROOM_DATA.INITIAL_ROOMS.splice(idx, 1);
      showToast('Listing removed from portal', 'delete');
      renderAdminStats();
      renderAdminListings();
    }
  }
}

function setupAdminListeners() {
  const addForm = document.getElementById('admin-add-listing-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('new-prop-title').value.trim();
      const price = Number(document.getElementById('new-prop-price').value);
      const locality = document.getElementById('new-prop-locality').value.trim();
      const type = document.getElementById('new-prop-type').value;
      const img = document.getElementById('new-prop-image').value.trim() || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';

      const newRoom = {
        id: 'prop-' + Date.now(),
        title,
        price,
        locality,
        type,
        rating: 5.0,
        reviewCount: 1,
        isVerified: true,
        zeroBrokerage: true,
        carpetArea: '300 sq.ft',
        furnishing: 'Fully Furnished',
        images: [img]
      };

      (window.ROOM_DATA.INITIAL_ROOMS || []).unshift(newRoom);
      showToast('New room listing published successfully!', 'add_task');
      addForm.reset();
      closeModal('admin-add-listing-modal');
      renderAdminStats();
      renderAdminListings();
    });
  }
}
