import { useState } from 'react';
import toast from 'react-hot-toast';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { aiApi } from '../../api/aiApi';
import { REPORT_TYPES } from '../../utils/constants';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';

export default function AIReportModal() {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('monthly_summary');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setReport(null);
    try {
      const res = await aiApi.generateReport(reportType);
      setReport(res.data.data);
      toast.success('Report generated — review before distribution');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Report generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReport(null);
  };

  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>
        <SparklesIcon className="h-4 w-4" />
        <span>Generate AI Report</span>
      </Button>

      <Modal open={open} onClose={handleClose} title="AI Operational Report Generator" size="xl">
        <div className="space-y-5">
          <p className="text-xs text-[#6E5445] leading-relaxed">
            Select an operational report type below. The AI synthesizes live museum catalog data, visitor telemetry, and conservation metrics into an executive draft.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 items-end">
            <div className="sm:col-span-2">
              <Select
                label="Report Classification"
                options={REPORT_TYPES}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerate} loading={loading} variant="primary">
              <SparklesIcon className="h-4 w-4" />
              <span>Generate Draft</span>
            </Button>
          </div>

          {loading && (
            <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-8 text-center">
              <Spinner className="mx-auto mb-3" />
              <p className="text-xs font-bold text-[#2B1B12]">Synthesizing live database metrics...</p>
              <p className="text-[11px] text-[#6E5445] mt-1">Analyzing artifact status and attendance records</p>
            </div>
          )}

          {report && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Alert variant="ai" title="AI-Generated Draft | Manager Review Required">
                This document is generated dynamically from live archive entries. Review and verify details before distribution.
              </Alert>

              <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">
                      {report.report?.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#6E5445]">
                      Generated: {report.report?.generated_at}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E4EEDC] px-2.5 py-1 text-xs font-semibold text-[#243205] border border-[#B8D4A0]">
                    <CheckCircleIcon className="h-3.5 w-3.5" /> Ready
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-4 font-mono text-xs leading-relaxed text-[#2B1B12]">
                  <pre className="whitespace-pre-wrap font-sans">{report.report?.content}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
