import React from 'react';
import { useRooms } from '../../context/RoomContext';
import PropertyCard from '../explore/PropertyCard';

export default function SavedRoomsView() {
  const { rooms, wishlist, setActiveTab } = useRooms();

  const savedRooms = rooms.filter(r => wishlist.includes(r.id));

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-[11px] font-bold uppercase tracking-wide">
              <span className="material-symbols-outlined text-[13px] material-symbols-filled">favorite</span>
              Wishlist
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold leading-tight">
            Saved Rooms
          </h1>
          <p className="font-body-sm text-[13px] text-on-surface-variant mt-0.5">
            {savedRooms.length > 0
              ? `${savedRooms.length} ${savedRooms.length === 1 ? 'room' : 'rooms'} saved to your wishlist`
              : 'Your saved properties will appear here'}
          </p>
        </div>
        {savedRooms.length > 0 && (
          <button
            onClick={() => setActiveTab('compare')}
            className="self-start flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-[13px] font-semibold hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[17px] text-primary">compare_arrows</span>
            Compare Saved
          </button>
        )}
      </div>

      {savedRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedRooms.map(room => (
            <PropertyCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-3xl border border-surface-container-high/40 my-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
            <span className="material-symbols-outlined text-[40px]">favorite_border</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Your Wishlist is Empty
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-2 mb-6">
            Tap the ❤️ heart icon on any property in the explore feed to save it here for quick access.
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            Explore Verified Rooms
          </button>
        </div>
      )}
    </div>
  );
}
