import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import QRScannerPanel from '../../components/artifacts/QRScannerPanel';
import Logo from '../../components/ui/Logo';
import { MUSEUM_NAME } from '../../utils/constants';

export default function PublicScanPage() {
  const navigate = useNavigate();

  const handleResult = useCallback(
    (code) => {
      navigate(`/artifact/${code}`);
    },
    [navigate],
  );

  return (
    <div className="visitor-shell min-h-screen bg-smrmp-parchment text-[#2B1B12]">
      <header className="border-b border-smrmp-gold/30 bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-4 py-4 text-smrmp-parchment">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3" aria-label={`${MUSEUM_NAME} home`}>
            <Logo className="h-9 w-auto" decorative />
            <div>
              <p className="text-sm font-bold text-smrmp-gold">{MUSEUM_NAME}</p>
              <p className="text-xs text-smrmp-parchment/70">Digital Artifact Explorer</p>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-smrmp-gold/30 bg-white/10 px-3 py-2 text-xs font-bold text-smrmp-gold transition-all hover:bg-white/20"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B8D4A0] bg-[#E4EEDC] text-[#374B07]">
            <QrCodeIcon className="h-7 w-7" />
          </div>
          <h1 className="font-display mt-4 text-2xl font-bold text-[#2B1B12]">
            Scan an Artifact Tag
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6E5445]">
            Point your camera at the QR code beside any artifact to read its full story, listen to
            the audio guide, and view the gallery. No account needed.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-5 shadow-2xs">
          <QRScannerPanel onResult={handleResult} />
          <p className="mt-4 border-t border-[#E2D6C5] pt-3 text-center text-[11px] leading-relaxed text-[#6E5445]">
            If the camera does not start, allow camera access in your browser settings — or type the
            code printed on the artifact label above.
          </p>
        </div>
      </main>
    </div>
  );
}
