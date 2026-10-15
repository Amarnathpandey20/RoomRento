import React, { useState } from 'react';
import { useRooms } from '../../context/RoomContext';

export default function ScheduleVisitModal({ room }) {
  const { isScheduleModalOpen, setIsScheduleModalOpen, bookVisit, isLoggedIn, setActiveTab, showToast } = useRooms();
  
  const [selectedDate, setSelectedDate] = useState('Tomorrow, Oct 14');
  const [selectedTime, setSelectedTime] = useState('4:00 PM - 5:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isScheduleModalOpen || !room) return null;

  const dates = [
    { day: 'Today', date: 'Oct 13' },
    { day: 'Tomorrow', date: 'Oct 14' },
    { day: 'Wed', date: 'Oct 15' },
    { day: 'Thu', date: 'Oct 16' }
  ];

  const times = [
    '10:00 AM - 11:00 AM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM',
    '06:30 PM - 07:30 PM'
  ];

  const handleConfirm = () => {
    if (!isLoggedIn) {
      showToast('Please sign in to schedule a property visit', 'lock');
      setIsScheduleModalOpen(false);
      setActiveTab('login');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      bookVisit({
        propertyId: room.id,
        propertyTitle: room.title,
        locality: room.address,
        date: selectedDate,
        time: selectedTime,
        hostName: room.host?.name || 'Property Host',
        hostPhone: room.host?.phone || '+91 98765 43210'
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="absolute inset-0"
        onClick={() => setIsScheduleModalOpen(false)}
      />

      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-5 shadow-2xl z-10 flex flex-col gap-4 border border-surface-container-high/40 animate-scale-up">
        <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Schedule Free Visit
            </h3>
            <p className="font-body-sm text-[12px] text-on-surface-variant truncate max-w-[260px]">
              {room.title}
            </p>
          </div>
          <button
            onClick={() => setIsScheduleModalOpen(false)}
            aria-label="Close visit modal"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md font-bold text-on-surface">
            Choose Preferred Date
          </label>
          <div className="grid grid-cols-4 gap-2">
            {dates.map((d) => {
              const fullDateStr = `${d.day}, ${d.date}`;
              const isSelected = selectedDate === fullDateStr;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(fullDateStr)}
                  className={`p-2.5 rounded-xl flex flex-col items-center transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-sm font-semibold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="text-[11px] font-medium">{d.day}</span>
                  <span className="font-bold text-label-md mt-0.5">{d.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md font-bold text-on-surface">
            Select Time Slot
          </label>
          <div className="grid grid-cols-2 gap-2">
            {times.map((t) => {
              const isSelected = selectedTime === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`p-2.5 rounded-xl font-label-md text-label-md text-center transition-all ${
                    isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notice */}
        {!isLoggedIn ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[12px] flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">lock</span>
            <span>You must be signed in to book this property visit.</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-[11px] flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span>Free direct visit. Host will greet you at the entrance with keys.</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Securing Visit Slot...</span>
          ) : !isLoggedIn ? (
            <>
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>Sign In to Book Visit</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              <span>Confirm Free Visit ({selectedDate.split(',')[0]})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
