import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function MapSplitView() {
  const { viewMode, setViewMode, filteredRooms, viewRoomDetails } = useRooms();

  if (viewMode !== 'map') return null;

  return (
    <div className="w-full py-2 transition-all duration-300">
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden shadow-md border border-surface-container-high/60">
        <div
          className="w-full h-full bg-cover bg-center flex flex-col justify-between p-4"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBiqYLZLDOCWRXkdYc3hEdOMF1-MYAlDggNz2xQPsayb7FAPq_Fordx_3-p70uoquaIbMyLJkUVvVs1KtHeOQ9QkU0Yz2e1T5K25YP2jVbnBqH-1MMiND-gmxkrsYMOh7cTxL_zxm8R2Kfil8tkJda2e97T-nIzUZv-bnLgMNO5eoIpONZmevqHMvMWqqe46UYnN3d_MHpxLAoAVS1pWYf1AE1m0fL3Fab0drIpYTE5xx3Sot_pACrQ4g')`
          }}
        >
          {/* Top Info Bar */}
          <div className="flex items-center justify-between w-full">
            <span className="px-3 py-1.5 rounded-full bg-surface/95 backdrop-blur-md font-label-sm text-label-sm text-on-surface shadow-sm flex items-center gap-2 border border-surface-container-high/60 font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Showing {filteredRooms.length} verified stays on Bengaluru Map
            </span>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Close Map View"
              className="w-8 h-8 rounded-full bg-surface text-on-surface flex items-center justify-center shadow hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Interactive Map Pins */}
          <div className="flex flex-wrap gap-2.5">
            {filteredRooms.slice(0, 5).map((room) => (
              <button
                key={room.id}
                onClick={() => viewRoomDetails(room.id)}
                className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-[12px] shadow-lg font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border border-white/20"
              >
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{room.priceDisplay} • {room.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
