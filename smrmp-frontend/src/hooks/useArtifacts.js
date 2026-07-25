import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artifactApi } from '../api/artifactApi';

export function useArtifacts(params = {}) {
  return useQuery({
    queryKey: ['artifacts', params],
    queryFn: () => artifactApi.getAll(params),
    select: (res) => res.data.data,
  });
}

export function useArtifact(id) {
  return useQuery({
    queryKey: ['artifact', id],
    queryFn: () => artifactApi.getById(id),
    select: (res) => res.data.data,
    enabled: Boolean(id),
  });
}

export function useArtifactByQR(code) {
  return useQuery({
    queryKey: ['artifact-qr', code],
    queryFn: () => artifactApi.getByQR(code),
    select: (res) => res.data.data,
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
