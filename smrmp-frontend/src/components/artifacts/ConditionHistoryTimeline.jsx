import { useState } from 'react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { CONDITION_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ConditionHistoryTimeline({ artifact, onAddLog }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState(() => {
    if (Array.isArray(artifact?.conservation_logs) && artifact.conservation_logs.length > 0) {
      return artifact.conservation_logs;
    }
    return [
      {
        id: 'log-1',
        inspected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        inspector_name: 'Dr. Meron Tadesse (Conservation Lead)',
        condition_before: 'fair',
        condition_after: artifact?.condition_status || 'good',
        observations: 'Surface dust and minor patina oxidation observed on lower frame.',
        action_taken: 'Gentle micro-fiber cleaning, anti-fungal treatment, climate enclosure adjustment.',
        next_inspection_date: '2026-11-15',
        requires_restoration: false,
      },
      {
        id: 'log-0',
        inspected_at: artifact?.created_at || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        inspector_name: 'Abebe Bikila (Catalog Specialist)',
        condition_before: 'fair',
        condition_after: 'fair',
        observations: 'Initial intake condition report upon arrival at Adwa Victory Memorial Museum repository.',
        action_taken: 'Cataloged, photographed, assigned museum QR tag and gallery placement.',
        next_inspection_date: '2026-06-30',
        requires_restoration: false,
      },
    ];
  });

  const [formData, setFormData] = useState({
    inspector_name: '',
    condition_before: artifact?.condition_status || 'good',
    condition_after: 'good',
    observations: '',
    action_taken: '',
    next_inspection_date: '',
    requires_restoration: false,
  });

  const handleSaveLog = (e) => {
    e.preventDefault();
    if (!formData.observations.trim()) {
      toast.error('Please provide observation notes');
      return;
    }

    const newLog = {
      id: `log-${Date.now()}`,
      inspected_at: new Date().toISOString(),
      inspector_name: formData.inspector_name.trim() || 'Conservation Specialist',
      condition_before: formData.condition_before,
      condition_after: formData.condition_after,
      observations: formData.observations,
      action_taken: formData.action_taken || 'Routine inspection logged',
      next_inspection_date: formData.next_inspection_date || '2026-12-31',
      requires_restoration: formData.requires_restoration,
    };

    setLogs([newLog, ...logs]);
    if (onAddLog) onAddLog(newLog);
    toast.success('Conservation inspection log saved');
    setIsModalOpen(false);
    setFormData({
      inspector_name: '',
      condition_before: formData.condition_after,
      condition_after: 'good',
      observations: '',
      action_taken: '',
      next_inspection_date: '',
      requires_restoration: false,
    });
  };

  return (
    <Card hover>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2D6C5] pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E4EEDC] text-[#374B07] border border-[#B8D4A0]">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#2B1B12]">
              Condition History & Conservation Logs
            </h3>
            <p className="text-[11px] text-[#6E5445]">Auditable inspection history and preservation actions</p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-3.5 w-3.5" />
          <span>Log Inspection</span>
        </Button>
      </div>

      {/* Timeline List */}
      <div className="relative space-y-6 pl-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2D6C5]">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div className="absolute -left-[5px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#374B07] ring-4 ring-[#FAF6F0]" />

            <div className="rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 shadow-2xs space-y-2.5">
              {/* Log Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0E6D8] pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2B1B12]">{formatDate(log.inspected_at)}</span>
                  <div className="flex items-center gap-1 text-[11px] text-[#6E5445] font-medium">
                    <UserIcon className="h-3 w-3 text-[#7C4A2D]" />
                    <span>{log.inspector_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#6E5445] font-semibold uppercase">Condition:</span>
                  <Badge variant={log.condition_before}>{log.condition_before}</Badge>
                  <span className="text-xs text-[#A08878]">→</span>
                  <Badge variant={log.condition_after}>{log.condition_after}</Badge>
                </div>
              </div>

              {/* Observations & Actions */}
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="font-bold text-[#5C4233]">Observations: </span>
                  <span className="text-[#2B1B12]">{log.observations}</span>
                </div>
                {log.action_taken && (
                  <div className="flex items-start gap-1.5 rounded-lg bg-[#FAF0D8]/60 p-2 border border-[#D4A017]/30 text-[11px] text-[#7C4A2D]">
                    <WrenchScrewdriverIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-smrmp-gold" />
                    <span><strong className="font-bold">Action Taken: </strong>{log.action_taken}</span>
                  </div>
                )}
              </div>

              {/* Footer Flags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#6E5445]">
                {log.next_inspection_date && (
                  <span>Next Inspection Due: <strong className="text-[#2B1B12]">{log.next_inspection_date}</strong></span>
                )}
                {log.requires_restoration ? (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <ExclamationTriangleIcon className="h-3.5 w-3.5" /> Requires Active Restoration
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircleIcon className="h-3.5 w-3.5" /> Stable / Cleared
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log Inspection Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Conservation Inspection">
        <form onSubmit={handleSaveLog} className="space-y-4">
          <Input
            label="Inspector Name / Title *"
            placeholder="e.g. Dr. Meron Tadesse"
            value={formData.inspector_name}
            onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Condition Before"
              options={CONDITION_STATUSES}
              value={formData.condition_before}
              onChange={(e) => setFormData({ ...formData, condition_before: e.target.value })}
            />
            <Select
              label="Condition After"
              options={CONDITION_STATUSES}
              value={formData.condition_after}
              onChange={(e) => setFormData({ ...formData, condition_after: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
              Inspection Observations *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe physical state, environmental risks, oxidation, or material stability..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 text-xs text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
              Conservation Action Taken
            </label>
            <textarea
              rows={2}
              placeholder="Micro-cleaning, climate enclosure adjustment, protective coating..."
              value={formData.action_taken}
              onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
              className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 text-xs text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <Input
              type="date"
              label="Next Inspection Date"
              value={formData.next_inspection_date}
              onChange={(e) => setFormData({ ...formData, next_inspection_date: e.target.value })}
            />
            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#8B1E1E]">
                <input
                  type="checkbox"
                  checked={formData.requires_restoration}
                  onChange={(e) => setFormData({ ...formData, requires_restoration: e.target.checked })}
                  className="h-4 w-4 rounded border-[#E2D6C5] text-rose-600 focus:ring-rose-500"
                />
                <span>Requires Restoration Workshop</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2D6C5]">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Log Entry
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
