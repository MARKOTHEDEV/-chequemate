"use client";

import { AdminLayout } from "@/components/layout";
import { Users, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import dashboardService, {
  DashboardData,
  AjoDistributionItem,
} from "@/services/dashboardService";

// Quick actions data (static)
const quickActions = [
  {
    label: "Review Pending KYC",
    countKey: "pendingKycReviews" as const,
    description: "Requires immediate attention",
    bgColor: "bg-[#F3FBFF]",
    borderColor: "border-[#C8EEFF]",
    textColor: "text-[#08425C]",
    descColor: "text-[#38BDF8]",
  },
  {
    label: "Process Offline Migrations",
    count: 12,
    description: "Waiting for approval",
    bgColor: "bg-[#FFEFE5]",
    borderColor: "border-[#FFE3D0]",
    textColor: "text-[#8E2900]",
    descColor: "text-[#FB4E00]",
  },
  {
    label: "Resolve Defaults",
    countKey: "defaultsThisMonth" as const,
    description: "Action required",
    bgColor: "bg-[#FEF2F3]",
    borderColor: "border-[#FEE2E4]",
    textColor: "text-[#7F1D24]",
    descColor: "text-[#EF3E4A]",
  },
  {
    label: "Release SDF",
    count: 8,
    description: "Completed Ajo ready",
    bgColor: "bg-[#F0FCF5]",
    borderColor: "border-[#DDF6E7]",
    textColor: "text-[#082D21]",
    descColor: "text-[#2DBB7F]",
  },
];

// Format currency
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₦${(value / 1000).toFixed(0)}K`;
  }
  return `₦${value}`;
};

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboardData"],
    queryFn: () => dashboardService.getDashboardData(),
  });

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load dashboard data</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#008A48] hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { stats, revenueTrend, ajoDistribution, defaultsChart, recentActivity } =
    data!;

  // Build stat cards from API data
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: stats.changes?.totalUsers || "+12.5%",
    },
    {
      label: "Active Ajo",
      value: stats.activeAjos.toLocaleString(),
      change: stats.changes?.activeAjos || "+12.5%",
    },
    {
      label: "Funds in Circulation",
      value: formatCurrency(stats.fundsInCirculation),
      change: stats.changes?.fundsInCirculation || "+12.5%",
    },
    {
      label: "Security Deposit Pool",
      value: formatCurrency(stats.securityDepositPool),
      change: stats.changes?.securityDepositPool || "+12.5%",
    },
    {
      label: "Defaults (This Month)",
      value: stats.defaultsThisMonth.toString(),
      change: stats.changes?.defaultsThisMonth || "+12.5%",
    },
    {
      label: "Revenue Earned",
      value: formatCurrency(stats.revenueEarned),
      change: stats.changes?.revenueEarned || "+12.5%",
    },
    {
      label: "Average Trust Score",
      value: stats.avgTrustScore.toFixed(1),
      suffix: "/100",
      change: stats.changes?.avgTrustScore || "+12.5%",
    },
    {
      label: "Pending KYC Reviews",
      value: stats.pendingKycReviews.toString(),
      change: stats.changes?.pendingKycReviews || "+12.5%",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-10">
        {/* Page Header */}
        <p className="text-[#6F7278] text-base -tracking-[0.32px]">
          Real-time health overview of Chequemate
        </p>

        {/* Stat Cards */}
        <div className="flex flex-col gap-6">
          {/* Row 1 */}
          <div className="flex gap-3">
            {statCards.slice(0, 4).map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
          {/* Row 2 */}
          <div className="flex gap-3">
            {statCards.slice(4, 8).map((stat, index) => (
              <StatCard key={index + 4} {...stat} />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col gap-[38px]">
          {/* Revenue Trend & Ajo Status Distribution */}
          <div className="flex gap-[18px]">
            {/* Revenue Trend Chart */}
            <div className="w-[550px] h-[453px] bg-white rounded-xl border border-[#DADCE0] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#121212] -tracking-[0.36px]">
                  Revenue Trend
                </h3>
                <p className="text-sm font-medium text-[#3A3B40] -tracking-[0.28px]">
                  Monthly revenue overview (₦)
                </p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6F7278", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#505258", fontSize: 12 }}
                      tickFormatter={(value) =>
                        value >= 1000000
                          ? `${value / 1000000}M`
                          : `${value / 1000}k`
                      }
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#E6F5ED] border border-[#C1E7D6] rounded-lg px-3 py-2 shadow-lg">
                              <p className="text-xs font-bold text-[#121212]">
                                {label} Revenue
                              </p>
                              <p className="text-[10px] font-medium text-[#121212]">
                                ₦{Number(payload[0].value).toLocaleString()}.00
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#008A48"
                      strokeWidth={2}
                      dot={{ fill: "#008A48", strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: "#008A48" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ajo Status Distribution */}
            <div className="w-[550px] h-[453px] bg-white rounded-xl border border-[#DADCE0] p-6">
              <h3 className="text-lg font-bold text-[#121212] -tracking-[0.36px] mb-6">
                Ajo Status Distribution
              </h3>
              <div className="flex gap-[37px] items-start">
                {/* Donut Chart */}
                <div className="w-[300px] h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ajoDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={140}
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {ajoDistribution.map(
                          (entry: AjoDistributionItem, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center white circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] bg-white rounded-full" />
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-6 pt-8">
                  {ajoDistribution.map(
                    (item: AjoDistributionItem, index: number) => (
                      <div key={index} className="flex items-center gap-6">
                        <div
                          className="w-4 h-4 rounded-[2px]"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#121212] -tracking-[0.26px]">
                            {item.name}
                          </span>
                          <span className="text-xs font-medium text-[#8C9098] -tracking-[0.24px]">
                            {item.count} Ajo
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Defaults Chart */}
          <div className="flex gap-[18px]">
            {/* Quick Actions */}
            <div className="w-[550px] h-[453px] bg-white rounded-xl border border-[#DADCE0] p-8">
              <div className="flex flex-col gap-[22px]">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium text-[#121212] -tracking-[0.36px]">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-[#6A7282] -tracking-[0.28px]">
                    Common admin tasks
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {quickActions.map((action, index) => {
                    const count =
                      "countKey" in action && action.countKey
                        ? stats[action.countKey]
                        : action.count;
                    return (
                      <button
                        key={index}
                        className={`${action.bgColor} ${action.borderColor} border rounded-xl h-[69px] px-5 text-left transition-opacity hover:opacity-90`}
                      >
                        <p
                          className={`${action.textColor} text-base font-medium -tracking-[0.32px]`}
                        >
                          {action.label} ({count})
                        </p>
                        <p
                          className={`${action.descColor} text-xs font-medium -tracking-[0.24px] mt-1`}
                        >
                          {action.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Defaults of the Month */}
            <div className="w-[550px] h-[453px] bg-white rounded-xl border border-[#DADCE0] p-6">
              <h3 className="text-lg font-bold text-[#121212] -tracking-[0.36px] mb-6">
                Defaults of the month
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defaultsChart} barSize={48}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={true}
                    />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6F7278", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#505258", fontSize: 12 }}
                      domain={[0, 70]}
                      ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
                    />
                    <Tooltip
                      formatter={(value) => [value, "Defaults"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="defaults"
                      fill="#008A48"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="bg-white rounded-[10px] border border-[#DADCE0] p-8">
            <div className="flex flex-col gap-[25px]">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium text-[#121212] -tracking-[0.36px]">
                  Recent System Activity
                </h3>
                <p className="text-sm text-[#6F7278] -tracking-[0.28px]">
                  Last 24 hours
                </p>
              </div>
              <div className="flex flex-col gap-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-6">
                    <div className="w-2 h-2 rounded-full bg-[#008A48]" />
                    <div className="flex-1 flex items-center justify-between">
                      <p className="text-base font-medium text-[#121212] -tracking-[0.32px]">
                        {activity.action}
                      </p>
                      <p className="text-sm text-[#6F7278] -tracking-[0.28px]">
                        {activity.actor} &bull; {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  suffix,
  change,
}: {
  label: string;
  value: string;
  suffix?: string;
  change: string;
}) {
  return (
    <div className="w-[269px] h-[200px] bg-white rounded-xl border border-[#DADCE0] p-6">
      <div className="flex flex-col gap-8">
        {/* Icon and Change Badge */}
        <div className="flex items-center gap-[15px]">
          <div className="w-12 h-12 bg-[#E6F5ED] rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-[#008A48]" />
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-[#008A48]" />
            <span className="text-[13px] text-[#008A48] -tracking-[0.26px]">
              {change}
            </span>
          </div>
        </div>
        {/* Label and Value */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#6F7278] -tracking-[0.28px]">{label}</p>
          <p className="text-2xl font-bold text-[#121212] -tracking-[0.48px]">
            {value}
            {suffix && <span className="text-base font-medium">{suffix}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

// Skeleton loading component
function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="h-5 w-80 bg-gray-200 rounded" />

      {/* Stat cards skeleton */}
      <div className="flex flex-col gap-6">
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[269px] h-[200px] bg-gray-100 rounded-xl"
            />
          ))}
        </div>
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[269px] h-[200px] bg-gray-100 rounded-xl"
            />
          ))}
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="flex flex-col gap-[38px]">
        <div className="flex gap-[18px]">
          <div className="w-[550px] h-[453px] bg-gray-100 rounded-xl" />
          <div className="w-[550px] h-[453px] bg-gray-100 rounded-xl" />
        </div>
        <div className="flex gap-[18px]">
          <div className="w-[550px] h-[453px] bg-gray-100 rounded-xl" />
          <div className="w-[550px] h-[453px] bg-gray-100 rounded-xl" />
        </div>
        <div className="h-[337px] bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
