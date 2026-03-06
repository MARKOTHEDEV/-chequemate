import api from "@/lib/api";

// Types for admin user management
export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  date_joined: string;
  last_login: string | null;
  is_active: boolean;
  kyc_status: string;
  trust_score: number;
  wallet_balance: string;
  active_ajo_count: number;
}

export interface TrustScoreBreakdown {
  email_verified: number;
  kyc_completed: number;
  transaction_pin: number;
  active_status: number;
  total: number;
  label: string;
}

export interface TrustScoreHistoryItem {
  score: number;
  title: string;
  date: string;
  is_current: boolean;
}

export interface KYCProfile {
  status: string;
  bvn_verified: boolean;
  id_verified: boolean;
  liveness_verified: boolean;
  is_completed: boolean;
  bvn_full_name: string | null;
  job_status: string | null;
  job_role: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletSummary {
  total_deposits: string;
  total_withdrawals: string;
  current_balance: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  is_email_verified: boolean;
  is_kyc_completed: boolean;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  debit_mode: string;
  auto_debit_timing: string | null;
  kyc_profile: KYCProfile | null;
  trust_score: TrustScoreBreakdown;
  trust_score_history: TrustScoreHistoryItem[];
  wallet_summary: WalletSummary;
  active_ajo_groups: number;
  security_deposits: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  defaulted_users: number;
  avg_trust_score: number;
  users_by_kyc_status: {
    pending: number;
    bvn_verified: number;
    id_submitted: number;
    id_verified: number;
    completed: number;
    rejected: number;
  };
  new_users_this_month: number;
  new_users_this_week: number;
}

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface UsersQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  kyc_status?: string;
  status?: "active" | "suspended" | "all";
  ordering?: string;
}

// Transaction types
export interface UserTransaction {
  id: string;
  kind: string;
  direction: string;
  amount: string;
  currency: string;
  status: string;
  narration: string;
  created_at: string;
  ajo_name: string | null;
}

export interface PaginatedTransactions {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: UserTransaction[];
}

// Ajo types
export interface UserAjo {
  id: string;
  name: string;
  status: string;
  member_status: string;
  slot_number: number | null;
  contribution_amount: string;
  currency: string;
  frequency: string;
  total_contributed: string;
  total_received: string;
  contributions_made: number;
  total_cycles: number;
  security_deposit_paid: boolean;
  joined_at: string;
}

export interface AjoSummary {
  total_ajos: number;
  active_ajos: number;
  completed_ajos: number;
  total_contributed: string;
  total_received: string;
}

export interface UserAjosResponse {
  summary: AjoSummary;
  ajos: UserAjo[];
}

// Activity types
export interface ActivityItem {
  type: string;
  action: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface UserActivityResponse {
  activities: ActivityItem[];
}

export const userService = {
  // Get all users (admin endpoint)
  getUsers: async (params?: UsersQueryParams): Promise<PaginatedUsers> => {
    const response = await api.get("/auth/admin/users/", { params });
    return response.data;
  },

  // Get single user by ID
  getUser: async (userId: string): Promise<AdminUserDetail> => {
    const response = await api.get(`/auth/admin/users/${userId}/`);
    return response.data.data;
  },

  // Suspend user
  suspendUser: async (
    userId: string,
    reason?: string
  ): Promise<{ user_id: string; email: string; is_active: boolean }> => {
    const response = await api.post(`/auth/admin/users/${userId}/suspend/`, {
      reason,
    });
    return response.data.data;
  },

  // Activate user
  activateUser: async (
    userId: string
  ): Promise<{ user_id: string; email: string; is_active: boolean }> => {
    const response = await api.post(`/auth/admin/users/${userId}/activate/`);
    return response.data.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get("/auth/admin/users/stats/");
    return response.data.data;
  },

  // Get user transactions
  getUserTransactions: async (
    userId: string,
    params?: { page?: number; page_size?: number; kind?: string; status?: string }
  ): Promise<PaginatedTransactions> => {
    const response = await api.get(`/auth/admin/users/${userId}/transactions/`, {
      params,
    });
    return response.data.data;
  },

  // Get user Ajo participation
  getUserAjos: async (userId: string): Promise<UserAjosResponse> => {
    const response = await api.get(`/auth/admin/users/${userId}/ajos/`);
    return response.data.data;
  },

  // Get user activity log
  getUserActivity: async (userId: string): Promise<UserActivityResponse> => {
    const response = await api.get(`/auth/admin/users/${userId}/activity/`);
    return response.data.data;
  },
};

export default userService;
