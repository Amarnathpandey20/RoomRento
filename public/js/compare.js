/**
 * RoomRento • Smart Comparison Matrix Controller (Vanilla JS)
 */

let highlightDiffs = true;

document.addEventListener('DOMContentLoaded', () => {
  renderComparisonMatrix();
  setupCompareListeners();
});

function setupCompareListeners() {
  const diffSwitch = document.getElementById('diff-highlight-switch');
  if (diffSwitch) {
    diffSwitch.addEventListener('change', (e) => {
      highlightDiffs = e.target.checked;
      renderComparisonMatrix();
    });
  }

  const addRoomBtn = document.getElementById('add-compare-room-btn');
  if (addRoomBtn) {
    addRoomBtn.addEventListener('click', openAddRoomModal);
  }
}

function renderComparisonMatrix() {
  const tableWrapper = document.getElementById('comparison-table-wrapper');
  const emptyState = document.getElementById('compare-empty-state');
  if (!tableWrapper) return;

  const roomIds = AppState.compareRooms || [];
  const allRooms = window.ROOM_DATA.INITIAL_ROOMS || [];
  const rooms = roomIds.map(id => allRooms.find(r => r.id === id)).filter(Boolean);

  if (rooms.length === 0) {
    tableWrapper.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  // Compare Attributes Definition
  const attributes = [
    { label: 'Monthly Rent', key: 'priceDisplay', valFn: r => `₹${(r.price || 0).toLocaleString('en-IN')}/mo` },
    { label: 'Locality', key: 'locality' },
    { label: 'Room Type', key: 'type' },
    { label: 'Security Deposit', key: 'securityDeposit' },
    { label: 'Lock-in Period', key: 'lockIn' },
    { label: 'Carpet Area', key: 'carpetArea' },
    { label: 'Furnishing', key: 'furnishing' },
    { label: 'Floor Level', key: 'floor' },
    { label: 'Balcony', key: 'balcony' },
    { label: 'Facing', key: 'facing' },
    { label: 'Zero Brokerage', key: 'zeroBrokerage', valFn: r => r.zeroBrokerage ? '✅ Yes' : '❌ No' },
    { label: 'Air Conditioner', key: 'hasAC', valFn: r => (r.amenities || []).some(a => (a.icon || '').includes('ac')) ? '✅ Included' : '❌ Not Included' },
    { label: 'Attached Bath', key: 'hasBath', valFn: r => (r.amenities || []).some(a => (a.label || '').includes('Bath')) ? '✅ Yes' : '❌ Common' },
    { label: 'High-speed Wi-Fi', key: 'hasWifi', valFn: r => (r.amenities || []).some(a => (a.label || '').includes('Wi-Fi')) ? '✅ 300 Mbps' : '❌ Extra' },
    { label: 'Power Backup', key: 'hasDG', valFn: r => (r.amenities || []).some(a => (a.label || '').includes('Power')) ? '✅ 100% DG' : '❌ Inverter' }
  ];

  let html = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th class="attr-col">Property</th>
          ${rooms.map(room => `
            <th class="prop-col" style="min-width: 220px; padding: 1.25rem 1rem;">
              <div style="position: relative; width: 100%; height: 120px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 0.75rem;">
                <img src="${(room.images && room.images[0]) || ''}" alt="${room.title}" style="width: 100%; height: 100%; object-fit: cover;">
                <button onclick="toggleCompare('${room.id}')" title="Remove" style="position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px;">×</button>
              </div>
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.25rem;"><a href="room-details.html?id=${room.id}">${room.title}</a></h4>
              <p style="font-size: 1.15rem; font-weight: 800; color: var(--primary); margin-bottom: 0.75rem;">₹${(room.price || 0).toLocaleString('en-IN')}<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 400;">/mo</span></p>
              <button class="btn-primary" style="width: 100%; padding: 0.45rem; font-size: 0.8rem;" onclick="openScheduleVisitModal('${room.id}', '${room.title.replace(/'/g, "\\'")}')">Schedule Visit</button>
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  attributes.forEach(attr => {
    const values = rooms.map(r => attr.valFn ? attr.valFn(r) : (r[attr.key] || 'N/A'));
    const isDiff = values.length > 1 && new Set(values).size > 1;
    const highlightClass = (highlightDiffs && isDiff) ? 'diff-highlight' : '';

    html += `
      <tr>
        <th class="attr-col ${highlightClass}">
          ${attr.label}
          ${(highlightDiffs && isDiff) ? '<span style="font-size:10px;margin-left:4px;color:#d97706;">⚡ Diff</span>' : ''}
        </th>
        ${values.map(val => `
          <td class="prop-col ${highlightClass}">${val}</td>
        `).join('')}
      </tr>
    `;
  });

  html += `</tbody></table>`;
  tableWrapper.innerHTML = html;
}

function openAddRoomModal() {
  const container = document.getElementById('add-room-picker-list');
  if (!container) return;

  const allRooms = window.ROOM_DATA.INITIAL_ROOMS || [];
  const unselected = allRooms.filter(r => !AppState.compareRooms.includes(r.id));

  if (unselected.length === 0) {
    container.innerHTML = `<p style="padding:1rem;color:var(--text-muted);">All available rooms are already added to compare.</p>`;
  } else {
    container.innerHTML = unselected.map(r => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;border-bottom:1px solid var(--border);">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <img src="${(r.images && r.images[0]) || ''}" style="width:50px;height:40px;border-radius:var(--radius-sm);object-fit:cover;">
          <div>
            <h5 style="font-size:0.9rem;font-weight:700;">${r.title}</h5>
            <p style="font-size:0.78rem;color:var(--text-muted);">${r.locality} • ₹${(r.price || 0).toLocaleString('en-IN')}/mo</p>
          </div>
        </div>
        <button class="btn-secondary" style="padding:0.35rem 0.75rem;font-size:0.8rem;" onclick="addRoomToCompare('${r.id}')">+ Add</button>
      </div>
    `).join('');
  }

  openModal('add-room-modal');
}

function addRoomToCompare(roomId) {
  const added = toggleCompare(roomId);
  if (added !== false) {
    closeModal('add-room-modal');
  }
}
