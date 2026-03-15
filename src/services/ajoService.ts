import api from "@/lib/api";

// API Endpoints
const ADMIN_AJO_ENDPOINTS = {
  list: "/auth/admin/ajos/",
  stats: "/auth/admin/ajos/stats/",
  detail: (id: string) => `/auth/admin/ajos/${id}/`,
  members: (id: string) => `/auth/admin/ajos/${id}/members/`,
  cycles: (id: string) => `/auth/admin/ajos/${id}/cycles/`,
  contributions: (id: string) => `/auth/admin/ajos/${id}/contributions/`,
  activity: (id: string) => `/auth/admin/ajos/${id}/activity/`,
};

// Types for admin Ajo management
export interface AdminAjo {
  id: string;
  name: string;
  visibility: "public" | "private";
  currency: string;
  contribution_amount: string;
  frequency: string;
  member_count: number;
  participant_count: number;
  status: "draft" | "active" | "completed" | "cancelled";
  created_at: string;
  admin_name: string;
  admin_id: string;
}

// Full member details for Members tab
export interface AjoMemberDetail {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  slot_number: number | null;
  status: "invited" | "accepted" | "declined" | "removed" | "pending_registration" | "blocked";
  // Security deposit info
  is_selected_for_deposit: boolean;
  security_deposit_paid: boolean;
  security_deposit_paid_at: string | null;
  security_deposit_amount: string;
  // Contribution info
  total_contributed: string;
  total_received: string;
  contributions_made: number;
  // Debt info
  has_debt: boolean;
  debt_amount: string;
  // Block info
  blocked_at: string | null;
  block_reason: string | null;
  // Timestamps
  invited_at: string;
  responded_at: string | null;
}

// Cycle details for Payout Schedule tab
export interface AjoCycle {
  id: string;
  cycle_number: number;
  start_date: string;
  end_date: string;
  status: "pending" | "active" | "completed" | "overdue";
  // Recipient info
  recipient_slot_number: number;
  recipient_name: string;
  recipient_id: string;
  // Financial info
  total_collected: string;
  expected_total: string;
  collection_percentage: number;
  payout_amount: string;
  payout_status: "pending" | "processing" | "completed" | "failed";
  payout_date: string | null;
  // Contribution breakdown
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

// Contribution details for Transactions tab
export interface AjoContribution {
  id: string;
  cycle_number: number;
  member_id: string;
  member_name: string;
  member_email: string;
  amount: string;
  status: "pending" | "paid" | "overdue";
  paid_at: string | null;
  created_at: string;
}

// Activity log item
export interface AjoActivityItem {
  id: string;
  type: "member_joined" | "member_left" | "member_blocked" | "contribution_paid" | "payout_completed" | "cycle_started" | "cycle_completed" | "ajo_activated" | "settings_changed" | "dispute_opened";
  title: string;
  description: string;
  actor_name: string | null;
  timestamp: string;
  meta?: Record<string, string>;
}

export interface AjoDispute {
  id: string;
  title: string;
  description: string;
  reported_by: string;
  reported_against: string;
  status: "open" | "investigating" | "resolved";
  created_at: string;
}

export interface AjoDetail {
  id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  currency: string;
  contribution_amount: string;
  frequency: string;
  member_count: number;
  participant_count: number;
  status: "draft" | "active" | "completed" | "cancelled";
  created_at: string;
  start_date: string;
  expected_completion: string;

  // Creator info
  creator_id: string;
  creator_name: string;

  // Financial info
  total_pool: string;
  security_deposits: string;
  per_member_amount: string;

  // Progress
  current_cycle: number;
  total_cycles: number;
  next_payout_date: string;
  next_payout_recipient: string;

  // Settings
  security_deposit_percentage: string;
  grace_period_days: number;
  missed_payment_penalty: string;

  // Current round status
  paid_count: number;
  pending_count: number;
  overdue_count: number;
  collection_rate: number;

  // Disputes
  active_disputes: AjoDispute[];
}

export interface AjoStats {
  total_ajos: number;
  active_ajos: number;
  completed_ajos: number;
  at_risk_ajos: number;
}

export interface AjoListParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
  ordering?: string;
}

