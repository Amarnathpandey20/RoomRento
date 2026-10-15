import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function CompareFloatingTray() {
  const { compareList, clearCompare, setActiveTab } = useRooms();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-inverse-surface text-inverse-on-surface rounded-full px-4 py-2.5 shadow-2xl flex items-center justify-between transition-all duration-300 border border-surface-container-high/20 animate-fade-in">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow">
          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md leading-tight text-surface-bright font-bold truncate">
            {compareList.length} room{compareList.length > 1 ? 's' : ''} in comparison
          </span>
          <span className="font-label-sm text-[11px] text-surface-variant/80 truncate">
            Tap to evaluate side-by-side
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={clearCompare}
          className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright px-1 py-1 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={() => {
            setActiveTab('compare');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow hover:bg-primary-container active:scale-95 transition-all"
        >
          View Match
        </button>
      </div>
    </div>
  );
}
