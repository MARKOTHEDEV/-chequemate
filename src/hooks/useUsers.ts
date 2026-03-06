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
  transactions: (id: string) => [...userKeys.all, "transactions", id] as const,
  ajos: (id: string) => [...userKeys.all, "ajos", id] as const,
  activity: (id: string) => [...userKeys.all, "activity", id] as const,
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

// Hook to get user transactions
export function useUserTransactions(
  userId: string,
  params?: { page?: number; page_size?: number; kind?: string; status?: string }
) {
  return useQuery({
    queryKey: [...userKeys.transactions(userId), params],
    queryFn: () => userService.getUserTransactions(userId, params),
    enabled: !!userId,
  });
}

// Hook to get user Ajo participation
export function useUserAjos(userId: string) {
  return useQuery({
    queryKey: userKeys.ajos(userId),
    queryFn: () => userService.getUserAjos(userId),
    enabled: !!userId,
  });
}

// Hook to get user activity log
export function useUserActivity(userId: string) {
  return useQuery({
    queryKey: userKeys.activity(userId),
    queryFn: () => userService.getUserActivity(userId),
    enabled: !!userId,
  });
}

// Hook to suspend user
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      userService.suspendUser(userId, reason),
    onSuccess: (_, { userId }) => {
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
    mutationFn: (userId: string) => userService.activateUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}
