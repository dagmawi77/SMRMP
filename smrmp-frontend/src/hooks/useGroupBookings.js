import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupBookingApi } from '../api/groupBookingApi';

export function useGroupBookings(params = {}) {
  return useQuery({
    queryKey: ['group-bookings', params],
    queryFn: () => groupBookingApi.list(params),
    select: (res) => res?.data?.data || { bookings: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    keepPreviousData: true,
  });
}

export function useTodaysBookings() {
  return useQuery({
    queryKey: ['group-bookings-today'],
    queryFn: () => groupBookingApi.getToday(),
    select: (res) => res?.data?.data?.bookings || [],
  });
}

export function useGroupBooking(id) {
  return useQuery({
    queryKey: ['group-booking', id],
    queryFn: () => groupBookingApi.getById(id),
    select: (res) => res?.data?.data?.booking,
    enabled: Boolean(id),
  });
}

export function useCreateGroupBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => groupBookingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['portal-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['group-bookings'] });
    },
  });
}

export function useUpdateGroupBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => groupBookingApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['group-booking', variables.id] });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => groupBookingApi.confirm(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['group-booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['group-bookings-today'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => groupBookingApi.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['group-booking', variables.id] });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupBookingApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['group-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['group-booking', id] });
      queryClient.invalidateQueries({ queryKey: ['group-bookings-today'] });
    },
  });
}

export function useBookingInvoice(id, enabled = false) {
  return useQuery({
    queryKey: ['group-booking-invoice', id],
    queryFn: () => groupBookingApi.getInvoice(id),
    select: (res) => res?.data?.data?.invoice,
    enabled: Boolean(id) && enabled,
  });
}
