import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function SortAndViewToggle() {
  const { 
    filteredRooms, 
    sortBy, 
    setSortBy, 
    viewMode, 
    setViewMode,
    showToast,
    selectedLocality
  } = useRooms();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-surface-container-high/40">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-headline-sm text-[20px] text-on-surface font-extrabold leading-none">
            {filteredRooms.length}
          </span>
          <span className="font-body-md text-body-md text-on-surface-variant font-medium">
            verified stays {selectedLocality !== 'All' ? `in ${selectedLocality}` : 'in Bengaluru'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-label-sm text-[12px] text-outline font-semibold hidden sm:inline">
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                showToast('Sorting updated');
              }}
              className="appearance-none bg-surface-container-lowest text-on-surface font-label-sm text-[12px] font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none shadow-xs cursor-pointer border border-surface-container-high hover:border-primary/40 transition-colors"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <span className="material-symbols-outlined text-[16px] text-outline pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              expand_more
            </span>
          </div>
        </div>

        {/* View Mode Segmented Toggle */}
        <div className="flex items-center bg-surface-container p-0.5 rounded-xl border border-surface-container-high/60">
          <button
            onClick={() => setViewMode('list')}
            aria-label="List View"
            title="List View"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-label-sm text-[12px] font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            aria-label="Map Split View"
            title="Map Split View"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-label-sm text-[12px] font-semibold transition-all ${
              viewMode === 'map'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}
