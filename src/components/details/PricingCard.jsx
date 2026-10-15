import React from 'react';

export default function PricingCard({ room }) {
  return (
    <div className="px-gutter-mobile py-3">
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/40 flex flex-col gap-3">
        <div className="flex items-baseline justify-between border-b border-surface-container-high/40 pb-3">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block">Monthly Rent</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline-lg text-headline-lg text-primary font-extrabold leading-none">
                {room.priceDisplay}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/month</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
            Maintenance: {room.maintenance || 'Included'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-on-surface">
          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] text-outline">Security Deposit</span>
            <span className="font-label-md text-label-md font-bold mt-0.5">
              {room.securityDeposit || '1 Month Rent'}
            </span>
            <span className="text-[10px] text-on-surface-variant">100% Refundable</span>
          </div>

          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] text-outline">Lock-in Period</span>
            <span className="font-label-md text-label-md font-bold mt-0.5">
              {room.lockIn || '1 Month'}
            </span>
            <span className="text-[10px] text-on-surface-variant">{room.noticePeriod || '30 days notice'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low text-on-surface-variant text-[11px]">
          <span className="material-symbols-outlined text-[15px] text-primary">electric_bolt</span>
          <span>Electricity billed transparently as per dedicated sub-meter reading (₹9/unit).</span>
        </div>
      </div>
    </div>
  );
}
