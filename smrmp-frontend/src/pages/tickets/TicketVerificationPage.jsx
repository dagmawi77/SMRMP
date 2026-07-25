import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalendarIcon,
  TicketIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { ticketApi } from '../../api/ticketApi';
import { MUSEUM_NAME } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Logo from '../../components/ui/Logo';

export default function TicketVerificationPage() {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();

  const [inputCode, setCodeInput] = useState(routeCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const scannerRef = useRef(null);

  // Helper to extract clean ticket code if full URL was scanned
  const parseTicketCode = (raw) => {
    if (!raw) return '';
    let code = raw.trim();
    if (code.includes('/tickets/verify/')) {
      code = code.split('/tickets/verify/').pop();
    } else if (code.includes('/verify/')) {
      code = code.split('/verify/').pop();
    } else if (code.includes('code=')) {
      code = code.split('code=').pop();
    }
    return code.split('?')[0].split('#')[0].trim().toUpperCase();
  };

  const executeVerification = async (codeToVerify) => {
    const cleanCode = parseTicketCode(codeToVerify);
    if (!cleanCode) {
      toast.error('Please enter a valid ticket code');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await ticketApi.verify(cleanCode);
      const resData = response?.data?.data || response?.data || {};

      const isValid = Boolean(resData.valid);
      const ticketObj = resData.ticket || null;
      const statusMsg = resData.message || (isValid ? 'Valid Pass' : 'Invalid Ticket');

      const outcome = {
        code: cleanCode,
        valid: isValid,
        ticket: ticketObj,
        message: statusMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setResult(outcome);
      setRecentScans((prev) => [outcome, ...prev.filter((item) => item.code !== cleanCode)].slice(0, 10));

      if (isValid) {
        toast.success(`Pass Validated: ${cleanCode}`);
      } else if (statusMsg.toLowerCase().includes('used')) {
        toast.error(`Ticket Already Used: ${cleanCode}`);
      } else {
        toast.error(`Invalid Ticket Code: ${cleanCode}`);
      }

      // Update route URL without full reload
      if (routeCode !== cleanCode) {
        navigate(`/tickets/verify/${cleanCode}`, { replace: true });
      }
    } catch (err) {
      console.error('Verification error:', err);
      const fallbackOutcome = {
        code: cleanCode,
        valid: false,
        ticket: null,
        message: err.response?.data?.message || 'Verification Failed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setResult(fallbackOutcome);
      toast.error(fallbackOutcome.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if code parameter is present in URL on mount/update
  useEffect(() => {
    if (routeCode) {
      const clean = parseTicketCode(routeCode);
      setCodeInput(clean);
      executeVerification(clean);
    }
  }, [routeCode]);

  // Handle Camera Scanner Lifecycle
  useEffect(() => {
    if (!cameraActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    let scanner = null;
    const timeoutId = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner(
          'ticket-qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            const code = parseTicketCode(decodedText);
            if (code) {
              setCodeInput(code);
              setCameraActive(false);
              executeVerification(code);
            }
          },
          () => {
            // Frame error ignored
          }
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
    setCodeInput('');
    setResult(null);
    setCameraActive(false);
    navigate('/tickets/verify', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans text-[#2B1B12] selection:bg-smrmp-gold/30">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-40 border-b border-smrmp-gold/30 bg-[#1C120B]/95 px-6 py-4 backdrop-blur-md text-smrmp-parchment shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="h-10 w-auto transition-transform group-hover:scale-105" decorative />
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white block leading-tight">
                {MUSEUM_NAME}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-smrmp-gold/80">
                Gate Entry & Verification Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/tickets"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-smrmp-parchment hover:border-smrmp-gold hover:text-smrmp-gold transition-colors"
            >
              <TicketIcon className="h-4 w-4" />
              <span>Book Pass</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-smrmp-gold/40 bg-smrmp-gold/10 px-3.5 py-1.5 text-xs font-bold text-smrmp-gold hover:bg-smrmp-gold hover:text-black transition-all"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Landing Page</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Title Section */}
      <section className="bg-gradient-to-b from-[#241710] via-[#1C120B] to-[#FAF6F0] pt-10 pb-16 px-6 text-center text-smrmp-parchment relative overflow-hidden">
        <div className="absolute inset-0 bg-smrmp-gold/5 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-smrmp-gold/40 bg-smrmp-gold/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-smrmp-gold mb-3">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Official Gate Pass Validation System</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Verify Museum Entry Ticket
          </h1>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-smrmp-parchment/80 max-w-xl mx-auto">
            Scan visitor ticket QR codes or enter ticket ID numbers below to inspect entry eligibility, payment verification, and pass status.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 -mt-8 pb-16 relative z-20">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Verification Form & Scanner */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE5D8] text-[#7C4A2D]">
                    <QrCodeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#2B1B12]">Pass Lookup & Scanner</h2>
                    <p className="text-xs text-[#6E5445]">Enter ticket code or use camera scanner</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCameraActive((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                    cameraActive
                      ? 'bg-rose-500/10 text-rose-700 border-rose-300 hover:bg-rose-500/20'
                      : 'bg-[#374B07] text-white border-[#374B07] hover:bg-[#243205]'
                  }`}
                >
                  <CameraIcon className="h-4 w-4" />
                  <span>{cameraActive ? 'Close Camera' : 'Scan QR'}</span>
                </button>
              </div>

              {/* Camera Scanner View */}
              {cameraActive && (
                <div className="mb-6 overflow-hidden rounded-2xl border-2 border-dashed border-smrmp-gold bg-[#1C120B] p-3 text-center text-white shadow-inner animate-in fade-in duration-200">
                  <div id="ticket-qr-reader" className="w-full text-xs text-smrmp-parchment font-semibold" />
                  <p className="text-[11px] text-smrmp-gold/80 mt-2 font-medium">
                    Align visitor QR code inside camera scanner box
                  </p>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="ticket-code-input" className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1.5">
                    Ticket Pass Code (e.g. TKT-123456)
                  </label>
                  <div className="relative">
                    <input
                      id="ticket-code-input"
                      type="text"
                      value={inputCode}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. TKT-100234"
                      className="w-full rounded-2xl border-2 border-[#E2D6C5] bg-[#FAF6F0] pl-11 pr-24 py-3 font-mono text-sm font-bold text-[#2B1B12] outline-none focus:border-[#374B07] focus:bg-white focus:ring-4 focus:ring-[#374B07]/10 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-[#A08C7D]"
                    />
                    <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-[#8C7467]" />
                    <button
                      type="submit"
                      disabled={loading || !inputCode.trim()}
                      className="absolute right-2 top-2 bottom-2 rounded-xl bg-[#374B07] px-4 text-xs font-bold text-white hover:bg-[#243205] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {loading ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>Verify</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Presets for Easy Demo / Testing */}
                <div className="pt-2 border-t border-[#E2D6C5]/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7467] block mb-2">
                    Quick Sample Test Codes:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const code = 'TKT-DEMO-VALID';
                        setCodeInput(code);
                        executeVerification(code);
                      }}
                      className="rounded-lg bg-[#E4EEDC] px-2.5 py-1 text-[11px] font-bold text-[#374B07] border border-[#B8D4A0] hover:bg-[#d5e6cb] transition-colors"
                    >
                      Valid Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const code = 'TKT-DEMO-USED';
                        setCodeInput(code);
                        executeVerification(code);
                      }}
                      className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                    >
                      Already Used Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const code = 'TKT-INVALID';
                        setCodeInput(code);
                        executeVerification(code);
                      }}
                      className="rounded-lg bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-900 border border-rose-300 hover:bg-rose-200 transition-colors"
                    >
                      Invalid Code
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Recent Scans Session Log */}
            {recentScans.length > 0 && (
              <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-md">
                <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#2B1B12]">
                      Session Verification Log ({recentScans.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecentScans([])}
                    className="text-[10px] font-bold text-[#8C7467] hover:text-[#2B1B12] hover:underline"
                  >
                    Clear History
                  </button>
                </div>

                <div className="divide-y divide-[#E2D6C5]/60 text-xs">
                  {recentScans.map((item, idx) => (
                    <div
                      key={`${item.code}-${idx}`}
                      onClick={() => {
                        setCodeInput(item.code);
                        setResult(item);
                      }}
                      className="flex items-center justify-between py-2.5 hover:bg-[#FAF6F0] px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.valid ? (
                          <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : item.message?.toLowerCase().includes('used') ? (
                          <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 shrink-0" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-mono font-bold text-[#2B1B12]">{item.code}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.valid
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.message?.toLowerCase().includes('used')
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.message || (item.valid ? 'Valid' : 'Invalid')}
                        </span>
                        <span className="text-[10px] font-mono text-[#8C7467]">{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Result Card */}
          <div className="lg:col-span-5">
            {loading ? (
              <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-10 text-center shadow-xl flex flex-col items-center justify-center min-h-[340px]">
                <ArrowPathIcon className="h-10 w-10 text-smrmp-gold animate-spin mb-4" />
                <h3 className="font-display text-lg font-bold text-[#2B1B12]">Checking Gate Ledger...</h3>
                <p className="text-xs text-[#6E5445] mt-1">Verifying ticket signature and payment record</p>
              </div>
            ) : result ? (
              <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] shadow-xl overflow-hidden animate-in fade-in duration-300">
                {/* Status Banner */}
                {result.valid ? (
                  <div className="bg-emerald-700 px-6 py-6 text-white text-center border-b border-emerald-800">
                    <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-emerald-200 animate-bounce" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-emerald-800/80 px-3 py-1 rounded-full text-emerald-100">
                      Entry Approved
                    </span>
                    <h2 className="font-display text-2xl font-bold mt-2">VALID MUSEUM PASS</h2>
                    <p className="text-xs text-emerald-100/90 mt-1 font-medium">
                      Pass code verified and redeemed for entry
                    </p>
                  </div>
                ) : result.message?.toLowerCase().includes('used') ? (
                  <div className="bg-amber-600 px-6 py-6 text-white text-center border-b border-amber-700">
                    <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2 text-amber-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-amber-800/80 px-3 py-1 rounded-full text-amber-100">
                      Already Redeemed
                    </span>
                    <h2 className="font-display text-2xl font-bold mt-2">PASS ALREADY USED</h2>
                    <p className="text-xs text-amber-100/90 mt-1 font-medium">
                      This ticket code has already been processed at the gate
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-700 px-6 py-6 text-white text-center border-b border-rose-800">
                    <XCircleIcon className="h-12 w-12 mx-auto mb-2 text-rose-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-rose-900/80 px-3 py-1 rounded-full text-rose-100">
                      Verification Failed
                    </span>
                    <h2 className="font-display text-2xl font-bold mt-2">INVALID TICKET CODE</h2>
                    <p className="text-xs text-rose-100/90 mt-1 font-medium">
                      No active ticket record matching code <span className="font-mono">{result.code}</span>
                    </p>
                  </div>
                )}

                {/* Ticket Details Box */}
                <div className="p-6 space-y-4">
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E2D6C5] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6E5445] uppercase tracking-wider">Ticket Code:</span>
                    <span className="font-mono text-sm font-bold text-[#2B1B12] bg-white px-3 py-1 rounded-xl border border-[#E2D6C5]">
                      {result.code}
                    </span>
                  </div>

                  {result.ticket ? (
                    <dl className="space-y-3 text-xs divide-y divide-[#E2D6C5]/60">
                      {result.ticket.visitor_name && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium flex items-center gap-1.5">
                            <UserIcon className="h-4 w-4 text-[#7C4A2D]" />
                            <span>Visitor Name</span>
                          </dt>
                          <dd className="font-bold text-[#2B1B12]">{result.ticket.visitor_name}</dd>
                        </div>
                      )}

                      {result.ticket.ticket_type && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium flex items-center gap-1.5">
                            <TicketIcon className="h-4 w-4 text-[#7C4A2D]" />
                            <span>Pass Type</span>
                          </dt>
                          <dd className="capitalize font-semibold text-[#2B1B12]">{result.ticket.ticket_type}</dd>
                        </div>
                      )}

                      {result.ticket.quantity && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium flex items-center gap-1.5">
                            <SparklesIcon className="h-4 w-4 text-[#7C4A2D]" />
                            <span>Admissions</span>
                          </dt>
                          <dd className="font-semibold text-[#2B1B12]">{result.ticket.quantity} Person(s)</dd>
                        </div>
                      )}

                      {result.ticket.visit_date && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-[#7C4A2D]" />
                            <span>Valid Date</span>
                          </dt>
                          <dd className="font-semibold text-[#2B1B12]">{formatDate(result.ticket.visit_date)}</dd>
                        </div>
                      )}

                      {result.ticket.total_amount !== undefined && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium">Total Paid</dt>
                          <dd className="font-bold text-[#374B07]">{formatCurrency(result.ticket.total_amount)}</dd>
                        </div>
                      )}

                      {result.ticket.used_at && (
                        <div className="flex justify-between pt-2">
                          <dt className="text-[#6E5445] font-medium">Redeemed At</dt>
                          <dd className="font-mono text-[11px] text-[#2B1B12]">
                            {new Date(result.ticket.used_at).toLocaleString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <div className="text-center py-4 text-xs text-[#8C7467] leading-relaxed">
                      Please check the ticket code on the visitor's printed pass or digital ticket and try again.
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full rounded-2xl bg-[#EFE5D8] py-2.5 text-xs font-bold text-[#5C4233] border border-[#D8C8B8] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
                    >
                      Scan / Verify Another Ticket
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#E2D6C5] bg-[#FFFDF9]/60 p-8 text-center min-h-[340px] flex flex-col items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE5D8] text-[#7C4A2D] mb-4">
                  <ShieldCheckIcon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-base font-bold text-[#2B1B12]">Awaiting Ticket Scan</h3>
                <p className="text-xs text-[#6E5445] mt-1.5 max-w-xs leading-relaxed">
                  Enter a ticket pass code on the left or click "Scan QR" to open camera scanner.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
