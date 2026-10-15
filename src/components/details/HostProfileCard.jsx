import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function HostProfileCard({ host, roomTitle }) {
  const { showToast, isLoggedIn, setActiveTab } = useRooms();

  if (!host) return null;

  const handleWhatsApp = () => {
    if (!isLoggedIn) {
      showToast('Please sign in to contact the host on WhatsApp', 'lock');
      setActiveTab('login');
      return;
    }
    const text = encodeURIComponent(`Hi ${host.name}, I am interested in ${roomTitle}.`);
    window.open(`https://wa.me/${host.whatsapp || '919876543210'}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    if (!isLoggedIn) {
      showToast('Please sign in to call the property host', 'lock');
      setActiveTab('login');
      return;
    }
    showToast(`Calling host ${host.name} (${host.phone})...`, 'call');
  };

  return (
    <div className="px-gutter-mobile py-2">
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={host.avatar}
              alt={host.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-headline-sm text-[16px] text-on-surface font-bold leading-tight">
                  {host.name}
                </h4>
                <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              </div>
              <span className="font-label-sm text-[11px] text-secondary font-semibold block">
                {host.title}
              </span>
              <span className="font-body-sm text-[11px] text-outline block mt-0.5">
                Response: {host.responseRate}
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[10px] font-bold">
            {host.verifiedBadge || 'Identity Verified'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-container-high/30">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleCall}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Host</span>
          </button>
        </div>
      </div>
    </div>
  );
}
