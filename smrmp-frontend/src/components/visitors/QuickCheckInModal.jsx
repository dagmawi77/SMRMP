import { useState } from 'react';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';
import { useVisitorSearch, useCheckInVisitor } from '../../hooks/useVisitors';
import { ENTRY_METHODS, VISITOR_TYPE_BADGE } from '../../utils/constants';
import getApiErrorMessage from '../../utils/apiError';

export default function QuickCheckInModal({ isOpen, onClose, onSuccess }) {
  const [query, setQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [entryMethod, setEntryMethod] = useState('staff_assisted');
  const [notes, setNotes] = useState('');

  const { data: results, isFetching } = useVisitorSearch(query);
  const checkIn = useCheckInVisitor();

  const reset = () => {
    setQuery('');
    setSelectedVisitor(null);
    setEntryMethod('staff_assisted');
    setNotes('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCheckIn = async () => {
    if (!selectedVisitor) return;
    if (selectedVisitor.is_blacklisted) {
      toast.error('This visitor is blacklisted and cannot be checked in');
      return;
    }
    try {
      const res = await checkIn.mutateAsync({
        id: selectedVisitor.id,
        data: { entry_method: entryMethod, notes: notes || undefined },
      });
      toast.success(`${selectedVisitor.first_name} checked in successfully`);
      onSuccess?.(res?.data?.data);
      handleClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to check in visitor'));
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title="Quick Visitor Check-In" size="md">
      <div className="space-y-4">
        {!selectedVisitor ? (
          <>
            <Input
              label="Search Registered Visitor"
              icon={MagnifyingGlassIcon}
              placeholder="Search by name, phone, email, or national ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />

            <div className="max-h-72 overflow-y-auto rounded-2xl border border-[#E2D6C5]">
              {isFetching ? (
                <div className="py-8">
                  <Spinner />
                </div>
              ) : query.trim().length < 2 ? (
                <p className="p-6 text-center text-xs text-[#8C7467]">
                  Type at least 2 characters to search registered visitors.
                </p>
              ) : !results?.length ? (
                <p className="p-6 text-center text-xs text-[#8C7467]">
                  No matching visitors found. Register a new visitor instead.
                </p>
              ) : (
                <div className="divide-y divide-[#E2D6C5]/60">
                  {results.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVisitor(v)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FAF0E4]"
                    >
                      <UserCircleIcon className="h-8 w-8 shrink-0 text-[#7C4A2D]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#2B1B12]">
                          {v.first_name} {v.last_name}
                        </p>
                        <p className="truncate text-xs text-[#6E5445]">{v.phone || v.email || 'No contact info'}</p>
                      </div>
                      <Badge variant={VISITOR_TYPE_BADGE[v.visitor_type] || 'default'}>{v.visitor_type}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-4">
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-10 w-10 text-[#7C4A2D]" />
                <div>
                  <p className="font-bold text-[#2B1B12]">
                    {selectedVisitor.first_name} {selectedVisitor.last_name}
                  </p>
                  <p className="text-xs text-[#6E5445]">{selectedVisitor.phone || selectedVisitor.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="text-xs font-bold text-[#7C4A2D] hover:underline"
              >
                Change
              </button>
            </div>

            {selectedVisitor.is_blacklisted && (
              <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">
                This visitor is blacklisted and cannot be checked in.
              </p>
            )}

            <Select
              label="Entry Method"
              options={ENTRY_METHODS}
              value={entryMethod}
              onChange={(e) => setEntryMethod(e.target.value)}
            />

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">
                Notes (optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate notes..."
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] placeholder:text-[#A08878] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E2D6C5] pt-4">
              <Button variant="secondary" onClick={handleClose} disabled={checkIn.isPending}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckIn}
                loading={checkIn.isPending}
                disabled={selectedVisitor.is_blacklisted}
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Confirm Check-In</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
