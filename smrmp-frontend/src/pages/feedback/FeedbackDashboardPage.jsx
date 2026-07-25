import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  CheckBadgeIcon,
  FunnelIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import { useFeedbackAnalytics, useFeedbackList, useRespondFeedback, usePublishFeedback } from '../../hooks/useFeedback';
import { FEEDBACK_CATEGORIES } from '../../utils/constants';
import getApiErrorMessage from '../../utils/apiError';
import useAuthStore from '../../store/authStore';

export default function FeedbackDashboardPage() {
  const { can } = useAuthStore();
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  const { data: analytics, isLoading: loadingAnalytics } = useFeedbackAnalytics();
  const { data, isLoading, isError, error, refetch } = useFeedbackList({
    page: 1,
    limit: 50,
    category: filters.category || undefined,
    status: filters.status || undefined,
  });

  const respondMutation = useRespondFeedback();
  const publishMutation = usePublishFeedback();

  const feedbackItems = data?.feedback || [];

  const handleRespond = (feedback) => {
    setRespondingTo(feedback);
    setResponseText(feedback.response_text || '');
  };

  const submitResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Response text is required');
      return;
    }
    try {
      await respondMutation.mutateAsync({ id: respondingTo.id, responseText: responseText.trim() });
      toast.success('Response sent to visitor record');
      setRespondingTo(null);
      setResponseText('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit response'));
    }
  };

  const handlePublish = async (feedback) => {
    try {
      await publishMutation.mutateAsync(feedback.id);
      toast.success('Feedback published to public testimonials');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to publish feedback'));
    }
  };

  return (
    <PrivateLayout>
      <PageHeader
        title="Visitor Feedback Dashboard"
        description="Monitor and moderate feedback submitted through the Visitor Portal."
        badge="Module 8"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#D4A017] border border-[#D4A017]/40">
            <StarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Average Rating</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{loadingAnalytics ? '—' : analytics?.average_rating || 'N/A'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2ECF5] text-[#1A4568] border border-[#A8C5E2]">
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Feedback</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{loadingAnalytics ? '—' : analytics?.total_feedback ?? 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckBadgeIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Responded</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">
              {analytics?.by_status?.find((s) => s.status === 'responded')?.count ?? 0}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#7C4A2D] border border-[#D4A017]/40">
            <MegaphoneIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Published</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">
              {analytics?.by_status?.find((s) => s.status === 'published')?.count ?? 0}
            </p>
          </div>
        </Card>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FunnelIcon className="h-4 w-4 text-[#7C4A2D] hidden sm:block" />
          <Select
            placeholder="All Categories"
            options={[{ value: '', label: 'All Categories' }, ...FEEDBACK_CATEGORIES]}
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          />
          <Select
            placeholder="All Statuses"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'new', label: 'New' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'responded', label: 'Responded' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          />
          {(filters.category || filters.status) && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ category: '', status: '' })}>
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {isError ? (
        <Card className="p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="font-bold text-[#2B1B12] text-lg">Unable to load feedback</h3>
          <p className="mt-1 text-sm text-[#6E5445]">{getApiErrorMessage(error, 'An unexpected error occurred')}</p>
          <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      ) : isLoading ? (
        <Spinner size="lg" className="mx-auto py-16" />
      ) : !feedbackItems.length ? (
        <EmptyState icon="💬" title="No Feedback Found" description="No feedback submissions match your filters yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {feedbackItems.map((f) => (
            <FeedbackCard
              key={f.id}
              feedback={f}
              showActions
              canRespond={can('feedback.update')}
              canPublish={can('feedback.manage')}
              onRespond={handleRespond}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}

      <Modal open={Boolean(respondingTo)} onClose={() => setRespondingTo(null)} title="Respond to Feedback" size="md">
        <div className="space-y-4">
          {respondingTo && (
            <div className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-3 text-xs text-[#5C4233]">
              <p className="font-bold text-[#2B1B12] mb-1">Original Feedback ({respondingTo.rating}/5):</p>
              <p className="whitespace-pre-line">{respondingTo.comment || 'No comment provided'}</p>
            </div>
          )}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">Your Response</label>
            <textarea
              rows={4}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Thank you for your feedback..."
              className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E2D6C5] pt-4">
            <Button variant="secondary" onClick={() => setRespondingTo(null)} disabled={respondMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitResponse} loading={respondMutation.isPending}>
              Send Response
            </Button>
          </div>
        </div>
      </Modal>
    </PrivateLayout>
  );
}
