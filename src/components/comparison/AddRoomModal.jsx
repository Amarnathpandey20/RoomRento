import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function AddRoomModal() {
  const { 
    isAddRoomModalOpen, 
    setIsAddRoomModalOpen, 
    rooms, 
    compareList, 
    addToCompare 
  } = useRooms();

  if (!isAddRoomModalOpen) return null;

  const availableRooms = rooms.filter(r => !compareList.includes(r.id));

  return (
    <div className="fixed inset-0 z-[100] bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="absolute inset-0"
        onClick={() => setIsAddRoomModalOpen(false)}
      />

      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-5 shadow-2xl z-10 flex flex-col gap-4 border border-surface-container-high/40 max-h-[80vh] animate-scale-up">
        <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Add Room to Compare
            </h3>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Select any listing to evaluate side-by-side
            </p>
          </div>
          <button
            onClick={() => setIsAddRoomModalOpen(false)}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {availableRooms.length > 0 ? (
            availableRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => addToCompare(room.id)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer border border-surface-container-high/30 group"
              >
                <img
                  src={room.images?.[0]}
                  alt={room.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                    {room.title}
                  </h4>
                  <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                    {room.locality} • {room.type}
                  </p>
                  <span className="font-label-md text-label-md text-primary font-extrabold block mt-0.5">
                    {room.priceDisplay}/mo
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-on-surface-variant py-8 font-body-sm">
              All available properties are already in the comparison matrix!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
