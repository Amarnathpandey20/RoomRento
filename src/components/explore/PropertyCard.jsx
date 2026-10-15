import React, { useState } from 'react';
import { useRooms } from '../../context/RoomContext';

export default function PropertyCard({ room }) {
  if (!room) return null;

  const { 
    viewRoomDetails, 
    isInWishlist, 
    toggleWishlist, 
    isInCompare, 
    toggleCompare, 
    showToast,
    isLoggedIn,
    setActiveTab
  } = useRooms();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const roomId = room.id || room._id;
  const isSaved = roomId ? isInWishlist(roomId) : false;
  const isCompared = roomId ? isInCompare(roomId) : false;

  const images = Array.isArray(room.images) && room.images.length > 0 ? room.images : [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80"
  ];

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast('Please sign in to contact the host on WhatsApp', 'lock');
      setActiveTab('login');
      return;
    }
    const phone = room.host?.whatsapp || '919876543210';
    const text = encodeURIComponent(`Hi, I am interested in ${room.title} (${room.priceDisplay}/mo).`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleCall = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast('Please sign in to call the host', 'lock');
      setActiveTab('login');
      return;
    }
    showToast(`Calling host ${room.host?.name || 'Manager'} at ${room.host?.phone || '+91 98765 43210'}...`, 'call');
  };

  return (
    <article
      onClick={() => viewRoomDetails(room.id)}
      className="listing-card w-full rounded-2xl bg-surface-container-lowest p-3 sm:p-3.5 shadow-sm flex flex-col justify-between gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-surface-container-high/60 hover:border-primary/40 group"
    >
      <div>
        {/* Media Header with Tags & Actions */}
        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-surface-container">
          <img
            src={images[activeImageIdx]}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Status Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {room.isVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-[11px] shadow-sm backdrop-blur-md font-bold">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Verified
              </span>
            )}
            {room.zeroBrokerage && (
              <span className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-[11px] shadow-sm font-bold">
                Zero Brokerage
              </span>
            )}
            {room.offerTag && !room.zeroBrokerage && (
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold">
                {room.offerTag}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(room.id);
              }}
              aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
              className="w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md text-on-surface-variant hover:text-error flex items-center justify-center shadow-md active:scale-90 transition-all"
            >
              <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'text-error material-symbols-filled' : ''}`}>
                {isSaved ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>

          {/* Carousel Arrow Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/80 text-on-surface flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-surface"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                onClick={handleNextImage}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/80 text-on-surface flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-surface"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </>
          )}

          {/* Dot Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-inverse-surface/60 backdrop-blur-xs">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`transition-all rounded-full ${
                    idx === activeImageIdx
                      ? 'w-2 h-2 bg-surface-bright'
                      : 'w-1.5 h-1.5 bg-surface-bright/50'
                  }`}
                />
              ))}
              <span className="font-label-sm text-[9px] text-surface-bright ml-1">
                {activeImageIdx + 1}/{images.length}
              </span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="flex flex-col gap-2 pt-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-[11px] text-primary font-bold uppercase tracking-wider">
                  {room.subtitle || room.type}
                </span>
                <span className="text-outline text-[12px]">•</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-0.5 truncate">
                  <span className="material-symbols-outlined text-[14px] text-primary">directions_walk</span>
                  {room.distanceText}
                </span>
              </div>
              <h3 className="font-headline-sm text-[17px] text-on-surface font-extrabold truncate mt-0.5 group-hover:text-primary transition-colors">
                {room.title}
              </h3>
            </div>

            {/* Rating Pill */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-high shrink-0">
              <span className="material-symbols-outlined text-[14px] text-secondary material-symbols-filled">
                star
              </span>
              <span className="font-label-sm text-label-sm font-bold text-on-surface">
                {room.rating}
              </span>
              <span className="font-body-sm text-[11px] text-outline">
                ({room.reviewCount})
              </span>
            </div>
          </div>

          {/* Amenity Pills */}
          <div className="flex items-center gap-1.5 flex-wrap min-h-[26px]">
            {(room.amenities || []).slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-surface-container font-label-sm text-[11px] text-on-surface-variant flex items-center gap-1 font-medium"
              >
                <span className="material-symbols-outlined text-[13px] text-primary">
                  {amenity.icon}
                </span>
                {amenity.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing & Actions Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-surface-container-high/40 mt-1">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-headline-md text-[20px] text-on-surface font-extrabold leading-none">
              {room.priceDisplay}
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">
              /mo
            </span>
          </div>
          <span className="font-label-sm text-[10px] text-primary font-semibold block mt-0.5">
            {room.noticePeriod || 'Electricity as per meter'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Compare Checkbox */}
          <label
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer select-none transition-colors border border-surface-container-high/40"
            title="Add to side-by-side comparison"
          >
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => toggleCompare(room.id)}
              className="rounded text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer accent-primary"
            />
            <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
              Compare
            </span>
          </label>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
            className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">chat</span>
          </button>

          {/* View Details / Connect */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              viewRoomDetails(room.id);
            }}
            aria-label="View Details"
            className="px-3 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-[12px] font-bold flex items-center gap-1 shadow-xs active:scale-95 hover:bg-primary-container transition-all"
          >
            <span>View</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </article>
  );
}
