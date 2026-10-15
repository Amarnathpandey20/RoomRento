import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function FilterDrawer() {
  const { 
    isFilterOpen, 
    setIsFilterOpen, 
    filters, 
    updateFilter, 
    resetFilters, 
    activeFiltersCount,
    filteredRooms,
    showToast 
  } = useRooms();

  if (!isFilterOpen) return null;

  const handleApply = () => {
    setIsFilterOpen(false);
    showToast(`Applied filters! ${filteredRooms.length} rooms match.`, 'tune');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-inverse-surface/60 backdrop-blur-xs transition-opacity duration-300 flex flex-col justify-end">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0"
        onClick={() => setIsFilterOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-h-[88vh] bg-surface-container-lowest rounded-t-3xl shadow-2xl flex flex-col overflow-hidden max-w-xl mx-auto z-10 animate-slide-up">
        {/* Drawer Drag Handle & Header */}
        <div className="px-gutter-mobile pt-3 pb-2.5 flex flex-col gap-2 shrink-0 bg-surface-container-lowest border-b border-surface-container-high/40">
          <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Filters &amp; Preferences
              </h2>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-primary font-bold">
                  {activeFiltersCount} Active
                </span>
              )}
            </div>
            <button
              onClick={() => setIsFilterOpen(false)}
              aria-label="Close filters"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto px-gutter-mobile py-4 flex flex-col gap-6 text-on-surface">
          {/* Monthly Budget Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg font-bold text-on-surface">
                Monthly Budget
              </label>
              <span className="font-label-md text-label-md text-primary font-bold">
                Up to ₹{filters.maxBudget.toLocaleString('en-IN')} /mo
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="45000"
              step="1000"
              value={filters.maxBudget}
              onChange={(e) => updateFilter('maxBudget', Number(e.target.value))}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
              <span>₹5,000</span>
              <span>₹25,000</span>
              <span>₹45,000+</span>
            </div>
          </div>

          {/* Gender Preference */}
          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-label-lg font-bold text-on-surface">
              Tenant &amp; Gender Preference
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Any', 'Boys', 'Girls', 'Family'].map((gender) => {
                const isActive = filters.gender === gender;
                return (
                  <button
                    key={gender}
                    onClick={() => updateFilter('gender', gender)}
                    className={`py-2 rounded-lg font-label-md text-label-md text-center transition-colors ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {gender}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Essential Amenities */}
          <div className="flex flex-col gap-2.5">
            <label className="font-label-lg text-label-lg font-bold text-on-surface">
              Essential Amenities
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'ac', label: 'Air Conditioner', icon: 'ac_unit' },
                { key: 'attachedBath', label: 'Attached Bath', icon: 'bathtub' },
                { key: 'powerBackup', label: 'Power Backup', icon: 'bolt' },
                { key: 'petFriendly', label: 'Pet Friendly', icon: 'pets' }
              ].map((item) => {
                const checked = Boolean(filters[item.key]);
                return (
                  <button
                    key={item.key}
                    onClick={() => updateFilter(item.key, !checked)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      checked
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-surface-container-high bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span className="font-label-md text-label-md">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification & Brokerage Switches */}
          <div className="flex flex-col gap-3 pt-2 border-t border-surface-container-high/40">
            <label className="font-label-lg text-label-lg font-bold text-on-surface">
              Trust &amp; Booking
            </label>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">
                    Verified Listings Only
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Physically inspected by Room Rento team
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">
                    Zero Brokerage Stays
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Direct from owners or managed properties
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.zeroBrokerage}
                onChange={(e) => updateFilter('zeroBrokerage', e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Drawer Action Bar */}
        <div className="p-gutter-mobile bg-surface-container-lowest border-t border-surface-container-high/60 flex items-center gap-3 shrink-0">
          <button
            onClick={resetFilters}
            className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Show {filteredRooms.length} Matches</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
