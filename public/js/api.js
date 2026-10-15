/**
 * RoomRento • REST API Client with Offline Resilience (Vanilla JS)
 */

const API_BASE = '/api/v1';

window.RoomRentoAPI = {
  // 1. Fetch Listings
  async getListings(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/listings?${query}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {
      console.warn('API /listings unavailable, fallback to local dataset:', e.message);
    }

    // Local in-memory filter fallback
    let rooms = [...(window.ROOM_DATA.INITIAL_ROOMS || [])];
    if (params.city && params.city !== 'All') {
      rooms = rooms.filter(r => (r.locality || '').toLowerCase().includes(params.city.toLowerCase()) || r.address.includes(params.city));
    }
    if (params.locality) {
      rooms = rooms.filter(r => (r.locality || '').toLowerCase() === params.locality.toLowerCase());
    }
    if (params.roomType && params.roomType !== 'all') {
      rooms = rooms.filter(r => (r.type || '').toLowerCase().includes(params.roomType.toLowerCase()));
    }
    if (params.maxPrice) {
      rooms = rooms.filter(r => r.price <= Number(params.maxPrice));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      rooms = rooms.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.locality.toLowerCase().includes(q) || 
        r.address.toLowerCase().includes(q)
      );
    }
    return rooms;
  },

  // 2. Fetch Single Listing by ID
  async getListingById(id) {
    try {
      const res = await fetch(`${API_BASE}/listings/${id}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {
      console.warn('API /listings/:id unavailable, fallback to local:', e.message);
    }
    return (window.ROOM_DATA.INITIAL_ROOMS || []).find(r => r.id === id) || null;
  },

  // 3. User Login
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.token) {
          localStorage.setItem('room_rento_token', json.token);
          localStorage.setItem('room_rento_user', JSON.stringify(json.user));
          AppState.currentUser = json.user;
          return { success: true, user: json.user };
        }
      }
    } catch (e) {
      console.warn('API login offline, fallback:', e.message);
    }

    // Demo Accounts Fallback
    let user = {
      name: 'Arjun Mehta',
      email: email,
      role: 'tenant',
      phone: '+91 98123 45678',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    const emailStr = String(email || '').toLowerCase();
    if (emailStr.includes('admin')) {
      user.name = 'Super Admin';
      user.role = 'admin';
    } else if (emailStr.includes('host') || emailStr.includes('owner')) {
      user.name = 'Priya Sharma';
      user.role = 'owner';
    }

    localStorage.setItem('room_rento_token', 'demo_jwt_token_local');
    localStorage.setItem('room_rento_user', JSON.stringify(user));
    AppState.currentUser = user;
    return { success: true, user };
  },

  // 4. Schedule Visit
  async scheduleVisit(visitData) {
    try {
      const res = await fetch(`${API_BASE}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AppState.token}`
        },
        body: JSON.stringify(visitData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API /visits offline, saving to local store:', e.message);
    }

    const localVisits = JSON.parse(localStorage.getItem('room_rento_visits') || '[]');
    const newVisit = {
      id: 'visit-' + Date.now(),
      status: 'Confirmed',
      ...visitData,
      createdAt: new Date().toISOString()
    };
    localVisits.unshift(newVisit);
    localStorage.setItem('room_rento_visits', JSON.stringify(localVisits));
    return { success: true, data: newVisit };
  },

  // 5. Get User Booked Visits
  async getVisits() {
    try {
      const res = await fetch(`${API_BASE}/visits`, {
        headers: { 'Authorization': `Bearer ${AppState.token}` }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {
      console.warn('API /visits offline:', e.message);
    }

    const localVisits = JSON.parse(localStorage.getItem('room_rento_visits') || 'null');
    return localVisits || window.ROOM_DATA.INITIAL_SCHEDULED_VISITS || [];
  },

  // 6. Cancel Visit
  async cancelVisit(id) {
    try {
      await fetch(`${API_BASE}/visits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${AppState.token}` }
      });
    } catch (e) {
      console.warn('API /visits/:id offline:', e.message);
    }

    let localVisits = JSON.parse(localStorage.getItem('room_rento_visits') || '[]');
    localVisits = localVisits.filter(v => v.id !== id);
    localStorage.setItem('room_rento_visits', JSON.stringify(localVisits));
    return { success: true };
  }
};
