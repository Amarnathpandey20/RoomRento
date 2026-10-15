import React, { useEffect } from 'react';
import { useRooms } from '../context/RoomContext';
import MediaCarousel from '../components/details/MediaCarousel';
import PropertyHeader from '../components/details/PropertyHeader';
import DistanceHighlights from '../components/details/DistanceHighlights';
import PricingCard from '../components/details/PricingCard';
import RoomSpecsGrid from '../components/details/RoomSpecsGrid';
import AmenityTabsSection from '../components/details/AmenityTabsSection';
import HostProfileCard from '../components/details/HostProfileCard';
import ReviewsSection from '../components/details/ReviewsSection';
import ScheduleVisitModal from '../components/details/ScheduleVisitModal';
import VirtualTourModal from '../components/details/VirtualTourModal';
import StickyDetailBar from '../components/details/StickyDetailBar';

export default function RoomDetailsPage() {
  const { rooms, selectedRoomId, setActiveTab, setIsScheduleModalOpen, setIsVirtualTourModalOpen, isLoggedIn, showToast } = useRooms();

  const room = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedRoomId]);

  if (!room) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p>Room not found.</p>
        <button 
          onClick={() => setActiveTab('explore')}
          className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-[12px]">
          <button 
            onClick={() => setActiveTab('explore')}
            className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>All Stays</span>
          </button>
          <span>/</span>
          <span>{room.locality}</span>
          <span>/</span>
          <span className="text-on-surface font-bold truncate max-w-[200px]">{room.title}</span>
        </div>

        {/* Top Media Gallery */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-surface-container-high/60">
          <MediaCarousel room={room} />
        </div>

        {/* 2-Column Responsive Layout (Main content on Left, Sticky Booking on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <PropertyHeader room={room} />
            <DistanceHighlights highlights={room.distanceHighlights} />
            <RoomSpecsGrid room={room} />
            <AmenityTabsSection amenityCategories={room.amenityCategories} />
            <HostProfileCard host={room.host} roomTitle={room.title} />
            <ReviewsSection 
              roomId={room.id}
              reviews={room.reviews} 
              rating={room.rating} 
              reviewCount={room.reviewCount} 
            />
          </div>

          {/* Right Column (1 Col Sticky Booking Card on Desktop) */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 flex flex-col gap-4">
            <PricingCard room={room} />

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    showToast('Please sign in to schedule a property visit', 'lock');
                    setActiveTab('login');
                    return;
                  }
                  setIsScheduleModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                <span>Schedule Free Visit</span>
              </button>

              <button
                onClick={() => setIsVirtualTourModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                <span>Launch 360° Matterport Tour</span>
              </button>

              <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-[11px] flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-primary text-[18px]">security</span>
                <span>Zero Brokerage guarantee. Pay only after you sign the rental agreement.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Bar (Visible on Mobile) */}
      <div className="lg:hidden">
        <StickyDetailBar room={room} />
      </div>

      {/* Modals */}
      <ScheduleVisitModal room={room} />
      <VirtualTourModal room={room} />
    </div>
  );
}
