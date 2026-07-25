import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { MapPinIcon, ArrowRightIcon, CalendarIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatters';

const categoryIcons = {
  weapon: '⚔️',
  textile: '🧵',
  document: '📜',
  ceramic: '🏺',
  jewelry: '👑',
  ceremonial: '🚩',
  photograph: '📷',
  coin: '🪙',
  other: '🏛️',
};

export default function ArtifactCard({ artifact, onClick }) {
  const primaryImage = artifact.images?.find((i) => i.is_primary) || artifact.images?.[0];
  const icon = categoryIcons[artifact.category?.toLowerCase()] || '🏛️';

  const cardContent = (
    <Card
      hover
      padding={false}
      className="group relative flex flex-col h-full overflow-hidden border-[#E2D6C5] bg-[#FAF6F0] transition-all duration-300 hover:-translate-y-1 hover:border-smrmp-gold hover:shadow-lg"
    >
      {/* Image Header with Badge Overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#EFE5D8] via-[#E8DCCB] to-[#DFCEBC]">
        {primaryImage ? (
          <img
            src={primaryImage.file_url}
            alt={artifact.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="text-5xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
              {artifact.category || 'Museum Asset'}
            </span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#FAF6F0]/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-[#422C1D] border border-[#E2D6C5]/80 shadow-2xs">
            <span>{icon}</span>
            <span className="capitalize">{artifact.category}</span>
          </span>

          {artifact.is_on_loan && (
            <Badge variant="on_loan" className="shadow-2xs">
              On Loan
            </Badge>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-display text-lg font-bold text-[#2B1B12] line-clamp-1 group-hover:text-[#374B07] transition-colors">
            {artifact.name}
          </h3>

          {/* Historical Period / Accession Number */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E5445]">
            {artifact.historical_period && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#EFE5D8] px-2 py-0.5 font-medium border border-[#D8C8B8]">
                {artifact.historical_period}
              </span>
            )}
            {artifact.accession_number && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#8C6D58]">
                <HashtagIcon className="h-3 w-3 text-[#A08878]" />
                {artifact.accession_number}
              </span>
            )}
          </div>

          {/* Description snippet if available */}
          {artifact.description && (
            <p className="text-xs text-[#6E5445] line-clamp-2 leading-relaxed">
              {artifact.description}
            </p>
          )}
        </div>

        {/* Bottom Details Footer */}
        <div className="mt-4 pt-4 border-t border-[#EFE5D8] space-y-3">
          {/* Location & Condition Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#5C4233] truncate">
              <MapPinIcon className="h-4 w-4 shrink-0 text-[#7C4A2D]" />
              <span className="truncate">{artifact.location || 'Storage Archive'}</span>
            </div>

            <Badge variant={artifact.condition_status}>
              {artifact.condition_status}
            </Badge>
          </div>

          {/* Action indicator */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#8C6D58] pt-1">
            <span className="inline-flex items-center gap-1 text-[#8C6D58]">
              <CalendarIcon className="h-3.5 w-3.5 text-[#A08878]" />
              {formatDate(artifact.created_at)}
            </span>
            <span className="inline-flex items-center gap-1 text-[#374B07] font-bold group-hover:translate-x-1 transition-transform">
              <span>View Profile</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <div onClick={() => onClick(artifact)} className="cursor-pointer h-full">
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={`/artifacts/${artifact.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}
