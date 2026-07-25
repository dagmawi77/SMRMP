import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { aiApi } from '../../api/aiApi';
import Button from '../ui/Button';

export default function AIDescriptionBtn({ artifactData, onResult, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!artifactData.name || !artifactData.category) {
      toast.error('Name and category are required for AI description');
      return;
    }

    setLoading(true);
    try {
      const res = await aiApi.describeArtifact({
        name: artifactData.name,
        category: artifactData.category,
        historical_period: artifactData.historical_period,
        origin: artifactData.origin,
        materials: artifactData.materials,
        staff_notes: artifactData.staff_notes,
      });
      onResult(res.data.data);
      toast.success('AI description generated — please review before saving');
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI service unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="gold"
      size="sm"
      loading={loading}
      disabled={disabled || loading}
      onClick={handleGenerate}
    >
      <SparklesIcon className="h-4 w-4" />
      Generate AI Description
    </Button>
  );
}
