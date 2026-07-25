import { useParams } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/ui/Spinner';
import PublicSiteShell from '../../components/layout/PublicSiteShell';
import DigitalMembershipCard from '../../components/memberships/DigitalMembershipCard';
import { useMembershipCard } from '../../hooks/useMemberships';
import useAuthStore from '../../store/authStore';

export default function MembershipCardPage() {
  const { id } = useParams();
  const { data: card, isLoading, isError } = useMembershipCard(id);
  const { isAuthenticated, user } = useAuthStore();
  const isVisitor = isAuthenticated && user?.role === 'visitor';

  return (
    <PublicSiteShell
      subtitle="Membership card"
      pageTitle="Membership card"
      pageDescription="Present this card at the museum entrance."
      contentClassName="max-w-lg print:max-w-none"
      parentTo={isVisitor ? '/portal/membership' : '/memberships'}
      backLabel={isVisitor ? 'Back to Membership' : 'Back to Memberships'}
    >
      {isLoading ? (
        <Spinner size="lg" className="mx-auto py-24" />
      ) : isError || !card ? (
        <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <ExclamationTriangleIcon className="mx-auto mb-3 h-10 w-10 text-rose-500" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-rose-800">Membership card not found</h2>
          <p className="mt-2 text-sm text-rose-700">
            We couldn&apos;t locate a membership card for this link. Please check the URL or contact museum staff.
          </p>
        </div>
      ) : (
        <DigitalMembershipCard membership={card} />
      )}
    </PublicSiteShell>
  );
}
