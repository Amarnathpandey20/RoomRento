import React, { useState, useRef, useEffect } from 'react';
import { useRooms } from '../../context/RoomContext';
import { CITIES, detectCityFromCoords } from '../../data/citiesData';

export default function Navbar() {
  const { 
    activeTab, 
    setActiveTab, 
    selectedCity,
    setSelectedCity,
    selectedLocality, 
    setSelectedLocality,
    customLocations,
    addCustomLocation,
    setUserLocation,
    showToast,
    user,
    wishlist,
    compareList,
    setIsAddRoomModalOpen,
    setIsAuthModalOpen,
    isBackendConnected,
    isLoggedIn
  } = useRooms();

  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [navCustomLocInput, setNavCustomLocInput] = useState('');
  const [isNavLocating, setIsNavLocating] = useState(false);
  const locationMenuRef = useRef(null);

  const [isSignInMenuOpen, setIsSignInMenuOpen] = useState(false);
  const signInMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target)) {
        setIsLocationMenuOpen(false);
      }
      if (signInMenuRef.current && !signInMenuRef.current.contains(e.target)) {
        setIsSignInMenuOpen(false);
      }
    };
    if (isLocationMenuOpen || isSignInMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isLocationMenuOpen, isSignInMenuOpen]);

  const isDetailView = activeTab === 'details';

  const selectCity = (cityId, cityName) => {
    setSelectedCity(cityId);
    setSelectedLocality('All');
    setIsLocationMenuOpen(false);
    showToast(`City switched to ${cityName}`, 'location_on');
  };

  const selectLocality = (cityId, loc) => {
    setSelectedCity(cityId);
    setSelectedLocality(loc);
    setIsLocationMenuOpen(false);
    showToast(`Filtered for ${loc}, ${cityId}`, 'location_on');
  };

  const handleNavDetectGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setIsNavLocating(true);
    showToast('Locating your current GPS coordinates...', 'near_me');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(4000) }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const detectedArea = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || addr.road || 'Current Area';
            const detectedCity = addr.city || addr.state_district || addr.town || addr.state || 'Bengaluru';

            setUserLocation(detectedArea, detectedCity, { lat: latitude, lng: longitude });
            addCustomLocation(detectedArea);
            setIsLocationMenuOpen(false);
            showToast(`Location set to ${detectedArea}, ${detectedCity}`, 'check_circle');
          } else {
            fallbackNavGPS(latitude, longitude);
          }
        } catch (err) {
          fallbackNavGPS(latitude, longitude);
        } finally {
          setIsNavLocating(false);
        }
      },
      (err) => {
        setIsNavLocating(false);
        showToast(`Could not access GPS: ${err.message}. Please type your location.`, 'warning');
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const fallbackNavGPS = (lat, lng) => {
    const matchedCity = detectCityFromCoords(lat, lng);
    setUserLocation('Near Me', matchedCity, { lat, lng });
    addCustomLocation('Near Me');
    setIsLocationMenuOpen(false);
    showToast(`Location set near ${matchedCity}`, 'my_location');
  };

  const handleNavAddCustomLocation = (e) => {
    e.preventDefault();
    const trimmed = navCustomLocInput.trim();
    if (!trimmed) return;
    addCustomLocation(trimmed);
    setSelectedLocality(trimmed);
    setNavCustomLocInput('');
    setIsLocationMenuOpen(false);
    showToast(`Custom location "${trimmed}" set`, 'add_location');
  };

  const navLinks = [
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { 
      id: 'compare', 
      label: 'Compare', 
      icon: 'compare_arrows', 
      badge: compareList.length > 0 ? compareList.length : null,
      badgeColor: 'bg-primary text-on-primary'
    },
    { 
      id: 'saved', 
      label: 'Saved', 
      icon: 'favorite', 
      badge: wishlist.length > 0 ? wishlist.length : null,
      badgeColor: 'bg-secondary text-on-secondary'
    },
    { id: 'enquiries', label: 'Enquiries', icon: 'chat_bubble_outline' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Locality Selector */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {isDetailView ? (
            <div className="flex items-center gap-2">
              <button 
                aria-label="Back to explore"
                onClick={() => setActiveTab('explore')}
                className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-on-surface hover:text-primary hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
              <div>
                <span className="font-label-sm text-[11px] text-primary font-bold uppercase tracking-wider block">
                  Property Preview
                </span>
                <h1 className="font-headline-sm text-[18px] text-on-surface font-extrabold truncate leading-tight">
                  Room Details
                </h1>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              <div 
                onClick={() => setActiveTab('explore')}
                className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">roofing</span>
                </div>
                <div className="flex flex-col shrink-0">
                  <span className="font-headline-sm text-[18px] sm:text-[20px] text-primary tracking-tight font-extrabold leading-none">
                    Room Rento
                  </span>
                  <span className="font-label-sm text-[9px] sm:text-[10px] text-on-surface-variant font-medium tracking-wide">
                    URBAN LIVING
                  </span>
                </div>
              </div>

              {/* City & Locality Selector Dropdown Pill */}
              <div className="hidden sm:flex items-center pl-2.5 sm:pl-3.5 border-l border-surface-container-high relative shrink-0" ref={locationMenuRef}>
                <button 
                  onClick={() => setIsLocationMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-all text-left group whitespace-nowrap shrink-0"
                  title="Click to select city or locality"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">location_on</span>
                  <span className="font-label-sm text-xs sm:text-label-sm font-semibold truncate max-w-[110px] sm:max-w-[140px]">
                    {selectedLocality !== 'All'
                      ? `${selectedLocality}`
                      : selectedCity !== 'All'
                      ? `${selectedCity}`
                      : 'All India'}
                  </span>
                  <span className={`material-symbols-outlined text-[15px] text-outline group-hover:text-primary transition-transform shrink-0 ${isLocationMenuOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>

                {/* Popover Dropdown */}
                {isLocationMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high/90 p-3.5 z-50 animate-fade-in flex flex-col gap-3">
                    
                    {/* Auto-detect GPS button */}
                    <button
                      type="button"
                      onClick={handleNavDetectGPS}
                      disabled={isNavLocating}
                      className="w-full py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-label-md text-xs font-bold flex items-center justify-center gap-2 border border-primary/20 transition-all hover:shadow-xs active:scale-98"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isNavLocating ? 'animate-spin' : ''}`}>
                        {isNavLocating ? 'progress_activity' : 'near_me'}
                      </span>
                      <span>{isNavLocating ? 'Locating Your Device...' : 'Use My Current Location'}</span>
                    </button>

                    {/* Custom Location Adder */}
                    <form onSubmit={handleNavAddCustomLocation} className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                          add_location_alt
                        </span>
                        <input
                          type="text"
                          value={navCustomLocInput}
                          onChange={(e) => setNavCustomLocInput(e.target.value)}
                          placeholder="Type your area or colony..."
                          className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-surface-container text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!navCustomLocInput.trim()}
                        className="px-2.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shrink-0"
                      >
                        Set
                      </button>
                    </form>

                    {/* Custom / Saved Locations */}
                    {Array.isArray(customLocations) && customLocations.length > 0 && (
                      <div>
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold block mb-1">
                          Your Custom Locations
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto no-scrollbar">
                          {customLocations.map((loc) => {
                            const isLocActive = selectedLocality === loc;
                            return (
                              <button
                                key={loc}
                                onClick={() => {
                                  setSelectedLocality(loc);
                                  setIsLocationMenuOpen(false);
                                  showToast(`Filtered for ${loc}`, 'location_on');
                                }}
                                className={`px-2 py-0.5 rounded-lg font-label-sm text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                  isLocActive
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                              >
                                <span>{loc}</span>
                                {isLocActive && <span className="material-symbols-outlined text-[12px]">check</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Major Cities */}
                    <div>
                      <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold block mb-1.5">
                        Select City
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {CITIES.map((c) => {
                          const isCityActive = selectedCity === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => selectCity(c.id, c.name)}
                              className={`px-2.5 py-1.5 rounded-xl font-label-sm text-[12px] font-semibold text-left flex items-center justify-between transition-colors ${
                                isCityActive
                                  ? 'bg-primary text-on-primary shadow-xs'
                                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                              }`}
                            >
                              <span className="truncate">{c.name}</span>
                              {isCityActive && <span className="material-symbols-outlined text-[14px] shrink-0">check</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Localities for currently active city */}
                    {selectedCity !== 'All' && (
                      <div className="pt-2 border-t border-surface-container-high/60">
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold block mb-1.5">
                          {selectedCity} Localities
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto no-scrollbar">
                          <button
                            onClick={() => {
                              setSelectedLocality('All');
                              setIsLocationMenuOpen(false);
                              showToast(`Showing all localities in ${selectedCity}`, 'location_on');
                            }}
                            className={`px-2.5 py-1 rounded-lg font-label-sm text-[11px] font-medium transition-colors ${
                              selectedLocality === 'All'
                                ? 'bg-primary/20 text-primary font-bold'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            All {selectedCity}
                          </button>
                          {(CITIES.find((c) => c.id === selectedCity)?.localities || []).map((loc) => {
                            const isLocActive = selectedLocality === loc;
                            return (
                              <button
                                key={loc}
                                onClick={() => selectLocality(selectedCity, loc)}
                                className={`px-2.5 py-1 rounded-lg font-label-sm text-[11px] font-medium transition-colors ${
                                  isLocActive
                                    ? 'bg-primary text-on-primary font-bold'
                                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                              >
                                {loc}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Tabs (Visible on lg and larger screens with ample space) */}
        {!isDetailView && (
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-surface-container-high/40 shrink-0 whitespace-nowrap">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-xs sm:text-[13px] font-semibold transition-all relative whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className={`px-1.5 min-w-[16px] h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Actions, Notification & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Post a Room */}
          <button 
            onClick={() => {
              if (!isLoggedIn) {
                showToast('Please sign in to list your property', 'lock');
                setActiveTab('login');
                return;
              }
              setIsAddRoomModalOpen(true);
            }}
            className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-primary font-label-sm text-xs font-bold hover:bg-surface-container transition-all whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_home</span>
            <span>Post Room</span>
          </button>

          {/* Notification Bell */}
          <button 
            aria-label="Notifications"
            onClick={() => showToast('You have 2 new property matches in Koramangala!', 'notifications')}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all relative shrink-0"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface"></span>
          </button>

          {/* Unified Sign In Button (Combines Sign In, Live API Status, and Admin Portal) */}
          {!isLoggedIn ? (
            <div className="relative shrink-0" ref={signInMenuRef}>
              <div className="flex items-center rounded-full bg-primary text-on-primary shadow-xs hover:shadow-md transition-all">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 font-label-sm text-[12px] font-bold hover:bg-primary-container/20 rounded-l-full transition-colors whitespace-nowrap"
                  title={isBackendConnected ? 'Live Backend Connected • Click to Sign In' : 'Backend Ready • Click to Sign In'}
                >
                  {/* Live status dot embedded directly inside Sign In */}
                  <span 
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isBackendConnected 
                        ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]' 
                        : 'bg-amber-400'
                    }`} 
                  />
                  <span>Sign In</span>
                </button>
                
                {/* Admin & Options dropdown caret */}
                <button
                  type="button"
                  onClick={() => setIsSignInMenuOpen((prev) => !prev)}
                  aria-label="Sign in and admin portal options"
                  title="Sign in options: User Login, Admin Portal, Server Status"
                  className="pr-2.5 pl-1 py-1.5 hover:bg-primary-container/30 rounded-r-full transition-colors flex items-center border-l border-white/20"
                >
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isSignInMenuOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
              </div>

              {/* Unified Sign In & Admin Portal Popover */}
              {isSignInMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high/90 p-2 z-50 animate-fade-in flex flex-col gap-1">
                  {/* User & Tenant Login */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setIsSignInMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-surface-container text-left transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <span className="font-label-md text-[13px] font-bold text-on-surface block leading-tight">
                        User Sign In
                      </span>
                      <span className="font-label-sm text-[11px] text-on-surface-variant block">
                        Tenants, seekers & room hosts
                      </span>
                    </div>
                  </button>

                  {/* Admin Portal Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin-login');
                      setIsSignInMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-amber-500/10 text-left transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">shield_person</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md text-[13px] font-bold text-on-surface leading-tight">
                          Admin Portal
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 font-extrabold uppercase">
                          Staff
                        </span>
                      </div>
                      <span className="font-label-sm text-[11px] text-on-surface-variant block">
                        Moderate listings & reviews
                      </span>
                    </div>
                  </button>

                  {/* Live Backend Telemetry Status */}
                  <div className="mt-1 pt-1.5 border-t border-surface-container-high/60 px-2.5 py-1.5 flex items-center justify-between text-[11px] font-medium text-on-surface-variant bg-surface-container-low/50 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span>API Server:</span>
                    </div>
                    <span className={`font-bold ${isBackendConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isBackendConnected ? 'Live • Connected' : 'Ready'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged in User Profile Pill with embedded Live Status and Admin access */
            <div className="relative shrink-0" ref={signInMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (user?.role === 'admin') {
                    setIsSignInMenuOpen((prev) => !prev);
                  } else {
                    setActiveTab('account');
                  }
                }}
                aria-label="Profile Account"
                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all shrink-0 ${
                  activeTab === 'account' || activeTab === 'admin'
                    ? user?.role === 'admin'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700'
                      : 'border-primary bg-primary/5 text-primary'
                    : 'border-surface-container-high hover:border-primary/40 bg-surface-container-lowest'
                }`}
                title={user?.role === 'admin' ? 'Administrator • Click for Admin Console' : `${user?.name} • Account`}
              >
                <div className="relative shrink-0">
                  <img 
                    alt={user?.name || 'User'} 
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-primary/20 shrink-0" 
                  />
                  {/* Live status dot on avatar */}
                  <span 
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${
                      isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} 
                  />
                </div>
                <div className="flex flex-col text-left leading-none shrink-0">
                  <span className="font-label-sm text-xs sm:text-label-sm font-bold text-on-surface hidden sm:inline max-w-[80px] truncate">
                    {String(user?.name || 'User').split(' ')[0]}
                  </span>
                  <span className={`text-[9px] font-semibold hidden sm:inline capitalize ${
                    user?.role === 'admin' ? 'text-amber-600 font-extrabold' : 'text-primary'
                  }`}>
                    {user?.role === 'admin' ? 'Super Admin' : (user?.role || 'tenant')}
                  </span>
                </div>
                {user?.role === 'admin' && (
                  <span className="material-symbols-outlined text-[16px] text-amber-600 ml-0.5">
                    shield_person
                  </span>
                )}
              </button>

              {/* Popover Menu for logged-in Admin */}
              {isSignInMenuOpen && user?.role === 'admin' && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high/90 p-2 z-50 animate-fade-in flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin');
                      setIsSignInMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-amber-500/10 text-left transition-colors font-label-md text-[13px] font-bold text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px] text-amber-600">admin_panel_settings</span>
                    <span>Admin Management Console</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('account');
                      setIsSignInMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-surface-container text-left transition-colors font-label-md text-[13px] font-semibold text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                    <span>My Profile & Settings</span>
                  </button>
                  <div className="mt-1 pt-1.5 border-t border-surface-container-high/60 px-2 py-1 flex items-center justify-between text-[11px] font-medium text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      Backend:
                    </span>
                    <span className="text-emerald-600 font-bold">Live</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
