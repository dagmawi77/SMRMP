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
import { CalendarIcon, SparklesIcon, TagIcon, CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ArtifactDetail({ artifact, qrDataUrl }) {
  const [descSource, setDescSource] = useState(artifact?.description_source || 'ai_draft');
  const [isApproving, setIsApproving] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const updateMutation = useUpdateArtifact();

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <ImageGallery images={artifact.images} />
        {(qrDataUrl || artifact.qr_code) && (
          <QRDisplay
            qrDataUrl={qrDataUrl}
            qrCode={artifact.qr_code}
          />
        )}
        <AudioNarrationPlayer
          artifactName={artifact.name}
          description={artifact.description}
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
              <h3 className="font-display text-base font-bold text-[#2B1B12]">Curator Description</h3>
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
