import {
  BuildingLibraryIcon,
  PrinterIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatters';
import { MUSEUM_NAME } from '../../utils/constants';

/**
 * Print-ready digital membership card. Accepts either the public `card`
 * payload from GET /memberships/:id/card or a full `membership` record
 * (with Visitor + tier associations) from the staff endpoints.
 */
export default function DigitalMembershipCard({ membership, showPrintButton = true }) {
  if (!membership) return null;

  const membershipNumber = membership.membership_number;
  const visitorName =
    membership.visitor_name ||
    (membership.Visitor ? `${membership.Visitor.first_name || ''} ${membership.Visitor.last_name || ''}`.trim() : null) ||
    'Museum Member';
  const tierName =
    typeof membership.tier === 'string' ? membership.tier : membership.tier?.name || 'Standard';
  const status = membership.status;
  const isActive = membership.is_active !== undefined ? membership.is_active : status === 'active';
  const qrValue = membership.qr_data_url
    ? membership.qr_data_url
    : membership.qr_code
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(membership.qr_code)}`
    : null;

  return (
    <div className="mx-auto max-w-md">
      <div
        id="membership-card-print-area"
        className="overflow-hidden rounded-3xl border-2 border-smrmp-gold/50 bg-gradient-to-br from-[#1C120B] via-[#233303] to-[#1C120B] shadow-2xl print:shadow-none"
      >
        {/* Header */}
        <div className="border-b border-smrmp-gold/30 bg-gradient-to-r from-smrmp-green via-[#2D3F06] to-smrmp-deep-green px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 text-smrmp-gold text-[11px] font-bold uppercase tracking-[0.2em]">
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>{MUSEUM_NAME}</span>
          </div>
          <p className="font-display mt-1.5 text-xl font-bold tracking-tight text-white">Museum Membership Card</p>
          <span className="mt-2 inline-block rounded-full bg-smrmp-gold px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-[#1C120B]">
            {tierName} Tier
          </span>
        </div>

        {/* Body */}
        <div className="bg-[#FAF6F0] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[#E2D6C5] bg-white p-1.5 shadow-2xs">
              {qrValue ? (
                <img src={qrValue} alt="Membership QR code" className="h-full w-full rounded-lg" />
              ) : (
                <span className="text-3xl">🎫</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Member Name</p>
              <p className="truncate font-display text-lg font-bold text-[#2B1B12]">{visitorName}</p>
              <p className="mt-1 font-mono text-xs font-bold text-[#7C4A2D] bg-[#FAF0D8] inline-block px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                {membershipNumber}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-2 text-xs divide-y divide-[#E2D6C5]/60">
            <div className="flex justify-between py-2">
              <dt className="text-[#6E5445] font-medium">Valid From</dt>
              <dd className="font-bold text-[#2B1B12]">{formatDate(membership.start_date)}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-[#6E5445] font-medium">Valid Until</dt>
              <dd className="font-bold text-[#2B1B12]">{formatDate(membership.end_date)}</dd>
            </div>
            {membership.max_guests !== undefined && membership.tier?.max_guests !== undefined && (
              <div className="flex justify-between py-2">
                <dt className="text-[#6E5445] font-medium">Guest Allowance</dt>
                <dd className="font-bold text-[#2B1B12]">{membership.tier.max_guests} guest(s)</dd>
              </div>
            )}
          </dl>

          <div
            className={`mt-5 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold border ${
              isActive
                ? 'bg-[#E4EEDC] text-[#243205] border-[#B8D4A0]'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {isActive ? <CheckBadgeIcon className="h-4 w-4 text-[#374B07]" /> : <XCircleIcon className="h-4 w-4 text-rose-600" />}
            <span>Status: {(status || 'unknown').toUpperCase()}</span>
          </div>
        </div>
      </div>

      {showPrintButton && (
        <div className="mt-4 flex justify-center print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#374B07] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#243205] transition-colors"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Print Membership Card</span>
          </button>
        </div>
      )}
    </div>
  );
}
