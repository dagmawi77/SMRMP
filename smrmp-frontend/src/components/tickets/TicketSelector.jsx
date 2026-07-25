import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '../../api/ticketApi';
import { formatCurrency } from '../../utils/formatters';
import Spinner from '../ui/Spinner';
import Select from '../ui/Select';
import { TicketIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TicketSelector({ selected, quantity, onSelect, onQuantityChange, visitDate, onDateChange }) {
  const { data, isLoading } = useQuery({
    queryKey: ['ticket-types'],
    queryFn: () => ticketApi.getTypes(),
    select: (res) => res.data.data.ticket_types,
  });

  if (isLoading) return <Spinner className="py-12" />;

  const types = data || [];
  const selectedType = types.find((t) => t.type === selected);
  const total = selectedType ? selectedType.price_etb * quantity : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-3">
          Select Entry Classification
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {types.map((type) => {
            const isSelected = selected === type.type;

            return (
              <button
                key={type.type}
                type="button"
                onClick={() => onSelect(type.type)}
                className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-smrmp-green bg-[#E4EEDC]/70 shadow-md ring-2 ring-smrmp-green/20'
                    : 'border-[#E2D6C5] bg-[#FFFDF9] hover:border-smrmp-gold/50 hover:bg-[#FAF0E4]'
                }`}
              >
                {isSelected && (
                  <CheckCircleIcon className="absolute top-3.5 right-3.5 h-5 w-5 text-smrmp-green" />
                )}
                <div className="flex items-center gap-2 mb-1">
                  <TicketIcon className={`h-4 w-4 ${isSelected ? 'text-smrmp-green' : 'text-[#7C4A2D]'}`} />
                  <p className="font-bold text-[#2B1B12] text-sm">{type.label}</p>
                </div>
                <p className="text-xs text-[#6E5445] leading-relaxed">{type.description}</p>
                <p className="mt-3 text-lg font-bold font-display text-smrmp-green">
                  {formatCurrency(type.price_etb)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-[#E2D6C5]">
        <div>
          <Select
            label="Quantity"
            value={quantity}
            placeholder=""
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
              value: n,
              label: `${n} Ticket${n > 1 ? 's' : ''}`,
            }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
            Visit Date
          </label>
          <input
            type="date"
            value={visitDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none transition-all focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
          />
        </div>
      </div>

      {selectedType && (
        <div className="rounded-2xl bg-gradient-to-r from-[#FAF0D8] via-[#FAF6F0] to-[#EFE5D8] p-4 border border-[#D4A017]/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6E5445]">Order Summary</p>
            <p className="text-sm font-bold text-[#2B1B12]">{selectedType.label} × {quantity}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Due</p>
            <p className="text-2xl font-bold font-display text-smrmp-green">{formatCurrency(total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
