/**
 * Room Rento Frontend API Client
 * Connects to the Express & MongoDB REST API (via Vite proxy or direct URL)
 */

const API_BASE = '/api/v1';

class ApiClient {
  constructor() {
    this.token = this.getStoredToken();
  }

  getStoredToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('room_rento_access_token') || null;
      }
    } catch (e) {
      // storage blocked or private browsing
    }
    return null;
  }

  setToken(token) {
    this.token = token;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (token) {
          localStorage.setItem('room_rento_access_token', token);
        } else {
          localStorage.removeItem('room_rento_access_token');
        }
      }
    } catch (e) {
      // storage blocked or private browsing
    }
  }

  getHeaders(isJson = true) {
    const headers = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(!(options.body instanceof FormData)),
        ...(options.headers || {})
      },
      credentials: 'include' // include httpOnly cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`[API Client Error] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // ─── Authentication ──────────────────────────────────────────────────────────
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
  }

  // ─── Listings ────────────────────────────────────────────────────────────────
  async getListings(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return this.request(`/listings${qs ? `?${qs}` : ''}`);
  }

  async getListingDetails(idOrSlug) {
    return this.request(`/listings/${idOrSlug}`);
  }

  async getFeaturedListings() {
    return this.request('/listings/featured');
  }

  async getPopularAreas() {
    return this.request('/listings/popular-areas');
  }

  async autocomplete(q) {
    return this.request(`/listings/autocomplete?q=${encodeURIComponent(q)}`);
  }

  async compareListings(ids) {
    return this.request('/listings/compare', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  }

  async getSimilarListings(id) {
    return this.request(`/listings/${id}/similar`);
  }

  async createListing(listingData) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
  }

  async uploadImages(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    return this.request('/listings/upload', {
      method: 'POST',
      body: formData
    });
  }

  async uploadListingImages(listingId, files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    return this.request(`/listings/${listingId}/images`, {
      method: 'POST',
      body: formData
    });
  }

  // ─── Wishlist ────────────────────────────────────────────────────────────────
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(listingId) {
    return this.request(`/wishlist/${listingId}`, { method: 'POST' });
  }

  async removeFromWishlist(listingId) {
    return this.request(`/wishlist/${listingId}`, { method: 'DELETE' });
  }

  // ─── Enquiries ───────────────────────────────────────────────────────────────
  async sendEnquiry(listingId, enquiryData) {
    return this.request(`/listings/${listingId}/enquiries`, {
      method: 'POST',
      body: JSON.stringify(enquiryData)
    });
  }

  async getSentEnquiries() {
    return this.request('/enquiries/sent');
  }

  async getReceivedEnquiries() {
    return this.request('/enquiries/received');
  }

  // ─── Visits ──────────────────────────────────────────────────────────────────
  async scheduleVisit(listingId, visitData) {
    return this.request(`/listings/${listingId}/visits`, {
      method: 'POST',
      body: JSON.stringify(visitData)
    });
  }

  async getMyVisits() {
    return this.request('/visits/mine');
  }

  // ─── Reviews ─────────────────────────────────────────────────────────────────
  async getReviews(listingId) {
    return this.request(`/listings/${listingId}/reviews`);
  }

  async createReview(listingId, reviewData) {
    return this.request(`/listings/${listingId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async markReviewHelpful(reviewId) {
    return this.request(`/reviews/${reviewId}/helpful`, {
      method: 'POST'
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // ─── Owner Dashboard ─────────────────────────────────────────────────────────
  async getOwnerListings() {
    return this.request('/owner/listings');
  }

  async getOwnerStats() {
    return this.request('/owner/stats');
  }

  // ─── Admin Control Console ───────────────────────────────────────────────────
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return this.request(`/admin/users${qs ? `?${qs}` : ''}`);
  }

  async toggleBlockUser(userId) {
    return this.request(`/admin/users/${userId}/block`, {
      method: 'PATCH'
    });
  }

  async getAdminListings(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return this.request(`/admin/listings${qs ? `?${qs}` : ''}`);
  }

  async verifyListing(listingId) {
    return this.request(`/admin/listings/${listingId}/verify`, {
      method: 'PATCH'
    });
  }

  async rejectListing(listingId, reason = 'Listing details did not meet platform safety and content guidelines') {
    return this.request(`/admin/listings/${listingId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }

  async getAdminReports(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return this.request(`/admin/reports${qs ? `?${qs}` : ''}`);
  }

  async resolveReport(reportId, data = { status: 'resolved' }) {
    return this.request(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async deleteListingAdmin(listingId) {
    return this.request(`/admin/listings/${listingId}`, {
      method: 'DELETE'
    });
  }

  async getAdminReviews(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return this.request(`/admin/reviews${qs ? `?${qs}` : ''}`);
  }

  async deleteReviewAdmin(reviewId) {
    return this.request(`/admin/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiClient();
export default api;
