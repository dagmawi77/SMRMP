import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalApi } from '../api/portalApi';

export function usePortalDashboard() {
  return useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: () => portalApi.getDashboard(),
    select: (res) => res?.data?.data?.dashboard,
  });
}

export function usePortalProfile() {
  return useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => portalApi.getProfile(),
    select: (res) => res?.data?.data?.profile,
  });
}

export function useUpdatePortalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => portalApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-profile'] });
      queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
    },
  });
}

export function usePortalMemberships() {
  return useQuery({
    queryKey: ['portal-memberships'],
    queryFn: () => portalApi.getMemberships(),
    select: (res) => res?.data?.data || { memberships: [], active_membership: null, card: null },
  });
}

export function usePortalVisits() {
  return useQuery({
    queryKey: ['portal-visits'],
    queryFn: () => portalApi.getVisits(),
    select: (res) => res?.data?.data || { visits: [], total_visits: 0 },
  });
}

export function usePortalTickets() {
  return useQuery({
    queryKey: ['portal-tickets'],
    queryFn: () => portalApi.getTickets(),
    select: (res) => res?.data?.data?.tickets || [],
  });
}

export function usePortalBookings() {
  return useQuery({
    queryKey: ['portal-bookings'],
    queryFn: () => portalApi.getBookings(),
    select: (res) => res?.data?.data?.bookings || [],
  });
}
