import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conservationApi } from '../api/conservationApi';

export function useConservationLogs(params = {}, options = {}) {
  return useQuery({
    queryKey: ['conservation', params],
    queryFn: () => conservationApi.getAll(params),
    select: (res) => {
      const data = res?.data?.data;
      return {
        conservation_logs: data?.conservation_logs || [],
        pagination: data?.pagination,
      };
    },
    ...options,
  });
}

export function useCreateConservationLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => conservationApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conservation'] });
      if (variables?.artifact_id) {
        queryClient.invalidateQueries({ queryKey: ['artifact', variables.artifact_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
