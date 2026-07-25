import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '../api/feedbackApi';

export function usePublicFeedback(params = {}) {
  return useQuery({
    queryKey: ['feedback-public', params],
    queryFn: () => feedbackApi.getPublic(params),
    select: (res) => res?.data?.data?.feedback || [],
  });
}

export function useFeedbackList(params = {}) {
  return useQuery({
    queryKey: ['feedback', params],
    queryFn: () => feedbackApi.list(params),
    select: (res) => res?.data?.data || { feedback: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    keepPreviousData: true,
  });
}

export function useFeedbackAnalytics() {
  return useQuery({
    queryKey: ['feedback-analytics'],
    queryFn: () => feedbackApi.getAnalytics(),
    select: (res) => res?.data?.data,
  });
}

export function useFeedbackItem(id) {
  return useQuery({
    queryKey: ['feedback-item', id],
    queryFn: () => feedbackApi.getById(id),
    select: (res) => res?.data?.data?.feedback,
    enabled: Boolean(id),
  });
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (data) => feedbackApi.submit(data),
  });
}

export function useRespondFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, responseText }) => feedbackApi.respond(id, responseText),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-item', variables.id] });
    },
  });
}

export function usePublishFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => feedbackApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-item', id] });
    },
  });
}
