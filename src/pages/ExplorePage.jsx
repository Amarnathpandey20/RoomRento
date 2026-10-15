import React from 'react';
import { useRooms } from '../context/RoomContext';
import SearchBar from '../components/explore/SearchBar';
import LocalityChips from '../components/explore/LocalityChips';
import RoomTypeChips from '../components/explore/RoomTypeChips';
import ActiveFilterBar from '../components/explore/ActiveFilterBar';
import SortAndViewToggle from '../components/explore/SortAndViewToggle';
import MapSplitView from '../components/explore/MapSplitView';
import PropertyCard from '../components/explore/PropertyCard';
import CompareFloatingTray from '../components/explore/CompareFloatingTray';
import FilterDrawer from '../components/explore/FilterDrawer';

export default function ExplorePage() {
  const { filteredRooms, resetFilters, isLoading } = useRooms();

  return (
    <div className="w-full pb-32">
      {/* Hero gradient banner */}
      <div className="w-full bg-gradient-to-br from-primary/8 via-surface to-surface border-b border-surface-container-high/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5 flex flex-col gap-4">
          {/* Hero tagline */}
          <div className="flex flex-col gap-1">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:text-[28px] text-on-surface font-extrabold leading-tight">
              Find Your Perfect{' '}
              <span className="text-primary">Verified Room</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Browse 200+ zero-brokerage stays across Bengaluru — move in as early as today.
            </p>
          </div>

          {/* Search Bar Card */}
          <SearchBar />

          {/* Hotspot & Category Filters */}
          <div className="flex flex-col gap-2 border-b border-surface-container-high/40 pb-3">
            <LocalityChips />
            <RoomTypeChips />
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-4">
        {/* Applied Filter Tags */}
        <ActiveFilterBar />

        {/* Results Counter & Sort/View Mode Bar */}
        <SortAndViewToggle />

        {/* Interactive Map Split View (if mode is map) */}
        <MapSplitView />

        {/* Responsive Listings Grid */}
        <div className="pt-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl bg-surface-container-lowest p-3.5 border border-surface-container-high/60 animate-pulse flex flex-col gap-3 shadow-sm"
                >
                  <div className="w-full aspect-[16/10] rounded-xl bg-surface-container-high/70" />
                  <div className="h-5 bg-surface-container-high/70 rounded-md w-3/4" />
                  <div className="h-4 bg-surface-container-high/40 rounded-md w-1/2" />
                  <div className="h-6 bg-surface-container-high/50 rounded-md w-1/3 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredRooms && filteredRooms.filter(Boolean).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.filter(Boolean).map((room) => (
                <PropertyCard key={room.id || room._id} room={room} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 my-6 shadow-sm animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
                <span className="material-symbols-outlined text-[32px]">search_off</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                No matching rooms found
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1 mb-5">
                Try broadening your locality hotspot, budget slider, or gender preference criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Comparison Tray */}
      <CompareFloatingTray />

      {/* Filter Bottom Sheet Drawer */}
      <FilterDrawer />
    </div>
  );
}
