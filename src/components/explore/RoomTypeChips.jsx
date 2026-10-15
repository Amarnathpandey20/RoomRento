import React from 'react';
import { useRooms } from '../../context/RoomContext';
import { ROOM_TYPE_OPTIONS } from '../../data/roomsData';

export default function RoomTypeChips() {
  const { selectedRoomType, setSelectedRoomType, showToast } = useRooms();

  const handleSelect = (val, label) => {
    setSelectedRoomType(val);
    showToast(`Showing: ${label}`, 'tune');
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 shrink-0 text-on-surface-variant font-label-sm text-[12px] font-bold select-none pr-1">
        <span className="material-symbols-outlined text-[16px] text-primary">category</span>
        <span>Room Category:</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {ROOM_TYPE_OPTIONS.map((item) => {
          const isActive = selectedRoomType === item.value;
          return (
            <button
              key={item.value}
              onClick={() => handleSelect(item.value, item.label)}
              className={`px-4 py-2 rounded-xl font-label-md text-label-md shrink-0 flex items-center gap-2 transition-all border ${
                isActive
                  ? 'bg-primary text-on-primary border-primary shadow-xs font-bold'
                  : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-high/60 hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