export interface PaginatedAjoResponse {
  results: AdminAjo[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Mock data for UI development
const mockAjos: AdminAjo[] = Array.from({ length: 100 }, (_, i) => ({
  id: `ajo-${i + 1}`,
  name: "Ojudu women Ajo",
  visibility: "private" as const,
  currency: "NGN",
  contribution_amount: "10000",
  frequency: "monthly",
  member_count: 12,
  participant_count: 12,
  status: "active" as const,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  admin_name: "Jane Doe",
  admin_id: `user-${i + 1}`,
}));

const mockStats: AjoStats = {
  total_ajos: 2847,
  active_ajos: 2000,
  completed_ajos: 100,
  at_risk_ajos: 8,
};

const mockMembers: AjoMemberDetail[] = [
  {
    id: "member-1",
    user_id: "user-1",
    name: "Adebayo Johnson",
    email: "adebayo@example.com",
    slot_number: 1,
    status: "accepted",
    is_selected_for_deposit: true,
    security_deposit_paid: true,
    security_deposit_paid_at: "2024-10-14T00:00:00Z",
    security_deposit_amount: "25000",
    total_contributed: "200000",
    total_received: "50000",
    contributions_made: 4,
    has_debt: false,
    debt_amount: "0",
    blocked_at: null,
    block_reason: null,
    invited_at: "2024-10-10T00:00:00Z",
    responded_at: "2024-10-12T00:00:00Z",
  },
  {
    id: "member-2",
    user_id: "user-2",
    name: "Fatima Hassan",
    email: "fatima@example.com",
    slot_number: 2,
    status: "accepted",
    is_selected_for_deposit: true,
    security_deposit_paid: true,
    security_deposit_paid_at: "2024-10-14T00:00:00Z",
    security_deposit_amount: "25000",
    total_contributed: "200000",
    total_received: "0",
    contributions_made: 4,
    has_debt: false,
    debt_amount: "0",
    blocked_at: null,
    block_reason: null,
    invited_at: "2024-10-10T00:00:00Z",
    responded_at: "2024-10-11T00:00:00Z",
  },
  {
    id: "member-3",
    user_id: "user-3",
    name: "Chukwuemeka Obi",
    email: "chukwuemeka@example.com",
    slot_number: 3,
    status: "accepted",
    is_selected_for_deposit: true,
    security_deposit_paid: true,
    security_deposit_paid_at: "2024-10-14T00:00:00Z",
    security_deposit_amount: "25000",
    total_contributed: "200000",
    total_received: "50000",
    contributions_made: 4,
    has_debt: false,
    debt_amount: "0",
    blocked_at: null,
    block_reason: null,
    invited_at: "2024-10-10T00:00:00Z",
    responded_at: "2024-10-11T00:00:00Z",
  },
  {
    id: "member-4",
    user_id: "user-4",
    name: "Ngozi Adekunle",
    email: "ngozi@example.com",
    slot_number: 4,
    status: "accepted",
    is_selected_for_deposit: true,
    security_deposit_paid: true,
    security_deposit_paid_at: "2024-10-14T00:00:00Z",
    security_deposit_amount: "25000",
    total_contributed: "150000",
    total_received: "50000",
    contributions_made: 3,
    has_debt: false,
    debt_amount: "0",
    blocked_at: null,
    block_reason: null,
    invited_at: "2024-10-10T00:00:00Z",
    responded_at: "2024-10-12T00:00:00Z",
  },
  {
    id: "member-5",
    user_id: "user-5",
    name: "Tunde Williams",
    email: "tunde@example.com",
    slot_number: 5,
    status: "accepted",
    is_selected_for_deposit: true,
    security_deposit_paid: true,
    security_deposit_paid_at: "2024-10-14T00:00:00Z",
    security_deposit_amount: "25000",
    total_contributed: "100000",
    total_received: "0",
    contributions_made: 2,
    has_debt: true,
    debt_amount: "50000",
    blocked_at: null,
    block_reason: null,
    invited_at: "2024-10-10T00:00:00Z",
    responded_at: "2024-10-13T00:00:00Z",
  },
  {
    id: "member-6",
    user_id: "user-6",
    name: "Samuel Eze",
    email: "samuel@example.com",
    slot_number: 6,
    status: "accepted",
    is_selected_for_deposit: true,
    security_deposit_paid: true,
    security_deposit_paid_at: "2024-10-14T00:00:00Z",
    security_deposit_amount: "25000",
    total_contributed: "200000",
    total_received: "0",
    contributions_made: 4,
    has_debt: false,
    debt_amount: "0",
    blocked_at: null,
    block_reason: null,
    invited_at: "2024-10-10T00:00:00Z",
    responded_at: "2024-10-11T00:00:00Z",
  },
  {
    id: "member-7",
    user_id: null,
    name: "Pending Invite",
    email: "pending@example.com",
    slot_number: null,
    status: "invited",
    is_selected_for_deposit: false,
    security_deposit_paid: false,
    security_deposit_paid_at: null,
    security_deposit_amount: "0",
    total_contributed: "0",
    total_received: "0",
    contributions_made: 0,
    has_debt: false,
    debt_amount: "0",
    blocked_at: null,
    block_reason: null,
    invited_at: "2024-10-15T00:00:00Z",
    responded_at: null,
  },
  {
    id: "member-8",
    user_id: "user-8",
    name: "Ibrahim Musa",
    email: "ibrahim@example.com",
    slot_number: 7,
    status: "blocked",
    is_selected_for_deposit: true,
    security_deposit_paid: true,
    security_deposit_paid_at: "2024-10-14T00:00:00Z",
    security_deposit_amount: "25000",
    total_contributed: "50000",
    total_received: "0",
    contributions_made: 1,
    has_debt: true,
    debt_amount: "100000",
    blocked_at: "2024-12-20T00:00:00Z",
    block_reason: "Repeated missed payments and unresponsive to contact attempts",
    invited_at: "2024-10-10T00:00:00Z",
    responded_at: "2024-10-11T00:00:00Z",
  },
];

const mockCycles: AjoCycle[] = [
  {
    id: "cycle-1",
    cycle_number: 1,
    start_date: "2024-10-15T00:00:00Z",
    end_date: "2024-11-14T00:00:00Z",
    status: "completed",
    recipient_slot_number: 1,
    recipient_name: "Adebayo Johnson",
    recipient_id: "member-1",
    total_collected: "600000",
    expected_total: "600000",
    collection_percentage: 100,
    payout_amount: "600000",
    payout_status: "completed",
    payout_date: "2024-11-15T00:00:00Z",
    paid_count: 12,
    pending_count: 0,
    overdue_count: 0,
  },
  {
    id: "cycle-2",
    cycle_number: 2,
    start_date: "2024-11-15T00:00:00Z",
    end_date: "2024-12-14T00:00:00Z",
    status: "completed",
    recipient_slot_number: 2,
    recipient_name: "Fatima Hassan",
    recipient_id: "member-2",
    total_collected: "600000",
    expected_total: "600000",
    collection_percentage: 100,
    payout_amount: "600000",
    payout_status: "completed",
    payout_date: "2024-12-15T00:00:00Z",
    paid_count: 12,
    pending_count: 0,
    overdue_count: 0,
  },
  {
    id: "cycle-3",
    cycle_number: 3,
    start_date: "2024-12-15T00:00:00Z",
    end_date: "2025-01-14T00:00:00Z",
    status: "completed",
    recipient_slot_number: 3,
    recipient_name: "Chukwuemeka Obi",
    recipient_id: "member-3",
    total_collected: "550000",
    expected_total: "600000",
    collection_percentage: 92,
    payout_amount: "550000",
    payout_status: "completed",
    payout_date: "2025-01-15T00:00:00Z",
    paid_count: 11,
    pending_count: 0,
    overdue_count: 1,
  },
  {
    id: "cycle-4",
    cycle_number: 4,
    start_date: "2025-01-15T00:00:00Z",
    end_date: "2025-02-14T00:00:00Z",
    status: "active",
    recipient_slot_number: 4,
    recipient_name: "Ngozi Adekunle",
    recipient_id: "member-4",
    total_collected: "500000",
    expected_total: "600000",
    collection_percentage: 83,
    payout_amount: "0",
    payout_status: "pending",
    payout_date: null,
    paid_count: 10,
    pending_count: 1,
    overdue_count: 1,
  },
  {
    id: "cycle-5",
    cycle_number: 5,
    start_date: "2025-02-15T00:00:00Z",
    end_date: "2025-03-14T00:00:00Z",
    status: "pending",
    recipient_slot_number: 5,
    recipient_name: "Tunde Williams",
    recipient_id: "member-5",
    total_collected: "0",
    expected_total: "600000",
    collection_percentage: 0,
    payout_amount: "0",
    payout_status: "pending",
    payout_date: null,
    paid_count: 0,
    pending_count: 0,
    overdue_count: 0,
  },
];

const mockContributions: AjoContribution[] = [
  // Cycle 4 contributions
  { id: "contrib-1", cycle_number: 4, member_id: "member-1", member_name: "Adebayo Johnson", member_email: "adebayo@example.com", amount: "50000", status: "paid", paid_at: "2025-01-16T00:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "contrib-2", cycle_number: 4, member_id: "member-2", member_name: "Fatima Hassan", member_email: "fatima@example.com", amount: "50000", status: "paid", paid_at: "2025-01-15T00:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "contrib-3", cycle_number: 4, member_id: "member-3", member_name: "Chukwuemeka Obi", member_email: "chukwuemeka@example.com", amount: "50000", status: "paid", paid_at: "2025-01-17T00:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "contrib-4", cycle_number: 4, member_id: "member-4", member_name: "Ngozi Adekunle", member_email: "ngozi@example.com", amount: "50000", status: "paid", paid_at: "2025-01-18T00:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "contrib-5", cycle_number: 4, member_id: "member-5", member_name: "Tunde Williams", member_email: "tunde@example.com", amount: "50000", status: "overdue", paid_at: null, created_at: "2025-01-15T00:00:00Z" },
  { id: "contrib-6", cycle_number: 4, member_id: "member-6", member_name: "Samuel Eze", member_email: "samuel@example.com", amount: "50000", status: "paid", paid_at: "2025-01-15T00:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "contrib-7", cycle_number: 4, member_id: "member-8", member_name: "Ibrahim Musa", member_email: "ibrahim@example.com", amount: "50000", status: "pending", paid_at: null, created_at: "2025-01-15T00:00:00Z" },
  // Cycle 3 contributions
  { id: "contrib-8", cycle_number: 3, member_id: "member-1", member_name: "Adebayo Johnson", member_email: "adebayo@example.com", amount: "50000", status: "paid", paid_at: "2024-12-16T00:00:00Z", created_at: "2024-12-15T00:00:00Z" },
  { id: "contrib-9", cycle_number: 3, member_id: "member-2", member_name: "Fatima Hassan", member_email: "fatima@example.com", amount: "50000", status: "paid", paid_at: "2024-12-15T00:00:00Z", created_at: "2024-12-15T00:00:00Z" },
  { id: "contrib-10", cycle_number: 3, member_id: "member-5", member_name: "Tunde Williams", member_email: "tunde@example.com", amount: "50000", status: "paid", paid_at: "2024-12-20T00:00:00Z", created_at: "2024-12-15T00:00:00Z" },
];

const mockActivityLog: AjoActivityItem[] = [
  { id: "act-1", type: "contribution_paid", title: "Contribution Received", description: "Adebayo Johnson paid ₦50,000 for Cycle 4", actor_name: "Adebayo Johnson", timestamp: "2025-01-16T10:30:00Z" },
  { id: "act-2", type: "contribution_paid", title: "Contribution Received", description: "Fatima Hassan paid ₦50,000 for Cycle 4", actor_name: "Fatima Hassan", timestamp: "2025-01-15T14:20:00Z" },
  { id: "act-3", type: "cycle_started", title: "Cycle Started", description: "Cycle 4 has started. Recipient: Ngozi Adekunle", actor_name: null, timestamp: "2025-01-15T00:00:00Z" },
  { id: "act-4", type: "payout_completed", title: "Payout Completed", description: "₦550,000 paid out to Chukwuemeka Obi for Cycle 3", actor_name: null, timestamp: "2025-01-15T00:05:00Z" },
  { id: "act-5", type: "cycle_completed", title: "Cycle Completed", description: "Cycle 3 completed with 92% collection rate", actor_name: null, timestamp: "2025-01-14T23:59:00Z" },
  { id: "act-6", type: "member_blocked", title: "Member Blocked", description: "Ibrahim Musa was blocked due to repeated missed payments", actor_name: "Admin", timestamp: "2024-12-20T15:00:00Z" },
  { id: "act-7", type: "dispute_opened", title: "Dispute Opened", description: "Late payment concern reported by Samuel Eze regarding Tunde Williams", actor_name: "Samuel Eze", timestamp: "2025-01-09T11:00:00Z" },
  { id: "act-8", type: "member_joined", title: "Member Joined", description: "Fatima Hassan accepted the invitation and joined the Ajo", actor_name: "Fatima Hassan", timestamp: "2024-10-11T09:00:00Z" },
  { id: "act-9", type: "ajo_activated", title: "Ajo Activated", description: "The Ajo has been activated with 12 members", actor_name: "Adebayo Johnson", timestamp: "2024-10-15T00:00:00Z" },
];

const mockAjoDetail: AjoDetail = {
  id: "ajo-1",
  name: "Tech Professionals Savings Circle",
  description:
    "A monthly savings circle for tech professionals looking to build emergency funds and support each other financially.",
  visibility: "private",
  currency: "NGN",
  contribution_amount: "50000",
  frequency: "monthly",
  member_count: 12,
  participant_count: 12,
  status: "active",
  created_at: "2024-10-15T00:00:00Z",
  start_date: "2024-10-15",
  expected_completion: "2025-10-15",

  creator_id: "user-1",
  creator_name: "Adebayo Johnson",

  total_pool: "245000",
  security_deposits: "300000",
  per_member_amount: "50000",

  current_cycle: 4,
  total_cycles: 12,
  next_payout_date: "2025-01-15",
  next_payout_recipient: "Fatima Hassan",

  security_deposit_percentage: "50",
  grace_period_days: 3,
  missed_payment_penalty: "Trust score reduction",

  paid_count: 10,
  pending_count: 1,
  overdue_count: 1,
  collection_rate: 83,

  active_disputes: [
    {
      id: "dispute-1",
      title: "Late payment concern",
      description: "Member has not paid for the current cycle",
      reported_by: "Samuel Eze",
      reported_against: "Tunde Williams",
      status: "open",
      created_at: "2025-01-09T00:00:00Z",
    },
  ],
};

const ajoService = {
  // Get Ajo statistics
  getAjoStats: async (): Promise<AjoStats> => {
    const response = await api.get(ADMIN_AJO_ENDPOINTS.stats);
    return response.data.data;
  },

  // Get paginated list of Ajos
  getAjos: async (params: AjoListParams = {}): Promise<PaginatedAjoResponse> => {
    const response = await api.get(ADMIN_AJO_ENDPOINTS.list, { params });
    return response.data.data;
  },

  // Get single Ajo details
  getAjoDetail: async (id: string): Promise<AjoDetail> => {
    const response = await api.get(ADMIN_AJO_ENDPOINTS.detail(id));
    return response.data.data;
  },

  // Get Ajo members
  getAjoMembers: async (ajoId: string): Promise<AjoMemberDetail[]> => {
    const response = await api.get(ADMIN_AJO_ENDPOINTS.members(ajoId));
    return response.data.data;
  },

  // Get Ajo cycles (payout schedule)
  getAjoCycles: async (ajoId: string): Promise<AjoCycle[]> => {
    const response = await api.get(ADMIN_AJO_ENDPOINTS.cycles(ajoId));
    return response.data.data;
  },

  // Get Ajo contributions (transactions)
  getAjoContributions: async (ajoId: string, params?: { cycle?: number; status?: string }): Promise<AjoContribution[]> => {
    const response = await api.get(ADMIN_AJO_ENDPOINTS.contributions(ajoId), { params });
    return response.data.data;
  },

  // Get Ajo activity log
  getAjoActivityLog: async (ajoId: string): Promise<AjoActivityItem[]> => {
    const response = await api.get(ADMIN_AJO_ENDPOINTS.activity(ajoId));
    return response.data.data;
  },
};

export default ajoService;
