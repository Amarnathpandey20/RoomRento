import React from 'react';

export default function DistanceHighlights({ highlights = [] }) {
  if (highlights.length === 0) return null;

  return (
    <div className="px-gutter-mobile py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
      {highlights.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface shrink-0 border border-surface-container-high/30"
        >
          <span className={`material-symbols-outlined ${item.color || 'text-primary'} text-[16px]`}>
            {item.icon}
          </span>
          <span className="font-label-sm text-label-sm font-medium">
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
