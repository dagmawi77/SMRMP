import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import AIDescriptionBtn from '../ai/AIDescriptionBtn';
import { ARTIFACT_CATEGORIES, CONDITION_STATUSES } from '../../utils/constants';
import { CloudArrowUpIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

const formatInitialKeywords = (kw) => {
  if (!kw) return '';
  if (Array.isArray(kw)) return kw.join(', ');
  if (typeof kw === 'string') {
    try {
      const parsed = JSON.parse(kw);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch (_e) {
      return kw;
    }
  }
  return String(kw);
};

export default function ArtifactForm({ onSubmit, loading, initialData, onCancel }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);

  const getFormDefaults = (data) => ({
    name: data?.name || '',
    category: data?.category || '',
    historical_period: data?.historical_period || '',
    origin: data?.origin || '',
    materials: data?.materials || '',
    description: data?.description || '',
    location: data?.location || '',
    condition_status: data?.condition_status || 'good',
    is_on_loan: Boolean(data?.is_on_loan),
    keywords: formatInitialKeywords(data?.keywords),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: getFormDefaults(initialData),
  });

  useEffect(() => {
    if (initialData) {
      reset(getFormDefaults(initialData));
    }
  }, [initialData, reset]);

  const formValues = watch();

  const addImageFiles = useCallback((incoming) => {
    const images = Array.from(incoming || []).filter((file) =>
      String(file.type || '').startsWith('image/')
    );
    if (!images.length) return;
    setFiles((prev) => [...prev, ...images].slice(0, 5));
  }, []);

  const onFileInputChange = (e) => {
    addImageFiles(e.target.files);
    e.target.value = '';
  };

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
          label="Artifact Name"
          required
          placeholder="e.g. Ras Alula Battle Shield"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Select
          label="Category"
          required
          options={ARTIFACT_CATEGORIES}
          error={errors.category?.message}
          value={formValues.category}
          {...register('category', { required: 'Category is required' })}
        />
        <Input
          label="Historical Period"
          placeholder="e.g. 1896 Adwa Victory Era"
          {...register('historical_period')}
        />
        <Input
          label="Origin"
          placeholder="e.g. Tigray / Adwa Region, Ethiopia"
          {...register('origin')}
        />
        <Input
          label="Materials"
          placeholder="e.g. Leather, brass embellishments, velvet"
          {...register('materials')}
        />
        <Input
          label="Gallery Location"
          required
          placeholder="e.g. Adwa Victory Gallery A-3, Display Case 12, or Storage Vault 4"
          hint="Physical location where the artifact is displayed or stored in the museum"
          error={errors.location?.message}
          {...register('location', { required: 'Location is required' })}
        />
        <Select
          label="Condition Status"
          options={CONDITION_STATUSES}
          error={errors.condition_status?.message}
          value={formValues.condition_status}
          {...register('condition_status')}
        />
        <Input
          label="Keywords (comma-separated)"
          placeholder="e.g. battle, 1896, shield, commander"
          {...register('keywords')}
        />
        <div className="flex items-center gap-3 pt-6">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#2B1B12]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#E2D6C5] text-smrmp-green focus:ring-smrmp-green"
              {...register('is_on_loan')}
            />
            <span>Currently On Loan to Partner Institution</span>
          </label>
        </div>
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
        {initialData?.images && initialData.images.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#6E5445] mb-2 uppercase tracking-wider">Current Images</p>
            <div className="flex flex-wrap gap-3">
              {initialData.images.map((img, idx) => (
                <div key={img.id || idx} className="relative group">
                  <img
                    src={img.file_url}
                    alt="Artifact preview"
                    className="h-20 w-20 rounded-xl object-cover border border-[#E2D6C5] shadow-2xs"
                  />
                  {img.is_primary && (
                    <span className="absolute bottom-1 left-1 bg-smrmp-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
            addImageFiles(e.dataTransfer.files);
          }}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragActive
              ? 'border-smrmp-green bg-[#E4EEDC]/50'
              : 'border-[#E2D6C5] bg-[#FAF6F0] hover:border-smrmp-gold hover:bg-[#FAF0E4]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={onFileInputChange}
          />
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
              <div key={`${file.name}-${i}`} className="relative group">
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
          <span>{initialData ? 'Update Artifact Record' : 'Save Artifact Record'}</span>
        </Button>
      </div>
    </form>
  );
}
