import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipApi } from '../api/membershipApi';

export function useMembershipTiers(params = {}) {
  return useQuery({
    queryKey: ['membership-tiers', params],
    queryFn: () => membershipApi.getTiers(params),
    select: (res) => res?.data?.data?.tiers || [],
  });
}

export function useMemberships(params = {}) {
  return useQuery({
    queryKey: ['memberships', params],
    queryFn: () => membershipApi.list(params),
    select: (res) => res?.data?.data || { memberships: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    keepPreviousData: true,
  });
}

export function useMembership(id) {
  return useQuery({
    queryKey: ['membership', id],
    queryFn: () => membershipApi.getById(id),
    select: (res) => res?.data?.data?.membership,
    enabled: Boolean(id),
  });
}

export function useMembershipCard(id) {
  return useQuery({
    queryKey: ['membership-card', id],
    queryFn: () => membershipApi.getCard(id),
    select: (res) => res?.data?.data?.card,
    enabled: Boolean(id),
  });
}

export function useExpiringMemberships(days = 30) {
  return useQuery({
    queryKey: ['memberships-expiring', days],
    queryFn: () => membershipApi.getExpiring(days),
    select: (res) => res?.data?.data?.memberships || [],
  });
}

export function useCreateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => membershipApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
  });
}

export function useUpdateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => membershipApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
    },
  });
}

export function useRenewMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => membershipApi.renew(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['memberships-expiring'] });
    },
  });
}

export function useCancelMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => membershipApi.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
    },
  });
}

export function useSendRenewalReminders() {
  return useMutation({
    mutationFn: (days) => membershipApi.sendReminders(days),
  });
}

export function useVerifyMembership() {
  return useMutation({
    mutationFn: (code) => membershipApi.verify(code),
  });
}
