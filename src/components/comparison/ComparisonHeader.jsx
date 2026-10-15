import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function ComparisonHeader() {
  const { 
    compareList, 
    highlightDiffs, 
    toggleHighlightDiffs, 
    showToast 
  } = useRooms();

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    showToast('Comparison link copied to clipboard!', 'ios_share');
  };

  return (
    <section className="px-gutter-mobile pt-3 pb-2 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wide font-semibold">
            <span className="material-symbols-outlined text-[14px]">balance</span>
            Smart Match Matrix
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-1 font-extrabold">
            Compare Rooms
          </h1>
        </div>

        {/* Share / Export Trigger */}
        <button
          onClick={handleShare}
          aria-label="Share comparison sheet"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container text-primary shadow-sm hover:bg-surface-container-high active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">ios_share</span>
        </button>
      </div>

      <div className="flex items-center justify-between mt-0.5">
        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>
            Comparing{' '}
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              {compareList.length} of 3
            </span>{' '}
            maximum rooms
          </span>
        </p>

        {/* Highlight Diffs Toggle */}
        <button
          onClick={toggleHighlightDiffs}
          className={`font-label-sm text-label-sm flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
            highlightDiffs
              ? 'bg-primary text-on-primary font-bold shadow-sm'
              : 'bg-surface-container-low text-primary hover:bg-surface-container font-semibold'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {highlightDiffs ? 'visibility_off' : 'visibility'}
          </span>
          <span>{highlightDiffs ? 'Reset View' : 'Highlight Diffs'}</span>
        </button>
      </div>
    </section>
  );
}
