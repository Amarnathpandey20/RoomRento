import React from 'react';

export default function PropertyHeader({ room }) {
  return (
    <div className="px-gutter-mobile pt-space-md flex flex-col gap-space-sm bg-surface">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
              {room.furnishing || 'Fully Furnished'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
              {room.moveIn || 'Immediate Move-in'}
            </span>
          </div>

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold tracking-tight mt-1">
            {room.title}
          </h1>

          <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
            <span className="truncate">{room.address}</span>
          </div>
        </div>

        {/* Verified Landlord Pill */}
        <div className="flex flex-col items-end shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center text-primary-container shadow-xs">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-bold mt-1 text-right">
            Verified Host
          </span>
        </div>
      </div>
    </div>
  );
}
