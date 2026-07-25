import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import {
  StarIcon as StarOutline,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { FEEDBACK_STATUS_BADGE } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const SENTIMENT_STYLES = {
  positive: 'bg-[#E4EEDC] text-[#243205] border-[#B8D4A0]',
  neutral: 'bg-[#FAF0D8] text-[#7C4A2D] border-[#D4A017]/30',
  negative: 'bg-rose-50 text-rose-700 border-rose-200',
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating ? (
          <StarSolid key={n} className="h-4 w-4 text-smrmp-gold" />
        ) : (
          <StarOutline key={n} className="h-4 w-4 text-[#D8C8B8]" />
        )
      )}
    </div>
  );
}

export default function FeedbackCard({ feedback, showActions = false, onRespond, onPublish, canRespond, canPublish }) {
  if (!feedback) return null;

  const name = feedback.visitor_name || feedback.Visitor?.first_name
    ? feedback.visitor_name || `${feedback.Visitor.first_name} ${feedback.Visitor.last_name || ''}`.trim()
    : 'Anonymous Visitor';

  return (
    <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5 shadow-2xs transition-all hover:border-smrmp-gold/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StarRating rating={feedback.rating} />
            <span className="text-xs font-bold text-[#2B1B12]">{feedback.rating}/5</span>
          </div>
          <p className="mt-1 text-sm font-bold text-[#2B1B12]">{name}</p>
          <p className="text-[11px] text-[#8C7467] flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {formatDate(feedback.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="default" className="capitalize">{feedback.category}</Badge>
          {feedback.status && (
            <Badge variant={FEEDBACK_STATUS_BADGE[feedback.status] || 'default'} className="capitalize">
              {feedback.status}
            </Badge>
          )}
        </div>
      </div>

      {feedback.comment && (
        <p className="mt-3 text-sm leading-relaxed text-[#5C4233] whitespace-pre-line">{feedback.comment}</p>
      )}

      {feedback.sentiment && (
        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${
            SENTIMENT_STYLES[feedback.sentiment] || SENTIMENT_STYLES.neutral
          }`}
        >
          <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
          {feedback.sentiment} sentiment
        </span>
      )}

      {feedback.response_text && (
        <div className="mt-3 rounded-xl border border-[#D4A017]/30 bg-[#FAF0D8] p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7C4A2D]">
            <MegaphoneIcon className="h-3.5 w-3.5" />
            Museum Response
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#5C4233]">{feedback.response_text}</p>
        </div>
      )}

      {showActions && (canRespond || canPublish) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E2D6C5] pt-3">
          {canRespond && (
            <Button size="xs" variant="secondary" onClick={() => onRespond?.(feedback)}>
              {feedback.response_text ? 'Update Response' : 'Respond'}
            </Button>
          )}
          {canPublish && !feedback.is_public && (
            <Button size="xs" variant="gold" onClick={() => onPublish?.(feedback)}>
              Publish to Testimonials
            </Button>
          )}
          {feedback.is_public && <Badge variant="excellent">Published</Badge>}
        </div>
      )}
    </div>
  );
}
