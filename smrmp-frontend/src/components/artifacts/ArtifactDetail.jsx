import { useState, useEffect } from 'react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ImageGallery from './ImageGallery';
import QRDisplay from './QRDisplay';
import AudioNarrationPlayer from './AudioNarrationPlayer';
import ConditionHistoryTimeline from './ConditionHistoryTimeline';
import LocationMovementHistory from './LocationMovementHistory';
import DuplicateDetectorModal from './DuplicateDetectorModal';
import { formatDate } from '../../utils/formatters';
import { useUpdateArtifact } from '../../hooks/useArtifacts';
import getApiErrorMessage from '../../utils/apiError';
import { CalendarIcon, SparklesIcon, TagIcon, CheckCircleIcon, DocumentDuplicateIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

function getEmbedVideoUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  if (trimmed.match(/\.(mp4|webm|ogg)($|\?)/i)) {
    return { type: 'video', src: trimmed };
  }
  return { type: 'iframe', src: trimmed };
}
import toast from 'react-hot-toast';

export default function ArtifactDetail({ artifact, qrDataUrl }) {
  const [descSource, setDescSource] = useState(artifact?.description_source || 'ai_draft');
  const [isApproving, setIsApproving] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const updateMutation = useUpdateArtifact();

  const activeQrDataUrl = qrDataUrl || artifact?.qr_data_url;

  useEffect(() => {
    if (artifact?.description_source) {
      setDescSource(artifact.description_source);
    }
  }, [artifact?.id, artifact?.description_source]);

  if (!artifact) return null;

  const handleApproveAI = () => {
    if (!artifact.id) {
      toast.error('Artifact ID is missing');
      return;
    }

    setIsApproving(true);
    updateMutation.mutate(
      { id: artifact.id, data: { description_source: 'ai_approved' } },
      {
        onSuccess: () => {
          setDescSource('ai_approved');
          toast.success('AI catalog description approved');
          setIsApproving(false);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, 'Failed to approve description'));
          setIsApproving(false);
        },
      }
    );
  };

  const videoEmbed = getEmbedVideoUrl(artifact?.video_url);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <ImageGallery images={artifact.images} />

        {videoEmbed && (
          <Card hover>
            <div className="flex items-center justify-between gap-2 mb-3 border-b border-[#E2D6C5] pb-2">
              <h3 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-2">
                <VideoCameraIcon className="h-5 w-5 text-smrmp-gold" />
                <span>Video & Archival Footage</span>
              </h3>
              <a
                href={artifact.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-smrmp-green hover:underline flex items-center gap-1"
              >
                <span>External Link</span>
                <span>↗</span>
              </a>
            </div>
            <div className="overflow-hidden rounded-xl bg-black border border-[#E2D6C5] aspect-video">
              {videoEmbed.type === 'video' ? (
                <video
                  src={videoEmbed.src}
                  controls
                  className="w-full h-full object-contain"
                  poster={artifact.images?.[0]?.file_url}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <iframe
                  src={videoEmbed.src}
                  title={`${artifact.name} Video`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </Card>
        )}

        {(activeQrDataUrl || artifact.qr_code) && (
          <QRDisplay
            qrDataUrl={activeQrDataUrl}
            qrCode={artifact.qr_code}
          />
        )}
        <AudioNarrationPlayer
          artifactName={artifact.name}
          description={artifact.description}
          amharicDescription={artifact.amharic_description}
          origin={artifact.origin}
          period={artifact.historical_period}
        />
      </div>

      <div className="space-y-6">
        <Card hover className="relative overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#2B1B12]">
                {artifact.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="purple">{artifact.category}</Badge>
                <Badge variant={artifact.condition_status}>{artifact.condition_status}</Badge>
                {artifact.is_on_loan && (
                  <Badge variant="on_loan">On Loan</Badge>
                )}
                {artifact.historical_period && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0D8] px-2.5 py-0.5 text-xs font-semibold text-[#7C4A2D] border border-[#D4A017]/40">
                    <CalendarIcon className="h-3 w-3 text-smrmp-gold" />
                    {artifact.historical_period}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDuplicateModal(true)}
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              <span>Check Duplicates</span>
            </Button>
          </div>
        </Card>

        <Card hover>
          <h3 className="mb-4 font-display text-base font-bold text-[#2B1B12] border-b border-[#E2D6C5] pb-3">
            Archive Properties
          </h3>
          <dl className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-2 text-xs">
            {[
              ['Origin', artifact.origin],
              ['Materials', artifact.materials],
              ['Gallery Location', artifact.location],
              ['Loan Status', artifact.is_on_loan ? 'On Loan to External Institution' : 'On Site'],
              ['QR Code', artifact.qr_code],
              ['Video Link', artifact.video_url],
              ['Date Added', formatDate(artifact.created_at)],
            ].map(([label, value]) => value && (
              <div key={label} className="rounded-xl bg-[#FFFDF9] p-3 border border-[#E2D6C5]">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">{label}</dt>
                <dd className="font-bold text-[#2B1B12] mt-0.5 truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {artifact.description && (
          <Card hover>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-[#E2D6C5] pb-2">
              <h3 className="font-display text-base font-bold text-[#2B1B12]">English Catalog Narrative</h3>
              {descSource === 'ai_approved' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" /> Curator Approved
                </span>
              ) : descSource?.startsWith('ai') ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7C4A2D] bg-[#FAF0D8] px-2.5 py-1 rounded-full border border-smrmp-gold/50">
                    <SparklesIcon className="h-3.5 w-3.5 text-smrmp-gold" /> AI Draft
                  </span>
                  <Button variant="gold" size="sm" loading={isApproving} onClick={handleApproveAI}>
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    <span>Approve Draft</span>
                  </Button>
                </div>
              ) : (
                <span className="text-[11px] font-semibold text-[#6E5445] bg-[#EFE5D8] px-2 py-0.5 rounded-md">
                  Manual Entry
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-[#2B1B12] whitespace-pre-wrap">{artifact.description}</p>
          </Card>
        )}

        {artifact.amharic_description && (
          <Card hover>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-[#E2D6C5] pb-2">
              <h3 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-1.5">
                <span>የአማርኛ መግለጫ (Amharic Catalog Narrative)</span>
              </h3>
              <span className="text-[11px] font-bold text-[#7C4A2D] bg-[#FAF0D8] px-2.5 py-1 rounded-full border border-smrmp-gold/50">
                አማርኛ
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#2B1B12] whitespace-pre-wrap">{artifact.amharic_description}</p>
          </Card>
        )}

        {artifact.staff_notes && (
          <Card hover>
            <div className="flex items-center justify-between gap-2 mb-2 border-b border-[#E2D6C5] pb-2">
              <h3 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-1.5">
                <SparklesIcon className="h-4 w-4 text-smrmp-gold" />
                Curator Source Notes (Read by AI)
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C4A2D] bg-[#FAF0D8] px-2 py-0.5 rounded border border-smrmp-gold/30">
                AI Prompt Reference
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#5C4233] whitespace-pre-wrap bg-[#FAF6F0] p-3 rounded-xl border border-[#E2D6C5]">
              {artifact.staff_notes}
            </p>
          </Card>
        )}

        {(() => {
          const safeKeywords = Array.isArray(artifact.keywords)
            ? artifact.keywords
            : typeof artifact.keywords === 'string'
            ? artifact.keywords.split(',').map((k) => k.trim()).filter(Boolean)
            : [];

          if (!safeKeywords.length) return null;

          return (
            <Card hover>
              <h3 className="mb-3 font-display text-base font-bold text-[#2B1B12] border-b border-[#E2D6C5] pb-2">
                Keywords & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 rounded-full bg-[#EFE5D8] px-3 py-1 text-xs font-semibold text-[#5C4233] border border-[#D8C8B8]"
                  >
                    <TagIcon className="h-3 w-3 text-[#7C4A2D]" />
                    {kw}
                  </span>
                ))}
              </div>
            </Card>
          );
        })()}

        <ConditionHistoryTimeline artifact={artifact} />
        <LocationMovementHistory artifact={artifact} />
      </div>

      <DuplicateDetectorModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        artifact={artifact}
      />
    </div>
  );
}
