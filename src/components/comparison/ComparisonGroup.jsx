import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function ComparisonGroup({ 
  groupTitle, 
  groupIcon, 
  iconBg = 'bg-primary-fixed text-on-primary-fixed', 
  rows = [], 
  comparedRooms = [], 
  highlightDiffs = false 
}) {
  return (
    <div className="mb-4">
      {/* Group Header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${iconBg}`}>
          <span className="material-symbols-outlined text-[15px]">{groupIcon}</span>
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          {groupTitle}
        </h3>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden text-body-md text-on-surface border border-surface-container-high/40">
        {rows.map((row, rIdx) => {
          // Check if values across rooms are different
          const values = comparedRooms.map(room => row.getValue(room));
          const isDifferent = highlightDiffs && comparedRooms.length > 1 && new Set(values).size > 1;

          return (
            <div
              key={rIdx}
              className={`grid grid-cols-[100px_repeat(3,minmax(160px,1fr))] gap-2.5 items-center p-3 odd:bg-surface-container-lowest even:bg-surface-container-low/40 ${
                isDifferent ? 'bg-amber-50/70 border-l-4 border-amber-500' : ''
              }`}
            >
              {/* Row Label */}
              <div className="flex items-center gap-1">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  {row.label}
                </span>
                {isDifferent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                )}
              </div>

              {/* Room 1, Room 2, Room 3 Columns */}
              {comparedRooms.map((room) => {
                const cell = row.render ? row.render(room) : (
                  <span className="font-label-md text-label-md text-on-surface">
                    {row.getValue(room) || '—'}
                  </span>
                );
                return (
                  <div key={room.id} className="min-w-0">
                    {cell}
                  </div>
                );
              })}

              {/* Empty slot placeholder columns if < 3 rooms */}
              {[...Array(Math.max(0, 3 - comparedRooms.length))].map((_, idx) => (
                <div key={idx} className="text-[11px] text-outline italic text-center">
                  —
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
