import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function ActiveFilterBar() {
  const { 
    selectedLocality, 
    filters, 
    removeFilterBadge, 
    resetFilters 
  } = useRooms();

  const activeChips = [];

  if (selectedLocality && selectedLocality !== 'All') {
    activeChips.push({ key: 'locality', label: selectedLocality });
  }
  if (filters.ac) {
    activeChips.push({ key: 'ac', label: 'AC Included' });
  }
  if (filters.verifiedOnly) {
    activeChips.push({ key: 'verifiedOnly', label: 'Verified Only' });
  }
  if (filters.zeroBrokerage) {
    activeChips.push({ key: 'zeroBrokerage', label: 'Zero Brokerage' });
  }
  if (filters.gender && filters.gender !== 'Any') {
    activeChips.push({ key: 'gender', label: `${filters.gender} Only` });
  }

  if (activeChips.length === 0) return null;

  return (
    <div className="py-1 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-bold">
          Active Filters:
        </span>
        {activeChips.map((chip) => (
          <div
            key={chip.key}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-[12px] shadow-xs border border-surface-container-high/60"
          >
            <span>{chip.label}</span>
            <button
              onClick={() => removeFilterBadge(chip.key)}
              aria-label={`Remove filter ${chip.label}`}
              className="leading-none text-outline hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={resetFilters}
        className="text-secondary font-label-sm text-[12px] shrink-0 underline decoration-secondary/40 font-bold px-1 hover:text-secondary-container transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
