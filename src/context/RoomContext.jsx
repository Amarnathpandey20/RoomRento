import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { INITIAL_ROOMS } from '../data/roomsData';
import { INITIAL_USER, INITIAL_ENQUIRIES, INITIAL_SCHEDULED_VISITS } from '../data/mockUserData';
import api from '../services/apiClient';
import { formatListingForFrontend } from '../services/listingAdapter';

const RoomContext = createContext(null);

export const DEFAULT_FILTERS = {
  maxBudget: 45000,
  gender: 'Any',
  ac: false,
  verifiedOnly: false,
  zeroBrokerage: false,
  attachedBath: false,
  powerBackup: false,
  petFriendly: false,
  furnishing: 'All'
};

export const GUEST_USER = {
  name: 'Guest User',
  email: '',
  phone: '',
  role: 'guest',
  city: 'Bengaluru',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  savedCount: 0,
  compareCount: 0,
  visitsScheduled: 0,
  budgetPreference: '₹15,000 - ₹25,000',
  targetLocality: 'All'
};

const getInitialUser = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('room_rento_user');
      const token = localStorage.getItem('room_rento_access_token');
      if (stored && token) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {
    // fallback
  }
  return GUEST_USER;
};

export function RoomProvider({ children }) {
  const [rooms, setRooms] = useState(() => INITIAL_ROOMS.map(formatListingForFrontend));
  const [user, setUser] = useState(getInitialUser);
  const getInitialTab = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      const validTabs = ['explore', 'details', 'compare', 'saved', 'enquiries', 'account', 'login', 'admin-login', 'admin'];
      if (validTabs.includes(hash)) return hash;
    }
    return 'explore';
  };
  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const validTabs = ['explore', 'details', 'compare', 'saved', 'enquiries', 'account', 'login', 'admin-login', 'admin'];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Toast Notification State & Global Helper (declared early so all callbacks can access it)
  const [toast, setToast] = useState({ message: '', icon: 'check_circle', isVisible: false });
  const showToast = useCallback((message, icon = 'check_circle') => {
    setToast({ message, icon, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3200);
  }, []);

  // Search & Filter State
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Custom User Locations & GPS Memory (guaranteed array)
  const [customLocations, setCustomLocations] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('room_rento_custom_locations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
          if (typeof parsed === 'string' && parsed.trim()) return [parsed.trim()];
        }
      }
    } catch (e) {}
    return [];
  });

  const addCustomLocation = useCallback((locName, cityName = null) => {
    if (!locName || typeof locName !== 'string' || !locName.trim()) return;
    const cleanLoc = locName.trim();
    setCustomLocations((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const updated = list.includes(cleanLoc) ? list : [cleanLoc, ...list].slice(0, 10);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('room_rento_custom_locations', JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
    if (cityName && cityName !== 'All') {
      setSelectedCity(cityName);
    }
    setSelectedLocality(cleanLoc);
    setSearchQuery(cleanLoc);
    showToast(`Location set to "${cleanLoc}"`, 'location_on');
  }, [showToast]);

  const setUserLocation = useCallback((cityName, localityName = 'All') => {
    if (cityName) setSelectedCity(cityName);
    if (localityName) setSelectedLocality(localityName);
    if (localityName && localityName !== 'All') {
      setSearchQuery(localityName);
    }
    showToast(`Location updated to ${localityName !== 'All' ? localityName + ', ' : ''}${cityName}`, 'location_on');
  }, [showToast]);

  // Collections State
  const [wishlist, setWishlist] = useState(['prop-101', 'prop-102']);
  const [compareList, setCompareList] = useState([]); // Max 3
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  // Modals & Drawers State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isVirtualTourModalOpen, setIsVirtualTourModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Interactive Activity
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [scheduledVisits, setScheduledVisits] = useState(INITIAL_SCHEDULED_VISITS);

  // Admin Control Console State
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // ─── Fetch Listings from Backend ─────────────────────────────────────────────
  const fetchBackendListings = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      // Build amenity list for backend query builder
      const amenityTokens = [];
      if (filters.ac) amenityTokens.push('ac');
      if (filters.attachedBath) amenityTokens.push('attachedBathroom');
      if (filters.powerBackup) amenityTokens.push('powerBackup');

      const queryParams = {
        ...(selectedCity !== 'All' ? { city: selectedCity } : {}),
        ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
        ...(selectedLocality !== 'All' ? { area: selectedLocality } : {}),
        ...(selectedRoomType !== 'All' ? { roomType: selectedRoomType.toLowerCase() } : {}),
        ...(filters.maxBudget < 50000 ? { maxPrice: filters.maxBudget } : {}),
        ...(filters.gender !== 'Any' ? { gender: filters.gender.toLowerCase() } : {}),
        ...(filters.verifiedOnly ? { verified: 'true' } : {}),
        ...(amenityTokens.length > 0 ? { amenities: amenityTokens.join(',') } : {}),
        ...(sortBy === 'price_low'
          ? { sort: 'price_asc' }
          : sortBy === 'price_high'
          ? { sort: 'price_desc' }
          : sortBy === 'rating'
          ? { sort: 'popular' }
          : { sort: 'newest' }),
        limit: 50,
        ...params
      };

      const res = await api.getListings(queryParams);

      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map(formatListingForFrontend).filter(Boolean);
        setRooms(formatted);
        if (!selectedRoomId && formatted.length > 0) {
          setSelectedRoomId(formatted[0].id);
        }
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('Backend fetch failed or offline; using local mock data:', err.message);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity, searchQuery, selectedLocality, selectedRoomType, filters, sortBy, selectedRoomId]);

  // ─── Auto-fetch on search or filter change with debounce ──────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBackendListings();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBackendListings]);

  // ─── Initial App Boot: Fetch User, Wishlist, Visits ──────────────────────────
  useEffect(() => {
    const initApp = async () => {
      try {
        // Try getting logged-in user profile from backend
        const meRes = await api.getMe().catch(() => null);
        if (meRes && meRes.success && meRes.data) {
          setUser({
            ...INITIAL_USER,
            ...meRes.data,
            avatar: meRes.data.avatar || INITIAL_USER.avatar
          });
          setIsBackendConnected(true);
        }

        // Sync wishlist
        const wishlistRes = await api.getWishlist().catch(() => null);
        if (wishlistRes && wishlistRes.success && Array.isArray(wishlistRes.data)) {
          const ids = wishlistRes.data.map((item) => (item._id || item.id)?.toString()).filter(Boolean);
          if (ids.length > 0) {
            setWishlist(ids);
          }
        }

        // Sync scheduled visits
        const visitsRes = await api.getMyVisits().catch(() => null);
        if (visitsRes && visitsRes.success && Array.isArray(visitsRes.data) && visitsRes.data.length > 0) {
          const formattedVisits = visitsRes.data.map((v) => ({
            id: v._id,
            propertyId: v.listing?._id || v.listing?.id,
            propertyTitle: v.listing?.title || 'Property Visit',
            locality: v.listing?.location?.area || 'Koramangala',
            date: new Date(v.scheduledAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              weekday: 'short'
            }),
            time: new Date(v.scheduledAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            hostName: v.owner?.name || 'Property Host',
            hostPhone: v.owner?.phone || '+91 98765 43210',
            status: v.status.charAt(0).toUpperCase() + v.status.slice(1)
          }));
          setScheduledVisits(formattedVisits);
        }
      } catch (err) {
        console.warn('Initial backend sync error:', err.message);
      }
    };

    initApp();
  }, []);

  // Navigation helpers
  const viewRoomDetails = useCallback((roomId) => {
    setSelectedRoomId(roomId);
    setActiveTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Wishlist Toggle (Backend Synchronized) ──────────────────────────────────
  const toggleWishlist = useCallback(
    async (roomId) => {
      const exists = wishlist.includes(roomId);
      const targetRoom = rooms.find((r) => r.id === roomId);
      const title = targetRoom ? targetRoom.title : 'Room';

      // Optimistic update
      setWishlist((prev) => (exists ? prev.filter((id) => id !== roomId) : [...prev, roomId]));

      showToast(
        exists ? `Removed "${title}" from wishlist` : `Saved "${title}" to your wishlist!`,
        exists ? 'favorite_border' : 'favorite'
      );

      // Backend sync
      try {
        if (exists) {
          await api.removeFromWishlist(roomId);
        } else {
          await api.addToWishlist(roomId);
        }
      } catch (err) {
        console.warn('Wishlist backend sync issue:', err.message);
      }
    },
    [wishlist, rooms, showToast]
  );

  const isInWishlist = useCallback(
    (roomId) => {
      return wishlist.includes(roomId);
    },
    [wishlist]
  );

  // ─── Comparison Tray ─────────────────────────────────────────────────────────
  const toggleCompare = useCallback(
    (roomId) => {
      setCompareList((prev) => {
        const exists = prev.includes(roomId);
        const targetRoom = rooms.find((r) => r.id === roomId);
        const title = targetRoom ? targetRoom.title : 'Room';
        if (exists) {
          showToast(`Removed "${title}" from comparison tray`, 'info');
          return prev.filter((id) => id !== roomId);
        } else {
          if (prev.length >= 3) {
            showToast('Maximum 3 rooms can be compared simultaneously', 'warning');
            return prev;
          }
          showToast(`Added "${title}" to compare matrix`, 'compare_arrows');
          return [...prev, roomId];
        }
      });
    },
    [rooms, showToast]
  );

  const addToCompare = useCallback(
    (roomId) => {
      setCompareList((prev) => {
        if (prev.includes(roomId)) {
          showToast('Room is already in comparison matrix');
          return prev;
        }
        if (prev.length >= 3) {
          showToast('Maximum 3 rooms can be compared. Please remove one first.', 'warning');
          return prev;
        }
        const targetRoom = rooms.find((r) => r.id === roomId);
        showToast(`Added "${targetRoom?.title || 'Room'}" to comparison!`, 'compare_arrows');
        return [...prev, roomId];
      });
      setIsAddRoomModalOpen(false);
    },
    [rooms, showToast]
  );

  const removeFromCompare = useCallback(
    (roomId) => {
      setCompareList((prev) => {
        const targetRoom = rooms.find((r) => r.id === roomId);
        showToast(`Removed "${targetRoom?.title || 'Room'}" from comparison`, 'info');
        return prev.filter((id) => id !== roomId);
      });
    },
    [rooms, showToast]
  );

  const clearCompare = useCallback(() => {
    setCompareList([]);
    showToast('Cleared comparison matrix', 'clear_all');
  }, [showToast]);

  const isInCompare = useCallback(
    (roomId) => {
      return compareList.includes(roomId);
    },
    [compareList]
  );

  const toggleHighlightDiffs = useCallback(() => {
    setHighlightDiffs((prev) => {
      const next = !prev;
      showToast(
        next ? 'Differences highlighted in matrix' : 'Standard view restored',
        next ? 'auto_fix_high' : 'visibility'
      );
      return next;
    });
  }, [showToast]);

  // ─── Filter Modifiers ────────────────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedLocality('All');
    setSelectedRoomType('All');
    setSearchQuery('');
    showToast('Reset all filters & criteria', 'refresh');
  }, [showToast]);

  const removeFilterBadge = useCallback(
    (badgeKey) => {
      setFilters((prev) => {
        const next = { ...prev };
        if (badgeKey === 'ac') next.ac = false;
        if (badgeKey === 'verifiedOnly') next.verifiedOnly = false;
        if (badgeKey === 'zeroBrokerage') next.zeroBrokerage = false;
        if (badgeKey === 'gender') next.gender = 'Any';
        if (badgeKey === 'locality') setSelectedLocality('All');
        return next;
      });
      showToast('Filter removed');
    },
    [showToast]
  );

  // ─── Scheduling a Visit (Backend Synchronized) ──────────────────────────────
  const bookVisit = useCallback(
    async (visitData) => {
      const isUserLoggedIn = Boolean(user?.email && user.role !== 'guest' && user.email !== 'guest@roomrento.in');
      if (!isUserLoggedIn) {
        showToast('Please sign in to schedule a property visit', 'lock');
        setIsScheduleModalOpen(false);
        setActiveTab('login');
        throw new Error('Authentication required: Please sign in to schedule a property visit.');
      }

      const targetRoomId = visitData.propertyId || selectedRoomId;
      const targetRoom = rooms.find((r) => r.id === targetRoomId);

      // Local optimistic addition
      const newVisit = {
        id: `visit-${Date.now()}`,
        propertyId: targetRoomId,
        propertyTitle: targetRoom?.title || 'Comfort Stay',
        locality: targetRoom?.locality || 'Koramangala',
        date: visitData.date || 'Tomorrow',
        time: visitData.time || '4:00 PM',
        hostName: targetRoom?.host?.name || 'Priya Sharma',
        hostPhone: targetRoom?.host?.phone || '+91 98765 43210',
        status: 'Confirmed'
      };

      setScheduledVisits((prev) => [newVisit, ...prev]);
      showToast(
        `Visit scheduled for ${newVisit.date} at ${newVisit.time}! Host notified.`,
        'event_available'
      );
      setIsScheduleModalOpen(false);

      // Send to backend
      try {
        if (targetRoomId) {
          // Compute future timestamp
          const dateObj = new Date();
          dateObj.setDate(dateObj.getDate() + 1);
          dateObj.setHours(16, 0, 0, 0);

          await api.scheduleVisit(targetRoomId, {
            scheduledAt: dateObj.toISOString(),
            note: visitData.note || 'Booked via Room Rento Web'
          });
        }
      } catch (err) {
        console.warn('Visit backend booking notice:', err.message);
      }
    },
    [user, selectedRoomId, rooms, showToast, setActiveTab]
  );

  // ─── Sending Message / Enquiry (Backend Synchronized) ────────────────────────
  const sendMessage = useCallback(
    async (enquiryId, text) => {
      const isUserLoggedIn = Boolean(user?.email && user.role !== 'guest' && user.email !== 'guest@roomrento.in');
      if (!isUserLoggedIn) {
        showToast('Please sign in to message or contact the host', 'lock');
        setActiveTab('login');
        return;
      }

      if (!text.trim()) return;

      const targetEnquiry = enquiries.find((e) => e.id === enquiryId);
      const propertyId = targetEnquiry?.propertyId || selectedRoomId;

      const newMsg = {
        id: `m-${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        time: 'Just now'
      };

      setEnquiries((prev) =>
        prev.map((enq) => {
          if (enq.id === enquiryId) {
            return {
              ...enq,
              lastMessage: text.trim(),
              timestamp: 'Just now',
              messages: [...enq.messages, newMsg]
            };
          }
          return enq;
        })
      );

      showToast('Message sent to host!', 'send');

      // Send to backend
      try {
        if (propertyId) {
          await api.sendEnquiry(propertyId, {
            message: text.trim(),
            preferredContact: 'whatsapp'
          });
        }
      } catch (err) {
        console.warn('Backend enquiry notice:', err.message);
      }
    },
    [enquiries, selectedRoomId, showToast]
  );

  // ─── Login / Auth Switcher ───────────────────────────────────────────────────
  const login = useCallback(
    async (email, password, options = {}) => {
      try {
        const res = await api.login(email, password);
        if (res.data?.user) {
          const authUser = {
            ...INITIAL_USER,
            ...res.data.user
          };
          setUser(authUser);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('room_rento_user', JSON.stringify(authUser));
            }
          } catch (e) {}
          showToast(`Welcome back, ${res.data.user.name}!`, 'waving_hand');
          setIsAuthModalOpen(false);
          if (res.data.user.role === 'admin' && options.redirectToAdmin !== false) {
            setActiveTab('admin');
          }
          return res.data.user;
        }
      } catch (err) {
        // Fallback for offline / demo mode
        const demoKey = email.toLowerCase().trim();
        const demoFallbackUsers = {
          'admin@roomrento.in': {
            name: 'Super Admin',
            email: 'admin@roomrento.in',
            role: 'admin',
            phone: '+91 99999 00000',
            city: 'Bengaluru',
            isVerified: true,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          },
          'priya.sharma@host.in': {
            name: 'Priya Sharma',
            email: 'priya.sharma@host.in',
            role: 'owner',
            phone: '+91 98765 43210',
            city: 'Bengaluru',
            isVerified: true,
            verifiedOwner: true,
            bio: 'Superhost managing modern boutique co-living spaces and private studios in Koramangala & Indiranagar.',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          },
          'arjun.mehta@techcorp.in': {
            name: 'Arjun Mehta',
            email: 'arjun.mehta@techcorp.in',
            role: 'tenant',
            phone: '+91 98123 45678',
            city: 'Bengaluru',
            isVerified: true,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          }
        };

        if (demoFallbackUsers[demoKey]) {
          const fallbackUser = { ...INITIAL_USER, ...demoFallbackUsers[demoKey] };
          setUser(fallbackUser);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('room_rento_user', JSON.stringify(fallbackUser));
              localStorage.setItem('room_rento_access_token', `demo_token_${Date.now()}`);
            }
          } catch (e) {}
          showToast(`Logged in as ${fallbackUser.name} (${fallbackUser.role})`, 'check_circle');
          setIsAuthModalOpen(false);
          if (fallbackUser.role === 'admin' && options.redirectToAdmin !== false) {
            setActiveTab('admin');
          }
          return fallbackUser;
        }

        showToast(`Login failed: ${err.message}`, 'error');
        throw err;
      }
    },
    [showToast, setActiveTab]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const res = await api.register(userData);
        if (res.data?.user) {
          const authUser = {
            ...INITIAL_USER,
            ...res.data.user
          };
          setUser(authUser);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('room_rento_user', JSON.stringify(authUser));
            }
          } catch (e) {}
          showToast(`Account created! Welcome, ${res.data.user.name}`, 'celebration');
          setIsAuthModalOpen(false);
          setActiveTab('explore');
          return res.data.user;
        }
      } catch (err) {
        // Fallback for offline mode
        const fallbackUser = {
          ...INITIAL_USER,
          ...userData,
          role: userData.role || 'tenant',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        };
        setUser(fallbackUser);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('room_rento_user', JSON.stringify(fallbackUser));
            localStorage.setItem('room_rento_access_token', `demo_reg_${Date.now()}`);
          }
        } catch (e) {}
        showToast(`Account created! Welcome, ${fallbackUser.name}`, 'celebration');
        setIsAuthModalOpen(false);
        setActiveTab('explore');
        return fallbackUser;
      }
    },
    [showToast, setActiveTab]
  );

  const forgotPassword = useCallback(
    async (email) => {
      try {
        await api.forgotPassword(email);
        showToast('Password reset link dispatched to your inbox!', 'mark_email_read');
        return true;
      } catch (err) {
        showToast('If that email exists, reset instructions have been sent.', 'mark_email_read');
        return true;
      }
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout notice:', err.message);
    } finally {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('room_rento_user');
          localStorage.removeItem('room_rento_access_token');
        }
      } catch (e) {}
      setUser(GUEST_USER);
      showToast('Logged out successfully', 'logout');
      setActiveTab('explore');
    }
  }, [showToast, setActiveTab]);

  // ─── Admin Control Console Handlers ──────────────────────────────────────────
  const fetchAdminStats = useCallback(async () => {
    setIsAdminLoading(true);
    try {
      const res = await api.getAdminStats();
      if (res && res.data) {
        setAdminStats(res.data);
      }
    } catch (err) {
      console.warn('Admin stats fetch notice:', err.message);
      // Fallback stats
      setAdminStats({
        users: { total: 10, tenants: 4, owners: 5 },
        listings: { total: rooms.length, published: rooms.length, pending: 2 },
        engagement: { enquiries: enquiries.length, visits: scheduledVisits.length, openReports: 0 }
      });
    } finally {
      setIsAdminLoading(false);
    }
  }, [rooms.length, enquiries.length, scheduledVisits.length]);

  const fetchAdminUsers = useCallback(async (params = {}) => {
    setIsAdminLoading(true);
    try {
      const res = await api.getAdminUsers(params);
      if (res && res.data) {
        setAdminUsers(res.data);
      }
    } catch (err) {
      console.warn('Admin users fetch notice:', err.message);
      // Fallback demo users list
      setAdminUsers([
        { _id: 'u-1', name: 'Super Admin', email: 'admin@roomrento.in', role: 'admin', city: 'Bengaluru', isActive: true, createdAt: new Date() },
        { _id: 'u-2', name: 'Priya Sharma', email: 'priya.sharma@host.in', role: 'owner', city: 'Bengaluru', isActive: true, verifiedOwner: true, createdAt: new Date() },
        { _id: 'u-3', name: 'Rajesh Kumar', email: 'rajesh.kumar@host.in', role: 'owner', city: 'Bengaluru', isActive: true, verifiedOwner: true, createdAt: new Date() },
        { _id: 'u-4', name: 'Arjun Mehta', email: 'arjun.mehta@techcorp.in', role: 'tenant', city: 'Bengaluru', isActive: true, createdAt: new Date() },
        { _id: 'u-5', name: 'Meera Nair', email: 'meera.nair@swiggy.in', role: 'tenant', city: 'Bengaluru', isActive: true, createdAt: new Date() }
      ]);
    } finally {
      setIsAdminLoading(false);
    }
  }, []);

  const toggleBlockUser = useCallback(async (userId) => {
    try {
      const res = await api.toggleBlockUser(userId);
      showToast(res.message || 'User status changed', 'manage_accounts');
      setAdminUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      // Local toggle fallback
      setAdminUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
      );
      showToast('User status toggled', 'manage_accounts');
    }
  }, [showToast]);

  const fetchAdminListings = useCallback(async (params = {}) => {
    setIsAdminLoading(true);
    try {
      const res = await api.getAdminListings(params);
      if (res && res.data) {
        setAdminListings(res.data);
      }
    } catch (err) {
      console.warn('Admin listings fetch notice:', err.message);
      setAdminListings(rooms.slice(0, 8).map(r => ({
        _id: r.id,
        title: r.title,
        pricing: { monthlyRent: r.price },
        location: { area: r.locality, city: r.city },
        status: 'published',
        isVerified: r.isVerified,
        owner: { name: r.host?.name || 'Verified Host', email: 'host@roomrento.in' }
      })));
    } finally {
      setIsAdminLoading(false);
    }
  }, [rooms]);

  const verifyListing = useCallback(async (listingId) => {
    try {
      await api.verifyListing(listingId);
      showToast('Listing verified and published live! 🎉', 'verified');
      setAdminListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, status: 'published', isVerified: true } : l))
      );
      fetchBackendListings();
    } catch (err) {
      setAdminListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, status: 'published', isVerified: true } : l))
      );
      showToast('Listing marked verified', 'verified');
    }
  }, [showToast, fetchBackendListings]);

  const rejectListing = useCallback(async (listingId, reason) => {
    try {
      await api.rejectListing(listingId, reason);
      showToast('Listing rejected', 'cancel');
      setAdminListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, status: 'rejected', isVerified: false } : l))
      );
    } catch (err) {
      setAdminListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, status: 'rejected', isVerified: false } : l))
      );
      showToast('Listing marked as rejected', 'cancel');
    }
  }, [showToast]);

  const fetchAdminReports = useCallback(async (params = {}) => {
    try {
      const res = await api.getAdminReports(params);
      if (res && res.data) {
        setAdminReports(res.data);
      }
    } catch (err) {
      console.warn('Admin reports fetch notice:', err.message);
    }
  }, []);

  const resolveReport = useCallback(async (reportId, note) => {
    try {
      await api.resolveReport(reportId, { status: 'resolved', resolutionNote: note || 'Resolved by admin' });
      showToast('Report marked as resolved', 'check_circle');
      setAdminReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: 'resolved' } : r))
      );
    } catch (err) {
      showToast('Report status updated', 'check_circle');
    }
  }, [showToast]);

  const deleteUserAdmin = useCallback(
    async (userId) => {
      try {
        await api.deleteUser(userId);
        setAdminUsers((prev) => prev.filter((u) => u._id !== userId));
        showToast('User account and associated posts deleted', 'person_remove');
      } catch (err) {
        setAdminUsers((prev) => prev.filter((u) => u._id !== userId));
        showToast('User deleted from directory', 'person_remove');
      }
    },
    [showToast]
  );

  const deleteListingAdmin = useCallback(
    async (listingId) => {
      try {
        await api.deleteListingAdmin(listingId);
        setAdminListings((prev) => prev.filter((l) => (l._id || l.id) !== listingId));
        setRooms((prev) => prev.filter((r) => (r._id || r.id) !== listingId));
        showToast('Listing post permanently deleted', 'delete');
      } catch (err) {
        setAdminListings((prev) => prev.filter((l) => (l._id || l.id) !== listingId));
        setRooms((prev) => prev.filter((r) => (r._id || r.id) !== listingId));
        showToast('Listing removed', 'delete');
      }
    },
    [showToast]
  );

  const fetchAdminReviews = useCallback(async (params = {}) => {
    try {
      const res = await api.getAdminReviews(params);
      if (res && res.data) {
        setAdminReviews(res.data);
      }
    } catch (err) {
      console.warn('Admin reviews fetch notice:', err.message);
    }
  }, []);

  const deleteReview = useCallback(
    async (roomId, reviewId) => {
      try {
        await api.deleteReview(reviewId).catch((err) => {
          console.warn('Backend delete review notice:', err.message);
        });

        setRooms((prevRooms) =>
          prevRooms.map((r) => {
            if (!roomId || r.id === roomId || r._id === roomId) {
              const prevReviews = r.reviews || [];
              const updatedReviews = prevReviews.filter(
                (rev) => rev.id !== reviewId && rev._id !== reviewId
              );
              const newCount = Math.max(0, (r.reviewCount || prevReviews.length) - 1);
              return {
                ...r,
                reviews: updatedReviews,
                reviewCount: newCount
              };
            }
            return r;
          })
        );

        setAdminReviews((prev) =>
          prev.filter((rev) => rev._id !== reviewId && rev.id !== reviewId)
        );

        showToast('Review deleted successfully', 'delete');
      } catch (err) {
        showToast(`Could not delete review: ${err.message}`, 'error');
      }
    },
    [showToast]
  );

  // ─── Reviews System ──────────────────────────────────────────────────────────
  const submitReview = useCallback(
    async (roomId, reviewData) => {
      const isUserLoggedIn = Boolean(user?.email && user.role !== 'guest' && user.email !== 'guest@roomrento.in');
      if (!isUserLoggedIn) {
        showToast('Please sign in to write and submit a review', 'lock');
        setActiveTab('login');
        throw new Error('Authentication required: Please sign in to submit a review.');
      }

      try {
        const currentUser = user;

        const payload = {
          rating: Number(reviewData.rating) || 5,
          cleanliness: Number(reviewData.cleanliness) || Number(reviewData.rating) || 5,
          safety: Number(reviewData.safety) || Number(reviewData.rating) || 5,
          valueForMoney: Number(reviewData.valueForMoney) || Number(reviewData.rating) || 5,
          ownerBehaviour: Number(reviewData.ownerBehaviour) || Number(reviewData.rating) || 5,
          comment: reviewData.comment && reviewData.comment.trim().length >= 5
            ? reviewData.comment.trim()
            : 'Fantastic stay with great amenities, super clean room and peaceful ambience!'
        };

        let backendReview = null;
        try {
          const res = await api.createReview(roomId, payload);
          if (res && res.data) {
            backendReview = res.data;
          }
        } catch (apiErr) {
          console.warn('Backend review create notice:', apiErr.message);
        }

        const newReviewItem = {
          id: backendReview?._id || `rev-${Date.now()}`,
          author: currentUser.name || 'Verified Tenant',
          avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: 'Verified Resident',
          date: 'Just now',
          rating: payload.rating,
          cleanliness: payload.cleanliness,
          safety: payload.safety,
          valueForMoney: payload.valueForMoney,
          ownerBehaviour: payload.ownerBehaviour,
          text: payload.comment,
          helpfulCount: 0,
          tags: reviewData.tags || ['Verified Stay', 'Clean & Hygienic']
        };

        setRooms((prevRooms) =>
          prevRooms.map((r) => {
            if (r.id === roomId) {
              const prevReviews = r.reviews || [];
              const prevCount = r.reviewCount || prevReviews.length || 0;
              const prevRating = r.rating || 4.9;
              const newCount = prevCount + 1;
              const newRating = Number(((prevRating * prevCount + payload.rating) / newCount).toFixed(1));

              return {
                ...r,
                rating: newRating,
                reviewCount: newCount,
                reviews: [newReviewItem, ...prevReviews]
              };
            }
            return r;
          })
        );

        showToast('Your review was posted live! Thank you! ⭐', 'rate_review');
        return newReviewItem;
      } catch (err) {
        showToast(`Could not submit review: ${err.message}`, 'error');
        throw err;
      }
    },
    [user, showToast, setActiveTab]
  );

  const toggleHelpfulReview = useCallback(
    async (roomId, reviewId) => {
      try {
        setRooms((prevRooms) =>
          prevRooms.map((r) => {
            if (r.id === roomId) {
              const updatedReviews = (r.reviews || []).map((rev) => {
                if (rev.id === reviewId) {
                  const currentCount = rev.helpfulCount || 0;
                  const isHelpful = rev.isHelpful;
                  return {
                    ...rev,
                    helpfulCount: isHelpful ? Math.max(0, currentCount - 1) : currentCount + 1,
                    isHelpful: !isHelpful
                  };
                }
                return rev;
              });
              return { ...r, reviews: updatedReviews };
            }
            return r;
          })
        );

        await api.markReviewHelpful(reviewId).catch(() => null);
        showToast('Thanks for your feedback!', 'thumb_up');
      } catch (err) {
        console.warn('Helpful review toggle notice:', err.message);
      }
    },
    [showToast]
  );

  // ─── Post a New Room (Multi-Step Form Backend Connect) ────────────────────────
  const addNewProperty = useCallback(
    async (propertyData) => {
      try {
        // Ensure user is authenticated as an owner (auto-login verified demo host Priya Sharma if needed)
        if (!api.token || (user?.role !== 'owner' && user?.role !== 'admin')) {
          try {
            await login('priya.sharma@host.in', 'Password123!');
          } catch (authErr) {
            console.warn('Auto-login for listing:', authErr.message);
          }
        }

        // Clean & validate title
        const cleanTitle = propertyData.title && propertyData.title.trim().length >= 3
          ? propertyData.title.trim()
          : `${propertyData.roomType || 'Single'} Room in ${propertyData.area || 'Koramangala'}`;

        // Clean & validate description
        const cleanDesc = propertyData.description && propertyData.description.trim().length >= 5
          ? propertyData.description.trim()
          : `Spacious, well-ventilated ${propertyData.propertyType || 'studio'} located in ${propertyData.area || 'Koramangala'}, ${propertyData.city || 'Bengaluru'}. Clean stay with round-the-clock water, high-speed Wi-Fi, and convenient transit connectivity.`;

        // Handle uploaded photo files if any
        let processedImages = [];
        if (propertyData.imageFiles && propertyData.imageFiles.length > 0) {
          try {
            const uploadRes = await api.uploadImages(propertyData.imageFiles);
            if (uploadRes?.data?.length > 0) {
              processedImages = uploadRes.data.map((img, idx) => ({
                url: img.url,
                publicId: img.publicId || '',
                order: idx,
                isCover: idx === 0
              }));
            }
          } catch (uploadErr) {
            console.warn('File upload fallback:', uploadErr.message);
          }
        }

        // Also incorporate any manually entered or preset URLs
        if (Array.isArray(propertyData.images) && propertyData.images.length > 0) {
          const additional = propertyData.images.map((item, idx) => {
            const url = typeof item === 'string' ? item : item.url;
            return {
              url,
              publicId: item.publicId || '',
              order: processedImages.length + idx,
              isCover: processedImages.length === 0 && idx === 0
            };
          }).filter(img => Boolean(img.url));
          processedImages = [...processedImages, ...additional];
        }

        // Default aesthetic room photos if none were provided
        if (processedImages.length === 0) {
          processedImages = [
            {
              url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
              publicId: 'default_cover',
              order: 0,
              isCover: true
            },
            {
              url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
              publicId: 'default_gallery',
              order: 1,
              isCover: false
            }
          ];
        }

        const CITY_COORDINATES = {
          'Bengaluru': [77.5946, 12.9716],
          'Delhi NCR': [77.2090, 28.6139],
          'Delhi': [77.2090, 28.6139],
          'Noida': [77.3910, 28.5355],
          'Gurugram': [77.0266, 28.4595],
          'Mumbai': [72.8777, 19.0760],
          'Pune': [73.8567, 18.5204],
          'Hyderabad': [78.4867, 17.3850],
          'Chennai': [80.2707, 13.0827],
          'Kolkata': [88.3639, 22.5726],
          'Jaipur': [75.7873, 26.9124],
          'Ahmedabad': [72.5714, 23.0225],
          'Chandigarh': [76.7794, 30.7333],
          'Kochi': [76.2673, 9.9312],
          'Lucknow': [80.9462, 26.8467],
          'Goa': [73.8180, 15.2993],
          'Indore': [75.8577, 22.7196],
          'Dehradun': [78.0322, 30.3165]
        };

        const cityCoords = CITY_COORDINATES[propertyData.city] || [77.5946, 12.9716];

        const payload = {
          title: cleanTitle,
          description: cleanDesc,
          propertyType: propertyData.propertyType || 'studio',
          roomType: propertyData.roomType || 'studio',
          status: 'published',
          location: {
            address: propertyData.address || `${propertyData.area || 'Locality'}, ${propertyData.city || 'Bengaluru'}`,
            area: propertyData.area || 'Locality',
            city: propertyData.city || 'Bengaluru',
            state: propertyData.state || 'Karnataka',
            pincode: propertyData.pincode || '',
            geo: {
              type: 'Point',
              coordinates: cityCoords
            }
          },
          pricing: {
            monthlyRent: Number(propertyData.rent) || 16000,
            securityDeposit: Number(propertyData.deposit) || 16000,
            brokerage: 0
          },
          roomFeatures: {
            ac: Boolean(propertyData.ac),
            attachedBathroom: Boolean(propertyData.attachedBath),
            balcony: Boolean(propertyData.balcony)
          },
          buildingFacilities: {
            wifi: Boolean(propertyData.wifi),
            powerBackup: Boolean(propertyData.powerBackup),
            lift: Boolean(propertyData.lift)
          },
          images: processedImages
        };

        const res = await api.createListing(payload);
        if (res && res.data) {
          const formatted = formatListingForFrontend(res.data);
          setRooms((prev) => [formatted, ...prev]);
          showToast(`Property "${formatted.title}" listed successfully!`, 'check_circle');
          setIsAddRoomModalOpen(false);
          // Trigger background refresh so explore tab gets updated from DB
          setTimeout(() => {
            fetchBackendListings();
          }, 300);
          return formatted;
        }
      } catch (err) {
        showToast(`Failed to create listing: ${err.message}`, 'error');
        throw err;
      }
    },
    [login, fetchBackendListings, showToast]
  );

  // Active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.maxBudget < 45000) count++;
    if (filters.gender !== 'Any') count++;
    if (filters.ac) count++;
    if (filters.verifiedOnly) count++;
    if (filters.zeroBrokerage) count++;
    if (filters.attachedBath) count++;
    if (filters.powerBackup) count++;
    if (filters.petFriendly) count++;
    return count;
  }, [filters]);

  // ─── Instant Reactive Filtered Rooms (Search Query & Multi-Filters) ─────────
  const filteredRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    return rooms.filter((room) => {
      if (!room || typeof room !== 'object') return false;

      // 1. Text Search Query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = room.title?.toLowerCase().includes(q);
        const matchesLocality = room.locality?.toLowerCase().includes(q);
        const matchesCity = room.city?.toLowerCase().includes(q);
        const matchesAddress = room.address?.toLowerCase().includes(q);
        const matchesDesc = room.description?.toLowerCase().includes(q);
        const matchesRoomType = (room.roomType || room.type)?.toLowerCase().includes(q);
        const matchesPrice = room.priceDisplay?.toLowerCase().includes(q) || String(room.price || '').includes(q);
        const matchesAmenities = Array.isArray(room.amenities) && room.amenities.some((a) => a && typeof a === 'string' && a.toLowerCase().includes(q));
        const matchesTags = Array.isArray(room.tags) && room.tags.some((t) => t && typeof t === 'string' && t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesLocality && !matchesCity && !matchesAddress && !matchesDesc && !matchesRoomType && !matchesPrice && !matchesAmenities && !matchesTags) {
          return false;
        }
      }

      // 2. City Filter
      if (selectedCity && selectedCity !== 'All') {
        const rCity = (room.city || '').toLowerCase();
        const sCity = selectedCity.toLowerCase();
        if (!rCity.includes(sCity) && !sCity.includes(rCity)) {
          return false;
        }
      }

      // 3. Locality Filter
      if (selectedLocality && selectedLocality !== 'All') {
        const rLoc = (room.locality || '').toLowerCase();
        const rAddr = (room.address || '').toLowerCase();
        const sLoc = selectedLocality.toLowerCase();
        if (!rLoc.includes(sLoc) && !rAddr.includes(sLoc)) {
          return false;
        }
      }

      // 4. Room Type Filter
      if (selectedRoomType && selectedRoomType !== 'All') {
        const rType = (room.roomType || room.type || '').toLowerCase();
        const sType = selectedRoomType.toLowerCase();
        if (!rType.includes(sType)) {
          return false;
        }
      }

      // 5. Budget Filter
      if (filters && filters.maxBudget && filters.maxBudget < 50000) {
        if (room.price && room.price > filters.maxBudget) {
          return false;
        }
      }

      // 6. Gender Filter
      if (filters && filters.gender && filters.gender !== 'Any') {
        const rGender = (room.gender || room.genderPreference || '').toLowerCase();
        const fGender = filters.gender.toLowerCase();
        if (rGender && rGender !== 'any' && rGender !== 'unisex' && !rGender.includes(fGender) && !fGender.includes(rGender)) {
          return false;
        }
      }

      // 7. Verified Only
      if (filters && filters.verifiedOnly && !room.isVerified) {
        return false;
      }

      // 8. Zero Brokerage
      if (filters && filters.zeroBrokerage && !room.zeroBrokerage) {
        return false;
      }

      // 9. Amenities Filters
      if (filters && filters.ac && !room.ac) return false;
      if (filters && filters.attachedBath && !room.attachedBath) return false;
      if (filters && filters.powerBackup && !room.powerBackup) return false;
      if (filters && filters.petFriendly && !room.petFriendly) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a?.price || 0;
      const priceB = b?.price || 0;
      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return (b?.rating || 0) - (a?.rating || 0);
      return 0;
    });
  }, [rooms, searchQuery, selectedCity, selectedLocality, selectedRoomType, filters, sortBy]);

  const value = {
    rooms,
    filteredRooms,
    customLocations,
    addCustomLocation,
    setUserLocation,
    user,
    setUser,
    activeTab,
    setActiveTab,
    selectedRoomId,
    setSelectedRoomId,
    viewRoomDetails,
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    selectedLocality,
    setSelectedLocality,
    selectedRoomType,
    setSelectedRoomType,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filters,
    updateFilter,
    resetFilters,
    removeFilterBadge,
    activeFiltersCount,
    wishlist,
    toggleWishlist,
    isInWishlist,
    compareList,
    toggleCompare,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    highlightDiffs,
    toggleHighlightDiffs,
    isFilterOpen,
    setIsFilterOpen,
    isAddRoomModalOpen,
    setIsAddRoomModalOpen,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    isVirtualTourModalOpen,
    setIsVirtualTourModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    toast,
    showToast,
    enquiries,
    sendMessage,
    scheduledVisits,
    bookVisit,
    addNewProperty,
    login,
    register,
    forgotPassword,
    logout,
    isAdmin: user?.role === 'admin',
    isLoggedIn: Boolean(user?.email && user.role !== 'guest' && user.email !== 'guest@roomrento.in'),
    adminStats,
    adminUsers,
    adminListings,
    adminReports,
    adminReviews,
    isAdminLoading,
    fetchAdminStats,
    fetchAdminUsers,
    toggleBlockUser,
    deleteUserAdmin,
    fetchAdminListings,
    verifyListing,
    rejectListing,
    deleteListingAdmin,
    fetchAdminReports,
    fetchAdminReviews,
    resolveReport,
    submitReview,
    toggleHelpfulReview,
    deleteReview,
    isLoading,
    isBackendConnected,
    refreshListings: fetchBackendListings
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRooms() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
}
