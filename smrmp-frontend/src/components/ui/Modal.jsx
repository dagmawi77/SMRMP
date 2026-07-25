import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-[#1C120B]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-2xl border border-smrmp-gold/30 bg-[#FAF6F0] text-[#2B1B12] shadow-2xl transition-all`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[#E2D6C5] bg-[#EFE5D8]/80 px-6 py-4">
            <h2 id="modal-title" className="font-display text-lg font-bold text-[#2B1B12]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#7C4A2D] transition-colors hover:bg-[#FAF0E4] hover:text-[#2B1B12] focus:outline-none focus:ring-2 focus:ring-smrmp-green/20"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
