import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import AIDescriptionBtn from '../ai/AIDescriptionBtn';
import { ARTIFACT_CATEGORIES, CONDITION_STATUSES } from '../../utils/constants';
import { CloudArrowUpIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ArtifactForm({ onSubmit, loading, initialData, onCancel }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [aiDraft, setAiDraft] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      name: '',
      category: '',
      historical_period: '',
      origin: '',
      materials: '',
      description: '',
      location: '',
      condition_status: 'good',
    },
  });

  const formValues = watch();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 5,
    onDrop: (accepted) => setFiles((prev) => [...prev, ...accepted].slice(0, 5)),
  });

  const handleAIDescription = (result) => {
    setAiDraft(result);
    if (result.description?.full_description) {
      setValue('description', result.description.full_description);
    }
    if (result.description?.keywords?.length) {
      setValue('keywords', result.description.keywords.join(', '));
    }
  };

  const submitHandler = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (key === 'keywords') {
          const keywords = value.split(',').map((k) => k.trim()).filter(Boolean);
          formData.append('keywords', JSON.stringify(keywords));
        } else {
          formData.append(key, value);
        }
      }
    });
    files.forEach((file) => formData.append('images', file));
    onSubmit(formData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/artifacts');
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Artifact Name *"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Select
          label="Category *"
          options={ARTIFACT_CATEGORIES}
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />
        <Input label="Historical Period" {...register('historical_period')} />
        <Input label="Origin" {...register('origin')} />
        <Input label="Materials" {...register('materials')} />
        <Input
          label="Gallery Location *"
          error={errors.location?.message}
          {...register('location', { required: 'Location is required' })}
        />
        <Select
          label="Condition Status"
          options={CONDITION_STATUSES}
          {...register('condition_status')}
        />
        <Input label="Keywords (comma-separated)" {...register('keywords')} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
            Description
          </label>
          <AIDescriptionBtn
            artifactData={formValues}
            onResult={handleAIDescription}
            disabled={!formValues.name || !formValues.category}
          />
        </div>
        <textarea
          rows={5}
          className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 text-xs text-[#2B1B12] outline-none transition-all placeholder:text-[#A08878] focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
          placeholder="Detailed narrative, historical context, and conservation history..."
          {...register('description')}
        />
        {aiDraft && (
          <Alert variant="ai" title="AI Draft — Pending Curator Approval" className="mt-3">
            Review and edit the AI-generated narrative before saving. Confidence level:{' '}
            <span className="font-bold">{aiDraft.description?.confidence_level || 'standard'}</span>.
          </Alert>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
          Upload Artifact Images (max 5)
        </label>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragActive
              ? 'border-smrmp-green bg-[#E4EEDC]/50'
              : 'border-[#E2D6C5] bg-[#FAF6F0] hover:border-smrmp-gold hover:bg-[#FAF0E4]'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-8 w-8 text-[#7C4A2D] mb-2" />
          <p className="text-xs font-semibold text-[#2B1B12]">
            {isDragActive
              ? 'Drop images here...'
              : 'Drag & drop high-resolution images, or click to browse'}
          </p>
          <p className="text-[11px] text-[#6E5445] mt-1">Supports JPG, PNG, WEBP</p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {files.map((file, i) => (
              <div key={file.name} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-20 w-20 rounded-xl object-cover border border-[#E2D6C5] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B1E1E] text-white text-xs shadow-md hover:bg-rose-700"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2D6C5]">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          <SparklesIcon className="h-4 w-4" />
          <span>Save Artifact Record</span>
        </Button>
      </div>
    </form>
  );
}
