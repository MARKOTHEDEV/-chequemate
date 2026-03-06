// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_email_verified?: boolean;
  is_kyc_completed?: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  last_login?: string;
  debit_mode?: "auto" | "manual";
  auto_debit_timing?: "3_days_before" | "1_day_before" | "on_date";
}

export interface KYCProfile {
  id: string;
  user: string;
  status: "pending" | "bvn_submitted" | "bvn_verified" | "bvn_failed" | "id_submitted" | "id_verified" | "id_failed" | "completed" | "rejected";
  bvn_verified: boolean;
  id_verified: boolean;
  liveness_verified: boolean;
  bvn_number?: string;
  bvn_full_name?: string;
  job_status?: string;
  job_role?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface TrustScoreBreakdown {
  wallet_transactions: number;
  kyc_completion: number;
  ajo_completion: number;
  ajo_joined: number;
  ajo_default: number;
  total: number;
}

export interface UserProfile extends User {
  kyc_profile?: KYCProfile;
  trust_score?: TrustScoreBreakdown;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Virtual Account Types
export interface VirtualAccount {
  id: string;
  user: string;
  currency: "NGN" | "USD" | "GBP" | "EUR";
  provider: "FINCRA" | "FLUTTERWAVE";
  account_number: string;
  account_name: string;
  bank_name: string;
  bank_code: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  balance: string;
  is_primary_for_currency: boolean;
  created_at: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  user: string;
  virtual_account?: string;
  currency: string;
  kind: "FUNDING" | "WITHDRAWAL" | "CONVERSION" | "TRANSFER" | "AJO_SECURITY_DEPOSIT" | "AJO_CONTRIBUTION" | "AJO_PAYOUT" | "AJO_ADMIN_FEE";
  direction: "CREDIT" | "DEBIT";
  amount: string;
  fee: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  narration: string;
  ajo?: string;
  ajo_member?: string;
  ajo_cycle?: string;
  created_at: string;
  updated_at: string;
}

// Community Types
export interface Community {
  id: string;
  owner: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
}

// Ajo Types
export interface Ajo {
  id: string;
  community: string;
  name: string;
  created_by: string;
  tenure_months: number;
  member_count: number;
  creator_participates: boolean;
  currency: "NGN" | "USD" | "GBP" | "EUR";
  contribution_amount: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  visibility: "PUBLIC" | "PRIVATE";
  join_code: string;
  auto_slot: boolean;
  security_deposit_type: "NONE" | "ALL" | "SELECTED";
  admin_fee_enabled: boolean;
  admin_fee_amount: string;
  group_balance: string;
  security_deposit_balance: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  created_at: string;
  updated_at: string;
  activated_at?: string;
}

export interface AjoMember {
  id: string;
  ajo: string;
  user?: string;
  email: string;
  slot_number?: number;
  status: "INVITED" | "ACCEPTED" | "DECLINED" | "REMOVED" | "PENDING_REGISTRATION" | "BLOCKED";
  is_selected_for_deposit: boolean;
  security_deposit_paid: boolean;
  security_deposit_paid_at?: string;
  invited_at: string;
  responded_at?: string;
}

export interface AjoCycle {
  id: string;
  ajo: string;
  cycle_number: number;
  start_date: string;
  end_date: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "OVERDUE";
  recipient_slot_number: number;
  total_collected: string;
  expected_total: string;
  payout_amount?: string;
  payout_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  payout_date?: string;
  created_at: string;
}

export interface AjoContribution {
  id: string;
  cycle: string;
  member: string;
  amount: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  paid_at?: string;
  created_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
