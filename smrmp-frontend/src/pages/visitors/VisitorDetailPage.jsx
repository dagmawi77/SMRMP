import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import {
  useVisitor,
  useVisitorVisits,
  useVisitorMemberships,
  useVisitorFeedback,
  useVisitorCommunications,
  useUpdateVisitor,
  useCheckInVisitor,
} from '../../hooks/useVisitors';
import { VISITOR_TYPE_BADGE, VISITOR_TYPES, MEMBERSHIP_STATUS_BADGE, ENTRY_METHODS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';
import useAuthStore from '../../store/authStore';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'visits', label: 'Visits' },
  { key: 'memberships', label: 'Memberships' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'communications', label: 'Communications' },
];

export default function VisitorDetailPage() {
  const { id } = useParams();
  const { can } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [entryMethod, setEntryMethod] = useState('staff_assisted');

  const { data: visitor, isLoading, isError, error, refetch } = useVisitor(id);
  const { data: visits, isLoading: loadingVisits } = useVisitorVisits(id);
  const { data: memberships, isLoading: loadingMemberships } = useVisitorMemberships(id);
  const { data: feedback, isLoading: loadingFeedback } = useVisitorFeedback(id);
  const { data: communications, isLoading: loadingCommunications } = useVisitorCommunications(id);

  const updateVisitor = useUpdateVisitor();
  const checkIn = useCheckInVisitor();

  const startEdit = () => {
    setEditForm({
      first_name: visitor.first_name || '',
      last_name: visitor.last_name || '',
      email: visitor.email || '',
      phone: visitor.phone || '',
      nationality: visitor.nationality || '',
      address: visitor.address || '',
      visitor_type: visitor.visitor_type || 'individual',
      notes: visitor.notes || '',
      is_blacklisted: visitor.is_blacklisted || false,
    });
    setEditMode(true);
  };

  const saveEdit = async () => {
    try {
      await updateVisitor.mutateAsync({ id, data: editForm });
      toast.success('Visitor profile updated');
      setEditMode(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update visitor'));
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync({ id, data: { entry_method: entryMethod } });
      toast.success('Visitor checked in successfully');
      setCheckInOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to check in visitor'));
    }
  };

  if (isLoading) {
    return (
      <PrivateLayout>
        <div className="py-24">
          <Spinner size="lg" className="mx-auto" />
        </div>
      </PrivateLayout>
    );
  }

  if (isError || !visitor) {
    return (
      <PrivateLayout>
        <Card className="p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="font-bold text-[#2B1B12] text-lg">Visitor not found</h3>
          <p className="mt-1 text-sm text-[#6E5445]">{getApiErrorMessage(error, 'This visitor record could not be loaded')}</p>
          <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <PageHeader
        title={`${visitor.first_name} ${visitor.last_name || ''}`.trim()}
        description="CRM profile, entry history, and engagement — self-service edits happen in the Visitor Portal."
        badge="Visitor Profile"
        backPath="/visitors"
        showBack
        action={
          <div className="flex flex-wrap gap-2">
            {can('visitors.update') && !editMode && (
              <Button variant="secondary" onClick={startEdit}>
                <PencilSquareIcon className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            )}
            {can('visitors.checkin') && (
              <Button variant="primary" onClick={() => setCheckInOpen(true)} disabled={visitor.is_blacklisted}>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Check In Now</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3">
          <UserCircleIcon className="h-9 w-9 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Visitor Type</p>
            <Badge variant={VISITOR_TYPE_BADGE[visitor.visitor_type] || 'default'}>{visitor.visitor_type}</Badge>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <CalendarDaysIcon className="h-9 w-9 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Visits</p>
            <p className="font-display text-xl font-bold text-[#2B1B12]">{visitor.total_visits}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <CalendarDaysIcon className="h-9 w-9 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Last Visit</p>
            <p className="text-sm font-bold text-[#2B1B12]">{visitor.last_visit_at ? formatDate(visitor.last_visit_at) : 'Never'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <IdentificationIcon className="h-9 w-9 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Status</p>
            {visitor.is_blacklisted ? <Badge variant="critical">Blacklisted</Badge> : <Badge variant="excellent">Active</Badge>}
          </div>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E2D6C5] pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-t-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-[#374B07] text-white shadow-xs'
                : 'text-[#5C4233] hover:bg-[#FAF0E4]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <EnvelopeIcon className="h-3.5 w-3.5" /> Email
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{visitor.email || '—'}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <PhoneIcon className="h-3.5 w-3.5" /> Phone
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{visitor.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Nationality</dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{visitor.nationality || '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">National ID</dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{visitor.national_id || '—'}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <MapPinIcon className="h-3.5 w-3.5" /> Address
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{visitor.address || '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Registered On</dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{formatDate(visitor.created_at)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Notes</dt>
              <dd className="mt-1 text-sm text-[#5C4233] whitespace-pre-line">{visitor.notes || 'No notes recorded'}</dd>
            </div>
          </dl>
        </Card>
      )}

      {activeTab === 'visits' && (
        <Table
          loading={loadingVisits}
          data={visits}
          emptyMessage="No visit history recorded for this visitor yet."
          columns={[
            { key: 'entry_time', label: 'Entry Time', render: (r) => formatDate(r.entry_time) },
            { key: 'entry_method', label: 'Entry Method', render: (r) => <span className="capitalize">{r.entry_method?.replace('_', ' ')}</span> },
            { key: 'visitor_count', label: 'Party Size' },
            { key: 'staff', label: 'Processed By', render: (r) => r.staff?.name || '—' },
            { key: 'purpose', label: 'Purpose', render: (r) => r.purpose || '—' },
          ]}
        />
      )}

      {activeTab === 'memberships' && (
        loadingMemberships ? (
          <Spinner className="py-12" />
        ) : !memberships?.length ? (
          <EmptyState icon="🎫" title="No Memberships" description="This visitor does not have any membership records yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {memberships.map((m) => (
              <Card key={m.id}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-[#2B1B12]">{m.tier?.name || 'Membership'}</p>
                  <Badge variant={MEMBERSHIP_STATUS_BADGE[m.status] || 'default'}>{m.status}</Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-[#7C4A2D]">{m.membership_number}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#6E5445]">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px]">Start</p>
                    <p className="text-[#2B1B12] font-semibold">{formatDate(m.start_date)}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px]">End</p>
                    <p className="text-[#2B1B12] font-semibold">{formatDate(m.end_date)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'feedback' && (
        loadingFeedback ? (
          <Spinner className="py-12" />
        ) : !feedback?.length ? (
          <EmptyState icon="💬" title="No Feedback" description="This visitor has not submitted any feedback yet." />
        ) : (
          <div className="space-y-4">
            {feedback.map((f) => (
              <FeedbackCard key={f.id} feedback={f} />
            ))}
          </div>
        )
      )}

      {activeTab === 'communications' && (
        <Table
          loading={loadingCommunications}
          data={communications}
          emptyMessage="No communications have been sent to this visitor."
          columns={[
            { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type?.replace('_', ' ')}</span> },
            { key: 'channel', label: 'Channel', render: (r) => <span className="uppercase text-xs font-bold">{r.channel}</span> },
            { key: 'subject', label: 'Subject', render: (r) => r.subject || '—' },
            { key: 'status', label: 'Status', render: (r) => <Badge variant={r.status === 'sent' ? 'excellent' : r.status === 'failed' ? 'critical' : 'fair'}>{r.status}</Badge> },
            { key: 'sent_at', label: 'Sent At', render: (r) => formatDate(r.sent_at) },
          ]}
        />
      )}

      {/* Edit Profile Modal */}
      <Modal open={editMode} onClose={() => setEditMode(false)} title="Edit Visitor Profile" size="lg">
        {editForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
              <Input label="Last Name" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
              <Input label="Email" type="email" icon={EnvelopeIcon} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <Input label="Phone" icon={PhoneIcon} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <Input label="Nationality" value={editForm.nationality} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} />
              <Select label="Visitor Type" options={VISITOR_TYPES} value={editForm.visitor_type} onChange={(e) => setEditForm({ ...editForm, visitor_type: e.target.value })} />
            </div>
            <Input label="Address" icon={MapPinIcon} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">Notes</label>
              <textarea
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
              />
            </div>
            {can('visitors.update') && (
              <label className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                <input
                  type="checkbox"
                  checked={editForm.is_blacklisted}
                  onChange={(e) => setEditForm({ ...editForm, is_blacklisted: e.target.checked })}
                  className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Blacklist this visitor (prevents check-in)</span>
              </label>
            )}
            <div className="flex justify-end gap-2 border-t border-[#E2D6C5] pt-4">
              <Button variant="secondary" onClick={() => setEditMode(false)} disabled={updateVisitor.isPending}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveEdit} loading={updateVisitor.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Check-In Modal */}
      <Modal open={checkInOpen} onClose={() => setCheckInOpen(false)} title="Check In Visitor" size="sm">
        <div className="space-y-4">
          <Select label="Entry Method" options={ENTRY_METHODS} value={entryMethod} onChange={(e) => setEntryMethod(e.target.value)} />
          <div className="flex justify-end gap-2 border-t border-[#E2D6C5] pt-4">
            <Button variant="secondary" onClick={() => setCheckInOpen(false)} disabled={checkIn.isPending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCheckIn} loading={checkIn.isPending}>
              <CheckCircleIcon className="h-4 w-4" />
              <span>Confirm Check-In</span>
            </Button>
          </div>
        </div>
      </Modal>
    </PrivateLayout>
  );
}
