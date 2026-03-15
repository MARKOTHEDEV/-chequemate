"use client";

import { AdminLayout } from "@/components/layout";
import {
  Download,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import transactionService, {
  Transaction,
  TransactionFilters,
} from "@/services/transactionService";

// Transaction Type Badge
function TransactionTypeBadge({
  type,
}: {
  type: Transaction["transaction_type"];
}) {
  const typeConfig: Record<
    string,
    { label: string; bgColor: string; textColor: string; borderColor: string }
  > = {
    contribution: {
      label: "Contribution",
      bgColor: "bg-[#EFF6FF]",
      textColor: "text-[#3B82F6]",
      borderColor: "border-[#BFDBFE]",
    },
    payout: {
      label: "Payout",
      bgColor: "bg-[#ECFDF5]",
      textColor: "text-[#10B981]",
      borderColor: "border-[#A7F3D0]",
    },
    wallet_credit: {
      label: "Wallet Credit",
      bgColor: "bg-[#F3E8FF]",
      textColor: "text-[#9333EA]",
      borderColor: "border-[#DDD6FE]",
    },
    wallet_debit: {
      label: "Wallet Debit",
      bgColor: "bg-[#FEF3C7]",
      textColor: "text-[#D97706]",
      borderColor: "border-[#FDE68A]",
    },
    security_deposit: {
      label: "Security Deposit",
      bgColor: "bg-[#E0F2FE]",
      textColor: "text-[#0284C7]",
      borderColor: "border-[#BAE6FD]",
    },
    refund: {
      label: "Refund",
      bgColor: "bg-[#F3F4F6]",
      textColor: "text-[#6B7280]",
      borderColor: "border-[#E5E7EB]",
    },
  };

  const config = typeConfig[type] || typeConfig.contribution;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.label}
    </span>
  );
}

// Status Badge
function StatusBadge({ status }: { status: Transaction["status"] }) {
  const statusConfig: Record<
    string,
    {
      label: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
      showIcon: boolean;
    }
  > = {
    successful: {
      label: "Successful",
      bgColor: "bg-white",
      textColor: "text-[#166534]",
      borderColor: "border-[#E5E7EB]",
      showIcon: true,
    },
    failed: {
      label: "Failed",
      bgColor: "bg-[#FEE2E2]",
      textColor: "text-[#EF4444]",
      borderColor: "border-[#FECACA]",
      showIcon: false,
    },
    pending: {
      label: "Pending",
      bgColor: "bg-[#FEF3C7]",
      textColor: "text-[#D97706]",
      borderColor: "border-[#FDE68A]",
      showIcon: false,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-[6px] px-2.5 py-1 rounded-[6px] text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.showIcon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M6 12C2.6862 12 0 9.3138 0 6C0 2.6862 2.6862 0 6 0C9.3138 0 12 2.6862 12 6C12 9.3138 9.3138 12 6 12ZM5.4018 8.4L9.6438 4.1574L8.7954 3.309L5.4018 6.7032L3.7044 5.0058L2.856 5.8542L5.4018 8.4Z"
            fill="#38C793"
          />
        </svg>
      )}
      {config.label}
    </span>
  );
}

