import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import ArtifactForm from '../../components/artifacts/ArtifactForm';
import QRDisplay from '../../components/artifacts/QRDisplay';
import Button from '../../components/ui/Button';
import { useCreateArtifact } from '../../hooks/useArtifacts';

export default function AddArtifactPage() {
  const navigate = useNavigate();
  const createMutation = useCreateArtifact();
  const [createdArtifact, setCreatedArtifact] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      const res = await createMutation.mutateAsync(formData);
      const { artifact, qr_data_url } = res.data.data;
      setCreatedArtifact({ artifact, qr_data_url });
      toast.success('Artifact created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create artifact');
    }
  };

  if (createdArtifact) {
    return (
      <PrivateLayout>
        <PageHeader
          title="Artifact Created"
          description="QR code generated — ready for physical labeling"
          backPath="/artifacts"
          backLabel="Back to Catalog"
        />
        <div className="mx-auto max-w-lg">
          <QRDisplay
            qrDataUrl={createdArtifact.qr_data_url}
            qrCode={createdArtifact.artifact?.qr_code}
          />
          <div className="mt-6 flex justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate(`/artifacts/${createdArtifact.artifact.id}`)}
            >
              View Artifact
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setCreatedArtifact(null); }}
            >
              Add Another
            </Button>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <PageHeader
        title="Add New Artifact"
        description="Register a new artifact in the digital catalog"
        backPath="/artifacts"
        backLabel="Back to Catalog"
      />
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 sm:p-8 shadow-xs">
        <ArtifactForm
          onSubmit={handleSubmit}
          loading={createMutation.isPending}
          onCancel={() => navigate('/artifacts')}
        />
      </div>
    </PrivateLayout>
  );
}
