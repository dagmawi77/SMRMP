import Alert from '../ui/Alert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BuildingLibraryIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function DigitalTicket({ ticket, paymentInfo }) {
  if (!ticket) return null;

  const qrUrl = ticket.qr_ticket_code
    ? `${window.location.origin}/tickets/verify/${ticket.qr_ticket_code}`
    : null;

  return (
    <div className="mx-auto max-w-md">
      <Alert variant="warning" title="DEMO MODE — Sandbox Simulation" className="mb-4">
        {paymentInfo?.sandbox_label || 'Sandbox mode — digital ticket issued for demonstration'}
      </Alert>

      <div className="overflow-hidden rounded-3xl border border-smrmp-gold/40 bg-[#FAF6F0] shadow-xl transition-all text-[#2B1B12]">
        <div className="bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-6 py-5 text-center text-smrmp-parchment border-b border-smrmp-gold/30">
          <div className="flex items-center justify-center gap-2 text-smrmp-gold text-xs uppercase tracking-widest font-bold">
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>Digital Museum Pass</span>
          </div>
          <p className="font-display mt-1.5 text-xl font-bold tracking-tight text-white">
            Adwa Victory Memorial Museum
          </p>
        </div>

        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-2xl bg-[#FFFDF9] p-2 border border-[#E2D6C5] shadow-2xs">
            {ticket.qr_ticket_code ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`}
                alt="Ticket QR code"
                className="h-40 w-40 rounded-xl"
              />
            ) : (
              <span className="text-5xl">🎫</span>
            )}
          </div>

          <p className="font-mono text-xs font-bold text-[#5C4233] bg-[#EFE5D8] py-1 px-3 rounded-full inline-block border border-[#D8C8B8]">
            {ticket.qr_ticket_code}
          </p>

          <dl className="mt-6 space-y-2 text-left text-xs">
            <div className="flex justify-between border-b border-[#E2D6C5] py-2">
              <dt className="text-[#6E5445] font-medium">Visitor Name</dt>
              <dd className="font-bold text-[#2B1B12]">{ticket.visitor_name}</dd>
            </div>
            <div className="flex justify-between border-b border-[#E2D6C5] py-2">
              <dt className="text-[#6E5445] font-medium">Pass Classification</dt>
              <dd className="capitalize font-semibold text-[#2B1B12]">{ticket.ticket_type}</dd>
            </div>
            <div className="flex justify-between border-b border-[#E2D6C5] py-2">
              <dt className="text-[#6E5445] font-medium">Quantity</dt>
              <dd className="font-semibold text-[#2B1B12]">{ticket.quantity} Person(s)</dd>
            </div>
            <div className="flex justify-between border-b border-[#E2D6C5] py-2">
              <dt className="text-[#6E5445] font-medium">Visit Date</dt>
              <dd className="font-semibold text-[#2B1B12]">{formatDate(ticket.visit_date)}</dd>
            </div>
            <div className="flex justify-between py-2 pt-3">
              <dt className="text-[#5C4233] font-bold">Total Amount Paid</dt>
              <dd className="font-bold text-base font-display text-smrmp-green">
                {formatCurrency(ticket.total_amount)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-[#E4EEDC] py-2.5 text-xs font-bold text-[#243205] border border-[#B8D4A0]">
            <CheckBadgeIcon className="h-4 w-4 text-[#374B07]" />
            <span>Pass Status: {(ticket.status || 'valid').toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
