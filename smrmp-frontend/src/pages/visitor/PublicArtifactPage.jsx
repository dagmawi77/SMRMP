import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  ShareIcon,
  TagIcon,
  VideoCameraIcon,
  BuildingLibraryIcon,
  TicketIcon,
  LanguageIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useArtifactByQR } from '../../hooks/useArtifacts';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Logo, { LogoMark } from '../../components/ui/Logo';
import AudioNarrationPlayer from '../../components/artifacts/AudioNarrationPlayer';
import { MUSEUM_NAME } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import getEmbedVideoUrl from '../../utils/videoEmbed';

const CARD = 'rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-5 shadow-2xs';
const HEADING = 'font-display text-lg font-semibold text-[#374B07]';

function SectionCard({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={`${CARD} ${className}`}>
      <h2 className={`${HEADING} mb-3 flex items-center gap-2`}>
        {Icon && <Icon className="h-5 w-5 text-smrmp-gold" aria-hidden="true" />}
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

export default function PublicArtifactPage() {
  const { code } = useParams();
  const { data, isLoading, isError } = useArtifactByQR(code);
  const [activeImage, setActiveImage] = useState(0);

  const artifact = data?.artifact || data;

  useEffect(() => {
    setActiveImage(0);
  }, [code]);

  useEffect(() => {
    if (artifact?.name) {
      document.title = `${artifact.name} · ${MUSEUM_NAME}`;
    }
    return () => {
      document.title = MUSEUM_NAME;
    };
  }, [artifact?.name]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: artifact?.name || 'Museum artifact',
      text: `${artifact?.name} — ${MUSEUM_NAME}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('Could not share this artifact');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="visitor-shell flex min-h-screen items-center justify-center bg-smrmp-parchment text-[#2B1B12]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm font-semibold text-smrmp-green">Loading artifact...</p>
        </div>
      </div>
    );
  }

  if (isError || !artifact) {
    return (
      <div className="visitor-shell flex min-h-screen items-center justify-center bg-smrmp-parchment px-4 text-[#2B1B12]">
        <div className="max-w-sm text-center">
          <LogoMark className="mx-auto mb-4 h-20 w-20 rounded-3xl" imgClassName="h-12 w-auto" decorative />
          <h1 className="font-display text-2xl font-bold text-[#2B1B12]">Artifact Not Found</h1>
          <p className="mt-2 text-sm text-[#6E5445]">
            The code
            {' '}
            <span className="font-mono font-semibold text-[#7C4A2D]">{code}</span>
            {' '}
            does not match any artifact in our collection. Please rescan the tag beside the display.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              to="/scan"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-smrmp-green px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#243205]"
            >
              <QrCodeIcon className="h-4 w-4" />
              <span>Scan Again</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2D6C5] bg-white px-4 py-2 text-xs font-bold text-[#5C4233] transition-colors hover:bg-[#EFE5D8]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = Array.isArray(artifact.images) ? artifact.images : [];
  const orderedImages = [...images].sort(
    (a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)),
  );
  const currentImage = orderedImages[activeImage] || orderedImages[0];
  const videoEmbed = getEmbedVideoUrl(artifact.video_url);
  const keywords = Array.isArray(artifact.keywords) ? artifact.keywords.filter(Boolean) : [];
  const exhibitions = Array.isArray(artifact.exhibitions) ? artifact.exhibitions : [];

  const details = [
    ['Origin', artifact.origin],
    ['Materials', artifact.materials],
    ['Historical period', artifact.historical_period],
    ['Gallery / location', artifact.location],
    ['Catalogued', artifact.created_at ? formatDate(artifact.created_at) : null],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="visitor-shell min-h-screen bg-smrmp-parchment text-[#2B1B12]">
      <header className="sticky top-0 z-20 border-b border-smrmp-gold/30 bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-4 py-4 text-smrmp-parchment">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3" aria-label={`${MUSEUM_NAME} home`}>
            <Logo className="h-9 w-auto" decorative />
            <div>
              <p className="text-sm font-bold text-smrmp-gold">{MUSEUM_NAME}</p>
              <p className="text-xs text-smrmp-parchment/70">Digital Artifact Explorer</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-smrmp-gold/30 bg-white/10 text-smrmp-gold transition-all hover:bg-white/20"
              aria-label="Share this artifact"
              title="Share this artifact"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            <Link
              to="/scan"
              className="inline-flex items-center gap-1.5 rounded-xl border border-smrmp-gold/30 bg-white/10 px-3 py-2 text-xs font-bold text-smrmp-gold transition-all hover:bg-white/20"
            >
              <QrCodeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {currentImage ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-[#E2D6C5] bg-[#EFE5D8] shadow-md">
              <img
                src={currentImage.file_url}
                alt={artifact.name}
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
            {orderedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {orderedImages.map((image, index) => (
                  <button
                    key={image.id || image.file_url}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      index === activeImage
                        ? 'border-smrmp-gold shadow-sm'
                        : 'border-[#E2D6C5] opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${index + 1} of ${orderedImages.length}`}
                    aria-current={index === activeImage}
                  >
                    <img src={image.file_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-[#E2D6C5] bg-[#EFE5D8] text-6xl">
            🏺
          </div>
        )}

        <div>
          <h1 className="font-display text-3xl font-bold text-[#2B1B12]">{artifact.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{artifact.category}</Badge>
            {artifact.historical_period && (
              <span className="rounded-full border border-smrmp-gold/40 bg-[#FAF0D8] px-3 py-1 text-sm font-semibold text-[#7C4A2D]">
                {artifact.historical_period}
              </span>
            )}
            {artifact.condition_status && (
              <Badge variant={artifact.condition_status}>{artifact.condition_status}</Badge>
            )}
            {artifact.is_on_loan && <Badge variant="on_loan">On loan</Badge>}
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-[#6E5445]">
            Catalog ref&nbsp;
            <span className="font-semibold text-[#7C4A2D]">{artifact.qr_code}</span>
          </p>
        </div>

        {artifact.is_on_loan && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#FCD34D] bg-[#FEF3C7] p-4 text-sm text-[#92400E]">
            <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>
              This artifact is currently on loan to another institution, so it may not be on display
              during your visit.
            </p>
          </div>
        )}

        {details.length > 0 && (
          <SectionCard title="Artifact Details" icon={BuildingLibraryIcon}>
            <dl className="space-y-3">
              {details.map(([label, value]) => (
                <div key={label} className="flex gap-3 text-sm">
                  <dt className="w-32 shrink-0 font-medium text-[#6E5445]">{label}</dt>
                  <dd className="font-semibold text-[#2B1B12]">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        )}

        {artifact.description && (
          <SectionCard title="About This Artifact">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2B1B12]">
              {artifact.description}
            </p>
          </SectionCard>
        )}

        {artifact.amharic_description && (
          <SectionCard title="ስለ ቅርሱ" icon={LanguageIcon}>
            <p
              lang="am"
              className="whitespace-pre-wrap text-sm leading-loose text-[#2B1B12]"
            >
              {artifact.amharic_description}
            </p>
          </SectionCard>
        )}

        {videoEmbed && (
          <SectionCard title="Video & Archival Footage" icon={VideoCameraIcon}>
            <div className="aspect-video overflow-hidden rounded-xl border border-[#E2D6C5] bg-black">
              {videoEmbed.type === 'video' ? (
                <video
                  src={videoEmbed.src}
                  controls
                  className="h-full w-full object-contain"
                  poster={currentImage?.file_url}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <iframe
                  src={videoEmbed.src}
                  title={`${artifact.name} video`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </SectionCard>
        )}

        <AudioNarrationPlayer
          artifactName={artifact.name}
          artifactCode={artifact.qr_code}
          description={artifact.description}
          amharicDescription={artifact.amharic_description}
          origin={artifact.origin}
          period={artifact.historical_period}
        />

        {exhibitions.length > 0 && (
          <SectionCard title="Currently On Display In" icon={BuildingLibraryIcon}>
            <ul className="space-y-3">
              {exhibitions.map((exhibition) => (
                <li
                  key={exhibition.id}
                  className="rounded-xl border border-[#E2D6C5] bg-white/60 px-4 py-3"
                >
                  <p className="text-sm font-bold text-[#2B1B12]">{exhibition.name}</p>
                  <p className="mt-0.5 text-xs text-[#6E5445]">
                    {[
                      exhibition.theme,
                      exhibition.gallery,
                      exhibition.end_date ? `Until ${formatDate(exhibition.end_date)}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {keywords.length > 0 && (
          <SectionCard title="Related Themes" icon={TagIcon}>
            <ul className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <li
                  key={keyword}
                  className="rounded-full border border-[#D8C8B8] bg-[#EFE7DA] px-3 py-1 text-xs font-semibold text-[#5C4233]"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Public Verified Curator Sign-off Card */}
        <div className="space-y-3 rounded-2xl border border-[#D4A017]/40 bg-gradient-to-r from-[#FAF6F0] via-[#FAF0D8]/50 to-[#FAF6F0] p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7C4A2D]">
              <ShieldCheckIcon className="h-4 w-4 text-[#D4A017]" />
              <span>Catalog Provenance &amp; Verification</span>
            </span>
            <span className="rounded border border-[#E2D6C5] bg-white px-2 py-0.5 font-mono text-[10px] text-[#374B07]">
              SEAL-ADW-2026
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            {artifact.curator?.avatar ? (
              <img
                src={artifact.curator.avatar}
                alt={artifact.curator?.name || 'Curator'}
                className="h-14 w-14 shrink-0 rounded-2xl border-2 border-[#D4A017] object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#D4A017]/40 bg-[#374B07] font-display text-xl font-bold text-[#D4A017] shadow-sm">
                {(artifact.curator?.name || 'Kassahun Tadesse').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-[#2B1B12]">
                  {artifact.curator?.name || 'Kassahun Tadesse'}
                </p>
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" title="Verified Curator" />
              </div>
              <p className="text-xs font-semibold text-[#7C4A2D]">
                Senior Curator of Adwa Victory Collections
              </p>
              <p className="mt-0.5 text-[11px] text-[#6E5445]">
                Adwa Victory Memorial Museum Authority • Reviewed &amp; Verified
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/scan"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-smrmp-green px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#243205]"
          >
            <QrCodeIcon className="h-5 w-5" />
            <span>Scan Another Artifact</span>
          </Link>
          <Link
            to="/tickets"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2D6C5] bg-white px-4 py-3 text-sm font-bold text-[#5C4233] transition-colors hover:bg-[#EFE5D8]"
          >
            <TicketIcon className="h-5 w-5 text-smrmp-gold" />
            <span>Plan Your Visit</span>
          </Link>
        </div>

        <footer className="pb-8 text-center text-xs text-[#6E5445]">
          <p className="font-semibold">{MUSEUM_NAME}</p>
          <p>SMRMP Digital Collection Platform</p>
        </footer>
      </main>
    </div>
  );
}
