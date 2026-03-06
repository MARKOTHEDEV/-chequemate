import api from "@/lib/api";
import { LoginCredentials, LoginResponse, UserProfile } from "@/types";

export const authService = {
  // Admin login with email and password (full password, not passcode)
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post("/auth/admin/login/", credentials);
    // API returns { data: { access, refresh, user }, is_success, msg }
    return {
      user: response.data.data.user,
      tokens: {
        access: response.data.data.access,
        refresh: response.data.data.refresh,
      },
    };
  },

  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/auth/profile/");
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await api.post("/auth/refresh/", { refresh: refreshToken });
    return response.data;
  },

  // Logout (blacklist token)
  logout: async (): Promise<void> => {
    await api.post("/auth/logout/");
  },

  // Verify if user is admin/staff
  verifyAdmin: async (): Promise<boolean> => {
    try {
      const profile = await authService.getProfile();
      return profile.is_staff === true;
    } catch {
      return false;
    }
  },
};

export default authService;
