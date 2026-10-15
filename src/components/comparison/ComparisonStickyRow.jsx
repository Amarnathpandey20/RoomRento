import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function ComparisonStickyRow({ comparedRooms }) {
  const { 
    removeFromCompare, 
    setIsAddRoomModalOpen, 
    viewRoomDetails 
  } = useRooms();

  return (
    <div className="sticky top-16 z-30 bg-surface/95 backdrop-blur-md pt-2 pb-3 px-gutter-mobile shadow-sm border-b border-surface-container-high/40">
      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        <div className="grid grid-cols-[100px_repeat(3,minmax(160px,1fr))] gap-2.5 min-w-[580px] items-stretch">
          {/* Leading Label Column */}
          <div className="flex flex-col justify-end pb-1 pr-1">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Property Card
            </span>
            <p className="font-body-sm text-[11px] text-on-surface-variant leading-tight mt-0.5">
              Swipe columns to review specs
            </p>
          </div>

          {/* Compared Room Cards */}
          {comparedRooms.map((room) => (
            <div
              key={room.id}
              className="relative flex flex-col rounded-xl bg-surface-container-lowest p-2.5 shadow-sm border border-surface-container-high/40 transition-all hover:shadow-md"
            >
              <div 
                onClick={() => viewRoomDetails(room.id)}
                className="relative w-full h-24 rounded-lg overflow-hidden mb-2 bg-surface-container cursor-pointer group"
              >
                <img
                  src={room.images?.[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7NRJ84SNIARf5kgLDZHT2_H8moxUif0taQDWw8ZhYQ_z5PlUUFuIhiQupFYrT93arvz7S65EDQvPpFAdS5RcAGoAZehmvZvJVM0UEoN3esK-ERm2tI8ixGj5JGUMa6OIhozuTpuyBLtgSxS9eYpiAm71aXhTchxlu4Ag1FGJ-6vP3d3INzy-99rZ_SxMh1xt-MSh5FWt7o1pu75vaOQ5c27AkLWgBsjOzOaS4c7Wl1eobSz8O0ZqlXA'}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCompare(room.id);
                  }}
                  aria-label={`Remove ${room.title}`}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-inverse-surface/80 text-inverse-on-surface flex items-center justify-center backdrop-blur-sm hover:bg-inverse-surface active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>

                {room.offerTag && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[10px] leading-tight font-bold">
                    {room.offerTag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[14px] material-symbols-filled">
                  star
                </span>
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  {room.rating}
                </span>
                <span className="text-[10px] text-outline font-body-sm">
                  ({room.reviewCount})
                </span>
              </div>

              <h2 
                onClick={() => viewRoomDetails(room.id)}
                className="font-label-lg text-label-lg text-on-surface truncate mt-0.5 cursor-pointer hover:text-primary font-bold"
              >
                {room.title}
              </h2>
              <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                {room.locality}
              </p>

              <div className="mt-1.5 pt-1.5 flex items-baseline gap-1 border-t border-surface-container-high/30">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  {room.priceDisplay}
                </span>
                <span className="text-[10px] text-outline">/mo</span>
              </div>
            </div>
          ))}

          {/* Empty Add Slot if < 3 rooms */}
          {comparedRooms.length < 3 && (
            <div
              onClick={() => setIsAddRoomModalOpen(true)}
              className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-2.5 text-center cursor-pointer hover:bg-surface-container transition-all group border-2 border-dashed border-primary/30"
            >
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform shadow-xs">
                <span className="material-symbols-outlined text-[22px]">add</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold leading-tight">
                Add {comparedRooms.length === 1 ? '2nd' : '3rd'} Room
              </span>
              <span className="text-[10px] text-on-surface-variant mt-1 leading-snug">
                Tap to pick from Listings
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
