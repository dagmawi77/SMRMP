import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artifactApi } from '../api/artifactApi';

export function useArtifacts(params = {}) {
  return useQuery({
    queryKey: ['artifacts', params],
    queryFn: () => artifactApi.getAll(params),
    select: (res) => {
      const data = res?.data?.data;
      if (data && typeof data === 'object' && Array.isArray(data.artifacts)) {
        return data;
      }
      return {
        artifacts: Array.isArray(data) ? data : [],
        pagination: { total: Array.isArray(data) ? data.length : 0, page: 1, limit: 50, totalPages: 1 },
      };
    },
  });
}

export function useArtifact(id) {
  return useQuery({
    queryKey: ['artifact', id],
    queryFn: () => artifactApi.getById(id),
    select: (res) => {
      const data = res?.data?.data;
      if (data && typeof data === 'object' && data.artifact) {
        return data.artifact;
      }
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useArtifactByQR(code) {
  return useQuery({
    queryKey: ['artifact-qr', code],
    queryFn: () => artifactApi.getByQR(code),
    select: (res) => {
      const data = res?.data?.data;
      if (data && typeof data === 'object' && data.artifact) {
        return data.artifact;
      }
      return data;
    },
    enabled: Boolean(code),
  });
}

export function useCreateArtifact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => artifactApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateArtifact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => artifactApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      queryClient.invalidateQueries({ queryKey: ['artifact', id] });
    },
  });
}

export function useDeleteArtifact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => artifactApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
    },
  });
}
