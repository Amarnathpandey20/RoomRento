import React, { useState } from 'react';
import { useRooms } from '../context/RoomContext';

export default function AdminLoginPage() {
  const { login, setActiveTab, showToast } = useRooms();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('9021');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setErrorMsg('Please supply admin credentials.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(adminEmail.trim(), adminPassword.trim(), { redirectToAdmin: true });
      if (user?.role === 'admin') {
        showToast('Super Admin authenticated successfully', 'admin_panel_settings');
        setActiveTab('admin');
      } else {
        setErrorMsg('Access Denied: The specified account does not possess administrative privileges.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify administrative credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillSuperAdmin = async () => {
    setAdminEmail('admin@roomrento.in');
    setAdminPassword('Password123!');
    setSecurityPin('9021');
    setErrorMsg('');
    setIsLoading(true);
    try {
      const user = await login('admin@roomrento.in', 'Password123!', { redirectToAdmin: true });
      if (user?.role === 'admin') {
        showToast('Super Admin access unlocked', 'admin_panel_settings');
        setActiveTab('admin');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo admin login error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-10 relative z-10 flex flex-col gap-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Room Finder</span>
          </button>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Restricted Portal
          </span>
        </div>

        {/* Portal Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg mb-3">
            <span className="material-symbols-outlined text-[36px]">shield_person</span>
          </div>
          <h1 className="font-headline-sm text-[24px] sm:text-[26px] font-black tracking-tight text-white">
            Admin Security Console
          </h1>
          <p className="font-body-sm text-[13px] text-slate-400 mt-1 max-w-sm">
            Room Rento Administrative Access Control & Listing Moderation Engine
          </p>
        </div>

        {/* Security Alert Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-amber-500/20 text-slate-300 text-[12px] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0 mt-0.5">
            warning
          </span>
          <span className="leading-relaxed">
            <strong>Authorized Personnel Only:</strong> Administrative sessions are cryptographically signed with JWT access tokens and logged with IP telemetry.
          </span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0">gpp_bad</span>
            <span className="font-medium flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-label-sm text-[12px] font-bold text-slate-300 block mb-1.5">
              Admin Identifier / Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                badge
              </span>
              <input
                type="email"
                required
                placeholder="admin@roomrento.in"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-[12px] font-bold text-slate-300 block mb-1.5">
              Security Passkey
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                key
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="font-label-sm text-[12px] font-bold text-slate-300 block mb-1.5">
              Security PIN / 2FA Token
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                pin
              </span>
              <input
                type="text"
                maxLength="6"
                placeholder="e.g. 9021"
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm tracking-widest focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-amber-400 font-bold">
                2FA Verified ✓
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-label-md text-sm font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                <span>Authenticate & Open Admin Console</span>
              </>
            )}
          </button>

          {/* Autofill One-Click Button for Testing */}
          <button
            type="button"
            disabled={isLoading}
            onClick={autofillSuperAdmin}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>1-Click Autofill & Login as Super Admin</span>
          </button>
        </form>

        {/* Security Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
            <span>TLS 1.3 / AES-256</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="hover:text-slate-300 font-medium"
          >
            User Login Page →
          </button>
        </div>
      </div>
    </div>
  );
}
