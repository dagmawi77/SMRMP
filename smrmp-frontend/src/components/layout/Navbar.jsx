import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  Bars3Icon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { authApi } from '../../api/authApi';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import QRScannerModal from '../artifacts/QRScannerModal';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { toggleMobileOpen } = useUiStore();
  const [showScanner, setShowScanner] = useState(false);

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
      {/* Left: Mobile Toggle & Compact Brand */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleMobileOpen}
          aria-label="Toggle navigation menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] text-[#2B1B12] hover:bg-[#FAF0E4] lg:hidden transition-colors"
        >
          <Bars3Icon className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF0E4] text-[#374B07] border border-[#D4A017]/30 shrink-0">
            <BuildingLibraryIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2B1B12] tracking-tight">
              Adwa Victory Memorial
            </span>
            <span className="hidden sm:inline-block h-3 w-px bg-[#E2D6C5]" />
            <span className="hidden sm:inline-block text-[11px] font-semibold text-[#6E5445]">
              SMRMP
            </span>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-[#E4EEDC] px-2.5 py-0.5 border border-[#B8D4A0] ml-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#374B07]"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#243205]">Operational</span>
        </div>
      </div>

      {/* Center: Search Trigger & QR Scan */}
      <div className="hidden md:flex items-center gap-2 max-w-sm w-full mx-4">
        <button
          type="button"
          onClick={() => navigate('/artifacts')}
          className="flex flex-1 items-center gap-2 rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-1 text-xs text-[#6E5445] transition-all hover:bg-[#FAF0E4] hover:border-[#D4A017]/40"
        >
          <MagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0 text-[#7C4A2D]" />
          <span className="truncate">Search catalog...</span>
          <kbd className="ml-auto rounded bg-[#EFE5D8] px-1.5 py-0.5 text-[9px] font-semibold text-[#5C4233] border border-[#D8C8B8]">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-1.5 rounded-lg border border-smrmp-gold/50 bg-[#FAF0D8] px-2.5 py-1 text-xs font-bold text-[#7C4A2D] shadow-2xs hover:bg-[#FAF0D8]/80 transition-colors"
        >
          <QrCodeIcon className="h-3.5 w-3.5 text-smrmp-gold shrink-0" />
          <span>Scan QR</span>
        </button>
      </div>

      {/* Right: Compact User Profile & Logout */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold text-[#2B1B12] leading-tight">{user?.name || 'Staff User'}</p>
          <p className="text-[10px] capitalize text-[#7C4A2D] font-bold tracking-wide">{user?.role || 'Staff'}</p>
        </div>

        <div className="h-5 w-px bg-[#E2D6C5] hidden sm:block" />

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-2.5 py-1 text-xs font-semibold text-[#4A2C1B] shadow-2xs hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-3.5 w-3.5 text-[#7C4A2D]" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <QRScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </header>
  );
}
