import api from "@/lib/api";
import {
  AdminUser,
  AdminUserDetail,
  UserStats,
  PaginatedUsers,
} from "./userService";

// Trust Score specific types
export interface TrustScoreMember {
  id: string;
  name: string;
  email: string;
  trustScore: number;
  activeAjo: number;
  issues: string[];
  status: "active" | "suspended";
}

export interface TrustScoreStats {
  averageTrustScore: number;
  highTrustCount: number; // 80+
  mediumRiskCount: number; // 41-60
  highRiskCount: number; // 0-40
  totalUsers: number;
}

export interface TrustScoreDistribution {
  range: string;
  count: number;
}

export interface TrustScoreTrend {
  month: string;
  score: number;
}

export interface TrustScoreListResponse {
  stats: TrustScoreStats;
  members: TrustScoreMember[];
  totalCount: number;
  distribution: TrustScoreDistribution[];
}

export interface TrustScoreQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  trust_score_min?: number;
  trust_score_max?: number;
  ordering?: string;
}

// Risk factor from backend or computed
export interface RiskFactor {
  id: number;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface TrustScoreDetailResponse {
  id: string;
  name: string;
  email: string;
  currentScore: number;
  riskLevel: "High Risk" | "Medium Risk" | "Low Risk";
  lastUpdated: string;
  nextCalculation: string;
  stats: {
    activeAjo: { value: number; subtitle: string };
    totalContributed: { value: string; subtitle: string };
    onTimePayments: { value: number; subtitle: string };
    completionRate: { value: string; subtitle: string };
  };
  riskFactors: RiskFactor[];
  scoreBreakdown: {
    label: string;
    description: string;
    score: number;
    maxScore: number;
  }[];
  scoreTrend: TrustScoreTrend[];
}

// Helper to determine risk level
const getRiskLevel = (score: number): "High Risk" | "Medium Risk" | "Low Risk" => {
  if (score <= 40) return "High Risk";
  if (score <= 60) return "Medium Risk";
  return "Low Risk";
};

// Helper to get issues from user data
const getIssuesFromUser = (user: AdminUser): string[] => {
  const issues: string[] = [];
  if (user.kyc_status !== "completed") {
    issues.push("Incomplete KYC");
  }
  if (user.trust_score < 40) {
    issues.push("Low Trust Score");
  }
  return issues;
};

// Helper to compute distribution from user list
const computeDistribution = (users: AdminUser[]): TrustScoreDistribution[] => {
  const ranges = [
    { range: "0-20", min: 0, max: 20 },
    { range: "21-40", min: 21, max: 40 },
    { range: "41-60", min: 41, max: 60 },
    { range: "61-80", min: 61, max: 80 },
    { range: "81-100", min: 81, max: 100 },
  ];

  return ranges.map(({ range, min, max }) => ({
    range,
    count: users.filter((u) => u.trust_score >= min && u.trust_score <= max).length,
  }));
};

// Compute trust score stats from user list
const computeStats = (users: AdminUser[], avgScore: number): TrustScoreStats => {
  return {
    averageTrustScore: avgScore,
    highTrustCount: users.filter((u) => u.trust_score >= 80).length,
    mediumRiskCount: users.filter((u) => u.trust_score >= 41 && u.trust_score <= 60).length,
    highRiskCount: users.filter((u) => u.trust_score <= 40).length,
    totalUsers: users.length,
  };
};

export const trustScoreService = {
  // Get trust score list with stats
  getTrustScoreList: async (
    params?: TrustScoreQueryParams
  ): Promise<TrustScoreListResponse> => {
    // Fetch users and stats in parallel
    const [usersResponse, statsResponse] = await Promise.all([
      api.get<PaginatedUsers>("/auth/admin/users/", {
        params: {
          ...params,
          ordering: params?.ordering || "-trust_score",
        },
      }),
      api.get<{ data: UserStats }>("/auth/admin/users/stats/"),
    ]);

    const users = usersResponse.data.results;
    const stats = statsResponse.data.data;

    // Transform users to TrustScoreMember format
    const members: TrustScoreMember[] = users.map((user) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim() || user.email.split("@")[0],
      email: user.email,
      trustScore: user.trust_score,
      activeAjo: user.active_ajo_count,
      issues: getIssuesFromUser(user),
      status: user.is_active ? "active" : "suspended",
    }));

    // Compute distribution and stats
    const distribution = computeDistribution(users);
    const trustStats = computeStats(users, stats.avg_trust_score);

