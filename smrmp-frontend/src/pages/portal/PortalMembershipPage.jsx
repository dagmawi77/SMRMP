import { IdentificationIcon, PhoneIcon } from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import DigitalMembershipCard from '../../components/memberships/DigitalMembershipCard';
import { usePortalMemberships } from '../../hooks/usePortal';
import { MEMBERSHIP_STATUS_BADGE } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

export default function PortalMembershipPage() {
  const { data, isLoading } = usePortalMemberships();
  const memberships = data?.memberships || [];
  const activeMembership = data?.active_membership;
  const card = data?.card;

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        icon={IdentificationIcon}
        title="My membership"
        description="Your digital membership card and history."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : card ? (
        <div className="mb-8">
          <DigitalMembershipCard membership={card} />
        </div>
      ) : (
        <Card className="mb-8">
          <EmptyState
            icon="🎫"
            title="No active membership yet"
            description="Become a museum member to enjoy unlimited visits, guest passes, and member-only events."
            action={(
              <a href="tel:+251000000000" className="inline-block">
                <Button variant="primary">
                  <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Contact the museum to join</span>
                </Button>
              </a>
            )}
          />
        </Card>
      )}

      <h2 className="mb-3 font-display text-base font-bold text-[#2B1B12]">Membership history</h2>
      {memberships.length === 0 ? (
        <Card>
          <p className="text-sm text-[#6E5445]">No membership records found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {memberships.map((m) => (
            <Card key={m.id} hover className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold text-[#7C4A2D]">{m.membership_number}</p>
                <p className="text-sm font-bold text-[#2B1B12]">
                  {m.tier?.name || 'Standard'}
                  {' '}
                  Tier
                </p>
                <p className="mt-0.5 text-xs text-[#6E5445]">
                  {formatDate(m.start_date)}
                  {' – '}
                  {formatDate(m.end_date)}
                </p>
              </div>
              <Badge variant={MEMBERSHIP_STATUS_BADGE[m.status] || 'default'}>{m.status}</Badge>
            </Card>
          ))}
        </div>
      )}

      {activeMembership && !card ? (
        <p className="mt-4 text-xs text-[#6E5445]">
          Your membership is active but the digital card could not be generated. Please contact the museum for assistance.
        </p>
      ) : null}
    </>
  );
}
