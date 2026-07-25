import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, CheckCircleIcon } from '@heroicons/react/24/outline';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import PublicSiteShell from '../../components/layout/PublicSiteShell';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import { useSubmitFeedback, usePublicFeedback } from '../../hooks/useFeedback';
import { FEEDBACK_CATEGORIES } from '../../utils/constants';
import getApiErrorMessage from '../../utils/apiError';
import usePortalEmbed from '../../hooks/usePortalEmbed';

const emptyForm = {
  rating: 0,
  category: 'overall',
  comment: '',
  highlight: '',
  improvement: '',
  visitor_name: '',
  visitor_email: '',
};

export default function FeedbackFormPage() {
  const embedded = usePortalEmbed();
  const [form, setForm] = useState(emptyForm);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = useSubmitFeedback();
  const { data: testimonials } = usePublicFeedback({ limit: 6 });

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      await submitFeedback.mutateAsync({
        ...form,
        visitor_name: form.visitor_name || undefined,
        visitor_email: form.visitor_email || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit feedback'));
    }
  };

  const body = (
    <>
        <div className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 shadow-md sm:p-8">
          {submitted ? (
            <div className="space-y-4 text-center py-6">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-600" />
              <h2 className="font-display text-xl font-bold text-[#2B1B12]">Thank You for Your Feedback!</h2>
              <p className="text-sm text-[#5C4233] max-w-sm mx-auto leading-relaxed">
                Your feedback helps us continue to preserve and share Ethiopia&apos;s heritage with pride.
              </p>
              <Link to="/portal" className="inline-flex items-center gap-2 text-xs font-bold text-[#374B07] hover:underline">
                <span>Return to Visitor Dashboard</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[#5C4233]">
                  How would you rate your overall experience?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setForm((prev) => ({ ...prev, rating: n }))}
                      aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                      className="transition-transform hover:scale-110"
                    >
                      {n <= (hoverRating || form.rating) ? (
                        <StarSolid className="h-10 w-10 text-smrmp-gold" />
                      ) : (
                        <StarOutline className="h-10 w-10 text-[#D8C8B8]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Select label="Feedback Category" options={FEEDBACK_CATEGORIES} value={form.category} onChange={update('category')} />

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">What did you enjoy most?</label>
                <textarea
                  rows={2}
                  value={form.highlight}
                  onChange={update('highlight')}
                  placeholder="e.g. The Adwa Battle diorama exhibit..."
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">What could we improve?</label>
                <textarea
                  rows={2}
                  value={form.improvement}
                  onChange={update('improvement')}
                  placeholder="Suggestions welcome..."
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">Additional Comments (optional)</label>
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={update('comment')}
                  placeholder="Anything else you'd like to share..."
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Your Name (optional)" value={form.visitor_name} onChange={update('visitor_name')} placeholder="e.g. Almaz Tesfaye" />
                <Input label="Email (optional)" type="email" value={form.visitor_email} onChange={update('visitor_email')} placeholder="you@example.com" />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitFeedback.isPending}>
                Submit Feedback
              </Button>
            </form>
          )}
        </div>

        {testimonials?.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-center font-display text-lg font-bold text-[#2B1B12]">What Other Visitors Say</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.map((t) => (
                <FeedbackCard key={t.id} feedback={t} />
              ))}
            </div>
          </div>
        )}
    </>
  );

  if (embedded) {
    return (
      <div className="max-w-2xl">
        <PortalPageHeader
          showTitle={false}
          showBack={false}
          title="Leave Feedback"
          description="Help us improve the museum experience for future visitors"
        />
        {body}
      </div>
    );
  }

  return (
    <PublicSiteShell
      subtitle="Feedback"
      pageTitle="Share your visit feedback"
      pageDescription="Help us improve the museum experience for future visitors"
      contentClassName="max-w-2xl"
    >
      {body}
    </PublicSiteShell>
  );
}
