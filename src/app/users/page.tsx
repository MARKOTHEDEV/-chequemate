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
  MoreVertical,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import userService, { AdminUser, UserStats } from "@/services/userService";
import * as XLSX from "xlsx";

// KYC status badge component
function KYCBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; bgColor: string; textColor: string; borderColor: string }
  > = {
    completed: {
      label: "Approved",
      bgColor: "bg-[#DCFCE7]",
      textColor: "text-[#22C55E]",
      borderColor: "border-[#BBF7D0]",
    },
    id_verified: {
      label: "ID Verified",
      bgColor: "bg-[#DBEAFE]",
      textColor: "text-[#3B82F6]",
      borderColor: "border-[#BFDBFE]",
    },
    bvn_verified: {
      label: "BVN Verified",
      bgColor: "bg-[#E0E7FF]",
      textColor: "text-[#6366F1]",
      borderColor: "border-[#C7D2FE]",
    },
    id_submitted: {
      label: "Pending",
      bgColor: "bg-[#FEF3C7]",
      textColor: "text-[#F59E0B]",
      borderColor: "border-[#FDE68A]",
    },
    pending: {
      label: "Not Started",
      bgColor: "bg-[#F3F4F6]",
      textColor: "text-[#6B7280]",
      borderColor: "border-[#E5E7EB]",
    },
    rejected: {
      label: "Rejected",
      bgColor: "bg-[#FEE2E2]",
      textColor: "text-[#EF4444]",
      borderColor: "border-[#FECACA]",
    },
    id_failed: {
      label: "Failed",
      bgColor: "bg-[#FEE2E2]",
      textColor: "text-[#EF4444]",
      borderColor: "border-[#FECACA]",
    },
    bvn_failed: {
      label: "BVN Failed",
      bgColor: "bg-[#FEE2E2]",
      textColor: "text-[#EF4444]",
      borderColor: "border-[#FECACA]",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-2 px-[8px] py-[4px] rounded-lg text-sm font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
    >
      {config.label === "Approved" && (
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

// User status badge component
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-[6px] px-2.5 py-1 rounded-[6px] text-xs font-medium border ${
        isActive
          ? "bg-white text-[#166534] border-[#E5E7EB]"
          : "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]"
      }`}
    >
      {isActive ? (
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
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M6 12C2.6862 12 0 9.3138 0 6C0 2.6862 2.6862 0 6 0C9.3138 0 12 2.6862 12 6C12 9.3138 9.3138 12 6 12ZM6 5.1516L4.1514 3.303L3.303 4.1514L5.1516 6L3.303 7.8486L4.1514 8.697L6 6.8484L7.8486 8.697L8.697 7.8486L6.8484 6L8.697 4.1514L7.8486 3.303L6 5.1516Z"
            fill="#EF4444"
          />
        </svg>
      )}
      {isActive ? "Active" : "Suspended"}
    </span>
  );
}

// Format currency
function formatCurrency(amount: string | number, currency: string = "NGN") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "N/A";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "suspended">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch user stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["userStats"],
    queryFn: userService.getUserStats,
    staleTime: 30000, // 30 seconds
  });

  // Fetch users list
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users", currentPage, pageSize, activeTab, debouncedSearch],
    queryFn: () =>
      userService.getUsers({
        page: currentPage,
        page_size: pageSize,
        status: activeTab === "all" ? undefined : activeTab,
        search: debouncedSearch || undefined,
        ordering: "-date_joined",
      }),
    staleTime: 10000, // 10 seconds
  });

  const [exporting, setExporting] = useState(false);

  const handleExportUsers = useCallback(async () => {
    setExporting(true);
    try {
      // Fetch all users (large page size to get everything)
      const allUsersData = await userService.getUsers({
        page_size: 10000,
        status: activeTab === "all" ? undefined : activeTab,
        search: debouncedSearch || undefined,
        ordering: "-date_joined",
      });

      const rows = allUsersData.results.map((user) => ({
        "First Name": user.first_name,
        "Last Name": user.last_name,
        Email: user.email,
        "Phone Number": user.phone_number || "N/A",
        "KYC Status": user.kyc_status,
        "Trust Score": user.trust_score,
        "Active Ajo": user.active_ajo_count,
        "Wallet Balance": user.wallet_balance,
        "Date Joined": new Date(user.date_joined).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        Status: user.is_active ? "Active" : "Suspended",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto-size columns
      const colWidths = Object.keys(rows[0] || {}).map((key) => ({
        wch: Math.max(
          key.length,
          ...rows.map((row) => String(row[key as keyof typeof row]).length)
        ) + 2,
      }));
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, `users_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Failed to export users:", error);
    } finally {
      setExporting(false);
    }
  }, [activeTab, debouncedSearch]);

  const totalPages = usersData ? Math.ceil(usersData.count / pageSize) : 1;
  const users = usersData?.results || [];

  // Handle tab change
  const handleTabChange = (tab: "all" | "active" | "suspended") => {
    setActiveTab(tab);
    setCurrentPage(1);
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
    <AdminLayout title="User Management">
      <div className="space-y-6 px-[28px]">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <p className="text-[#6B7280] text-sm">
            Monitor and manage all Chequemate users
          </p>
          <button
            onClick={handleExportUsers}
            disabled={exporting}
            className="flex items-center gap-2 bg-[#008A48] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#007A3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? "Exporting..." : "Export Users"}
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
                <p className="text-sm text-[#6B7280] mb-2">Total Users</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.total_users?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">Active Users</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.active_users?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">Defaulted</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.defaulted_users?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">Avg Trust Score</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.avg_trust_score || "0"}
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
              {(["all", "active", "suspended"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-5 py-2 text-sm font-medium transition-colors rounded-lg capitalize ${
                    activeTab === tab
                      ? "bg-white text-[#1A1A1A] shadow-sm"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tab === "all" ? "All" : tab === "active" ? "Active" : "Inactive"}
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

              {/* Refresh */}
              <button
                onClick={() => refetchUsers()}
                className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
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
          {usersLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
            </div>
          ) : usersError ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>Failed to load users</p>
              <button
                onClick={() => refetchUsers()}
                className="mt-2 text-sm text-[#008A48] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <p>No users found</p>
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
                      User Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      KYC
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Trust Score
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Active Ajo
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Wallet Balance
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Date Joined
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
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Action
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/users/${user.id}`)}
                    className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer"
                  >
                    {/* Checkbox */}
                    <td
                      className="py-4 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#D1D5DB]"
                      />
                    </td>

                    {/* User Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-[#DBEAFE] flex items-center justify-center">
                          <span className="text-sm font-medium text-[#3B82F6]">
                            {user.first_name?.[0] || ""}
                            {user.last_name?.[0] || ""}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-[#6B7280]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* KYC */}
                    <td className="py-4 px-4">
                      <KYCBadge status={user.kyc_status} />
                    </td>

                    {/* Trust Score */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-[80px] h-2 bg-[#C1E7D6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#008A48] rounded-full"
                            style={{ width: `${user.trust_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {user.trust_score}
                        </span>
                      </div>
                    </td>

                    {/* Active Ajo */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-[#6B7280]">
                        {user.active_ajo_count}
                      </span>
                    </td>

                    {/* Wallet Balance */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-[#1A1A1A]">
                        {formatCurrency(user.wallet_balance)}
                      </span>
                    </td>

                    {/* Date Joined */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-[#6B7280]">
                        {new Date(user.date_joined).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge isActive={user.is_active} />
                    </td>

                    {/* Action */}
                    <td
                      className="py-4 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!usersLoading && !usersError && users.length > 0 && (
            <div className="p-4 flex items-center justify-between border-t border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280]">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, usersData?.count || 0)} of{" "}
                {usersData?.count || 0} entries
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
                    <span key={`ellipsis-${idx}`} className="px-2 text-[#6B7280]">
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
