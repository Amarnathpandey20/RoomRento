import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function StickyDetailBar({ room }) {
  const { setIsScheduleModalOpen, isLoggedIn, setActiveTab, showToast } = useRooms();

  if (!room) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-container-high/60 shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.1)] pb-safe">
      <div className="max-w-xl mx-auto px-gutter-mobile py-2.5 flex items-center justify-between gap-3">
        {/* Left: Rent Details */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="font-headline-md text-headline-md text-on-surface font-extrabold leading-none">
              {room.priceDisplay}
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">/mo</span>
          </div>
          <span className="font-label-sm text-[11px] text-primary truncate">
            {room.securityDeposit || '1 Month Security'} • Zero Brokerage
          </span>
        </div>

        {/* Right: Booking CTA */}
        <button
          onClick={() => {
            if (!isLoggedIn) {
              showToast('Please sign in to schedule a property visit', 'lock');
              setActiveTab('login');
              return;
            }
            setIsScheduleModalOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[19px]">calendar_month</span>
          <span>Schedule Free Visit</span>
        </button>
      </div>
    </div>
  );
}
