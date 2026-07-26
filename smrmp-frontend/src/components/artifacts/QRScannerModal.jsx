import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import QRScannerPanel from './QRScannerPanel';

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleResult = useCallback(
    (code) => {
      onClose();
      navigate(`/artifact/${code}`);
    },
    [navigate, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-smrmp-gold/30 bg-[#FAF6F0] p-6 text-[#2B1B12] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#B8D4A0] bg-[#E4EEDC] text-[#374B07]">
              <QrCodeIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#2B1B12]">
                Scan Artifact QR Code
              </h3>
              <p className="text-xs text-[#6E5445]">Point camera at artifact QR tag</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#6E5445] transition-colors hover:bg-[#EFE5D8] hover:text-[#2B1B12]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <QRScannerPanel active={isOpen} onResult={handleResult} />
      </div>
    </div>
  );
}
