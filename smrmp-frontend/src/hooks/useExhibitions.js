import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exhibitionApi } from '../api/exhibitionApi';

export function useExhibitions(params = {}) {
  return useQuery({
    queryKey: ['exhibitions', params],
    queryFn: () => exhibitionApi.getAll(params),
    select: (res) => {
      const data = res?.data?.data;
      if (data && typeof data === 'object' && Array.isArray(data.exhibitions)) {
        return data;
      }
      return {
        exhibitions: Array.isArray(data) ? data : [],
        pagination: { total: Array.isArray(data) ? data.length : 0, page: 1, limit: 50, totalPages: 1 },
      };
    },
  });
}

export function useExhibition(id) {
  return useQuery({
    queryKey: ['exhibition', id],
    queryFn: () => exhibitionApi.getById(id),
    select: (res) => {
      const data = res?.data?.data;
      if (data && typeof data === 'object') {
        return data.exhibition || data;
      }
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateExhibition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => exhibitionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateExhibition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => exhibitionApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
      queryClient.invalidateQueries({ queryKey: ['exhibition', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteExhibition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => exhibitionApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
