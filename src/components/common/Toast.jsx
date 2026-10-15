import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function Toast() {
  const { toast } = useRooms();

  if (!toast.isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] animate-toast-in flex items-center gap-2.5 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-2xl max-w-[90vw] border border-white/10">
      <span className="material-symbols-outlined text-[18px] text-primary-fixed shrink-0">
        {toast.icon || 'check_circle'}
      </span>
      <span className="font-label-md text-[13px] font-semibold truncate max-w-xs">
        {toast.message}
      </span>
    </div>
  );
}
