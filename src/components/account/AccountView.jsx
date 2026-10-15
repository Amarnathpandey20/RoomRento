import React from 'react';
import { useRooms } from '../../context/RoomContext';

const MENU_SECTIONS = [
  {
    title: 'Property & Listings',
    items: [
      { icon: 'add_home', label: 'List Your Property', desc: 'Earn income from vacant rooms', color: 'text-primary' },
      { icon: 'history', label: 'Recently Viewed', desc: '14 properties viewed this week', color: 'text-primary' },
    ]
  },
  {
    title: 'Settings & Support',
    items: [
      { icon: 'notifications', label: 'Alert Preferences', desc: 'New match, price drop notifications', color: 'text-secondary' },
      { icon: 'security', label: 'Privacy & Data', desc: 'Manage your data and permissions', color: 'text-secondary' },
      { icon: 'headset_mic', label: 'Help & Support', desc: '24x7 tenant assistance portal', color: 'text-outline' },
    ]
  }
];

export default function AccountView() {
  const { 
    user, 
    scheduledVisits, 
    wishlist, 
    compareList, 
    setActiveTab, 
    viewRoomDetails, 
    showToast,
    setIsAddRoomModalOpen,
    setIsAuthModalOpen,
    logout,
    isLoggedIn
  } = useRooms();

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto gap-6 animate-fade-in">
      {/* Profile Header Card */}
      <div className="relative p-5 sm:p-6 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-surface-container-lowest to-surface-container-low border border-primary/20 shadow-sm">
        {/* Decorative circle */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/5 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-primary/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[14px]">
                  {isLoggedIn ? 'verified' : 'person'}
                </span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                  {isLoggedIn ? user.name : 'Welcome, Guest Explorer'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${
                  !isLoggedIn
                    ? 'bg-surface-container-high text-on-surface-variant'
                    : user.role === 'admin'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : user.role === 'owner'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {!isLoggedIn
                    ? 'Guest Mode'
                    : user.role === 'admin'
                    ? 'Super Administrator'
                    : user.role === 'owner'
                    ? 'Verified Host ✓'
                    : 'Tenant Verified ✓'}
                </span>
              </div>
              <p className="font-body-sm text-[13px] text-on-surface-variant mt-0.5">
                {isLoggedIn ? user.email : 'Sign in to schedule property visits, message hosts, or post reviews'}
              </p>
              {isLoggedIn && user.phone && (
                <p className="font-body-sm text-[13px] text-on-surface-variant">
                  {user.phone}
                </p>
              )}
              {isLoggedIn && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                  <span className="font-label-sm text-[11px] text-secondary font-semibold">
                    City: {user.city || user.targetLocality || 'Bengaluru'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start flex-wrap">
            {user?.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('admin')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-label-md text-[13px] font-extrabold hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">shield_person</span>
                Admin Console
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('admin-login')}
                className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                title="Login as System Administrator"
              >
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                Admin Portal
              </button>
            )}

            {!isLoggedIn ? (
              <button
                onClick={() => setActiveTab('login')}
                className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3.5 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-[13px] font-semibold hover:bg-surface-container-high transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">switch_account</span>
                Switch Account
              </button>
            )}

            <button
              onClick={() => {
                if (!isLoggedIn) {
                  showToast('Please sign in to post a property listing', 'lock');
                  setActiveTab('login');
                  return;
                }
                setIsAddRoomModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-[13px] font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_home</span>
              Post Room
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Saved Stays', value: wishlist.length, icon: 'favorite', color: 'text-secondary', bg: 'bg-secondary/10', tab: 'saved' },
          { label: 'Compare Tray', value: compareList.length, icon: 'compare_arrows', color: 'text-primary', bg: 'bg-primary/10', tab: 'compare' },
          { label: 'Visits Booked', value: scheduledVisits.length, icon: 'event_available', color: 'text-tertiary', bg: 'bg-tertiary/10', tab: null },
        ].map(({ label, value, icon, color, bg, tab }) => (
          <div
            key={label}
            onClick={() => tab && setActiveTab(tab)}
            className={`p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 text-center shadow-xs transition-all ${tab ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center mx-auto mb-2`}>
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <span className={`font-headline-sm text-[22px] font-extrabold block ${color}`}>
              {value}
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Upcoming Visits */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-[17px] text-on-surface font-bold">
            Upcoming Free Visits
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold">
            {scheduledVisits.length} Scheduled
          </span>
        </div>

        {scheduledVisits.length > 0 ? (
          <div className="flex flex-col gap-3">
            {scheduledVisits.map((visit) => (
              <div
                key={visit.id}
                className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[22px]">calendar_today</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[10px] font-bold mb-1">
                      <span className="material-symbols-outlined text-[11px]">fiber_manual_record</span>
                      {visit.status}
                    </span>
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface leading-tight">
                      {visit.propertyTitle}
                    </h4>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                      {visit.date} • {visit.time}
                    </p>
                    <p className="font-body-sm text-[11px] text-outline mt-0.5">
                      Host: {visit.hostName} · {visit.hostPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewRoomDetails(visit.propertyId)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-[12px] font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    View Room
                  </button>
                  <button
                    onClick={() => showToast(`Contacting host ${visit.hostName}...`, 'call')}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-[12px] font-semibold hover:bg-primary-container transition-colors"
                  >
                    Call Host
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-container-low text-center text-on-surface-variant font-body-sm flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-outline">event_busy</span>
            <span>No visits scheduled yet. Tap <strong>"Schedule Free Visit"</strong> on any room details page!</span>
          </div>
        )}
      </div>

      {/* Menu Sections */}
      {MENU_SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <h4 className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-bold px-1">
            {section.title}
          </h4>
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/40 shadow-xs divide-y divide-surface-container-high/40 overflow-hidden">
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={() => showToast(`Opening ${item.label}...`, item.icon)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-container-low transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center ${item.color} shrink-0`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-[13px] font-semibold text-on-surface">{item.label}</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant truncate">{item.desc}</p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline shrink-0">chevron_right</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Admin Quick Entry */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          </div>
          <div>
            <h4 className="font-label-md text-[13px] font-bold text-white">Platform Administration</h4>
            <p className="font-body-sm text-[11px] text-slate-400">Moderation, stats & user security</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab(user?.role === 'admin' ? 'admin' : 'admin-login')}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-label-sm text-[12px] font-bold hover:bg-amber-400 transition-colors"
        >
          {user?.role === 'admin' ? 'Open Console' : 'Admin Login'}
        </button>
      </div>

      {/* Logout / Login Footer Action */}
      {isLoggedIn ? (
        <button
          onClick={async () => {
            await logout();
          }}
          className="w-full py-3 rounded-xl bg-error/10 text-error font-label-md text-label-md font-semibold hover:bg-error/15 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out of Account
        </button>
      ) : (
        <button
          onClick={() => setActiveTab('login')}
          className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          Sign In to Access All Features
        </button>
      )}
    </div>
  );
}
