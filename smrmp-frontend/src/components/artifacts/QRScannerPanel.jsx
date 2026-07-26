import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Extracts the artifact catalog code from whatever the camera decoded. Artifact
 * QR tags encode a full `/artifact/<code>` URL, but hand-typed and legacy codes
 * are accepted too.
 */
export function parseArtifactCode(decodedText) {
  let code = String(decodedText || '').trim();
  if (code.includes('/artifact/')) {
    code = code.split('/artifact/').pop();
  } else if (code.includes('/qr/')) {
    code = code.split('/qr/').pop();
  }
  return code.split(/[?#]/)[0].trim().toUpperCase();
}

/**
 * Camera scanner plus manual-code fallback. Rendered inline on the public scan
 * page and inside the staff scanner modal.
 */
export default function QRScannerPanel({ active = true, onResult }) {
  const scannerRef = useRef(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  // Held in a ref so an inline `onResult` prop does not restart the camera on
  // every parent render.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!active) return undefined;

    let scanner = null;

    const onScanSuccess = (decodedText) => {
      const code = parseArtifactCode(decodedText);
      if (!code) return;

      toast.success(`Scanned ${code}`);
      if (scanner) {
        scanner.clear().catch(() => {});
      }
      onResultRef.current(code);
    };

    // Delay slightly to ensure the target element is mounted.
    const timeoutId = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          /* verbose= */ false,
        );

        scanner.render(onScanSuccess, () => {
          // Per-frame decode misses are expected; ignore them.
        });
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
  }, [active]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const code = parseArtifactCode(manualCode);
    if (!code) return;
    onResultRef.current(code);
  };

  return (
    <div>
      <div className="my-5 overflow-hidden rounded-2xl border-2 border-dashed border-[#D4A017]/50 bg-[#241710] p-2 text-center text-white">
        <div id="qr-reader" className="w-full text-xs font-semibold text-smrmp-parchment" />
        {!cameraActive && (
          <div className="flex flex-col items-center justify-center py-8 text-smrmp-gold">
            <CameraIcon className="mb-2 h-8 w-8 animate-pulse" />
            <p className="text-xs font-bold">Initializing Camera...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="border-t border-[#E2D6C5] pt-2">
        <label
          htmlFor="qr-manual-code"
          className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#5C4233]"
        >
          Or Enter QR Code Manually:
        </label>
        <div className="flex gap-2">
          <input
            id="qr-manual-code"
            type="text"
            placeholder="e.g. ART-SEED001"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-3.5 py-2 font-mono text-xs text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#374B07] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#243205]"
          >
            Lookup
          </button>
        </div>
      </form>
    </div>
  );
}
