import React from 'react';
import { useRooms } from '../../context/RoomContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, wishlist, compareList } = useRooms();

  const navItems = [
    {
      id: 'explore',
      label: 'Explore',
      icon: 'explore',
      badge: null
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: 'favorite',
      badge: wishlist.length > 0 ? wishlist.length : null,
      badgeColor: 'bg-secondary text-on-secondary'
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: 'compare_arrows',
      badge: compareList.length > 0 ? compareList.length : null,
      badgeColor: 'bg-primary text-on-primary'
    },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: 'chat_bubble_outline',
      badge: null
    },
    {
      id: 'account',
      label: 'Account',
      icon: 'manage_accounts',
      badge: null
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.06)] border-t border-surface-container-high/60">
      <div className="flex justify-between items-center h-16 px-space-xs max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'explore' && activeTab === 'details');
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-all relative ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  {item.icon}
                </span>
                {item.badge !== null && (
                  <span className={`absolute -top-1 -right-2 px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full font-label-sm text-[10px] leading-none ${item.badgeColor || 'bg-primary text-on-primary'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-label-sm mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
