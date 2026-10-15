import React from 'react';
import { useRooms } from '../context/RoomContext';
import ComparisonHeader from '../components/comparison/ComparisonHeader';
import ComparisonStickyRow from '../components/comparison/ComparisonStickyRow';
import ComparisonGroup from '../components/comparison/ComparisonGroup';
import AddRoomModal from '../components/comparison/AddRoomModal';

export default function ComparePage() {
  const { 
    rooms, 
    compareList, 
    highlightDiffs, 
    setIsScheduleModalOpen, 
    setSelectedRoomId, 
    setActiveTab, 
    showToast,
    isLoggedIn
  } = useRooms();

  const comparedRooms = rooms.filter(r => compareList.includes(r.id));

  const handleScheduleVisit = (room) => {
    if (!isLoggedIn) {
      showToast('Please sign in to schedule a property visit', 'lock');
      setActiveTab('login');
      return;
    }
    setSelectedRoomId(room.id);
    setIsScheduleModalOpen(true);
  };

  const handleContactHost = (room) => {
    if (!isLoggedIn) {
      showToast('Please sign in to contact the property host', 'lock');
      setActiveTab('login');
      return;
    }
    const text = encodeURIComponent(`Hi ${room.host?.name || 'Host'}, I'm interested in ${room.title}.`);
    window.open(`https://wa.me/${room.host?.whatsapp || '919876543210'}?text=${text}`, '_blank');
  };

  // Comparison Rows Definitions
  const pricingRows = [
    {
      label: 'Monthly Rent',
      getValue: (r) => r.compareSpecs?.monthlyRent || r.priceDisplay,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-label-lg text-label-lg text-on-surface font-bold">
            {r.compareSpecs?.monthlyRent || r.priceDisplay}
          </span>
          <span className="text-[10px] text-primary font-label-sm">
            {r.compareSpecs?.rentDetails || 'Per Month'}
          </span>
        </div>
      )
    },
    {
      label: 'Security Deposit',
      getValue: (r) => r.compareSpecs?.securityDeposit || r.securityDeposit,
      render: (r) => (
        <div>
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            {r.compareSpecs?.securityDeposit || r.securityDeposit}
          </span>
          <span className="text-[10px] block text-on-surface-variant">
            {r.compareSpecs?.depositDetails || '(Refundable)'}
          </span>
        </div>
      )
    },
    {
      label: 'Brokerage',
      getValue: (r) => r.compareSpecs?.brokerage || (r.zeroBrokerage ? 'Zero Brokerage' : '15 Days Brokerage'),
      render: (r) => {
        const isZero = (r.compareSpecs?.brokerage || '').includes('Zero') || r.zeroBrokerage;
        return isZero ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">check</span> Zero Brokerage
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">info</span> 15 Days Brokerage
          </span>
        );
      }
    },
    {
      label: 'Maintenance',
      getValue: (r) => r.compareSpecs?.maintenance || r.maintenance || 'Included'
    },
    {
      label: 'Electricity',
      getValue: (r) => r.compareSpecs?.electricity || 'Per sub-meter'
    }
  ];

  const specRows = [
    {
      label: 'Room Type',
      getValue: (r) => r.compareSpecs?.roomType || r.type,
      render: (r) => (
        <span className="font-label-md text-label-md text-primary font-semibold">
          {r.compareSpecs?.roomType || r.type}
        </span>
      )
    },
    {
      label: 'Carpet Area',
      getValue: (r) => r.compareSpecs?.carpetArea || r.carpetArea || '280 sq.ft'
    },
    {
      label: 'Furnishing',
      getValue: (r) => r.compareSpecs?.furnishing || r.furnishing,
      render: (r) => (
        <div>
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            {r.compareSpecs?.furnishing || r.furnishing}
          </span>
          <span className="text-[10px] block text-on-surface-variant truncate">
            {r.compareSpecs?.furnishingDetails || 'Queen Bed, Desk'}
          </span>
        </div>
      )
    },
    {
      label: 'Bathroom',
      getValue: (r) => r.compareSpecs?.bathroom || 'Private Attached',
      render: (r) => (
        <div className="flex items-center gap-1 text-primary">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span className="font-label-sm text-label-sm text-on-surface">
            {r.compareSpecs?.bathroom || 'Private Attached'}
          </span>
        </div>
      )
    },
    {
      label: 'Balcony',
      getValue: (r) => r.compareSpecs?.balcony || r.balcony || 'Attached Balcony',
      render: (r) => {
        const val = r.compareSpecs?.balcony || r.balcony || 'Attached Balcony';
        const isPrivate = val.includes('Private');
        return (
          <div className="flex items-center gap-1">
            <span className={`material-symbols-outlined text-[16px] ${isPrivate ? 'text-primary' : 'text-outline'}`}>
              {isPrivate ? 'check_circle' : 'info'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface">
              {val}
            </span>
          </div>
        );
      }
    }
  ];

  const facilityRows = [
    {
      label: 'Wi-Fi Speed',
      getValue: (r) => r.compareSpecs?.wifi || '300 Mbps Fiber',
      render: (r) => (
        <div className="flex items-center gap-1 font-label-md text-label-md">
          <span className="material-symbols-outlined text-[16px] text-primary">wifi</span>
          <span>{r.compareSpecs?.wifi || '300 Mbps'}</span>
        </div>
      )
    },
    {
      label: 'Power Backup',
      getValue: (r) => r.compareSpecs?.powerBackup || '100% DG'
    },
    {
      label: 'Food / Meals',
      getValue: (r) => r.compareSpecs?.foodMeals || 'Self Kitchen'
    },
    {
      label: 'Washing Machine',
      getValue: (r) => r.compareSpecs?.washingMachine || 'In-house Washers'
    },
    {
      label: 'Housekeeping',
      getValue: (r) => r.compareSpecs?.housekeeping || 'Included'
    },
    {
      label: 'Gym Facility',
      getValue: (r) => r.compareSpecs?.gym || 'Community Gym'
    }
  ];

  const ruleRows = [
    {
      label: 'Notice Period',
      getValue: (r) => r.compareSpecs?.noticePeriod || r.noticePeriod || '30 Days'
    },
    {
      label: 'Lock-in Period',
      getValue: (r) => r.compareSpecs?.lockIn || r.lockIn || '3 Months'
    },
    {
      label: 'Gate Curfew',
      getValue: (r) => r.compareSpecs?.gateCurfew || '24x7 Biometric'
    },
    {
      label: 'Visitors',
      getValue: (r) => r.compareSpecs?.visitorPolicy || 'Allowed'
    },
    {
      label: 'Pet Policy',
      getValue: (r) => r.compareSpecs?.petPolicy || 'Small Pets Allowed'
    }
  ];

  if (comparedRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center my-12 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary mb-3">
          <span className="material-symbols-outlined text-[32px]">compare_arrows</span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          No Rooms Selected to Compare
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-5">
          Select up to 3 rooms from the explore feed to evaluate side-by-side specs, pricing, and rules.
        </p>
        <button
          onClick={() => setActiveTab('explore')}
          className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all"
        >
          Explore Listings
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* Intro Header */}
        <ComparisonHeader />

        {/* Synchronized Sticky Columns Header */}
        <ComparisonStickyRow comparedRooms={comparedRooms} />

        {/* Comparison Groups Matrix */}
        <div className="mt-2 flex flex-col gap-4 overflow-x-auto no-scrollbar">
          <div className="min-w-[580px]">
          {/* Group 1: Pricing */}
          <ComparisonGroup
            groupTitle="1. Pricing &amp; Financials"
            groupIcon="payments"
            iconBg="bg-primary-fixed text-on-primary-fixed"
            rows={pricingRows}
            comparedRooms={comparedRooms}
            highlightDiffs={highlightDiffs}
          />

          {/* Group 2: Specs */}
          <ComparisonGroup
            groupTitle="2. Room Specifications"
            groupIcon="bed"
            iconBg="bg-secondary-fixed text-on-secondary-fixed-variant"
            rows={specRows}
            comparedRooms={comparedRooms}
            highlightDiffs={highlightDiffs}
          />

          {/* Group 3: Common Facilities */}
          <ComparisonGroup
            groupTitle="3. Common Facilities &amp; Services"
            groupIcon="wifi"
            iconBg="bg-tertiary-fixed text-on-tertiary-fixed"
            rows={facilityRows}
            comparedRooms={comparedRooms}
            highlightDiffs={highlightDiffs}
          />

          {/* Group 4: Rules & Policies */}
          <ComparisonGroup
            groupTitle="4. House Rules &amp; Flexibility"
            groupIcon="gavel"
            iconBg="bg-surface-container-highest text-on-surface"
            rows={ruleRows}
            comparedRooms={comparedRooms}
            highlightDiffs={highlightDiffs}
          />

          {/* Action Row for each column */}
          <div className="grid grid-cols-[100px_repeat(3,minmax(160px,1fr))] gap-2.5 items-center p-3 mt-2 bg-surface-container-lowest rounded-2xl border border-surface-container-high/40 shadow-sm">
            <span className="font-label-sm text-outline uppercase tracking-wider font-bold">
              Actions
            </span>
            {comparedRooms.map((room) => (
              <div key={room.id} className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleScheduleVisit(room)}
                  className="w-full py-2 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-xs hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                  <span>Schedule Visit</span>
                </button>
                <button
                  onClick={() => handleContactHost(room)}
                  className="w-full py-1.5 rounded-xl bg-surface-container text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  <span>Contact Host</span>
                </button>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Add Room Modal */}
        <AddRoomModal />
      </div>
    </div>
  );
}
