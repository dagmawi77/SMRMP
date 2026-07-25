import { useEffect, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useUpdateArtifact } from '../../hooks/useArtifacts';
import getApiErrorMessage from '../../utils/apiError';
import {
  MapPinIcon,
  ArrowsRightLeftIcon,
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

export default function LocationMovementHistory({ artifact }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(artifact?.location || '');
  const updateMutation = useUpdateArtifact();

  useEffect(() => {
    setCurrentLocation(artifact?.location || '');
  }, [artifact?.id, artifact?.location]);

  const [formData, setFormData] = useState({
    to_location: '',
    reason_type: 'exhibition_rotation',
    notes: '',
  });

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!formData.to_location.trim()) {
      toast.error('Destination location is required');
      return;
    }
    if (!artifact?.id) {
      toast.error('Artifact is required to update location');
      return;
    }

    const nextLocation = formData.to_location.trim();
    const reason =
      formData.notes.trim() ||
      LOCATION_REASONS.find((r) => r.value === formData.reason_type)?.label;

    try {
      await updateMutation.mutateAsync({
        id: artifact.id,
        data: { location: nextLocation },
      });
      setCurrentLocation(nextLocation);
      toast.success(`Location updated to ${nextLocation}${reason ? ` (${reason})` : ''}`);
      setIsModalOpen(false);
      setFormData({
        to_location: '',
        reason_type: 'exhibition_rotation',
        notes: '',
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update location'));
    }
  };

  return (
    <Card hover>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2D6C5] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D] border border-smrmp-gold/40">
            <BuildingOffice2Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#2B1B12]">
              Gallery Location
            </h3>
            <p className="text-[11px] text-[#6E5445]">Current placement on the museum floor plan</p>
          </div>
        </div>

        <Button variant="gold" size="sm" onClick={() => setIsModalOpen(true)}>
          <ArrowsRightLeftIcon className="h-3.5 w-3.5" />
          <span>Update Location</span>
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-[#E4EEDC] p-3.5 border border-[#B8D4A0]">
        <div className="flex items-center gap-2.5">
          <MapPinIcon className="h-5 w-5 text-[#374B07] shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#243205]">
              Current Gallery Location:
            </span>
            <p className="font-bold text-[#243205] text-sm">
              {currentLocation || 'Not set'}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#374B07] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
          {artifact?.is_on_loan ? 'On Loan' : 'On Site'}
        </span>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Artifact Location">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="rounded-xl bg-[#FAF0D8] p-3 border border-smrmp-gold/30 text-xs">
            <span className="text-[#6E5445] font-semibold">Current Location: </span>
            <strong className="text-[#2B1B12] font-bold">{currentLocation || 'Not set'}</strong>
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

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
              Transfer Notes
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
            <Button variant="gold" type="submit" loading={updateMutation.isPending}>
              Confirm Location Update
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
