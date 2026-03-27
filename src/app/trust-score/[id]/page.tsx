"use client";

import { AdminLayout } from "@/components/layout";
import { ArrowLeft, FileText, ShieldAlert, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { trustScoreService } from "@/services/trustScoreService";

// Stat Card Component - matching design exactly
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  isLoading = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-white border border-[#DADCE0] rounded-xl h-[220px] p-6 flex flex-col">
      <div className="w-12 h-12 rounded-lg bg-[#E6F5ED] flex items-center justify-center mb-8">
        {Icon}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#6F7278] tracking-tight">{label}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-bold text-[#121212] tracking-tight">{value}</p>
        )}
      </div>
      {isLoading ? (
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mt-4" />
      ) : (
        <p className="text-sm text-[#6F7278] tracking-tight mt-4">{subtitle}</p>
      )}
    </div>
  );
}

// Severity Badge Component
function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-[#EF3E4A] text-white",
    medium: "bg-[#FB4E00] text-white",
    low: "bg-green-500 text-white",
  };

  const labels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-normal ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

// Score Breakdown Item Component
function ScoreBreakdownItem({
  label,
  description,
  score,
  maxScore,
  isLoading = false,
}: {
  label: string;
  description: string;
  score: number;
  maxScore: number;
  isLoading?: boolean;
}) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#008A48] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-bold text-[#121212] tracking-tight">{label}</p>
            <p className="text-[13px] text-[#6F7278] tracking-tight">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {isLoading ? (
            <>
              <div className="h-5 w-12 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-10 bg-gray-200 animate-pulse rounded" />
            </>
          ) : (
            <>
              <p className="text-base font-medium text-[#121212] tracking-tight">+ {score}</p>
              <p className="text-xs font-medium text-[#6F7278] tracking-tight">of {maxScore}</p>
            </>
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-[#C1E7D6] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="h-full w-1/3 bg-gray-300 animate-pulse rounded-lg" />
        ) : (
          <div
            className="h-full bg-[#008A48] rounded-lg transition-all"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}

// Loading skeleton for the page
function PageSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-5 w-48 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Banner skeleton */}
      <div className="h-[120px] bg-gray-100 rounded-[10px] mb-10" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[220px] bg-gray-100 rounded-xl" />
        ))}
      </div>

      {/* Risk factors skeleton */}
      <div className="h-[200px] bg-gray-100 rounded-[10px] mb-10" />

      {/* Chart skeleton */}
      <div className="h-[342px] bg-gray-100 rounded-[10px] mb-10" />

      {/* Score breakdown skeleton */}
      <div className="h-[400px] bg-gray-100 rounded-md" />
    </div>
  );
}

