import React, { useState } from 'react';
import { useRooms } from '../../context/RoomContext';
import { CITIES } from '../../data/citiesData';

export default function LocalityChips() {
  const { 
    selectedCity, 
    selectedLocality, 
    setSelectedLocality, 
    customLocations, 
    addCustomLocation, 
    showToast 
  } = useRooms();

  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [newLocInput, setNewLocInput] = useState('');

  // Find localities from centralized cities data
  const currentCityObj = CITIES.find((c) => c.id === selectedCity);
  const baseLocalities = currentCityObj?.localities?.length > 0
    ? currentCityObj.localities
    : ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Powai', 'Gachibowli'];

  // Combine standard localities with custom user locations
  const safeCustomLocs = Array.isArray(customLocations) ? customLocations : [];
  const allLocalities = [
    'All',
    ...safeCustomLocs,
    ...baseLocalities.filter((l) => !safeCustomLocs.includes(l))
  ];

  const handleSelectLocality = (loc) => {
    setSelectedLocality(loc);
    if (loc === 'All') {
      showToast(selectedCity === 'All' ? 'Showing all localities across cities' : `Showing all stays in ${selectedCity}`, 'location_on');
    } else {
      showToast(`Filtered for ${loc}`, 'location_on');
    }
  };

  const handleAddNewLocation = (e) => {
    if (e) e.preventDefault();
    if (!newLocInput.trim()) return;
    addCustomLocation(newLocInput.trim());
    setNewLocInput('');
    setIsAddingLoc(false);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 shrink-0 text-on-surface-variant font-label-sm text-[12px] font-bold select-none pr-1">
        <span className="material-symbols-outlined text-[16px] text-primary">near_me</span>
        <span>{selectedCity !== 'All' ? `${selectedCity} Areas:` : 'Popular Hotspots:'}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {allLocalities.map((loc) => {
          const isActive = selectedLocality === loc;
          const isCustom = safeCustomLocs.includes(loc);

          return (
            <button
              key={loc}
              type="button"
              onClick={() => handleSelectLocality(loc)}
              className={`px-3.5 py-1.5 rounded-full font-label-sm text-[12px] font-semibold shrink-0 transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {isCustom && <span className="material-symbols-outlined text-[12px]">place</span>}
              <span>{loc}</span>
            </button>
          );
        })}

        {/* Inline Add Custom Location Toggle / Input */}
        {isAddingLoc ? (
          <form onSubmit={handleAddNewLocation} className="flex items-center gap-1 shrink-0 animate-scale-up">
            <input
              type="text"
              autoFocus
              placeholder="Enter your location..."
              value={newLocInput}
              onChange={(e) => setNewLocInput(e.target.value)}
              className="px-3 py-1 rounded-full bg-surface-container-high border border-primary text-on-surface font-label-sm text-[12px] focus:outline-none w-36 sm:w-44"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-[11px] font-bold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingLoc(false)}
              className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingLoc(true)}
            className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-dashed border-primary/40 text-primary font-label-sm text-[12px] font-bold shrink-0 flex items-center gap-1 transition-all"
            title="Add your custom location to search"
          >
            <span className="material-symbols-outlined text-[14px]">add_location</span>
            <span>+ Add Location</span>
          </button>
        )}
      </div>
    </div>
  );
}
