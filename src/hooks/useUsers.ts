import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService, { UsersQueryParams } from "@/services/userService";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UsersQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  kyc: (id: string) => [...userKeys.all, "kyc", id] as const,
};

// Hook to get users list
export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => userService.getUsers(params),
  });
}

// Hook to get single user
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  });
}

// Hook to get user stats
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: userService.getUserStats,
  });
}

// Hook to get user KYC
export function useUserKYC(userId: string) {
  return useQuery({
    queryKey: userKeys.kyc(userId),
    queryFn: () => userService.getUserKYC(userId),
    enabled: !!userId,
  });
}

// Hook to suspend user
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.suspendUser,
    onSuccess: (_, userId) => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

// Hook to activate user
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.activateUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

// Hook to approve KYC
export function useApproveKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.approveKYC,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.kyc(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },
  });
}

// Hook to reject KYC
export function useRejectKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      userService.rejectKYC(userId, reason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.kyc(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },
  });
}
