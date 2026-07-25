import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitorApi } from '../api/visitorApi';

export function useVisitors(params = {}) {
  return useQuery({
    queryKey: ['visitors', params],
    queryFn: () => visitorApi.list(params),
    select: (res) => res?.data?.data || { visitors: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    keepPreviousData: true,
  });
}

export function useVisitor(id) {
  return useQuery({
    queryKey: ['visitor', id],
    queryFn: () => visitorApi.getById(id),
    select: (res) => res?.data?.data?.visitor,
    enabled: Boolean(id),
  });
}

export function useVisitorSearch(q) {
  return useQuery({
    queryKey: ['visitor-search', q],
    queryFn: () => visitorApi.search(q),
    select: (res) => res?.data?.data?.visitors || [],
    enabled: Boolean(q && q.trim().length >= 2),
  });
}

export function useVisitorVisits(id) {
  return useQuery({
    queryKey: ['visitor-visits', id],
    queryFn: () => visitorApi.getVisits(id),
    select: (res) => res?.data?.data?.visits || [],
    enabled: Boolean(id),
  });
}

export function useVisitorMemberships(id) {
  return useQuery({
    queryKey: ['visitor-memberships', id],
    queryFn: () => visitorApi.getMemberships(id),
    select: (res) => res?.data?.data?.memberships || [],
    enabled: Boolean(id),
  });
}

export function useVisitorFeedback(id) {
  return useQuery({
    queryKey: ['visitor-feedback', id],
    queryFn: () => visitorApi.getFeedback(id),
    select: (res) => res?.data?.data?.feedback || [],
    enabled: Boolean(id),
  });
}

export function useVisitorCommunications(id) {
  return useQuery({
    queryKey: ['visitor-communications', id],
    queryFn: () => visitorApi.getCommunications(id),
    select: (res) => res?.data?.data?.communications || [],
    enabled: Boolean(id),
  });
}

export function useCreateVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => visitorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
}

export function useUpdateVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => visitorApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['visitor', variables.id] });
    },
  });
}

export function useDeleteVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => visitorApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
}

export function useCheckInVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => visitorApi.checkIn(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['visitor', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['visitor-visits', variables.id] });
    },
  });
}

export function useVisitorAnalyticsSummary() {
  return useQuery({
    queryKey: ['visitor-analytics-summary'],
    queryFn: () => visitorApi.analyticsSummary(),
    select: (res) => res?.data?.data?.summary,
  });
}

export function useVisitorAnalyticsTrends(days = 30) {
  return useQuery({
    queryKey: ['visitor-analytics-trends', days],
    queryFn: () => visitorApi.analyticsTrends(days),
    select: (res) => res?.data?.data?.trend || [],
  });
}

export function useVisitorAnalyticsSegments() {
  return useQuery({
    queryKey: ['visitor-analytics-segments'],
    queryFn: () => visitorApi.analyticsSegments(),
    select: (res) => res?.data?.data,
  });
}

export function useVisitorAnalyticsFeedback() {
  return useQuery({
    queryKey: ['visitor-analytics-feedback'],
    queryFn: () => visitorApi.analyticsFeedback(),
    select: (res) => res?.data?.data,
  });
}
