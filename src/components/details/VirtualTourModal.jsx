import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function VirtualTourModal({ room }) {
  const { isVirtualTourModalOpen, setIsVirtualTourModalOpen } = useRooms();

  if (!isVirtualTourModalOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-inverse-surface/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="absolute inset-0"
        onClick={() => setIsVirtualTourModalOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col border border-surface-container-high/40 animate-scale-up">
        {/* Header */}
        <div className="p-4 bg-surface-container-lowest flex items-center justify-between border-b border-surface-container-high/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">360</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              360° Virtual Tour • {room.title}
            </h3>
          </div>
          <button
            onClick={() => setIsVirtualTourModalOpen(false)}
            aria-label="Close 3D Tour"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 360 Viewer Canvas Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <img
            src={room.images?.[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA37OngSpsWudEz8zgwTjnNexi5zKFr3Krd506HuNvdcFlROPnTbG-MdtGzdHVJKM2ZxOWJt33TVs5tr_Uv-5vDxR7puy46PGthwX6xGa67PzUqNR1JUaqrq0BaNJaITuXd-ETHNVD7Vmmb36bmdj7hXCxO5Zuo_yNO_HmFswPYrd7J9I-x11fg5NufTyswMPN7N-hBtcaU8GR6MwyEQplQCdsxe4Sd2T_j4dRDs5tPtQtLp1-Ca_crJw'}
            alt="360 view"
            className="w-full h-full object-cover opacity-90 scale-105 hover:scale-110 transition-transform duration-700 cursor-grab active:cursor-grabbing"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

          {/* Interactive Gyroscope Pill */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-label-sm text-label-sm flex items-center gap-2 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-ping"></span>
            <span>Drag or move device to explore studio interior</span>
          </div>

          {/* Room Hotspots */}
          <button className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-primary/90 text-on-primary font-label-sm text-[11px] shadow-lg flex items-center gap-1 hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[13px]">bed</span>
            <span>Orthopedic Queen Bed</span>
          </button>

          <button className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-secondary/90 text-on-secondary font-label-sm text-[11px] shadow-lg flex items-center gap-1 hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[13px]">balcony</span>
            <span>Private Balcony Garden</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-surface-container flex items-center justify-between text-on-surface-variant font-label-sm text-[12px]">
          <span>Matterport 3D Digital Twin • Real Camera Capture</span>
          <button 
            onClick={() => setIsVirtualTourModalOpen(false)}
            className="text-primary font-bold hover:underline"
          >
            Back to Room Details
          </button>
        </div>
      </div>
    </div>
  );
}
