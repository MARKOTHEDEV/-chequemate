import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/services/authService";
import { LoginCredentials } from "@/types";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// Hook to get current user profile
export function useProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to login
export function useLogin() {
  const router = useRouter();
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      const { user, tokens } = data;

      // Store auth data
      login(user, tokens.access, tokens.refresh);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Redirect to dashboard
      router.push("/");
    },
  });
}

// Hook to logout
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Always logout locally, even if API fails
      logout();

      // Clear all queries
      queryClient.clear();

      // Redirect to login
      router.push("/login");
    },
  });
}
