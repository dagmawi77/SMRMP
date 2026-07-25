import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatDate } from '../../utils/formatters';
import {
  MapPinIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LOCATION_REASONS = [
  { value: 'exhibition_rotation', label: 'Exhibition Rotation / New Gallery Display' },
  { value: 'conservation_lab', label: 'Transfer to Conservation Lab' },
  { value: 'loan_dispatch', label: 'Outbound Loan Dispatch' },
  { value: 'secure_storage', label: 'Secure Archival Storage' },
  { value: 'maintenance', label: 'Gallery Maintenance / Display Case Service' },
];

export default function LocationMovementHistory({ artifact, onLocationChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(artifact?.location || 'Adwa Victory Gallery A-3');
  const [movements, setSetMovements] = useState(() => {
    if (Array.isArray(artifact?.location_movements) && artifact.location_movements.length > 0) {
      return artifact.location_movements;
    }
    return [
      {
        id: 'move-2',
        moved_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        from_location: 'Central Storage Room 4',
        to_location: artifact?.location || 'Adwa Victory Gallery A-3',
        reason: 'Exhibition Placement for Victory Anniversary Display',
        handler: 'Samuel Worku (Gallery Curator)',
      },
      {
        id: 'move-1',
        moved_at: artifact?.created_at || new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        from_location: 'Intake Vault',
        to_location: 'Central Storage Room 4',
        reason: 'Initial Registration & Inventory Security Transfer',
        handler: 'Abebe Bikila (Archive Officer)',
      },
    ];
  });

  const [formData, setFormData] = useState({
    to_location: '',
    reason_type: 'exhibition_rotation',
    notes: '',
    handler_name: '',
  });

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!formData.to_location.trim()) {
      toast.error('Destination location is required');
      return;
    }

    const newMove = {
      id: `move-${Date.now()}`,
      moved_at: new Date().toISOString(),
      from_location: currentLocation,
      to_location: formData.to_location.trim(),
      reason: formData.notes.trim() || LOCATION_REASONS.find(r => r.value === formData.reason_type)?.label,
      handler: formData.handler_name.trim() || 'Curator Handler',
    };

    setSetMovements([newMove, ...movements]);
    setCurrentLocation(formData.to_location.trim());

    if (onLocationChange) {
      onLocationChange(formData.to_location.trim());
    }

    toast.success(`Artifact moved to ${formData.to_location.trim()}`);
    setIsModalOpen(false);
    setFormData({
      to_location: '',
      reason_type: 'exhibition_rotation',
      notes: '',
      handler_name: '',
    });
  };

  return (
    <Card hover>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2D6C5] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D] border border-smrmp-gold/40">
            <BuildingOffice2Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#2B1B12]">
              Location & Movement Chain
            </h3>
            <p className="text-[11px] text-[#6E5445]">Real-time placement and custody transfer history</p>
          </div>
        </div>

        <Button variant="gold" size="sm" onClick={() => setIsModalOpen(true)}>
          <ArrowsRightLeftIcon className="h-3.5 w-3.5" />
          <span>Transfer Location</span>
        </Button>
      </div>

      {/* Current Location Highlight Banner */}
      <div className="mb-5 flex items-center justify-between rounded-xl bg-[#E4EEDC] p-3.5 border border-[#B8D4A0]">
        <div className="flex items-center gap-2.5">
          <MapPinIcon className="h-5 w-5 text-[#374B07] shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#243205]">Current Gallery Location:</span>
            <p className="font-bold text-[#243205] text-sm">{currentLocation}</p>
          </div>
        </div>
        <span className="rounded-full bg-[#374B07] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
          On Site
        </span>
      </div>

      {/* Movement Logs List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C4233]">Custody & Movement History</h4>
        <div className="space-y-2.5 text-xs">
          {movements.map((m) => (
            <div key={m.id} className="rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3.5 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-1.5">
                <div className="flex items-center gap-2 font-bold text-[#2B1B12]">
                  <span className="text-[#6E5445]">{m.from_location}</span>
                  <span className="text-smrmp-gold font-bold">→</span>
                  <span className="text-[#374B07]">{m.to_location}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#6E5445]">{formatDate(m.moved_at)}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#6E5445]">
                <span><strong className="text-[#5C4233]">Reason:</strong> {m.reason}</span>
                <div className="flex items-center gap-1 font-medium">
                  <UserIcon className="h-3 w-3 text-[#7C4A2D]" />
                  <span>{m.handler}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Location Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Location Movement">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="rounded-xl bg-[#FAF0D8] p-3 border border-smrmp-gold/30 text-xs">
            <span className="text-[#6E5445] font-semibold">Current Location: </span>
            <strong className="text-[#2B1B12] font-bold">{currentLocation}</strong>
          </div>

          <Input
            label="Destination Location / Gallery *"
            placeholder="e.g. Conservation Lab Wing B, Storage Vault 2"
            value={formData.to_location}
            onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
            required
          />

          <Select
            label="Reason for Movement"
            options={LOCATION_REASONS}
            value={formData.reason_type}
            onChange={(e) => setFormData({ ...formData, reason_type: e.target.value })}
          />

          <Input
            label="Handler / Curator Name *"
            placeholder="e.g. Samuel Worku"
            value={formData.handler_name}
            onChange={(e) => setFormData({ ...formData, handler_name: e.target.value })}
            required
          />

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
              Transfer & Authorization Notes
            </label>
            <textarea
              rows={2}
              placeholder="Reasoning, display case ID, or security clearance details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 text-xs text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2D6C5]">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit">
              Confirm Location Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
