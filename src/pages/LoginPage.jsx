import React, { useState, useEffect } from 'react';
import { useRooms } from '../context/RoomContext';

export default function LoginPage({ initialPortal = 'user' }) {
  const { login, register, forgotPassword, activeTab, setActiveTab, showToast, isBackendConnected } = useRooms();

  // Top-Level Portal: 'user' | 'admin'
  const [portalType, setPortalType] = useState(() => {
    if (initialPortal === 'admin' || activeTab === 'admin-login') return 'admin';
    return 'user';
  });

  // Sync portalType if activeTab changes
  useEffect(() => {
    if (activeTab === 'admin-login') {
      setPortalType('admin');
    } else if (activeTab === 'login') {
      setPortalType('user');
    }
  }, [activeTab]);

  // General Loading & Error State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePortalChange = (newPortal) => {
    setPortalType(newPortal);
    setErrorMsg('');
    if (newPortal === 'admin') {
      if (activeTab !== 'admin-login') setActiveTab('admin-login');
    } else {
      if (activeTab !== 'login') setActiveTab('login');
    }
  };

  // User Portal Modes: 'login' | 'register'
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('tenant'); // 'tenant' | 'owner'

  // User Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // User Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Bengaluru');

  // Admin Portal State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('9021');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // ─── Handle User Login ───────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword.trim());
      if (user?.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('explore');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Handle Admin Login ──────────────────────────────────────────────────────
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setErrorMsg('Please supply admin credentials.');
      return;
    }

    if (securityPin.trim() !== '9021') {
      setErrorMsg('Invalid Security PIN. Access denied.');
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

  // ─── Handle User Registration ────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please provide your name, email, and password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim(),
        city: regCity,
        role
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Quick Demo Helpers ──────────────────────────────────────────────────────
  const handleQuickDemo = async (email, pass) => {
    setErrorMsg('');
    setLoginEmail(email);
    setLoginPassword(pass);
    setIsLoading(true);
    try {
      await login(email, pass);
      setActiveTab('explore');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
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

  // ─── Handle Forgot Password ──────────────────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsForgotSubmitting(true);
    try {
      await forgotPassword(forgotEmail.trim());
      setIsForgotModalOpen(false);
      setForgotEmail('');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-b from-surface via-surface-container-low/40 to-surface">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-3xl sm:rounded-[32px] shadow-2xl border border-surface-container-high/80 overflow-hidden flex flex-col lg:flex-row relative">
        
        {/* ─── Left Column: Visual Showcase & Security Brand Value ────────────── */}
        <div className={`lg:w-5/12 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${
          portalType === 'admin'
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-r border-slate-800'
            : 'bg-gradient-to-br from-primary via-primary-container to-secondary'
        }`}>
          {/* Subtle background ambient blur ornamentation */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          {/* Top Brand Tag & Return Link */}
          <div className="relative z-10 flex flex-col gap-3">
            <button
              onClick={() => setActiveTab('explore')}
              className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[12px] font-semibold backdrop-blur-md transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Room Finder</span>
            </button>

            <div className="flex items-center gap-3 mt-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md backdrop-blur-md ${
                portalType === 'admin'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/20'
              }`}>
                <span className="material-symbols-outlined text-[28px]">
                  {portalType === 'admin' ? 'shield_person' : 'roofing'}
                </span>
              </div>
              <div>
                <h1 className="font-headline-sm text-[26px] font-black tracking-tight leading-none text-white">
                  Room Rento
                </h1>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  portalType === 'admin' ? 'text-amber-400' : 'text-white/80'
                }`}>
                  {portalType === 'admin' ? 'Administrative Security Console' : 'Modern Urban Living'}
                </span>
              </div>
            </div>

            {portalType === 'admin' ? (
              <>
                <h2 className="font-headline-sm text-[22px] sm:text-[24px] font-extrabold text-white mt-4 leading-snug">
                  Platform Moderation & Administrative Hub
                </h2>
                <p className="font-body-sm text-[13px] text-slate-300 leading-relaxed">
                  Manage users across India, moderate listings, inspect reported properties, review audit telemetry, and maintain platform security.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-headline-sm text-[22px] sm:text-[24px] font-extrabold text-white mt-4 leading-snug">
                  Find & Rent Your Ideal Room with Zero Brokerage
                </h2>
                <p className="font-body-sm text-[13px] text-white/90 leading-relaxed">
                  Explore verified private rooms, 1BHKs, studios, and co-living spaces across all Indian cities with real photos, transparent pricing, and instant free site visits.
                </p>
              </>
            )}
          </div>

          {/* Feature Highlights List */}
          <div className="relative z-10 flex flex-col gap-3.5 my-8">
            {portalType === 'admin' ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-md flex items-center justify-center shrink-0 text-amber-400">
                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  </div>
                  <span className="font-label-md text-[13px] font-semibold text-slate-200">
                    Super Admin Rights & Global Controls
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-md flex items-center justify-center shrink-0 text-amber-400">
                    <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                  </div>
                  <span className="font-label-md text-[13px] font-semibold text-slate-200">
                    Moderate & Delete Posts, Reviews & Accounts
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-md flex items-center justify-center shrink-0 text-amber-400">
                    <span className="material-symbols-outlined text-[20px]">security</span>
                  </div>
                  <span className="font-label-md text-[13px] font-semibold text-slate-200">
                    Encrypted JWT Session & IP Telemetry Protection
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-white">verified</span>
                  </div>
                  <span className="font-label-md text-[13px] font-semibold text-white">
                    100% Verified Hosts & Real Stays
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-white">savings</span>
                  </div>
                  <span className="font-label-md text-[13px] font-semibold text-white">
                    Zero Brokerage on Every Property
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-white">map</span>
                  </div>
                  <span className="font-label-md text-[13px] font-semibold text-white">
                    Pan-India Rooms: Bengaluru, Delhi, Mumbai & More
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bottom Portal Switch Helper */}
          <div className="relative z-10 pt-4 border-t border-white/20 flex flex-col gap-2">
            <div className="flex items-center justify-between text-white/85 text-[12px]">
              <span>{portalType === 'admin' ? 'Looking for standard User login?' : 'Are you a platform administrator?'}</span>
              <button
                type="button"
                onClick={() => handlePortalChange(portalType === 'admin' ? 'user' : 'admin')}
                className={`font-bold underline transition-colors flex items-center gap-1 ${
                  portalType === 'admin' ? 'text-amber-400 hover:text-amber-300' : 'text-white hover:text-white/80'
                }`}
              >
                <span>{portalType === 'admin' ? 'Switch to User Login' : 'Admin Portal'}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Interactive Unified Authentication Center ───────── */}
        <div className="lg:w-7/12 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Live Server Indicator & Portal Header */}
            <div className="flex items-center justify-between max-w-md mx-auto mb-3 px-1">
              <span className="font-label-sm text-[11px] font-bold text-outline uppercase tracking-wider">
                Select Sign In Portal
              </span>
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-surface-container-high text-[11px] font-semibold text-on-surface-variant shadow-xs"
                title={isBackendConnected ? 'Connected to live MongoDB API backend (port 5000)' : 'API connecting'}
              >
                <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={isBackendConnected ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  {isBackendConnected ? 'Live Backend API' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Primary Unified Portal Switcher: User & Host Login vs Admin Security Login */}
            <div className="flex items-center p-1.5 bg-surface-container rounded-2xl mb-6 border border-surface-container-high/60 max-w-md mx-auto shadow-xs">
              <button
                type="button"
                onClick={() => handlePortalChange('user')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-label-md text-[13px] font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  portalType === 'user'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">group</span>
                <span>User & Host Login</span>
              </button>
              <button
                type="button"
                onClick={() => handlePortalChange('admin')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-label-md text-[13px] font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  portalType === 'admin'
                    ? 'bg-slate-900 text-amber-400 shadow-sm border border-amber-500/30'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                <span>Admin Login</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error font-body-sm text-[12px] flex items-center gap-2.5 animate-fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span className="flex-1 font-medium">{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="text-error/70 hover:text-error shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ─── TAB 1: USER & HOST LOGIN PORTAL ────────────────────────────── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {portalType === 'user' && (
              <div>
                {/* User Sub-Mode Switcher: Sign In vs Create Account */}
                <div className="flex items-center p-1 bg-surface-container-low rounded-xl mb-5 border border-surface-container-high/40 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-label-sm text-[12px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                      mode === 'login'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-label-sm text-[12px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                      mode === 'register'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Register</span>
                  </button>
                </div>

                {mode === 'login' ? (
                  /* ─── User Sign In Form ────────────────────────────────────────── */
                  <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
                    <div>
                      <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined text-outline absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                          mail
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-label-sm text-[12px] font-bold text-on-surface">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          className="font-label-sm text-[11px] text-primary hover:underline font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined text-outline absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                          lock
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary/40"
                        />
                        <span className="font-body-sm text-[12px] text-on-surface-variant font-medium">
                          Remember me on this browser
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">lock_open</span>
                          <span>Sign In to Account</span>
                        </>
                      )}
                    </button>

                    {/* Quick 1-Click Fast Demo Logins */}
                    <div className="mt-4 pt-3.5 border-t border-surface-container-high/60">
                      <span className="font-label-sm text-[10px] font-extrabold uppercase tracking-wider text-outline block mb-2 text-center">
                        ⚡ Quick 1-Click Demo Profiles
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickDemo('arjun.mehta@techcorp.in', 'Password123!')}
                          className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-left flex items-center gap-2.5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">person</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-label-sm text-[12px] font-bold text-on-surface truncate">
                              Arjun Mehta
                            </h4>
                            <span className="font-body-sm text-[10px] text-on-surface-variant block truncate">
                              Tenant / Resident
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickDemo('priya.sharma@host.in', 'Password123!')}
                          className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-left flex items-center gap-2.5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">villa</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-label-sm text-[12px] font-bold text-on-surface truncate">
                              Priya Sharma
                            </h4>
                            <span className="font-body-sm text-[10px] text-on-surface-variant block truncate">
                              Host / Property Owner
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* ─── User Create Account Form ──────────────────────────────────── */
                  <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5 max-w-md mx-auto">
                    {/* Role Switcher */}
                    <div>
                      <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                        I am registering as:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('tenant')}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            role === 'tenant'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-surface-container-high text-on-surface-variant hover:border-outline'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">person</span>
                          <span className="font-label-sm text-[12px] font-bold">Tenant / Renter</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('owner')}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            role === 'owner'
                              ? 'border-secondary bg-secondary/5 text-secondary'
                              : 'border-surface-container-high text-on-surface-variant hover:border-outline'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">villa</span>
                          <span className="font-label-sm text-[12px] font-bold">Property Host</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Verma"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                          Password (min 6)
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                        Primary City in India
                      </label>
                      <select
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Jaipur">Jaipur</option>
                        <option value="Goa">Goa</option>
                        <option value="Other">Other City</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">verified_user</span>
                          <span>Create Free Account</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ─── TAB 2: ADMIN SECURITY CONSOLE LOGIN ────────────────────────── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {portalType === 'admin' && (
              <div className="flex flex-col gap-4 max-w-md mx-auto animate-fade-in">
                {/* Security Warning Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-[12px] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-500 shrink-0 mt-0.5">
                    shield
                  </span>
                  <span className="leading-relaxed">
                    <strong>Administrative Clearance Required:</strong> Access is restricted to authorized platform administrators. Moderation actions and deletions are tracked and audited.
                  </span>
                </div>

                <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1.5">
                      Admin Email Identifier
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined text-outline absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                        admin_panel_settings
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="admin@roomrento.in"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1.5">
                      Master Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined text-outline absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                        key
                      </span>
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showAdminPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-label-sm text-[12px] font-bold text-on-surface">
                        Security PIN Code
                      </label>
                      <span className="font-label-sm text-[10px] text-outline">Default: 9021</span>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined text-outline absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                        pin
                      </span>
                      <input
                        type="password"
                        required
                        maxLength={6}
                        placeholder="••••"
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm tracking-widest focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 rounded-xl bg-slate-900 text-amber-400 border border-amber-500/40 hover:bg-slate-800 font-label-md text-sm font-extrabold shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                        <span>Validating Admin Session...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                        <span>Authenticate to Admin Console</span>
                      </>
                    )}
                  </button>

                  {/* 1-Click Fast Super Admin Demo Button */}
                  <div className="mt-2 pt-3 border-t border-surface-container-high/60">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={autofillSuperAdmin}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-400 font-label-sm text-[12px] font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                      <span>⚡ 1-Click Fast Super Admin Login</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Security Footer */}
          <div className="mt-8 pt-4 border-t border-surface-container-high/50 text-center">
            <p className="font-body-sm text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
              <span>Protected by 256-bit encryption. Room Rento ensures zero data sharing with third parties.</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Forgot Password Modal ────────────────────────────────────────────── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[24px]">lock_reset</span>
                <h3 className="font-headline-sm text-[18px] font-extrabold text-on-surface">
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              Enter your registered email address and we'll send a password recovery reset token to your inbox.
            </p>

            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isForgotSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold shadow-sm hover:bg-primary-container disabled:opacity-50"
                >
                  {isForgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
