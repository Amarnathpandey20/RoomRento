import React, { useState } from 'react';
import { useRooms } from '../../context/RoomContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, user, logout } = useRooms();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = async (targetEmail) => {
    setIsSubmitting(true);
    try {
      await login(targetEmail, 'Password123!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAuthModalOpen(false);
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container-high/80 overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high/60 flex items-center justify-between shrink-0 bg-surface-container-lowest">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-[17px] font-extrabold text-on-surface leading-tight">
                Account & Authentication
              </h2>
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                Logged in: <strong className="text-primary">{user.name}</strong> ({user.role || 'tenant'})
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Quick Demo Switcher */}
          <div>
            <label className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
              Quick One-Click Demo Logins
            </label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => quickLogin('arjun.mehta@techcorp.in')}
                className="p-3 rounded-2xl bg-surface-container border border-surface-container-high hover:border-primary/40 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                  <div>
                    <h4 className="font-label-md text-[13px] font-bold text-on-surface">Arjun Mehta (Tenant)</h4>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">arjun.mehta@techcorp.in</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-primary group-hover:underline">Login →</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => quickLogin('priya.sharma@host.in')}
                className="p-3 rounded-2xl bg-surface-container border border-surface-container-high hover:border-primary/40 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">villa</span>
                  <div>
                    <h4 className="font-label-md text-[13px] font-bold text-on-surface">Priya Sharma (Host / Owner)</h4>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">priya.sharma@host.in</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-secondary group-hover:underline">Login →</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => quickLogin('admin@roomrento.in')}
                className="p-3 rounded-2xl bg-surface-container border border-surface-container-high hover:border-primary/40 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">admin_panel_settings</span>
                  <div>
                    <h4 className="font-label-md text-[13px] font-bold text-on-surface">Super Admin</h4>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">admin@roomrento.in</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-tertiary group-hover:underline">Login →</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-surface-container-high"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-outline uppercase tracking-wider">or custom login</span>
            <div className="flex-grow border-t border-surface-container-high"></div>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full mt-2 py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating with Backend...' : 'Sign In with JWT'}
            </button>
          </form>

          {/* Quick links to full pages */}
          <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                setActiveTab('login');
              }}
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>Full Login & Register Page</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                setActiveTab('admin-login');
              }}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Admin Portal</span>
              <span className="material-symbols-outlined text-[14px]">security</span>
            </button>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 rounded-xl text-on-surface-variant hover:text-error text-xs font-semibold hover:bg-error/5 transition-all text-center"
          >
            Log Out Current Account
          </button>
        </div>
      </div>
    </div>
  );
}
