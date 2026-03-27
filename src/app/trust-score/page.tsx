"use client";

import { AdminLayout } from "@/components/layout";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  ArrowUpDown,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { trustScoreService, TrustScoreMember } from "@/services/trustScoreService";

// Mock trend data (API doesn't provide this yet)
const trendData = [
  { month: "Jan", score: 20 },
  { month: "Feb", score: 120 },
  { month: "Mar", score: 180 },
  { month: "Apr", score: 280 },
  { month: "May", score: 380 },
  { month: "Jun", score: 350 },
  { month: "Jul", score: 320 },
  { month: "Aug", score: 390 },
  { month: "Sep", score: 450 },
  { month: "Oct", score: 460 },
  { month: "Nov", score: 380 },
  { month: "Dec", score: 470 },
];

// Stat Card Component
function StatCard({
  label,
  value,
  change,
  isRisk = false,
  isLoading = false,
}: {
  label: string;
  value: string | number;
  change: number;
  isRisk?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#DADCE0]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-lg bg-[#E6F5ED] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#008A48]" />
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-[#008A48]" />
          <span className="text-[13px] text-[#008A48]">+{change}%</span>
        </div>
      </div>
      <p className="text-sm text-[#6F7278] mb-3">{label}</p>
      {isLoading ? (
        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
      ) : (
        <p
          className={`text-2xl font-bold ${isRisk ? "text-[#EF3E4A]" : "text-[#121212]"}`}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      )}
    </div>
  );
}

// Trust Score Progress Bar Component
function TrustScoreBar({ score }: { score: number }) {
  const getColor = () => {
    if (score <= 40) return { bg: "#FEE2E4", fill: "#EF3E4A" };
    if (score <= 60) return { bg: "#FEF3C7", fill: "#F59E0B" };
    return { bg: "#DCFCE7", fill: "#22C55E" };
  };

  const colors = getColor();

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-[100px] h-2 rounded-full"
        style={{ backgroundColor: colors.bg }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: colors.fill }}
        />
      </div>
      <span className="text-sm font-medium text-[#121212]">{score}</span>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${
        isActive
          ? "bg-white text-[#525866] border-[#E2E4E9]"
          : "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${isActive ? "bg-[#22C55E]" : "bg-[#EF4444]"}`}
      />
      {isActive ? "Active" : "Suspended"}
    </span>
  );
}

// Loading skeleton for table rows
function TableRowSkeleton() {
  return (
    <div className="flex items-center px-3 py-4 animate-pulse">
      <div className="w-[300px] flex items-center gap-3 px-3">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-[200px] px-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="w-[120px] px-6">
        <div className="h-4 w-8 bg-gray-200 rounded" />
      </div>
      <div className="w-[260px] px-3">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="w-[120px] px-3">
        <div className="h-6 w-16 bg-gray-200 rounded" />
      </div>
      <div className="w-[98px] px-3 flex justify-center">
        <div className="h-6 w-6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function TrustScorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Fetch trust score data
  const { data, isLoading, error } = useQuery({
    queryKey: ["trustScoreList", currentPage, pageSize, searchQuery],
    queryFn: () =>
      trustScoreService.getTrustScoreList({
        page: currentPage,
        page_size: pageSize,
        search: searchQuery || undefined,
      }),
  });

  const members = data?.members || [];
  const stats = data?.stats;
  const distribution = data?.distribution || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };

  // Handle individual select
  const handleSelect = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
    <AdminLayout title="Trust Score">
      <div className="space-y-6 px-6">
        {/* Header */}
        <p className="text-[#6B7280] text-sm">
          Monitor and manage user creditworthiness
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="Average Trust Score"
            value={stats?.averageTrustScore?.toFixed(1) || 0}
            change={12.5}
            isLoading={isLoading}
          />
          <StatCard
            label="High Trust (80+)"
            value={stats?.highTrustCount || 0}
            change={12.5}
            isLoading={isLoading}
          />
          <StatCard
            label="Medium Risk (41-60)"
            value={stats?.mediumRiskCount || 0}
            change={12.5}
            isLoading={isLoading}
          />
          <StatCard
            label="High Risk (0-40)"
            value={stats?.highRiskCount || 0}
            change={12.5}
            isRisk
            isLoading={isLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-5">
          {/* Trust Score Distribution - Bar Chart */}
          <div className="bg-white rounded-xl p-6 border border-[#DADCE0]">
            <h3 className="text-base font-semibold text-[#121212] mb-6">
              Trust Score Distribution
            </h3>
            {isLoading ? (
              <div className="h-[320px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#008A48]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={distribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#008A48"
                    radius={[4, 4, 0, 0]}
                    barSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Average Score Trend - Line Chart */}
          <div className="bg-white rounded-xl p-6 border border-[#DADCE0]">
            <h3 className="text-base font-semibold text-[#121212] mb-6">
              Average Score Trend
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  domain={[0, 500]}
                  ticks={[0, 100, 200, 300, 400, 500]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#008A48"
                  strokeWidth={2}
                  dot={{ fill: "#008A48", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-[#DADCE0]">
          {/* Table Top Bar */}
          <div className="p-4 flex items-center justify-end gap-3 border-b border-[#E5E7EB]">
            {/* Search */}
            <div className="relative w-[396px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868C98]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-[#E2E4E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008A48] focus:border-transparent shadow-sm"
              />
            </div>

            {/* Filter */}
            <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E4E9] rounded-lg text-sm text-[#525866] hover:bg-[#F9FAFB] transition-colors shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
              Filter
            </button>

            {/* Sort by */}
            <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E4E9] rounded-lg text-sm text-[#525866] hover:bg-[#F9FAFB] transition-colors shadow-sm">
              <ArrowUpDown className="w-5 h-5" />
              Sort by
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Table Header */}
          <div className="bg-[#F6F8FA] rounded-lg mx-2 mt-2">
            <div className="flex items-center px-3 py-2">
              <div className="w-[300px] flex items-center gap-2.5 px-3">
                <input
                  type="checkbox"
                  checked={
                    selectedMembers.length === members.length &&
                    members.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-[#DADCE0] cursor-pointer"
                />
                <span className="text-sm text-[#525866] flex items-center gap-0.5">
                  User Name
                  <ArrowUpDown className="w-4 h-4" />
                </span>
              </div>
              <div className="w-[200px] px-3">
                <span className="text-sm text-[#525866] flex items-center gap-0.5">
                  Trust Score
                  <ArrowUpDown className="w-4 h-4" />
                </span>
              </div>
              <div className="w-[120px] px-3">
                <span className="text-sm text-[#525866] flex items-center gap-0.5">
                  Active Ajo
                  <ArrowUpDown className="w-4 h-4" />
                </span>
              </div>
              <div className="w-[260px] px-3">
                <span className="text-sm text-[#525866] flex items-center gap-0.5">
                  Issues
                  <ArrowUpDown className="w-4 h-4" />
                </span>
              </div>
              <div className="w-[120px] px-3">
                <span className="text-sm text-[#525866] flex items-center gap-0.5">
                  Status
                  <ArrowUpDown className="w-4 h-4" />
                </span>
              </div>
              <div className="w-[98px] px-3">
                <span className="text-sm text-[#525866] flex items-center gap-0.5">
                  Action
                  <ArrowUpDown className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#E2E4E9]">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))
            ) : error ? (
              // Error state
              <div className="p-8 text-center text-red-500">
                Failed to load trust score data. Please try again.
              </div>
            ) : members.length === 0 ? (
              // Empty state
              <div className="p-8 text-center text-gray-500">
                No users found matching your criteria.
              </div>
            ) : (
              // Data rows
              members.map((member: TrustScoreMember) => (
                <div
                  key={member.id}
                  className="flex items-center px-3 py-4 hover:bg-[#F9FAFB] cursor-pointer"
                  onClick={() => router.push(`/trust-score/${member.id}`)}
                >
                  {/* User Name */}
                  <div className="w-[300px] flex items-center gap-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleSelect(member.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-[#DADCE0] cursor-pointer"
                    />
                    <div className="w-10 h-10 rounded-full bg-[#FBDFB1] flex items-center justify-center overflow-hidden">
                      <span className="text-sm font-medium text-[#92400E]">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#121212]">
                        {member.name}
                      </p>
                      <p className="text-xs text-[#505258]">{member.email}</p>
                    </div>
                  </div>

                  {/* Trust Score */}
                  <div className="w-[200px] px-3">
                    <TrustScoreBar score={member.trustScore} />
                  </div>

                  {/* Active Ajo */}
                  <div className="w-[120px] px-6">
                    <span className="text-xs text-[#505258]">
                      {member.activeAjo}
                    </span>
                  </div>

                  {/* Issues */}
                  <div className="w-[260px] px-3">
                    <p className="text-xs text-[#505258] truncate">
                      {member.issues.length > 0 ? member.issues.join(", ") : "-"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="w-[120px] px-3">
                    <StatusBadge status={member.status} />
                  </div>

                  {/* Action */}
                  <div className="w-[98px] px-3 flex justify-center">
                    <button
                      className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-5 h-5 text-[#6B7280]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Showing {members.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
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
        </div>
      </div>
    </AdminLayout>
  );
}
