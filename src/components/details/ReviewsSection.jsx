import React, { useState } from 'react';
import { useRooms } from '../../context/RoomContext';

const REVIEW_TAGS = [
  'Spotless & Clean',
  'Fast Wi-Fi',
  'Peaceful & Quiet',
  'Great Value',
  'Helpful Host',
  'Metro Accessible',
  'Spacious Balcony',
  'Safe Neighbourhood'
];

export default function ReviewsSection({ roomId, reviews = [], rating = 4.9, reviewCount = 128 }) {
  const { user, submitReview, deleteReview, toggleHelpfulReview, setActiveTab, showToast, isLoggedIn } = useRooms();

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Category breakdown ratings
  const [cleanliness, setCleanliness] = useState(5);
  const [safety, setSafety] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);
  const [ownerBehaviour, setOwnerBehaviour] = useState(5);

  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Spotless & Clean', 'Fast Wi-Fi']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLoggedIn) {
      setErrorMsg('Please sign in to submit a review.');
      showToast('Please sign in to write a review', 'lock');
      setIsWriteModalOpen(false);
      setActiveTab('login');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('Please write a comment of at least 5 characters sharing your experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview(roomId, {
        rating: overallRating,
        cleanliness,
        safety,
        valueForMoney,
        ownerBehaviour,
        comment: comment.trim(),
        tags: selectedTags
      });

      // Reset form
      setComment('');
      setOverallRating(5);
      setIsWriteModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RATING_DESCRIPTIONS = {
    1: '1 Star - Poor stay',
    2: '2 Stars - Below average',
    3: '3 Stars - Average',
    4: '4 Stars - Very good',
    5: '5 Stars - Exceptional stay!'
  };

  return (
    <div className="px-gutter-mobile py-6 flex flex-col gap-6 bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-xs">
      {/* Header with Overall Rating and Add Review CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-[20px] text-on-surface font-extrabold tracking-tight">
              Resident Reviews & Ratings
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-label-sm text-[11px] font-bold">
              Verified Stays
            </span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
            Authentic feedback from verified tenants who have visited or stayed here
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Big Score Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined text-[22px] material-symbols-filled">
              star
            </span>
            <span className="font-headline-sm text-[20px] font-black text-on-surface">
              {rating}
            </span>
            <span className="text-outline text-xs font-semibold">({reviewCount})</span>
          </div>

          {/* Write a Review Button */}
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                showToast('Please sign in to write a review', 'lock');
                setActiveTab('login');
                return;
              }
              setIsWriteModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-primary text-on-primary font-label-md text-[13px] font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Category Ratings Breakdown Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/40">
        {[
          { label: 'Cleanliness', score: '4.9', icon: 'cleaning_services' },
          { label: 'Safety & Security', score: '5.0', icon: 'gpp_good' },
          { label: 'Value for Rent', score: '4.8', icon: 'payments' },
          { label: 'Host Hospitality', score: '4.9', icon: 'sentiment_very_satisfied' }
        ].map((cat) => (
          <div key={cat.label} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
            </div>
            <div className="min-w-0">
              <span className="font-headline-sm text-[14px] font-bold text-on-surface block leading-tight">
                {cat.score} ★
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant truncate block">
                {cat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Cards List */}
      <div className="flex flex-col gap-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-surface-container-high/50 flex flex-col gap-3 transition-colors hover:border-primary/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={rev.author}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-label-md text-[14px] font-bold text-on-surface">
                        {rev.author}
                      </h4>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        Verified Tenant
                      </span>
                    </div>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      {rev.role || 'Resident'} • {rev.date}
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 self-start sm:self-auto">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined text-[16px] ${
                          i < Math.floor(rev.rating) ? 'material-symbols-filled' : 'opacity-30'
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-bold text-[12px] ml-1">{rev.rating}</span>
                </div>
              </div>

              {/* Review Text */}
              <p className="font-body-md text-[13px] text-on-surface leading-relaxed">
                "{rev.text}"
              </p>

              {/* Tags & Helpful Upvote Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container-high/40">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(rev.tags || ['Verified Stay']).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant text-[11px] font-medium"
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Delete button (Visible to author or admin) */}
                  {Boolean(
                    user && (
                      user.role === 'admin' ||
                      (rev.user && (rev.user === user._id || rev.user === user.id || rev.user?._id === user._id || rev.user?._id === user.id)) ||
                      (rev.author && user.name && rev.author.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
                      (rev.userEmail && user.email && rev.userEmail.trim().toLowerCase() === user.email.trim().toLowerCase())
                    )
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this review?')) {
                          deleteReview(roomId, rev.id || rev._id);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-error/80 hover:text-error hover:bg-error/10 transition-colors"
                      title={user?.role === 'admin' && rev.author !== user.name ? 'Delete Review (Admin Moderation)' : 'Delete My Review'}
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span>{user?.role === 'admin' && rev.author !== user.name ? 'Delete (Admin)' : 'Delete My Review'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleHelpfulReview(roomId, rev.id || rev._id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      rev.isHelpful
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-surface-container-low text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">rate_review</span>
            </div>
            <h4 className="font-headline-sm text-[16px] font-bold text-on-surface">
              No written reviews yet for this room
            </h4>
            <p className="font-body-sm text-[12px] text-on-surface-variant max-w-sm">
              Be the first verified tenant to share your stay experience and help fellow room hunters!
            </p>
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  showToast('Please sign in to write a review', 'lock');
                  setActiveTab('login');
                  return;
                }
                setIsWriteModalOpen(true);
              }}
              className="mt-1 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold shadow-sm hover:bg-primary-container"
            >
              Write First Review
            </button>
          </div>
        )}
      </div>

      {/* ─── WRITE REVIEW MODAL ──────────────────────────────────────────────── */}
      {isWriteModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWriteModalOpen(false);
          }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container-high p-6 sm:p-7 max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">reviews</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[18px] font-black text-on-surface">
                    Write a Resident Review
                  </h3>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    Posting as: <strong className="text-primary">{user.name || 'Tenant'}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              {/* Overall Star Picker */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60">
                <span className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Overall Rating
                </span>
                <div className="flex items-center gap-1.5 my-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || overallRating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setOverallRating(star)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform"
                      >
                        <span
                          className={`material-symbols-outlined text-[34px] ${
                            active
                              ? 'text-amber-500 material-symbols-filled drop-shadow-xs'
                              : 'text-surface-container-highest'
                          }`}
                        >
                          star
                        </span>
                      </button>
                    );
                  })}
                </div>
                <span className="font-label-sm text-[12px] font-bold text-primary">
                  {RATING_DESCRIPTIONS[hoverRating || overallRating]}
                </span>
              </div>

              {/* Sub-Category Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/40">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                    <span>Cleanliness</span>
                    <span className="text-primary font-bold">{cleanliness} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={cleanliness}
                    onChange={(e) => setCleanliness(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                    <span>Safety & Security</span>
                    <span className="text-primary font-bold">{safety} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={safety}
                    onChange={(e) => setSafety(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                    <span>Value for Rent</span>
                    <span className="text-primary font-bold">{valueForMoney} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={valueForMoney}
                    onChange={(e) => setValueForMoney(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                    <span>Owner / Host Behaviour</span>
                    <span className="text-primary font-bold">{ownerBehaviour} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={ownerBehaviour}
                    onChange={(e) => setOwnerBehaviour(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Your Detailed Review
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about room ventilation, Wi-Fi reliability, water supply, noise level, and nearby connectivity..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed"
                />
                <span className="text-[11px] text-outline mt-1 block">
                  Minimum 5 characters. Currently: {comment.length} characters.
                </span>
              </div>

              {/* Tag Selection */}
              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1.5">
                  Select Highlights (Click to add)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {REVIEW_TAGS.map((t) => {
                    const isSelected = selectedTags.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleTag(t)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-2xs'
                            : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container-high/60">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant text-sm font-semibold hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Publish Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
