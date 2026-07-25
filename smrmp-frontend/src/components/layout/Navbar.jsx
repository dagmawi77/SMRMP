import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { authApi } from '../../api/authApi';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationModal from '../notifications/NotificationModal';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { toggleMobileOpen } = useUiStore();
  const { toggleModal, getUnreadCount } = useNotificationStore();

  const unreadCount = getUnreadCount();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed with local logout even if API fails
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E2D6C5] bg-[#FAF6F0]/90 px-4 sm:px-6 backdrop-blur-md text-[#2B1B12]">
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleMobileOpen}
          aria-label="Toggle navigation menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] text-[#2B1B12] hover:bg-[#FAF0E4] lg:hidden transition-colors"
        >
          <Bars3Icon className="h-4 w-4" />
        </button>
      </div>

      {/* Right: Notifications, User Profile, Settings & Logout */}
      <div className="flex items-center gap-2">
        {/* Notification Bell Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleModal();
          }}
          title="Toggle System Notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
        >
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-2 ring-[#FAF6F0] animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="hidden sm:block text-right cursor-pointer group rounded-lg px-2 py-1 hover:bg-[#FAF0E4] transition-colors"
          title="Open Curator Settings"
        >
          <p className="text-xs font-bold text-[#2B1B12] leading-tight group-hover:text-[#7C4A2D] transition-colors">{user?.name || 'Staff User'}</p>
          <p className="text-[10px] capitalize text-[#7C4A2D] font-bold tracking-wide">{user?.role || 'Staff'}</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          title="Settings & Preferences"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
        >
          <Cog6ToothIcon className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-[#E2D6C5]" />

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-2.5 py-1 text-xs font-semibold text-[#4A2C1B] shadow-2xs hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-3.5 w-3.5 text-[#7C4A2D]" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <NotificationModal />
    </header>
  );
}