export default function TrustScoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // Fetch trust score detail
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["trustScoreDetail", userId],
    queryFn: () => trustScoreService.getTrustScoreDetail(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <AdminLayout title="Trust Score">
        <PageSkeleton />
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout title="Trust Score">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#121212]" />
            </button>
            <p className="text-sm font-medium text-[#121212] tracking-tight">
              Trust Score Details
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 font-medium">Failed to load user trust score data.</p>
            <p className="text-red-500 text-sm mt-2">Please try again or contact support.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const isScoreDecreasing = user.scoreTrend.length >= 2 &&
    user.scoreTrend[user.scoreTrend.length - 1].score < user.scoreTrend[0].score;

  return (
    <AdminLayout title="Trust Score">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#121212]" />
            </button>
            <p className="text-sm font-medium text-[#121212] tracking-tight">
              {user.name} Trust Score
            </p>
          </div>
          <button className="flex items-center gap-1 px-4 py-3 bg-[#008A48] text-white rounded-lg hover:bg-[#007a40] transition-colors shadow-sm">
            <span className="text-sm font-medium">Export Report</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-10">
          {/* Trust Score Banner */}
          <div className={`${
            user.riskLevel === "High Risk" ? "bg-[#FEF2F3] border-[#FECACE]" :
            user.riskLevel === "Medium Risk" ? "bg-[#FEF3C7] border-[#FCD34D]" :
            "bg-[#DCFCE7] border-[#86EFAC]"
          } border rounded-[10px] h-[120px] flex items-center justify-between px-6`}>
            <div className="flex items-center gap-4">
              {/* Shield Icon */}
              <div className="w-12 h-12 flex items-center justify-center">
                <ShieldAlert className={`w-12 h-12 ${
                  user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                  user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                  "text-[#22C55E]"
                }`} />
              </div>
              <div className="flex flex-col gap-1">
                <p className={`text-sm font-medium tracking-tight ${
                  user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                  user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                  "text-[#22C55E]"
                }`}>
                  Current Trust Score
                </p>
                <div className="flex items-center gap-3">
                  <span className={`text-5xl font-medium ${
                    user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                    user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                    "text-[#22C55E]"
                  }`}>{user.currentScore}</span>
                  <div className="flex items-center gap-1">
                    {isScoreDecreasing ? (
                      <TrendingDown className={`w-5 h-5 ${
                        user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                        user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                        "text-[#22C55E]"
                      }`} />
                    ) : (
                      <TrendingUp className={`w-5 h-5 ${
                        user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                        user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                        "text-[#22C55E]"
                      }`} />
                    )}
                    <span className={`text-[13px] font-medium tracking-tight ${
                      user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                      user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                      "text-[#22C55E]"
                    }`}>
                      {isScoreDecreasing ? "-" : "+"}
                      {Math.abs(
                        user.scoreTrend.length >= 2
                          ? user.scoreTrend[user.scoreTrend.length - 1].score - user.scoreTrend[user.scoreTrend.length - 2].score
                          : 0
                      )} from last month
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className={`${
                user.riskLevel === "High Risk" ? "bg-[#FEF2F3] border-[#FECACE]" :
                user.riskLevel === "Medium Risk" ? "bg-[#FEF3C7] border-[#FCD34D]" :
                "bg-[#DCFCE7] border-[#86EFAC]"
              } border rounded-[10px] px-3 py-1.5`}>
                <p className={`text-sm font-medium ${
                  user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                  user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                  "text-[#22C55E]"
                }`}>{user.riskLevel}</p>
              </div>
              <div className={`flex flex-col items-end gap-1 text-xs font-medium tracking-tight ${
                user.riskLevel === "High Risk" ? "text-[#EF3E4A]" :
                user.riskLevel === "Medium Risk" ? "text-[#F59E0B]" :
                "text-[#22C55E]"
              }`}>
                <p>Last Updated: {user.lastUpdated}</p>
                <p>Next Calculation: {user.nextCalculation}</p>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              icon={
                <svg className="w-6 h-6 text-[#008A48]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              }
              label="Active Ajo"
              value={user.stats.activeAjo.value}
              subtitle={user.stats.activeAjo.subtitle}
            />
            <StatCard
              icon={
                <svg className="w-6 h-6 text-[#008A48]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12M9 10h6M9 14h6" />
                </svg>
              }
              label="Total Contributed"
              value={user.stats.totalContributed.value}
              subtitle={user.stats.totalContributed.subtitle}
            />
            <StatCard
              icon={
                <svg className="w-6 h-6 text-[#008A48]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              }
              label="On-Time Payments"
              value={user.stats.onTimePayments.value}
              subtitle={user.stats.onTimePayments.subtitle}
            />
            <StatCard
              icon={
                <svg className="w-6 h-6 text-[#008A48]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              }
              label="Completion Rate"
              value={user.stats.completionRate.value}
              subtitle={user.stats.completionRate.subtitle}
            />
          </div>

          {/* Risk Factors Section */}
          {user.riskFactors.length > 0 && (
            <div className="bg-[#FEF2F3] border border-[#FECACE] rounded-[10px] p-6">
              <div className="flex gap-10">
                {/* Warning Icon */}
                <div className="shrink-0">
                  <svg className="w-5 h-5 text-[#EF3E4A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex flex-col gap-8">
                  <h2 className="text-lg font-bold text-[#EF3E4A] tracking-tight">Risk Factors</h2>
                  <div className="flex flex-col gap-6">
                    {user.riskFactors.map((factor) => (
                      <div key={factor.id} className="flex items-start gap-2">
                        <SeverityBadge severity={factor.severity} />
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-[#EF3E4A] tracking-tight">
                            {factor.title}
                          </p>
                          <p className="text-xs text-[#EF3E4A] tracking-tight">
                            {factor.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 12-Month Score Trend */}
          <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
            <h2 className="text-lg font-semibold text-[#101828] mb-6">12 - Month Score Trend</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={user.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6F7278", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#EF3E4A"
                    strokeWidth={2}
                    dot={{ fill: "#EF3E4A", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#EF3E4A" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white border border-[#E6E8EC] rounded-md p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-[#121212] tracking-tight mb-10">Score Breakdown</h2>
            <div className="flex flex-col gap-6">
              {user.scoreBreakdown.map((item, index) => (
                <ScoreBreakdownItem
                  key={index}
                  label={item.label}
                  description={item.description}
                  score={item.score}
                  maxScore={item.maxScore}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
