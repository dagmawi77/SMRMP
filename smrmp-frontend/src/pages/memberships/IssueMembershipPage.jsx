import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import DigitalMembershipCard from '../../components/memberships/DigitalMembershipCard';
import { useVisitorSearch } from '../../hooks/useVisitors';
import { useMembershipTiers, useCreateMembership } from '../../hooks/useMemberships';
import { MEMBERSHIP_PAYMENT_METHODS, VISITOR_TYPE_BADGE } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';

const STEPS = ['Select Visitor', 'Choose Tier', 'Payment', 'Membership Card'];

export default function IssueMembershipPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [payment, setPayment] = useState({
    payment_method: 'telebirr',
    payment_reference: '',
    start_date: new Date().toISOString().split('T')[0],
    auto_renew: false,
  });
  const [createdMembership, setCreatedMembership] = useState(null);

  const { data: searchResults, isFetching: searching } = useVisitorSearch(query);
  const { data: tiers, isLoading: loadingTiers } = useMembershipTiers();
  const createMembership = useCreateMembership();

  const handleCreate = async () => {
    if (!selectedVisitor || !selectedTier) return;
    try {
      const res = await createMembership.mutateAsync({
        visitor_id: selectedVisitor.id,
        tier_id: selectedTier.id,
        payment_method: payment.payment_method,
        payment_reference: payment.payment_reference || undefined,
        start_date: payment.start_date,
        auto_renew: payment.auto_renew,
      });
      const membership = res?.data?.data?.membership;
      setCreatedMembership(membership);
      setStep(4);
      toast.success('Membership issued successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to issue membership'));
    }
  };

  const resetWizard = () => {
    setStep(1);
    setQuery('');
    setSelectedVisitor(null);
    setSelectedTier(null);
    setCreatedMembership(null);
    setPayment({
      payment_method: 'telebirr',
      payment_reference: '',
      start_date: new Date().toISOString().split('T')[0],
      auto_renew: false,
    });
  };

  return (
    <PrivateLayout>
      <PageHeader
        title="Issue New Membership"
        description="Staff desk enrollment — issue a membership card for a CRM visitor record."
        badge="Module 8"
        backPath="/memberships"
        showBack
      />

      <div className="mb-8 flex justify-center items-center gap-3 sm:gap-6">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2 text-xs font-bold ${
              step > i + 1 ? 'text-[#374B07]' : step === i + 1 ? 'text-[#2B1B12]' : 'text-[#887060]'
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= i + 1 ? 'bg-gradient-to-br from-smrmp-green to-smrmp-deep-green text-white shadow-xs' : 'bg-[#EFE5D8] text-[#7C4A2D] border border-[#D8C8B8]'
              }`}
            >
              {step > i + 1 ? <CheckCircleIcon className="h-4 w-4" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <Card className="mx-auto max-w-2xl p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-base font-bold text-[#2B1B12]">Select a Visitor</h2>
            <p className="text-xs text-[#6E5445]">
              Search visitors who already registered through the Visitor Portal.
            </p>

            {selectedVisitor ? (
              <div className="flex items-center justify-between rounded-2xl border border-[#B8D4A0] bg-[#E4EEDC] p-4">
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="h-10 w-10 text-[#374B07]" />
                  <div>
                    <p className="font-bold text-[#243205]">
                      {selectedVisitor.first_name} {selectedVisitor.last_name}
                    </p>
                    <p className="text-xs text-[#374B07]">{selectedVisitor.phone || selectedVisitor.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedVisitor(null)} className="text-xs font-bold text-[#374B07] hover:underline">
                  Change
                </button>
              </div>
            ) : (
              <>
                <Input
                  icon={MagnifyingGlassIcon}
                  placeholder="Search by name, phone, email, or national ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="max-h-64 overflow-y-auto rounded-2xl border border-[#E2D6C5]">
                  {searching ? (
                    <Spinner className="py-8" />
                  ) : query.trim().length < 2 ? (
                    <p className="p-6 text-center text-xs text-[#8C7467]">Type at least 2 characters to search.</p>
                  ) : !searchResults?.length ? (
                    <p className="p-6 text-center text-xs text-[#8C7467]">No matching visitors. They must register via the Visitor Portal first.</p>
                  ) : (
                    <div className="divide-y divide-[#E2D6C5]/60">
                      {searchResults.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVisitor(v)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF0E4]"
                        >
                          <UserCircleIcon className="h-8 w-8 shrink-0 text-[#7C4A2D]" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#2B1B12]">
                              {v.first_name} {v.last_name}
                            </p>
                            <p className="truncate text-xs text-[#6E5445]">{v.phone || v.email}</p>
                          </div>
                          <Badge variant={VISITOR_TYPE_BADGE[v.visitor_type] || 'default'}>{v.visitor_type}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <Button variant="primary" size="lg" className="w-full" disabled={!selectedVisitor} onClick={() => setStep(2)}>
              Continue to Tier Selection
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <h2 className="font-display text-base font-bold text-[#2B1B12]">Choose Membership Tier</h2>

            {loadingTiers ? (
              <Spinner className="py-12" />
            ) : !tiers?.length ? (
              <p className="py-8 text-center text-xs text-[#8C7467]">No active membership tiers configured.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTier(t)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      selectedTier?.id === t.id
                        ? 'border-smrmp-gold bg-[#FAF0D8] shadow-md'
                        : 'border-[#E2D6C5] bg-[#FFFDF9] hover:border-smrmp-gold/50'
                    }`}
                  >
                    <p className="font-display text-sm font-bold text-[#2B1B12]">{t.name}</p>
                    <p className="mt-1 text-lg font-bold text-[#374B07]">{formatCurrency(t.price_etb)}</p>
                    <p className="text-[11px] text-[#6E5445]">{t.duration_months} month(s) validity</p>
                    {t.description && <p className="mt-2 text-xs text-[#5C4233] leading-relaxed">{t.description}</p>}
                    {Array.isArray(t.benefits) && t.benefits.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-[11px] text-[#5C4233]">
                        {t.benefits.slice(0, 3).map((b, idx) => (
                          <li key={idx}>• {b}</li>
                        ))}
                      </ul>
                    )}
                  </button>
                ))}
              </div>
            )}

            <Button variant="primary" size="lg" className="w-full" disabled={!selectedTier} onClick={() => setStep(3)}>
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <h2 className="font-display text-base font-bold text-[#2B1B12]">Payment Details</h2>

            <div className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E5445]">Amount Due</span>
              <span className="font-display text-xl font-bold text-[#374B07]">{formatCurrency(selectedTier?.price_etb)}</span>
            </div>

            <Select
              label="Payment Method"
              options={MEMBERSHIP_PAYMENT_METHODS}
              value={payment.payment_method}
              onChange={(e) => setPayment({ ...payment, payment_method: e.target.value })}
            />
            <Input
              label="Payment Reference (optional)"
              value={payment.payment_reference}
              onChange={(e) => setPayment({ ...payment, payment_reference: e.target.value })}
              placeholder="Transaction reference number"
            />
            <Input
              label="Start Date"
              type="date"
              value={payment.start_date}
              onChange={(e) => setPayment({ ...payment, start_date: e.target.value })}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-[#5C4233]">
              <input
                type="checkbox"
                checked={payment.auto_renew}
                onChange={(e) => setPayment({ ...payment, auto_renew: e.target.checked })}
                className="h-4 w-4 rounded border-[#E2D6C5] text-smrmp-green focus:ring-smrmp-green"
              />
              <span>Enable auto-renewal</span>
            </label>

            <Button variant="primary" size="lg" className="w-full" onClick={handleCreate} loading={createMembership.isPending}>
              Issue Membership &amp; Generate Card
            </Button>
          </div>
        )}

        {step === 4 && createdMembership && (
          <div className="space-y-6">
            <DigitalMembershipCard membership={createdMembership} />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={resetWizard}>
                Issue Another Membership
              </Button>
              <Button variant="primary" onClick={() => navigate('/memberships')}>
                Back to Membership List
              </Button>
            </div>
          </div>
        )}
      </Card>
    </PrivateLayout>
  );
}
