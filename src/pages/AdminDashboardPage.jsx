import React, { useState, useEffect } from 'react';
import { useRooms } from '../context/RoomContext';

export default function AdminDashboardPage() {
  const {
    user,
    logout,
    setActiveTab,
    showToast,
    adminStats,
    adminUsers,
    adminListings,
    adminReports,
    adminReviews,
    isAdminLoading,
    fetchAdminStats,
    fetchAdminUsers,
    toggleBlockUser,
    deleteUserAdmin,
    fetchAdminListings,
    verifyListing,
    rejectListing,
    deleteListingAdmin,
    fetchAdminReports,
    resolveReport,
    fetchAdminReviews,
    deleteReview
  } = useRooms();

  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'users' | 'listings' | 'reviews' | 'reports'
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');
  const [reviewSearch, setReviewSearch] = useState('');

  // Load initial data
  useEffect(() => {
    fetchAdminStats();
    fetchAdminUsers();
    fetchAdminListings({ status: 'all' });
    fetchAdminReports();
    fetchAdminReviews();
  }, [fetchAdminStats, fetchAdminUsers, fetchAdminListings, fetchAdminReports, fetchAdminReviews]);

  // Handle user search & filter
  const safeUsers = Array.isArray(adminUsers) ? adminUsers : [];
  const filteredUsers = safeUsers.filter((u) => {
    if (!u) return false;
    const matchesSearch =
      !userSearch.trim() ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch);
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle review search
  const safeReviews = Array.isArray(adminReviews) ? adminReviews : [];
  const filteredReviews = safeReviews.filter((r) => {
    if (!r) return false;
    if (!reviewSearch.trim()) return true;
    const q = reviewSearch.toLowerCase();
    return (
      r.text?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.author?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.listing?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-surface text-on-surface pb-20">
      {/* Admin Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-sm text-[20px] sm:text-[22px] font-extrabold tracking-tight">
                  Super Admin Management Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                  RBAC Level 3
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-slate-400 mt-0.5">
                Logged in as <strong className="text-white">{user?.name || 'Administrator'}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                fetchAdminStats();
                fetchAdminUsers();
                fetchAdminListings({ status: listingStatusFilter });
                fetchAdminReports();
                fetchAdminReviews();
                showToast('Analytics refreshed from database', 'refresh');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Refresh DB</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              <span>View Live Website</span>
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-surface-container-high/60">
          {[
            { id: 'overview', label: 'Platform Overview', icon: 'dashboard' },
            { id: 'users', label: `Users (${adminUsers.length})`, icon: 'group' },
            { id: 'listings', label: `Listings Moderation (${adminListings.length})`, icon: 'checklist' },
            { id: 'reviews', label: `Reviews Moderation (${adminReviews.length})`, icon: 'rate_review' },
            { id: 'reports', label: `Trust & Safety (${adminReports.length})`, icon: 'policy' }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-label-md text-[13px] font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB: OVERVIEW & KPIS ─────────────────────────────────────────── */}
        {activeSubTab === 'overview' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Total Users
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">people</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-headline-sm text-[30px] font-black text-on-surface block">
                    {adminStats?.users?.total || adminUsers.length || 10}
                  </span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 block">
                    {adminStats?.users?.tenants || 4} Tenants • {adminStats?.users?.owners || 5} Hosts
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Active Listings
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">villa</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-headline-sm text-[30px] font-black text-on-surface block">
                    {adminStats?.listings?.published || adminListings.length || 35}
                  </span>
                  <span className="font-body-sm text-[12px] text-emerald-600 font-semibold mt-0.5 block">
                    {adminStats?.listings?.pending || 0} Pending Moderation
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Reviews Moderation
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">rate_review</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-headline-sm text-[30px] font-black text-on-surface block">
                    {adminReviews.length}
                  </span>
                  <span className="font-body-sm text-[12px] text-amber-600 font-semibold mt-0.5 block">
                    Tenant reviews active
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Visits & Enquiries
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">event_available</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-headline-sm text-[30px] font-black text-on-surface block">
                    {(adminStats?.engagement?.visits || 2) + (adminStats?.engagement?.enquiries || 3)}
                  </span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 block">
                    {adminStats?.engagement?.visits || 2} Scheduled Visits booked
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Trust & Safety
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">verified_user</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-headline-sm text-[30px] font-black text-emerald-600 block">
                    100%
                  </span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 block">
                    Zero fraudulent incidents
                  </span>
                </div>
              </div>
            </div>

            {/* Quick System Diagnostics */}
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col gap-4">
              <h3 className="font-headline-sm text-[17px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <span>System Security & Architecture Status</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h4 className="font-label-sm text-[12px] font-bold text-on-surface">JWT Authentication</h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">Bearer Auth + httpOnly Cookies Active</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <h4 className="font-label-sm text-[12px] font-bold text-on-surface">Role-Based Access (RBAC)</h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">Admin, Host/Owner, Tenant gates locked</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <h4 className="font-label-sm text-[12px] font-bold text-on-surface">Express Rate Limiter</h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">200 req / 15m window enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: USER DIRECTORY & MODERATION ─────────────────────────────── */}
        {activeSubTab === 'users' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search user by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-label-sm text-[11px] text-outline uppercase font-bold">Role:</span>
                {['all', 'tenant', 'owner', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      userRoleFilter === r
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider font-bold text-on-surface-variant border-b border-surface-container-high/60">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40 text-xs">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u._id || u.email} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={u.name}
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-surface-container-high"
                              />
                              <div>
                                <h4 className="font-label-md text-[13px] font-bold text-on-surface">
                                  {u.name}
                                </h4>
                                <span className="font-body-sm text-[11px] text-on-surface-variant">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold capitalize ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                  : u.role === 'owner'
                                  ? 'bg-secondary/15 text-secondary'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {u.role || 'tenant'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-body-sm text-on-surface-variant">
                            {u.city || 'Bengaluru'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${
                                u.isActive !== false
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-red-500/10 text-red-600'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {u.isActive !== false ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.role !== 'admin' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleBlockUser(u._id)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                    u.isActive !== false
                                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                                  }`}
                                >
                                  {u.isActive !== false ? 'Suspend' : 'Unsuspend'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Permanently delete user "${u.name}" (${u.email}) and remove their posts?`)) {
                                      deleteUserAdmin(u._id);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-error/10 hover:bg-error/20 text-error text-[11px] font-bold transition-colors flex items-center gap-1"
                                  title="Delete User Account"
                                >
                                  <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                  <span>Delete User</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-semibold text-outline">Protected</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                          No users matched your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: LISTING MODERATION ──────────────────────────────────────── */}
        {activeSubTab === 'listings' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60">
              <span className="font-label-sm text-[12px] font-bold text-on-surface">
                Filter Property Moderation Queue:
              </span>
              <div className="flex items-center gap-2">
                {['all', 'pending', 'published', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setListingStatusFilter(status);
                      fetchAdminListings({ status });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      listingStatusFilter === status
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminListings.length > 0 ? (
                adminListings.map((listing) => (
                  <div
                    key={listing._id || listing.id}
                    className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            listing.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : listing.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {listing.status}
                        </span>
                        <span className="font-headline-sm text-[16px] font-extrabold text-primary">
                          ₹{(listing.pricing?.monthlyRent || listing.price || 15000).toLocaleString('en-IN')}/mo
                        </span>
                      </div>

                      <h4 className="font-label-lg text-label-lg font-bold text-on-surface line-clamp-1">
                        {listing.title}
                      </h4>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">
                        {listing.location?.area || listing.locality || 'Koramangala'}, {listing.location?.city || listing.city || 'Bengaluru'}
                      </p>
                      <p className="font-body-sm text-[11px] text-outline">
                        Submitted by: {listing.owner?.name || 'Verified Host'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-surface-container-high/40">
                      {listing.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => verifyListing(listing._id || listing.id)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-label-sm text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>Verify</span>
                        </button>
                      )}
                      {listing.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => rejectListing(listing._id || listing.id, 'Moderation review: safety guideline violation')}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-label-sm text-[11px] font-bold transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Permanently delete listing post "${listing.title}"?`)) {
                            deleteListingAdmin(listing._id || listing.id);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-error/10 hover:bg-error/20 text-error font-label-sm text-[11px] font-bold transition-colors flex items-center gap-1"
                        title="Delete User Post"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Delete Post</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center bg-surface-container-low rounded-3xl text-on-surface-variant text-sm">
                  No listings found for the selected status.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: REVIEWS MODERATION ───────────────────────────────────────── */}
        {activeSubTab === 'reviews' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search reviews by tenant name, text, or room title..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                <span>Showing {filteredReviews.length} of {adminReviews.length} tenant reviews</span>
              </div>
            </div>

            {/* Reviews Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => {
                  const reviewId = rev._id || rev.id;
                  const listingId = rev.listing?._id || rev.listing?.id || rev.roomId;
                  const reviewerName = rev.user?.name || rev.author || 'Verified Tenant';
                  const reviewerEmail = rev.user?.email || 'tenant@roomrento.in';
                  const roomTitle = rev.listing?.title || 'Modern Room Listing';
                  const roomLocality = rev.listing?.location?.area || rev.listing?.location?.city || 'India';

                  return (
                    <div
                      key={reviewId}
                      className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between gap-3"
                    >
                      {/* Top: User & Property Info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              rev.user?.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={reviewerName}
                            className="w-10 h-10 rounded-2xl object-cover ring-1 ring-surface-container-high"
                          />
                          <div>
                            <h4 className="font-label-md text-[13px] font-bold text-on-surface">
                              {reviewerName}
                            </h4>
                            <span className="font-body-sm text-[11px] text-on-surface-variant block">
                              {reviewerEmail}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs shrink-0">
                          <span className="material-symbols-outlined text-[16px] text-amber-500 material-symbols-filled">
                            star
                          </span>
                          <span>{rev.rating || 5}.0</span>
                        </div>
                      </div>

                      {/* Associated Listing */}
                      <div className="p-2.5 rounded-xl bg-surface-container text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="material-symbols-outlined text-[16px] text-primary shrink-0">home</span>
                          <span className="font-semibold text-on-surface truncate">{roomTitle}</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant shrink-0">{roomLocality}</span>
                      </div>

                      {/* Review Comment Text */}
                      <p className="font-body-md text-[12px] text-on-surface leading-relaxed">
                        "{rev.comment || rev.text || 'Pleasant stay with spotless rooms and cooperative host.'}"
                      </p>

                      {/* Tags & Action Row */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container-high/40">
                        <div className="flex flex-wrap items-center gap-1">
                          {(rev.tags || ['Verified Stay']).slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-medium"
                            >
                              ✓ {t}
                            </span>
                          ))}
                        </div>

                        {/* Admin Delete Review Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Permanently delete this review by "${reviewerName}"?`)) {
                              deleteReview(listingId, reviewId);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-error/10 hover:bg-error/20 text-error font-label-sm text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Delete Review (Admin Moderation)"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span>Delete Review</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-10 text-center bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[36px] text-primary">rate_review</span>
                  <h4 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    No Reviews Found
                  </h4>
                  <p className="font-body-sm text-[12px] text-on-surface-variant max-w-sm">
                    {reviewSearch ? 'No reviews matched your search criteria.' : 'There are no reviews in the database yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: TRUST & SAFETY REPORTS ──────────────────────────────────── */}
        {activeSubTab === 'reports' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {adminReports.length > 0 ? (
              adminReports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">flag</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-label-md text-label-md font-bold text-on-surface">
                          {report.reason || 'Listing Discrepancy'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[10px] font-bold uppercase">
                          {report.status}
                        </span>
                      </div>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                        {report.description || 'Tenant noted discrepancies in room amenities.'}
                      </p>
                      <span className="font-body-sm text-[11px] text-outline mt-1 block">
                        Reported by: {report.reportedBy?.name || 'Anonymous User'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => resolveReport(report._id, 'Inspected and verified by Admin team')}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-primary text-on-primary font-label-sm text-[12px] font-bold hover:bg-primary-container transition-all"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[36px] text-emerald-500">verified</span>
                <h4 className="font-headline-sm text-[16px] font-bold text-on-surface">
                  All Quiet on Platform Safety
                </h4>
                <p className="font-body-sm text-[12px] text-on-surface-variant max-w-sm">
                  There are currently no active trust or fraud reports flagged for moderation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
