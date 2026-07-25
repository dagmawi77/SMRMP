import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDownIcon,
  TicketIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import useAuthStore from '../../store/authStore';

export default function BuyTicketsDropdown({
  variant = 'primary',
  size = 'md',
  buttonText = 'Buy tickets',
  className = '',
  align = 'right',
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { isAuthenticated, user } = useAuthStore();

  const isVisitorPortal = isAuthenticated && user?.role === 'visitor';
  const basePath = isVisitorPortal ? '/portal/tickets/buy' : '/tickets';

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectOption = (tab) => {
    setIsOpen(false);
    navigate(`${basePath}?tab=${tab}`);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="gap-2"
      >
        <TicketIcon className="h-4 w-4" aria-hidden="true" />
        <span>{buttonText}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </Button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-72 origin-top-${align} rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-2 shadow-xl ring-1 ring-black/5 focus:outline-none transition-all ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="px-3 py-2 border-b border-[#E2D6C5]/60 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7467]">
              Select Ticket Option
            </p>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleSelectOption('individual')}
              className="w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors duration-150 hover:bg-[#FAF0E4] active:bg-[#EFE5D8] group cursor-pointer"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E4EEDC] text-[#374B07] group-hover:scale-105 transition-transform">
                <TicketIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#2B1B12] group-hover:text-[#374B07] transition-colors">
                  Individual Pass
                </p>
                <p className="mt-0.5 text-[11px] text-[#6E5445] leading-snug">
                  Instant digital pass with Telebirr checkout & QR validation.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption('group')}
              className="w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors duration-150 hover:bg-[#FAF0E4] active:bg-[#EFE5D8] group cursor-pointer"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D] group-hover:scale-105 transition-transform">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#2B1B12] group-hover:text-[#7C4A2D] transition-colors">
                  Group Visit Booking
                </p>
                <p className="mt-0.5 text-[11px] text-[#6E5445] leading-snug">
                  School, tour & group visit request (2+ visitors).
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
