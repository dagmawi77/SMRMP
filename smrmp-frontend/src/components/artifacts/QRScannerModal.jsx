import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCodeIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let scanner = null;

    const onScanSuccess = (decodedText) => {
      let code = decodedText.trim();
      // Extract code if full URL was scanned
      if (code.includes('/artifact/')) {
        code = code.split('/artifact/').pop();
      } else if (code.includes('/qr/')) {
        code = code.split('/qr/').pop();
      }

      toast.success(`Scanned QR Code: ${code}`);
      if (scanner) {
        scanner.clear().catch(() => {});
      }
      onClose();
      navigate(`/artifact/${code}`);
    };

    const onScanError = () => {
      // ignore frame scan errors
    };

    // Delay slightly to ensure DOM element rendered
    const timeoutId = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;
        setCameraActive(true);
      } catch (err) {
        console.warn('QR Scanner initialization error:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      setCameraActive(false);
    };
  }, [isOpen, navigate, onClose]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const clean = manualCode.trim().toUpperCase();
    onClose();
    navigate(`/artifact/${clean}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-smrmp-gold/30 bg-[#FAF6F0] p-6 shadow-2xl text-[#2B1B12]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E4EEDC] text-[#374B07] border border-[#B8D4A0]">
              <QrCodeIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#2B1B12]">Scan Artifact QR Code</h3>
              <p className="text-xs text-[#6E5445]">Point camera at artifact QR tag</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#6E5445] hover:bg-[#EFE5D8] hover:text-[#2B1B12] transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Camera Scanner Container */}
        <div className="my-5 overflow-hidden rounded-2xl border-2 border-dashed border-[#D4A017]/50 bg-[#241710] p-2 text-center text-white">
          <div id="qr-reader" className="w-full text-xs text-smrmp-parchment font-semibold" />
          {!cameraActive && (
            <div className="py-8 flex flex-col items-center justify-center text-smrmp-gold">
              <CameraIcon className="h-8 w-8 animate-pulse mb-2" />
              <p className="text-xs font-bold">Initializing Camera...</p>
            </div>
          )}
        </div>

        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-[#E2D6C5]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C4233] mb-1">
            Or Enter QR Code Manually:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. ART-SEED001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-3.5 py-2 text-xs font-mono text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#374B07] px-4 py-2 text-xs font-bold text-white hover:bg-[#243205] transition-colors"
            >
              Lookup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
