import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenanceApi';

export function useMaintenanceDashboard() {
  return useQuery({
    queryKey: ['maintenance', 'dashboard'],
    queryFn: () => maintenanceApi.getDashboard(),
    select: (res) => res.data.data,
  });
}

export function useAssignedMaintenanceTasks() {
  return useQuery({
    queryKey: ['maintenance', 'requests', 'assigned', 'mine'],
    queryFn: () => maintenanceApi.getRequests({ mine: true }),
    select: (res) => res.data.data.requests,
  });
}

export function useCloseMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, closeNotes }) => maintenanceApi.closeRequest(code, closeNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}
