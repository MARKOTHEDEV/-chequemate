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
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ajoService from "@/services/ajoService";

// Type badge component
function TypeBadge({ visibility }: { visibility: string }) {
  const isPrivate = visibility === "private";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${
        isPrivate
          ? "bg-[#F3FBFF] text-[#38BDF8] border-[#C8EEFF]"
          : "bg-[#E6F0FF] text-[#3B82F6] border-[#BFDBFE]"
      }`}
    >
      {isPrivate ? "Private" : "Public"}
    </span>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
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
    active: {
      label: "Active",
      bgColor: "bg-white",
      textColor: "text-[#166534]",
      borderColor: "border-[#E5E7EB]",
      showIcon: true,
    },
    completed: {
      label: "Completed",
      bgColor: "bg-[#DBEAFE]",
      textColor: "text-[#3B82F6]",
      borderColor: "border-[#BFDBFE]",
      showIcon: false,
    },
    draft: {
      label: "Draft",
      bgColor: "bg-[#F3F4F6]",
      textColor: "text-[#6B7280]",
      borderColor: "border-[#E5E7EB]",
      showIcon: false,
    },
    cancelled: {
      label: "Cancelled",
      bgColor: "bg-[#FEE2E2]",
      textColor: "text-[#EF4444]",
      borderColor: "border-[#FECACA]",
      showIcon: false,
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

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
function formatCurrency(amount: string | number, currency: string = "NGN") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "N/A";

  const symbol =
    currency === "NGN"
      ? "₦"
      : currency === "USD"
        ? "$"
        : currency === "GBP"
          ? "£"
          : "€";
  return `${symbol}${num.toLocaleString()}`;
}

export default function AjoPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all",
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
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Ajo stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["ajoStats"],
    queryFn: ajoService.getAjoStats,
    staleTime: 30000,
  });

  // Fetch Ajos list
  const {
    data: ajosData,
    isLoading: ajosLoading,
    error: ajosError,
    refetch: refetchAjos,
  } = useQuery({
    queryKey: ["ajos", currentPage, pageSize, activeTab, debouncedSearch],
    queryFn: () =>
      ajoService.getAjos({
        page: currentPage,
        page_size: pageSize,
        status:
          activeTab === "all"
            ? undefined
            : activeTab === "inactive"
              ? "cancelled"
              : activeTab,
        search: debouncedSearch || undefined,
        ordering: "-created_at",
      }),
    staleTime: 10000,
  });

  const totalPages = ajosData?.total_pages || 1;
  const ajos = ajosData?.results || [];

  // Handle tab change
  const handleTabChange = (tab: "all" | "active" | "inactive") => {
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
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  return (
    <AdminLayout title="Ajo">
      <div className="space-y-6 px-[28px]">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <p className="text-[#6B7280] text-sm">
            System-level oversight of all Ajo
          </p>
          <button className="flex items-center gap-2 bg-[#008A48] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#007A3D] transition-colors">
            <Download className="w-4 h-4" />
            Export
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
                <p className="text-sm text-[#6B7280] mb-2">Total Ajo</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.total_ajos?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">Active Ajo</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.active_ajos?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">Completed</p>
                <p className="text-2xl font-semibold text-[#1A7F64]">
                  {stats?.completed_ajos?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] h-[120px]">
                <p className="text-sm text-[#6B7280] mb-2">At Risk</p>
                <p className="text-2xl font-semibold text-[#EF4444]">
                  {stats?.at_risk_ajos?.toLocaleString() || "0"}
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
              {(["all", "active", "inactive"] as const).map((tab) => (
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
                    : tab === "active"
                      ? "Active"
                      : "Inactive"}
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
          {ajosLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
            </div>
          ) : ajosError ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>Failed to load Ajos</p>
              <button
                onClick={() => refetchAjos()}
                className="mt-2 text-sm text-[#008A48] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : ajos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <p>No Ajos found</p>
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
                      Ajo Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Type
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Currency
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      Contribution
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                      No. of Participant
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
                {ajos.map((ajo) => (
                  <tr
                    key={ajo.id}
                    onClick={() => router.push(`/ajo/${ajo.id}`)}
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

                    {/* Ajo Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-[#FEF3C7] flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {ajo.name}
                        </p>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4">
                      <TypeBadge visibility={ajo.visibility} />
                    </td>

                    {/* Currency */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-[#6B7280]">
                        {ajo.currency}
                      </span>
                    </td>

                    {/* Contribution */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-[#1A1A1A]">
                        {formatCurrency(ajo.contribution_amount, ajo.currency)}
                      </span>
                    </td>

                    {/* No. of Participant */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-[#6B7280]">
                        {ajo.participant_count}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={ajo.status} />
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
          {!ajosLoading && !ajosError && ajos.length > 0 && (
            <div className="p-4 flex items-center justify-between border-t border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280]">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, ajosData?.count || 0)} of{" "}
                {ajosData?.count || 0} entries
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
                  ),
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
