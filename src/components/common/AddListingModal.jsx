import React, { useState, useRef } from 'react';
import { useRooms } from '../../context/RoomContext';

const CURATED_PHOTO_PRESETS = [
  {
    title: 'Master Bedroom',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80'
  },
  {
    title: 'Spacious Studio',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80'
  },
  {
    title: 'Attached Bath',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80'
  },
  {
    title: 'Balcony View',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80'
  },
  {
    title: 'Modular Kitchen',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80'
  }
];

const POPULAR_INDIAN_CITIES = [
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Delhi NCR', state: 'Delhi' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Gurugram', state: 'Haryana' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Goa', state: 'Goa' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Dehradun', state: 'Uttarakhand' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Bhubaneswar', state: 'Odisha' },
  { city: 'Other City', state: '' }
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Other'
];

export default function AddListingModal() {
  const { isAddRoomModalOpen, setIsAddRoomModalOpen, addNewProperty, showToast } = useRooms();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'studio',
    roomType: 'single',
    area: 'Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    address: '',
    rent: '',
    deposit: '',
    furnishing: 'furnished',
    floorNumber: 2,
    totalFloors: 4,
    ac: true,
    attachedBath: true,
    balcony: true,
    wifi: true,
    powerBackup: true,
    lift: false,
    images: [CURATED_PHOTO_PRESETS[0].url, CURATED_PHOTO_PRESETS[1].url]
  });

  // Local file objects to upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const handleCitySelect = (cityName) => {
    if (cityName === 'Other City') {
      setIsCustomCity(true);
      setFormData((prev) => ({ ...prev, city: '' }));
    } else {
      setIsCustomCity(false);
      const matched = POPULAR_INDIAN_CITIES.find((c) => c.city === cityName);
      setFormData((prev) => ({
        ...prev,
        city: cityName,
        state: matched?.state || prev.state
      }));
    }
  };

  if (!isAddRoomModalOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle local file picking
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    // Create object URLs for immediate preview
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls]
    }));

    showToast(`Added ${files.length} photo(s) from device`, 'add_photo_alternate');
  };

  const handleAddPreset = (url) => {
    if (formData.images.includes(url)) {
      showToast('Photo is already added to gallery', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url]
    }));
    showToast('Photo preset added to room gallery', 'photo_library');
  };

  const handleAddCustomUrl = (e) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, customImageUrl.trim()]
    }));
    setCustomImageUrl('');
    showToast('Image URL added', 'link');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.title || formData.title.trim().length < 3) {
        showToast('Please enter a listing title (at least 3 characters)', 'warning');
        return;
      }
      if (!formData.city || !formData.city.trim()) {
        showToast('Please enter or select a city in India', 'warning');
        return;
      }
      if (!formData.area || !formData.area.trim()) {
        showToast('Please specify the locality or sector', 'warning');
        return;
      }
      if (!formData.address || !formData.address.trim()) {
        showToast('Please fill out the street address', 'warning');
        return;
      }
    }
    if (step === 2) {
      if (!formData.rent || Number(formData.rent) <= 0) {
        showToast('Please specify a valid monthly rent', 'warning');
        return;
      }
    }
    if (step === 3) {
      if (formData.images.length === 0 && selectedFiles.length === 0) {
        showToast('Please add at least one room photo', 'warning');
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addNewProperty({
        ...formData,
        imageFiles: selectedFiles
      });
      setStep(1);
      setSelectedFiles([]);
    } catch (err) {
      // Handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAddRoomModalOpen(false);
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container-high/80 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high/60 flex items-center justify-between shrink-0 bg-surface-container-lowest">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-label-sm text-[11px] font-bold text-primary tracking-wider uppercase">
                Step {step} of 4 • Property Onboarding
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step
                        ? 'w-6 bg-primary'
                        : i < step
                        ? 'w-3 bg-primary/40'
                        : 'w-2 bg-surface-container-highest'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h2 className="font-headline-sm text-[18px] sm:text-[20px] font-extrabold text-on-surface">
              {step === 1 && 'Basic Property Details'}
              {step === 2 && 'Pricing & Room Specs'}
              {step === 3 && 'Room Photos & Gallery'}
              {step === 4 && 'Amenities & Facilities'}
            </h2>
          </div>
          <button
            onClick={() => setIsAddRoomModalOpen(false)}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={step === 4 ? handleSubmit : handleNext} className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Pan-India Banner */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-primary/10 border border-primary/20 text-on-surface">
                <span className="text-xl">🇮🇳</span>
                <div>
                  <h4 className="text-xs font-bold text-primary">All-India Coverage</h4>
                  <p className="text-[11px] text-on-surface-variant">
                    List properties anywhere in India — metros, tier-2 cities, university zones, or tech hubs.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Modern Studio with Balcony near Cyber Hub"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  minLength={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                />
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                  At least 3 characters. Be descriptive to attract high-intent tenants.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="studio">Studio</option>
                    <option value="pg">PG / Co-Living</option>
                    <option value="room">Private Room</option>
                    <option value="flat">Independent Flat</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Room Type
                  </label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="single">Single</option>
                    <option value="double-sharing">Double Sharing</option>
                    <option value="triple-sharing">Triple Sharing</option>
                    <option value="1RK">1RK</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                  </select>
                </div>
              </div>

              {/* City and State Selection (All India) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    City / Metro (India) *
                  </label>
                  <select
                    value={isCustomCity ? 'Other City' : formData.city}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    {POPULAR_INDIAN_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} {c.state ? `(${c.state})` : ''}
                      </option>
                    ))}
                  </select>
                  {isCustomCity && (
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter your City / Town name..."
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full mt-2 px-3 py-2 rounded-xl bg-surface-container border border-primary text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  )}
                </div>

                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    State / UT *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Locality & PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Locality / Area / Sector *
                  </label>
                  <input
                    type="text"
                    name="area"
                    placeholder="e.g. Koramangala, Bandra West, Sector 62, Hitec City..."
                    value={formData.area}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    placeholder="e.g. 560034"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. 4th Block, 80ft Road, Near Sony World"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Highlight stay highlights, proximity to tech parks, cafes, and inclusions..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Specs */}
          {step === 2 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    name="rent"
                    placeholder="16500"
                    value={formData.rent}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    placeholder="16500"
                    value={formData.deposit}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Furnishing Status
                  </label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="furnished">Fully Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Floor Level
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="floorNumber"
                      value={formData.floorNumber}
                      onChange={handleChange}
                      placeholder="Floor"
                      className="w-1/2 px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm"
                    />
                    <span className="text-on-surface-variant text-xs">of</span>
                    <input
                      type="number"
                      name="totalFloors"
                      value={formData.totalFloors}
                      onChange={handleChange}
                      placeholder="Total"
                      className="w-1/2 px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <div>
                  <h4 className="font-label-md text-[13px] font-bold text-primary">Zero Brokerage Verified</h4>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    All direct listings feature ₹0 brokerage for tenants to maximize inquiries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Photo Upload & Gallery */}
          {step === 3 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-label-md text-[13px] font-bold text-on-surface">
                    Property Photos ({formData.images.length})
                  </h3>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Upload from your device or choose from curated presets
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-label-sm text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Upload Files</span>
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Drop / Pick Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                </div>
                <div>
                  <p className="font-label-md text-sm font-bold text-on-surface">
                    Click to browse or drop room photos here
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Supports JPG, PNG, WEBP up to 10MB each
                  </p>
                </div>
              </div>

              {/* Active Gallery Thumbnails */}
              {formData.images.length > 0 && (
                <div>
                  <span className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                    Gallery Preview (First image is Cover)
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden aspect-video border border-surface-container-high group shadow-xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Room upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-primary text-on-primary text-[9px] font-bold">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                          aria-label="Remove image"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Presets */}
              <div className="pt-2 border-t border-surface-container-high/40">
                <span className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Quick Room Photo Presets
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {CURATED_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset.url)}
                      className="flex-shrink-0 flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high transition-colors"
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span className="font-label-sm text-xs font-semibold text-on-surface">
                        + {preset.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct URL Input */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Or paste external photo URL..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Amenities Checkboxes */}
          {step === 4 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <h3 className="font-label-md text-[13px] font-bold text-on-surface">Included Amenities & Perks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'ac', label: 'Air Conditioner', icon: 'ac_unit' },
                  { key: 'attachedBath', label: 'Attached Bath', icon: 'bathtub' },
                  { key: 'balcony', label: 'Private Balcony', icon: 'balcony' },
                  { key: 'wifi', label: 'High Speed Wi-Fi', icon: 'wifi' },
                  { key: 'powerBackup', label: 'Power Backup', icon: 'bolt' },
                  { key: 'lift', label: 'Elevator / Lift', icon: 'elevator' }
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formData[item.key]
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-surface-container-high bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={item.key}
                      checked={formData[item.key]}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="font-label-sm text-[12px] font-bold">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Review summary before publishing */}
              <div className="p-3.5 rounded-2xl bg-surface-container border border-surface-container-high flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant block">Summary</span>
                  <p className="font-label-md text-xs font-bold text-on-surface">
                    {formData.title || 'Untitled Stay'} • ₹{formData.rent || '0'}/mo
                  </p>
                </div>
                <span className="font-label-sm text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
                  {formData.images.length} Photos Ready
                </span>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-surface-container-high/60 flex items-center justify-between mt-auto shrink-0 bg-surface-container-lowest">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface font-label-md text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Back
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Room to Database...</span>
                </>
              ) : step < 4 ? (
                <>
                  <span>Next Step</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  <span>Publish Property</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
