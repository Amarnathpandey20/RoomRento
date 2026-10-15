import React, { useState } from 'react';

export default function AmenityTabsSection({ amenityCategories }) {
  const [activeTab, setActiveTab] = useState('inRoom');

  const tabs = [
    { key: 'inRoom', label: 'In-Room', icon: 'chair' },
    { key: 'building', label: 'Building', icon: 'apartment' },
    { key: 'food', label: 'Food & Kitchen', icon: 'restaurant' },
    { key: 'rules', label: 'House Rules', icon: 'gavel' }
  ];

  const currentItems = amenityCategories?.[activeTab] || [];

  return (
    <div className="px-gutter-mobile py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          Amenities &amp; Features
        </h3>
        <span className="font-label-sm text-label-sm text-primary font-semibold">
          Verified Checklist
        </span>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {currentItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-label-md text-label-md font-bold text-on-surface">
                {item.name}
              </h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-tight">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
