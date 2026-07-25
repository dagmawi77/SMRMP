import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import ArtifactDetail from '../../components/artifacts/ArtifactDetail';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useArtifact, useDeleteArtifact } from '../../hooks/useArtifacts';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';

export default function ArtifactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  const { data, isLoading, isError } = useArtifact(id);
  const deleteMutation = useDeleteArtifact();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const artifact = data?.artifact || data;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Artifact removed from catalog');
      navigate('/artifacts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete artifact');
    }
  };

  return (
    <PrivateLayout>
      <PageHeader
        title={artifact?.name || 'Artifact Details'}
        description="Full artifact profile and digital identity"
        action={hasRole('admin') && artifact && (
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete
          </Button>
        )}
      />

      {isLoading && <Spinner className="py-24" />}
      {isError && (
        <EmptyState
          title="Artifact not found"
          description="This artifact may have been removed or you don't have access."
          action={<Button onClick={() => navigate('/artifacts')}>Back to Catalog</Button>}
        />
      )}
      {artifact && <ArtifactDetail artifact={artifact} />}

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
        <p className="text-sm text-gray-600">
          Remove <strong>{artifact?.name}</strong> from the active catalog? This is a soft delete.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" loading={deleteMutation.isPending} onClick={handleDelete}>
            Delete Artifact
          </Button>
        </div>
      </Modal>
    </PrivateLayout>
  );
}
