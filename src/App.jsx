import React from 'react';
import { RoomProvider, useRooms } from './context/RoomContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Toast from './components/common/Toast';
import AddListingModal from './components/common/AddListingModal';
import AuthModal from './components/common/AuthModal';
import ExplorePage from './pages/ExplorePage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import ComparePage from './pages/ComparePage';
import SavedPage from './pages/SavedPage';
import EnquiriesPage from './pages/EnquiriesPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const { activeTab } = useRooms();

  const isFullscreenView = ['details', 'login', 'admin-login', 'admin'].includes(activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Toast Notification */}
      <Toast />

      {/* Global Modals */}
      <AddListingModal />
      <AuthModal />

      {/* Global Navbar */}
      <Navbar />

      {/* Main Dynamic View with proper top offset for header */}
      <main className="flex-1 flex flex-col relative w-full pt-16 sm:pt-20 bg-surface">
        {activeTab === 'explore' && <ExplorePage />}
        {activeTab === 'details' && <RoomDetailsPage />}
        {activeTab === 'compare' && <ComparePage />}
        {activeTab === 'saved' && <SavedPage />}
        {activeTab === 'enquiries' && <EnquiriesPage />}
        {activeTab === 'account' && <AccountPage />}
        {activeTab === 'login' && <LoginPage initialPortal="user" />}
        {activeTab === 'admin-login' && <LoginPage initialPortal="admin" />}
        {activeTab === 'admin' && <AdminDashboardPage />}
      </main>

      {/* Bottom Navigation Bar (Mobile only, hidden on desktop md:hidden, and hidden on focused views) */}
      {!isFullscreenView && <BottomNav />}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const handleResetStorage = () => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('room_rento_custom_locations');
            localStorage.removeItem('room_rento_user');
            localStorage.removeItem('room_rento_access_token');
          }
          if (typeof window !== 'undefined') {
            window.location.hash = 'explore';
            window.location.reload();
          }
        } catch (e) {
          window.location.reload();
        }
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
          <div className="max-w-lg w-full bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-xl border border-surface-container-high/80 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h2 className="font-headline-sm text-[20px] font-extrabold text-on-surface">Something went wrong</h2>
            <p className="font-body-sm text-[13px] text-on-surface-variant">
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
            {this.state.error && (
              <div className="w-full p-3 rounded-xl bg-error/5 border border-error/20 text-error text-left text-xs font-mono max-h-36 overflow-auto">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = 'explore';
                  window.location.reload();
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold shadow-sm hover:bg-primary-container transition-all"
              >
                Reload Explore Page
              </button>
              <button
                onClick={handleResetStorage}
                className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-semibold transition-all"
                title="Clears corrupted localStorage values and resets app state"
              >
                Reset Storage & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <RoomProvider>
        <AppContent />
      </RoomProvider>
    </ErrorBoundary>
  );
}
