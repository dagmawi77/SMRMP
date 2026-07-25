import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { membershipApi } from '../../api/membershipApi';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import { formatDate } from '../../utils/formatters';

export default function MembershipVerifyPage() {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(routeCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  const parseCode = (raw) => {
    if (!raw) return '';
    let code = raw.trim();
    if (code.includes('/memberships/verify/')) code = code.split('/memberships/verify/').pop();
    return code.split('?')[0].split('#')[0].trim();
  };

  const executeVerification = async (codeToVerify) => {
    const cleanCode = parseCode(codeToVerify);
    if (!cleanCode) {
      toast.error('Please enter a valid membership code');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await membershipApi.verify(cleanCode);
      const resData = res?.data?.data || {};
      setResult({ code: cleanCode, ...resData });

      if (resData.valid) {
        toast.success('Valid membership — entry granted');
      } else {
        toast.error(resData.message || 'Invalid membership card');
      }
    } catch (err) {
      setResult({ code: cleanCode, valid: false, membership: null, message: err.response?.data?.message || 'Verification failed' });
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeCode) {
      executeVerification(routeCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeCode]);

  useEffect(() => {
    if (!cameraActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return undefined;
    }

    let scanner = null;
    const timeoutId = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner('membership-qr-reader', { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, false);
        scanner.render(
          (decodedText) => {
            const code = parseCode(decodedText);
            if (code) {
              setInputCode(code);
              setCameraActive(false);
              executeVerification(code);
            }
          },
          () => {}
        );
        scannerRef.current = scanner;
      } catch (err) {
        console.warn('Camera scanner initialization issue:', err);
      }
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraActive]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeVerification(inputCode);
  };

  const handleReset = () => {
    setInputCode('');
    setResult(null);
    setCameraActive(false);
    navigate('/memberships/verify', { replace: true });
  };

  const membership = result?.membership;
  const visitorName = membership?.Visitor ? `${membership.Visitor.first_name} ${membership.Visitor.last_name || ''}`.trim() : null;

  return (
    <PrivateLayout>
      <PageHeader
        title="Verify Membership"
        description="Scan or enter a membership code at the gate. Valid cards grant free entry."
        badge="Curator"
        backPath="/memberships"
        showBack
      />

      <section className="relative mb-8 overflow-hidden rounded-2xl border border-smrmp-gold/30 bg-gradient-to-b from-[#241710] via-[#1C120B] to-[#2a1c12] px-6 py-10 text-center text-smrmp-parchment">
        <div className="absolute inset-0 bg-smrmp-gold/5 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-smrmp-gold/40 bg-smrmp-gold/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-smrmp-gold">
            <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
            <span>Gate membership validation</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Verify membership card</h1>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-smrmp-parchment/80 sm:text-sm">
            Scan a member&apos;s digital card QR code or enter their membership code to confirm free entry eligibility.
          </p>
        </div>
      </section>

      <div className="relative z-20 pb-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE5D8] text-[#7C4A2D]">
                    <QrCodeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#2B1B12]">Card Lookup &amp; Scanner</h2>
                    <p className="text-xs text-[#6E5445]">Enter membership code or use camera scanner</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCameraActive((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                    cameraActive ? 'bg-rose-500/10 text-rose-700 border-rose-300 hover:bg-rose-500/20' : 'bg-[#374B07] text-white border-[#374B07] hover:bg-[#243205]'
                  }`}
                >
                  <CameraIcon className="h-4 w-4" />
                  <span>{cameraActive ? 'Close Camera' : 'Scan QR'}</span>
                </button>
              </div>

              {cameraActive && (
                <div className="mb-6 overflow-hidden rounded-2xl border-2 border-dashed border-smrmp-gold bg-[#1C120B] p-3 text-center text-white shadow-inner">
                  <div id="membership-qr-reader" className="w-full text-xs text-smrmp-parchment font-semibold" />
                  <p className="text-[11px] text-smrmp-gold/80 mt-2 font-medium">Align membership QR code inside the camera box</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="membership-code-input" className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1.5">
                    Membership QR Code
                  </label>
                  <div className="relative">
                    <input
                      id="membership-code-input"
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="e.g. MBR-QR-XXXXXX"
                      className="w-full rounded-2xl border-2 border-[#E2D6C5] bg-[#FAF6F0] pl-11 pr-24 py-3 font-mono text-sm font-bold text-[#2B1B12] outline-none focus:border-[#374B07] focus:bg-white focus:ring-4 focus:ring-[#374B07]/10 transition-all"
                    />
                    <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-[#8C7467]" />
                    <button
                      type="submit"
                      disabled={loading || !inputCode.trim()}
                      className="absolute right-2 top-2 bottom-2 rounded-xl bg-[#374B07] px-4 text-xs font-bold text-white hover:bg-[#243205] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <span>Verify</span>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5">
            {loading ? (
              <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-10 text-center shadow-xl flex flex-col items-center justify-center min-h-[340px]">
                <ArrowPathIcon className="h-10 w-10 text-smrmp-gold animate-spin mb-4" />
                <h3 className="font-display text-lg font-bold text-[#2B1B12]">Checking Membership Ledger...</h3>
              </div>
            ) : result ? (
              <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] shadow-xl overflow-hidden">
                {result.valid ? (
                  <div className="bg-emerald-700 px-6 py-6 text-white text-center border-b border-emerald-800">
                    <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-emerald-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-emerald-800/80 px-3 py-1 rounded-full text-emerald-100">Entry Approved</span>
                    <h2 className="font-display text-2xl font-bold mt-2">VALID MEMBERSHIP</h2>
                    <p className="text-xs text-emerald-100/90 mt-1 font-medium">Free entry granted for this member</p>
                  </div>
                ) : (
                  <div className="bg-rose-700 px-6 py-6 text-white text-center border-b border-rose-800">
                    <XCircleIcon className="h-12 w-12 mx-auto mb-2 text-rose-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-rose-900/80 px-3 py-1 rounded-full text-rose-100">Verification Failed</span>
                    <h2 className="font-display text-2xl font-bold mt-2">{result.message || 'INVALID CARD'}</h2>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E2D6C5] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6E5445] uppercase tracking-wider">Code:</span>
                    <span className="font-mono text-sm font-bold text-[#2B1B12] bg-white px-3 py-1 rounded-xl border border-[#E2D6C5]">{result.code}</span>
                  </div>

                  {membership ? (
                    <dl className="space-y-3 text-xs divide-y divide-[#E2D6C5]/60">
                      {visitorName && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium flex items-center gap-1.5">
                            <UserIcon className="h-4 w-4 text-[#7C4A2D]" />
                            <span>Member Name</span>
                          </dt>
                          <dd className="font-bold text-[#2B1B12]">{visitorName}</dd>
                        </div>
                      )}
                      <div className="flex justify-between pt-2">
                        <dt className="text-[#6E5445] font-medium">Membership #</dt>
                        <dd className="font-mono font-bold text-[#2B1B12]">{membership.membership_number}</dd>
                      </div>
                      {membership.tier?.name && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium">Tier</dt>
                          <dd className="capitalize font-semibold text-[#2B1B12]">{membership.tier.name}</dd>
                        </div>
                      )}
                      <div className="flex justify-between pt-2">
                        <dt className="text-[#6E5445] font-medium flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-[#7C4A2D]" />
                          <span>Valid Until</span>
                        </dt>
                        <dd className="font-semibold text-[#2B1B12]">{formatDate(membership.end_date)}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="text-center py-4 text-xs text-[#8C7467] leading-relaxed">
                      No membership record matches this code.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full rounded-2xl bg-[#EFE5D8] py-2.5 text-xs font-bold text-[#5C4233] border border-[#D8C8B8] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
                  >
                    Verify Another Card
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#E2D6C5] bg-[#FFFDF9]/60 p-8 text-center min-h-[340px] flex flex-col items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE5D8] text-[#7C4A2D] mb-4">
                  <ShieldCheckIcon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-base font-bold text-[#2B1B12]">Awaiting Card Scan</h3>
                <p className="text-xs text-[#6E5445] mt-1.5 max-w-xs leading-relaxed">
                  Enter a membership code on the left or click &quot;Scan QR&quot; to open the camera scanner.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
