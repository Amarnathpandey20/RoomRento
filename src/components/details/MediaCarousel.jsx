import React, { useState } from 'react';
import { useRooms } from '../../context/RoomContext';

export default function MediaCarousel({ room }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setIsVirtualTourModalOpen } = useRooms();

  const images = room.images || [];
  const totalSlides = images.length || 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden group">
      {/* Slider */}
      <div 
        className="flex w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="min-w-full h-full relative shrink-0">
            <img
              src={img}
              alt={`${room.title} view ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Ambient Scrim Gradients */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-on-surface/40 to-transparent pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-on-surface/60 to-transparent pointer-events-none"></div>

      {/* Top Floating Tags */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-sm backdrop-blur-md">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          <span>Verified Studio</span>
        </div>
        {room.zeroBrokerage && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shadow-sm font-bold">
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>Zero Brokerage</span>
          </div>
        )}
      </div>

      {/* 3D Virtual Tour Button */}
      <button
        onClick={() => setIsVirtualTourModalOpen(true)}
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/90 text-primary font-label-md text-label-md shadow-md backdrop-blur-md active:scale-95 transition-transform hover:bg-surface font-semibold"
      >
        <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
        <span>3D Tour</span>
      </button>

      {/* Nav Buttons */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/80 text-on-surface flex items-center justify-center shadow-md backdrop-blur-sm active:scale-90 transition-transform hover:bg-surface"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/80 text-on-surface flex items-center justify-center shadow-md backdrop-blur-sm active:scale-90 transition-transform hover:bg-surface"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-on-surface/75 text-on-primary font-label-sm text-label-sm backdrop-blur-md">
        <span className="material-symbols-outlined text-[14px]">photo_camera</span>
        <span>{currentSlide + 1} / {totalSlides}</span>
      </div>

      {/* Dot Indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-on-surface/40 px-2 py-1 rounded-full backdrop-blur-sm">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`transition-all rounded-full ${
                idx === currentSlide
                  ? 'w-3 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-surface/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
