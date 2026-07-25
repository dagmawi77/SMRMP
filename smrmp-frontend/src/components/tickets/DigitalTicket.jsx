import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckBadgeIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  QrCodeIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import Alert from '../ui/Alert';
import Logo from '../ui/Logo';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function DigitalTicket({
  ticket,
  groupBooking,
  paymentInfo,
  showSandboxBanner = true,
}) {
  const [copied, setCopied] = useState(false);
  const item = groupBooking || ticket;

  if (!item) return null;

  const isGroup = Boolean(groupBooking || item.booking_reference);

  // QR encodes the ticket or booking reference for gate scanning.
  const qrPayload = isGroup
    ? item.booking_reference || ''
    : item.qr_ticket_code || item.ticket_code || '';

  const showDemo =
    showSandboxBanner &&
    (paymentInfo?.sandbox ||
      paymentInfo?.sandbox_label ||
      item.payment_method === 'telebirr' ||
      import.meta.env.VITE_PAYMENT_SANDBOX === 'true');

  const handleCopyCode = () => {
    if (!qrPayload) return;
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    toast.success('Pass code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-md">
      {showDemo ? (
        <Alert variant="warning" title="Sandbox payment" className="mb-4">
          {paymentInfo?.sandbox_label ||
            'Sandbox mode — digital pass issued for demonstration'}
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-smrmp-gold/40 bg-[#FAF6F0] shadow-xl transition-all text-[#2B1B12] print:shadow-none print:border-none">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-6 py-5 text-center text-smrmp-parchment border-b border-smrmp-gold/30">
          <Logo className="mx-auto mb-3 h-14 w-auto" decorative />
          <div className="flex items-center justify-center gap-2 text-smrmp-gold text-xs uppercase tracking-widest font-bold">
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>{isGroup ? 'Group Digital Pass' : 'Individual Digital Pass'}</span>
          </div>
          <p className="font-display mt-1.5 text-xl font-bold tracking-tight text-white">
            Adwa Victory Memorial Museum
          </p>
        </div>

        {/* QR Code & Code Badge */}
        <div className="p-6 text-center">
          <div className="relative mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-2xl bg-[#FFFDF9] p-3 border-2 border-dashed border-[#D4A017]/50 shadow-inner">
            {qrPayload ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x160&data=${encodeURIComponent(qrPayload)}`}
                alt={`Pass QR code ${qrPayload}`}
                className="h-42 w-42 rounded-xl object-contain"
              />
            ) : (
              <span className="text-5xl" aria-hidden="true">🎫</span>
            )}
          </div>

          {/* Reference pill with Copy action */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C8B8] bg-[#EFE5D8] px-3.5 py-1.5 font-mono text-xs font-bold text-[#5C4233]">
            <span>{qrPayload}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy code"
              aria-label="Copy reference code"
              className="cursor-pointer text-[#7C4A2D] hover:text-[#2B1B12] transition-colors"
            >
              {copied ? (
                <CheckIcon className="h-3.5 w-3.5 text-emerald-700" />
              ) : (
                <DocumentDuplicateIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <p className="mt-2 text-[11px] font-semibold text-[#8B7668]">
            Present this QR code at any museum entrance scanner
          </p>

          {/* Pass Details Table */}
          <dl className="mt-5 space-y-2 text-left text-xs bg-[#FFFDF9] p-4 rounded-2xl border border-[#E2D6C5]">
            {isGroup ? (
              <>
                <div className="flex justify-between border-b border-[#E2D6C5] pb-2">
                  <dt className="text-[#6E5445] font-medium">Group Name</dt>
                  <dd className="font-bold text-[#2B1B12]">{item.group_name}</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Contact Organiser</dt>
                  <dd className="font-semibold text-[#2B1B12]">
                    {item.contact_name} {item.contact_phone ? `(${item.contact_phone})` : ''}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Group Category</dt>
                  <dd className="capitalize font-semibold text-[#2B1B12]">{item.group_type || 'Group'}</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Visitor Count</dt>
                  <dd className="font-semibold text-[#2B1B12]">{item.visitor_count} Person(s)</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Scheduled Visit</dt>
                  <dd className="font-semibold text-[#2B1B12]">
                    {formatDate(item.visit_date)} {item.visit_time ? `at ${item.visit_time}` : ''}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Tour Guide Included</dt>
                  <dd className="font-semibold text-[#2B1B12]">{item.guide_required ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-[#5C4233] font-bold">Total Booking Amount</dt>
                  <dd className="font-bold text-base font-display text-smrmp-green">
                    {formatCurrency(item.total_amount)}
                  </dd>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between border-b border-[#E2D6C5] pb-2">
                  <dt className="text-[#6E5445] font-medium">Pass Holder</dt>
                  <dd className="font-bold text-[#2B1B12]">{item.visitor_name}</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Pass Type</dt>
                  <dd className="capitalize font-semibold text-[#2B1B12]">{item.ticket_type} Pass</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Guest Quantity</dt>
                  <dd className="font-semibold text-[#2B1B12]">{item.quantity} Person(s)</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Valid Visit Date</dt>
                  <dd className="font-semibold text-[#2B1B12]">{formatDate(item.visit_date)}</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5] py-2">
                  <dt className="text-[#6E5445] font-medium">Payment Method</dt>
                  <dd className="capitalize font-semibold text-[#2B1B12]">{item.payment_method || 'Telebirr'}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-[#5C4233] font-bold">Total Paid</dt>
                  <dd className="font-bold text-base font-display text-smrmp-green">
                    {formatCurrency(item.total_amount)}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {/* Pass Status Banner */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#E4EEDC] px-4 py-2.5 text-xs font-bold text-[#243205] border border-[#B8D4A0]">
            <div className="flex items-center gap-1.5">
              <CheckBadgeIcon className="h-4 w-4 text-[#374B07]" />
              <span>STATUS: {(item.status || 'valid').toUpperCase()}</span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded-md bg-[#374B07] px-2.5 py-1 text-[11px] text-white hover:bg-[#283505] transition-colors cursor-pointer print:hidden"
            >
              <PrinterIcon className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
