import api from "@/lib/api";

// Types
export interface Transaction {
  id: string;
  transaction_id: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  transaction_type:
    | "contribution"
    | "payout"
    | "wallet_credit"
    | "wallet_debit"
    | "security_deposit"
    | "refund";
  amount: number;
  currency: string;
  date_time: string;
  status: "successful" | "failed" | "pending";
  description?: string;
  reference?: string;
  ajo_name?: string;
}

export interface TransactionStats {
  total_wallets: number;
  float_balance: number;
  successful_this_month: number;
  failed_transactions: number;
  currency: string;
}

export interface TransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

export interface TransactionFilters {
  status?: "successful" | "failed" | "pending" | "";
  transaction_type?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  date_from?: string;
  date_to?: string;
}

export interface TransactionDetail {
  id: string;
  transaction_id: string;
  status: "successful" | "failed" | "pending";
  transaction_type: string;
  amount: number;
  currency: string;
  completion_time: string;
  date_time: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    trust_score: number;
  };
  ajo?: {
    id: string;
    name: string;
    round: number;
  };
  payment: {
    method: string;
    provider: string;
    reference: string;
  };
  breakdown: {
    transaction_amount: number;
    platform_fee: number;
    processing_fee: number;
    net_amount: number;
  };
  wallet: {
    balance_before: number;
    balance_after: number;
  };
  banking: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  metadata: {
    ip_address: string;
    device_type: string;
    device_model: string;
    location: string;
    session_id: string;
  };
}

// API Endpoints
const ADMIN_TRANSACTION_ENDPOINTS = {
  list: "/auth/admin/transactions/",
  stats: "/auth/admin/transactions/stats/",
  detail: (id: string) => `/auth/admin/transactions/${id}/`,
  export: "/auth/admin/transactions/export/",
};

// API Functions
export const transactionService = {
  // Get transactions list with filters
  async getTransactions(
    filters: TransactionFilters = {},
  ): Promise<TransactionListResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.transaction_type)
      params.append("transaction_type", filters.transaction_type);
    if (filters.search) params.append("search", filters.search);
    if (filters.ordering) params.append("ordering", filters.ordering);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size)
      params.append("page_size", filters.page_size.toString());
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);

    const queryString = params.toString();
    const url = queryString
      ? `${ADMIN_TRANSACTION_ENDPOINTS.list}?${queryString}`
      : ADMIN_TRANSACTION_ENDPOINTS.list;

    const response = await api.get(url);
    // Backend wraps response with apiresponse() - extract inner data
    return response.data.data;
  },

  // Get transaction stats
  async getStats(): Promise<TransactionStats> {
    const response = await api.get(ADMIN_TRANSACTION_ENDPOINTS.stats);
    // Backend wraps response with apiresponse() - extract inner data
    return response.data.data;
  },

  // Get single transaction detail
  async getTransaction(id: string): Promise<TransactionDetail> {
    const response = await api.get(ADMIN_TRANSACTION_ENDPOINTS.detail(id));
    // Backend wraps response with apiresponse() - extract inner data
    return response.data.data;
  },

  // Export transactions
  async exportTransactions(filters: TransactionFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.transaction_type)
      params.append("transaction_type", filters.transaction_type);
    if (filters.search) params.append("search", filters.search);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);

    const queryString = params.toString();
    const url = queryString
      ? `${ADMIN_TRANSACTION_ENDPOINTS.export}?${queryString}`
      : ADMIN_TRANSACTION_ENDPOINTS.export;

    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },
};

export default transactionService;
