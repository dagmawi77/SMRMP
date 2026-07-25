import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  ShoppingBagIcon,
  TicketIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { usePortalDashboard } from '../../hooks/usePortal';
import { MEMBERSHIP_STATUS_BADGE } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const FALLBACK_QUICK_LINKS = [
  { label: 'Buy tickets', path: '/portal/tickets/buy', icon: ShoppingBagIcon },
  { label: 'Book a group visit', path: '/portal/bookings/new', icon: UserGroupIcon },
  { label: 'Leave feedback', path: '/portal/feedback', icon: BuildingLibraryIcon },
];

export default function VisitorDashboardPage() {
  const { data: dashboard, isLoading } = usePortalDashboard();

  const membership = dashboard?.membership;
  const stats = dashboard?.stats || {};
  const quickLinks = (dashboard?.quick_links?.length
    ? dashboard.quick_links
    : FALLBACK_QUICK_LINKS
  ).map((link, index) => ({
    ...link,
    icon: FALLBACK_QUICK_LINKS[index]?.icon || ArrowRightIcon,
  }));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-smrmp-gold/30 bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-5 py-6 text-smrmp-parchment shadow-md sm:px-7 sm:py-8">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-gold">Welcome back</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {isLoading ? '…' : dashboard?.welcome_name || 'Visitor'}
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-smrmp-parchment/70">
              Manage your passes, membership, and museum visits from your personal dashboard.
            </p>
          </div>
          <Link
            to="/portal/tickets/buy"
            className="inline-flex items-center gap-2 rounded-xl bg-smrmp-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1C120B] transition hover:bg-white"
          >
            <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
            <span>Buy tickets</span>
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-smrmp-gold/10 blur-2xl" />
      </section>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card hover className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4EEDC] text-[#374B07]">
                <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.total_visits ?? 0}</p>
                <p className="text-xs font-semibold text-[#6E5445]">Total visits</p>
              </div>
            </Card>
            <Card hover className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D]">
                <TicketIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.tickets ?? 0}</p>
                <p className="text-xs font-semibold text-[#6E5445]">Tickets purchased</p>
              </div>
            </Card>
            <Card hover className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E2ECF5] text-[#1A4568]">
                <UserGroupIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.open_bookings ?? 0}</p>
                <p className="text-xs font-semibold text-[#6E5445]">Open group bookings</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2" hover>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IdentificationIcon className="h-5 w-5 text-smrmp-green" aria-hidden="true" />
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">Membership status</h3>
                </div>
                {membership ? (
                  <Badge variant={MEMBERSHIP_STATUS_BADGE[membership.status] || 'default'}>
                    {membership.status}
                  </Badge>
                ) : null}
              </div>

              {membership ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Tier</p>
                    <p className="text-sm font-bold text-[#2B1B12]">{membership.tier?.name || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Membership no.</p>
                    <p className="font-mono text-sm font-bold text-[#2B1B12]">{membership.membership_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Valid until</p>
                    <p className="text-sm font-bold text-[#2B1B12]">{formatDate(membership.end_date)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Days remaining</p>
                    <p className="text-sm font-bold text-[#2B1B12]">{membership.days_remaining ?? '—'}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-[#6E5445]">You don&apos;t have an active membership yet.</p>
                  <Link
                    to="/portal/membership"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] transition-colors hover:underline"
                  >
                    <span>View membership options</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </Card>

            <Card variant="dark" hover>
              <h3 className="font-display text-base font-bold text-white">Quick actions</h3>
              <div className="mt-3 flex flex-col gap-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon || ArrowRightIcon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center justify-between rounded-xl border border-smrmp-gold/30 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-smrmp-parchment transition-colors duration-200 hover:bg-smrmp-gold/15 hover:text-smrmp-gold"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {link.label}
                      </span>
                      <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
