import Badge from '../ui/Badge';
import Card from '../ui/Card';
import ImageGallery from './ImageGallery';
import QRDisplay from './QRDisplay';
import { formatDate } from '../../utils/formatters';
import { CalendarIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/outline';

export default function ArtifactDetail({ artifact, qrDataUrl }) {
  if (!artifact) return null;

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
      </div>

      <div className="space-y-6">
        <Card hover className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#2B1B12]">
                {artifact.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="purple">{artifact.category}</Badge>
                <Badge variant={artifact.condition_status}>{artifact.condition_status}</Badge>
                {artifact.historical_period && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0D8] px-2.5 py-0.5 text-xs font-semibold text-[#7C4A2D] border border-[#D4A017]/40">
                    <CalendarIcon className="h-3 w-3 text-smrmp-gold" />
                    {artifact.historical_period}
                  </span>
                )}
              </div>
            </div>
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
            <div className="flex items-center justify-between mb-3 border-b border-[#E2D6C5] pb-2">
              <h3 className="font-display text-base font-bold text-[#2B1B12]">Curator Description</h3>
              {artifact.description_source?.startsWith('ai') && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7C4A2D] bg-[#FAF0D8] px-2.5 py-1 rounded-full border border-smrmp-gold/50">
                  <SparklesIcon className="h-3.5 w-3.5 text-smrmp-gold" /> AI Draft
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-[#2B1B12] whitespace-pre-wrap">{artifact.description}</p>
          </Card>
        )}

        {artifact.keywords?.length > 0 && (
          <Card hover>
            <h3 className="mb-3 font-display text-base font-bold text-[#2B1B12] border-b border-[#E2D6C5] pb-2">
              Keywords & Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {artifact.keywords.map((kw) => (
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
        )}
      </div>
    </div>
  );
}