// Format currency
function formatCurrency(amount: number, currency: string = "NGN") {
  const symbol =
    currency === "NGN"
      ? "₦"
      : currency === "USD"
        ? "$"
        : currency === "GBP"
          ? "£"
          : "€";

  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toLocaleString()}`;
}

// Format full currency
function formatFullCurrency(amount: number, currency: string = "NGN") {
  const symbol =
    currency === "NGN"
      ? "₦"
      : currency === "USD"
        ? "$"
        : currency === "GBP"
          ? "£"
          : "€";
  return `${symbol}${amount.toLocaleString()}`;
}

// Format date
function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date: formattedDate, time: formattedTime };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "successful" | "failed">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build filters
  const filters: TransactionFilters = {
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status: activeTab === "all" ? undefined : activeTab,
  };

  // Fetch transaction stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["transactionStats"],
    queryFn: transactionService.getStats,
    staleTime: 30000,
  });

  // Fetch transactions list
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: [
      "transactions",
      currentPage,
      pageSize,
      activeTab,
      debouncedSearch,
    ],
    queryFn: () => transactionService.getTransactions(filters),
    staleTime: 10000,
  });

  const totalPages = Math.ceil((transactionsData?.count || 0) / pageSize);
  const transactions = transactionsData?.results || [];

  // Handle tab change
  const handleTabChange = (tab: "all" | "successful" | "failed") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await transactionService.exportTransactions(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Pagination helpers
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <AdminLayout title="Transactions">
      <div className="space-y-6 px-[28px]">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <p className="text-[#6B7280] text-sm">
            Monitor financial flows and transaction statuses
          </p>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#008A48] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#007A3D] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Transactions
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px] animate-pulse"
                >
                  <div className="h-4 bg-[#E5E7EB] rounded w-24 mb-3" />
                  <div className="h-8 bg-[#E5E7EB] rounded w-16" />
                </div>
              ))}
            </>
          ) : statsError ? (
            <div className="col-span-4 bg-white rounded-xl p-5 border border-[#E5E7EB] flex items-center justify-center gap-2 text-[#EF4444]">
              <AlertCircle className="w-5 h-5" />
              Failed to load stats
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">Total Wallets</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.total_wallets?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">
                  Float Balance (NGN)
                </p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {formatCurrency(
                    stats?.float_balance || 0,
                    stats?.currency || "NGN"
                  )}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">
                  Successful this month
                </p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.successful_this_month?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">
                  Failed Transactions
                </p>
                <p className="text-2xl font-semibold text-[#EF4444]">
                  {stats?.failed_transactions?.toLocaleString() || "0"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          {/* Table Top Bar */}
          <div className="p-4 flex items-center justify-between border-b border-[#E5E7EB]">
            {/* Tabs */}
            <div className="flex items-center bg-[#F3F4F6] rounded-xl p-1">
              {(["all", "successful", "failed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-5 py-2 text-sm font-medium transition-colors rounded-lg capitalize ${
                    activeTab === tab
                      ? "bg-white text-[#1A1A1A] shadow-sm"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tab === "all"
                    ? "All"
                    : tab === "successful"
                      ? "Successful"
                      : "Failed"}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7F64] focus:border-transparent w-[240px]"
                />
              </div>

              {/* Filter */}
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>

              {/* Sort by */}
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
                <ArrowUpDown className="w-4 h-4" />
                Sort by
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
            </div>
          ) : transactionsError ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>Failed to load transactions</p>
              <button
                onClick={() => refetchTransactions()}
                className="mt-2 text-sm text-[#008A48] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <p>No transactions found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F6F8FA]">
                  <th className="py-3 px-4 text-left w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Transaction ID
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      User
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Transaction Type
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Date/Time
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="text-xs font-medium text-[#6B7280]">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const { date, time } = formatDateTime(transaction.date_time);
                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]"
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#D1D5DB]"
                        />
                      </td>

                      {/* Transaction ID */}
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {transaction.transaction_id}
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-[#F3F4F6] flex items-center justify-center">
                            {transaction.user.avatar ? (
                              <img
                                src={transaction.user.avatar}
                                alt={transaction.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-[#6B7280]">
                                {transaction.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A]">
                              {transaction.user.name}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {transaction.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-4 px-4">
                        <TransactionTypeBadge
                          type={transaction.transaction_type}
                        />
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {formatFullCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </span>
                      </td>

                      {/* Date/Time */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm text-[#1A1A1A]">{date}</p>
                          <p className="text-xs text-[#6B7280]">{time}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={transaction.status} />
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() =>
                            router.push(`/transactions/${transaction.id}`)
                          }
                          className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-[#6B7280]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!transactionsLoading &&
            !transactionsError &&
            transactions.length > 0 && (
              <div className="p-4 flex items-center justify-between border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(
                    currentPage * pageSize,
                    transactionsData?.count || 0
                  )}{" "}
                  of {transactionsData?.count || 0} entries
                </p>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-[#6B7280]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1.5 text-sm rounded-lg ${
                          currentPage === page
                            ? "bg-[#008A48] text-white"
                            : "text-[#6B7280] hover:bg-[#F9FAFB]"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsRight className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </div>

                {/* Entries Dropdown */}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#008A48]"
                >
                  <option value={10}>10 Entries</option>
                  <option value={25}>25 Entries</option>
                  <option value={50}>50 Entries</option>
                  <option value={100}>100 Entries</option>
                </select>
              </div>
            )}
        </div>
      </div>
    </AdminLayout>
  );
}
