import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  QrCodeIcon,
  BellAlertIcon,
  ArrowPathIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { useMemberships, useExpiringMemberships, useRenewMembership, useCancelMembership, useSendRenewalReminders } from '../../hooks/useMemberships';
import { MEMBERSHIP_STATUS_BADGE } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';
import useAuthStore from '../../store/authStore';

const TABS = [
  { key: 'all', label: 'All Memberships' },
  { key: 'expiring', label: 'Expiring Soon' },
  { key: 'expired', label: 'Expired' },
];

export default function MembershipsPage() {
  const navigate = useNavigate();
  const { can } = useAuthStore();
  const [tab, setTab] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const allQuery = useMemberships({ page: 1, limit: 50 });
  const expiredQuery = useMemberships({ page: 1, limit: 50, status: 'expired' });
  const expiringQuery = useExpiringMemberships(30);

  const renewMutation = useRenewMembership();
  const cancelMutation = useCancelMembership();
  const remindersMutation = useSendRenewalReminders();

  const isLoading =
    tab === 'all' ? allQuery.isLoading : tab === 'expired' ? expiredQuery.isLoading : expiringQuery.isLoading;

  const rows =
    tab === 'all'
      ? allQuery.data?.memberships || []
      : tab === 'expired'
      ? expiredQuery.data?.memberships || []
      : expiringQuery.data || [];

  const handleRenew = async (membership) => {
    try {
      await renewMutation.mutateAsync({ id: membership.id, data: {} });
      toast.success(`Membership ${membership.membership_number} renewed`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to renew membership'));
    }
  };

  const handleCancel = async () => {
    if (!cancelling) return;
    try {
      await cancelMutation.mutateAsync({ id: cancelling.id, reason: cancelReason || undefined });
      toast.success(`Membership ${cancelling.membership_number} cancelled`);
      setCancelling(null);
      setCancelReason('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel membership'));
    }
  };

  const handleSendReminders = async () => {
    try {
      const res = await remindersMutation.mutateAsync(30);
      const count = res?.data?.data?.reminders_sent ?? 0;
      toast.success(`Sent ${count} renewal reminder(s)`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send renewal reminders'));
    }
  };

  const columns = [
    {
      key: 'membership_number',
      label: 'Membership #',
      render: (row) => <span className="font-mono text-xs font-bold text-[#7C4A2D]">{row.membership_number}</span>,
    },
    {
      key: 'visitor',
      label: 'Member',
      render: (row) => (
        <span className="font-semibold text-[#2B1B12]">
          {row.Visitor ? `${row.Visitor.first_name} ${row.Visitor.last_name || ''}` : '—'}
        </span>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (row) => <span className="capitalize text-[#5C4233]">{row.tier?.name || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={MEMBERSHIP_STATUS_BADGE[row.status] || 'default'}>{row.status}</Badge>,
    },
    {
      key: 'end_date',
      label: 'Expires',
      render: (row) => <span className="text-xs text-[#6E5445]">{formatDate(row.end_date)}</span>,
    },
    {
      key: 'price_paid',
      label: 'Paid',
      render: (row) => <span className="font-semibold text-[#374B07]">{formatCurrency(row.price_paid)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/membership/${row.id}/card`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4]"
            title="View Digital Card"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          {can('members.update') && row.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => handleRenew(row)}
              className="rounded-lg p-1.5 text-[#374B07] hover:bg-[#E4EEDC]"
              title="Renew Membership"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
          {can('members.update') && row.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => setCancelling(row)}
              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
              title="Cancel Membership"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PrivateLayout>
      <PageHeader
        title="Membership Management"
        description="Monitor memberships and issue cards at the desk. Visitors renew and view cards in the Visitor Portal."
        badge="Module 8"
        action={
          <div className="flex flex-wrap gap-2">
            {can('members.verify') && (
              <Button variant="secondary" onClick={() => navigate('/memberships/verify')}>
                <QrCodeIcon className="h-4 w-4" />
                <span>Verify Card</span>
              </Button>
            )}
            {can('members.update') && (
              <Button variant="secondary" onClick={handleSendReminders} loading={remindersMutation.isPending}>
                <BellAlertIcon className="h-4 w-4" />
                <span>Send Reminders</span>
              </Button>
            )}
            {can('members.create') && (
              <Button variant="primary" onClick={() => navigate('/memberships/issue')}>
                <PlusIcon className="h-4 w-4" />
                <span>Issue Membership</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E2D6C5] pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-t-xl px-4 py-2 text-xs font-bold transition-all ${
              tab === t.key ? 'bg-[#374B07] text-white shadow-xs' : 'text-[#5C4233] hover:bg-[#FAF0E4]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {allQuery.isError && tab === 'all' ? (
        <Card className="p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="font-bold text-[#2B1B12] text-lg">Unable to load memberships</h3>
          <p className="mt-1 text-sm text-[#6E5445]">{getApiErrorMessage(allQuery.error, 'An unexpected error occurred')}</p>
        </Card>
      ) : (
        <Table
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyMessage={
            tab === 'expiring'
              ? 'No memberships are expiring in the next 30 days.'
              : tab === 'expired'
              ? 'No expired memberships found.'
              : 'No memberships issued yet. Click "Issue Membership" to create the first one.'
          }
        />
      )}

      <Modal open={Boolean(cancelling)} onClose={() => setCancelling(null)} title="Cancel Membership" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[#5C4233]">
            Are you sure you want to cancel membership{' '}
            <span className="font-mono font-bold text-[#2B1B12]">{cancelling?.membership_number}</span>?
          </p>
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">
              Cancellation Reason (optional)
            </label>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E2D6C5] pt-4">
            <Button variant="secondary" onClick={() => setCancelling(null)} disabled={cancelMutation.isPending}>
              Keep Membership
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelMutation.isPending}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </PrivateLayout>
  );
}
