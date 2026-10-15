import React, { useState, useRef, useEffect } from 'react';
import { useRooms } from '../../context/RoomContext';
import { CITIES } from '../../data/citiesData';

export default function SearchBar() {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCity,
    setSelectedCity,
    selectedLocality,
    setSelectedLocality,
    customLocations,
    addCustomLocation,
    setUserLocation,
    filteredRooms,
    setIsFilterOpen, 
    activeFiltersCount, 
    showToast,
    filters 
  } = useRooms();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const locationRef = useRef(null);

  // Close location menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setIsLocationOpen(false);
      }
    };
    if (isLocationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocationOpen]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const count = filteredRooms.length;
    showToast(
      searchQuery.trim()
        ? `Found ${count} room(s) matching "${searchQuery}"`
        : `Showing all ${count} room(s) in ${selectedCity !== 'All' ? selectedCity : 'India'}`,
      'search'
    );
  };

  // Real GPS Geolocation Detection
  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }

    setIsLocating(true);
    showToast('Detecting your GPS location...', 'my_location');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          const data = await res.json();

          const detectedLoc = data.address?.suburb || 
            data.address?.neighbourhood || 
            data.address?.residential || 
            data.address?.road || 
            '';

          const detectedCity = data.address?.city || 
            data.address?.state_district || 
            data.address?.town || 
            data.address?.state || 
            'Bengaluru';

          const finalLoc = detectedLoc || 'Nearby Stays';

          addCustomLocation(finalLoc, detectedCity);
          showToast(`Location detected: ${finalLoc}, ${detectedCity}! 🎯`, 'my_location');
          setIsLocationOpen(false);
        } catch (err) {
          // Robust fallback: set custom location label
          addCustomLocation('My Current GPS Area', 'Bengaluru');
          showToast('GPS coordinates locked to current area', 'my_location');
          setIsLocationOpen(false);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        showToast('Location permission denied or unavailable. Please type your location.', 'location_off');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle adding custom user location
  const handleAddCustom = (e) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;
    addCustomLocation(customInput.trim());
    setCustomInput('');
    setIsLocationOpen(false);
  };

  const currentLocationLabel = selectedLocality !== 'All'
    ? `${selectedLocality}`
    : selectedCity !== 'All'
    ? `${selectedCity}`
    : 'All India';

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-sm border border-surface-container-high/60 hover:border-primary/40 hover:shadow-md transition-all p-2 sm:p-2.5">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2.5">
        
        {/* ─── Location Selector & Adder Pill ───────────────────────────────── */}
        <div className="relative shrink-0" ref={locationRef}>
          <button
            type="button"
            onClick={() => setIsLocationOpen((prev) => !prev)}
            className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[13px] font-bold transition-all border border-surface-container-high/60 shadow-2xs"
            title="Set your location or detect current GPS"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                location_on
              </span>
              <span className="truncate max-w-[140px] sm:max-w-[160px]">
                {currentLocationLabel}
              </span>
            </div>
            <span className={`material-symbols-outlined text-[16px] text-outline transition-transform shrink-0 ${isLocationOpen ? 'rotate-180' : ''}`}>
              arrow_drop_down
            </span>
          </button>

          {/* ─── Location Picker & Custom Adder Popover ───────────────────────── */}
          {isLocationOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-container-high/80 p-4 z-50 animate-scale-up flex flex-col gap-3.5">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px] text-primary">pin_drop</span>
                  <h4 className="font-headline-sm text-[15px] font-extrabold text-on-surface">
                    Set Your Location
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationOpen(false)}
                  className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {/* 1-Click GPS Detection Button */}
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="w-full py-2.5 px-3.5 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/25 text-primary font-label-md text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
              >
                {isLocating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                    <span>Locating coordinates...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                    <span>Use My Current GPS Location</span>
                  </>
                )}
              </button>

              {/* Add Custom Location Input Form */}
              <div>
                <label className="font-label-sm text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
                  Add Any Custom Locality or City
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined text-outline text-[16px] absolute left-3 top-1/2 -translate-y-1/2">
                      add_location_alt
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Whitefield, Bandra, HSR Layout..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustom();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    disabled={!customInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-label-sm text-[12px] font-bold shadow-xs hover:bg-primary-container disabled:opacity-40 transition-all shrink-0"
                  >
                    Add & Set
                  </button>
                </div>
              </div>

              {/* Saved Custom Locations */}
              {Array.isArray(customLocations) && customLocations.length > 0 && (
                <div>
                  <span className="font-label-sm text-[11px] font-bold text-outline uppercase tracking-wider block mb-1.5">
                    Your Saved Locations
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                    {customLocations.map((loc) => {
                      const isActive = selectedLocality === loc;
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setSelectedLocality(loc);
                            setSearchQuery(loc);
                            setIsLocationOpen(false);
                            showToast(`Filtered for "${loc}"`, 'location_on');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-label-sm text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            isActive
                              ? 'bg-primary text-on-primary font-bold shadow-xs'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">place</span>
                          <span>{loc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Major Cities Quick Selector */}
              <div className="pt-2 border-t border-surface-container-high/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-sm text-[11px] font-bold text-outline uppercase tracking-wider">
                    Quick City Switch
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity('All');
                      setSelectedLocality('All');
                      setSearchQuery('');
                      setIsLocationOpen(false);
                      showToast('Showing stays across All India 🇮🇳', 'public');
                    }}
                    className="font-label-sm text-[11px] text-primary hover:underline font-bold"
                  >
                    View All India
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {CITIES.filter((c) => c.id !== 'All').slice(0, 9).map((city) => {
                    const isCityActive = selectedCity === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city.id);
                          setSelectedLocality('All');
                          setIsLocationOpen(false);
                          showToast(`Switched city to ${city.name}`, 'location_on');
                        }}
                        className={`px-2 py-1.5 rounded-xl font-label-sm text-[11px] font-semibold text-center truncate transition-colors ${
                          isCityActive
                            ? 'bg-primary text-on-primary font-bold shadow-xs'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {city.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Search Keyword Input Field ───────────────────────────────────── */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 min-w-0 bg-surface-container-low/70 rounded-xl focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-surface-container-high/40">
          <span className="material-symbols-outlined text-[20px] text-primary shrink-0">
            search
          </span>
          <div className="flex-1 min-w-0">
            <input
              id="main-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locality, landmark, tech park, PG, room type..."
              className="w-full bg-transparent font-label-md text-label-md sm:text-[14px] text-on-surface focus:outline-none placeholder:text-outline font-medium"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface text-[12px] transition-colors"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}

          {/* Quick GPS Auto-detect Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            aria-label="Detect my location"
            title="Detect my current location via GPS"
            className="w-8 h-8 rounded-lg text-primary hover:bg-surface-container flex items-center justify-center shrink-0 transition-colors active:scale-95 disabled:opacity-50"
          >
            {isLocating ? (
              <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[19px]">my_location</span>
            )}
          </button>
        </div>

        {/* ─── Filters & Search Action CTAs ─────────────────────────────────── */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
          {/* Budget trigger pill */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all text-left"
            title="Adjust Budget"
          >
            <span className="material-symbols-outlined text-[17px] text-primary">payments</span>
            <div className="flex flex-col text-left">
              <span className="font-label-sm text-[10px] text-outline leading-tight uppercase font-bold">Budget</span>
              <span className="font-label-sm text-[12px] text-on-surface font-semibold leading-tight">
                ≤ ₹{(filters.maxBudget / 1000).toFixed(0)}k/mo
              </span>
            </div>
          </button>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Open Filters"
            className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-all shrink-0 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-secondary text-on-secondary font-label-sm text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Primary Search CTA */}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">travel_explore</span>
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}
