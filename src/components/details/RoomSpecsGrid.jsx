import React from 'react';

export default function RoomSpecsGrid({ room }) {
  const specs = [
    { label: 'Room Type', value: room.type, icon: 'bed' },
    { label: 'Carpet Area', value: room.carpetArea || '280 sq.ft', icon: 'square_foot' },
    { label: 'Floor Level', value: room.floor || '3rd Floor', icon: 'stairs' },
    { label: 'Balcony', value: room.balcony || 'Attached Balcony', icon: 'balcony' },
    { label: 'Facing', value: room.facing || 'East Facing', icon: 'explore' },
    { label: 'Gender', value: room.genderPreference || 'Any', icon: 'person' }
  ];

  return (
    <div className="px-gutter-mobile py-2">
      <div className="flex flex-col gap-2.5">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          Room Specifications
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              </div>
              <div className="min-w-0">
                <span className="font-label-sm text-[11px] text-outline block truncate">
                  {item.label}
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate block">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
