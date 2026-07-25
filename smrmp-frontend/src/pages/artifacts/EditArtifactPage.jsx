import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import ArtifactForm from '../../components/artifacts/ArtifactForm';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { useArtifact, useUpdateArtifact } from '../../hooks/useArtifacts';
import getApiErrorMessage from '../../utils/apiError';

export default function EditArtifactPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useArtifact(id);
  const updateMutation = useUpdateArtifact();

  const artifact = data?.artifact || data;

  const handleSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync({ id, data: formData });
      toast.success('Artifact updated successfully');
      navigate(`/artifacts/${id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update artifact'));
    }
  };

  return (
    <PrivateLayout>
      <PageHeader
        title={artifact ? `Edit ${artifact.name}` : 'Edit Artifact'}
        description="Update artifact record, physical location, condition, or catalog metadata"
        backPath={`/artifacts/${id}`}
        backLabel="Back to Artifact"
      />

      {isLoading && <Spinner className="py-24" />}

      {!isLoading && (isError || !artifact) && (
        <EmptyState
          title="Artifact not found"
          description="The requested artifact record could not be found or you don't have access."
          action={<Button onClick={() => navigate('/artifacts')}>Back to Catalog</Button>}
        />
      )}

      {!isLoading && artifact && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 sm:p-8 shadow-xs">
          <ArtifactForm
            initialData={artifact}
            onSubmit={handleSubmit}
            loading={updateMutation.isPending}
            onCancel={() => navigate(`/artifacts/${id}`)}
          />
        </div>
      )}
    </PrivateLayout>
  );
}