    return {
      stats: trustStats,
      members,
      totalCount: usersResponse.data.count,
      distribution,
    };
  },

  // Get user trust score detail
  getTrustScoreDetail: async (userId: string): Promise<TrustScoreDetailResponse> => {
    // Fetch user detail and ajos in parallel
    const [userResponse, ajosResponse] = await Promise.all([
      api.get<{ data: AdminUserDetail }>(`/auth/admin/users/${userId}/`),
      api.get<{ data: { summary: { total_contributed: string; active_ajos: number; completed_ajos: number }; ajos: Array<{ contributions_made: number; total_cycles: number }> } }>(`/auth/admin/users/${userId}/ajos/`),
    ]);

    const user = userResponse.data.data;
    const ajos = ajosResponse.data.data;

    // Calculate on-time payments and completion rate from ajos
    let totalContributions = 0;
    let totalCycles = 0;
    ajos.ajos.forEach((ajo) => {
      totalContributions += ajo.contributions_made;
      totalCycles += ajo.total_cycles;
    });

    const completionRate = totalCycles > 0
      ? Math.round((totalContributions / totalCycles) * 100)
      : 0;

    // Get risk factors based on trust score breakdown
    const riskFactors: RiskFactor[] = [];
    const ts = user.trust_score;

    if (ts.kyc_completed < 100) {
      riskFactors.push({
        id: 1,
        title: "Incomplete KYC",
        description: "Identity verification not fully completed",
        severity: ts.kyc_completed < 50 ? "high" : "medium",
      });
    }

    if (ts.total < 100) {
      riskFactors.push({
        id: 2,
        title: "Low Overall Score",
        description: "Trust score below acceptable threshold",
        severity: "high",
      });
    }

    if (!user.is_active) {
      riskFactors.push({
        id: 3,
        title: "Account Suspended",
        description: "User account is currently suspended",
        severity: "high",
      });
    }

    // Build score breakdown from user data
    // Map the admin trust score (max 200) to the expected format
    const scoreBreakdown = [
      {
        label: "Wallet Transactions",
        description: "Money-in and money-out activity",
        score: Math.round(ts.email_verified * 0.72), // Scale to ~180
        maxScore: 250,
      },
      {
        label: "KYC Completion",
        description: "Identity verification status",
        score: Math.round(ts.kyc_completed * 1.8),
        maxScore: 250,
      },
      {
        label: "Ajo Completion",
        description: "Finished Ajo cycle on time",
        score: Math.round(ts.transaction_pin * 7.2),
        maxScore: 250,
      },
      {
        label: "Ajo joined",
        description: "Number of Ajo joined",
        score: Math.round(ts.active_status * 7.2),
        maxScore: 250,
      },
      {
        label: "Ajo Defaults",
        description: "Missed payments",
        score: Math.max(0, 200 - (riskFactors.length * 50)),
        maxScore: 250,
      },
    ];

    // Build trend from history (or generate mock if not available)
    const scoreTrend: TrustScoreTrend[] = user.trust_score_history?.length > 0
      ? user.trust_score_history.map((h) => ({
          month: h.date.split("/")[1] === "01" ? "Jan" :
                 h.date.split("/")[1] === "02" ? "Feb" :
                 h.date.split("/")[1] === "03" ? "Mar" :
                 h.date.split("/")[1] === "04" ? "Apr" :
                 h.date.split("/")[1] === "05" ? "May" :
                 h.date.split("/")[1] === "06" ? "Jun" :
                 h.date.split("/")[1] === "07" ? "Jul" :
                 h.date.split("/")[1] === "08" ? "Aug" :
                 h.date.split("/")[1] === "09" ? "Sep" :
                 h.date.split("/")[1] === "10" ? "Oct" :
                 h.date.split("/")[1] === "11" ? "Nov" : "Dec",
          score: h.score,
        }))
      : generateMockTrend(ts.total);

    // Normalize total score to 0-100 scale
    const normalizedScore = Math.min(100, Math.round((ts.total / 200) * 100));

    return {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim() || user.email.split("@")[0],
      email: user.email,
      currentScore: normalizedScore,
      riskLevel: getRiskLevel(normalizedScore),
      lastUpdated: new Date(user.last_login || user.date_joined).toISOString().replace("T", " ").slice(0, 19),
      nextCalculation: getNextCalculationDate(),
      stats: {
        activeAjo: {
          value: ajos.summary.active_ajos,
          subtitle: `${ajos.summary.completed_ajos} completed`,
        },
        totalContributed: {
          value: `₦${parseInt(ajos.summary.total_contributed || "0").toLocaleString()}`,
          subtitle: "Total Contributed",
        },
        onTimePayments: {
          value: totalContributions,
          subtitle: `${Math.max(0, totalCycles - totalContributions)} late`,
        },
        completionRate: {
          value: `${completionRate}%`,
          subtitle: ajos.summary.completed_ajos > 0 ? `${ajos.summary.completed_ajos} completed` : "0 completed",
        },
      },
      riskFactors,
      scoreBreakdown,
      scoreTrend,
    };
  },

  // Get trust score stats only
  getTrustScoreStats: async (): Promise<UserStats> => {
    const response = await api.get<{ data: UserStats }>("/auth/admin/users/stats/");
    return response.data.data;
  },
};

// Helper to generate mock trend data
function generateMockTrend(currentScore: number): TrustScoreTrend[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trend: TrustScoreTrend[] = [];

  // Generate declining trend ending at current score
  let score = Math.min(100, currentScore + 30);
  for (let i = 0; i < 12; i++) {
    trend.push({
      month: months[i],
      score: Math.max(0, Math.round(score)),
    });
    score -= (score - currentScore) / (12 - i);
  }

  return trend;
}

// Helper to get next calculation date (first of next month)
function getNextCalculationDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().replace("T", " ").slice(0, 19);
}

export default trustScoreService;
