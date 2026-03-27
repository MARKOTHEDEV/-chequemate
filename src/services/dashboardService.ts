import api from "@/lib/api";
import { UserStats } from "./userService";
import { AjoStats } from "./ajoService";
import { TransactionStats } from "./transactionService";

// Dashboard specific types
export interface DashboardStats {
  totalUsers: number;
  activeAjos: number;
  fundsInCirculation: number;
  securityDepositPool: number;
  defaultsThisMonth: number;
  revenueEarned: number;
  avgTrustScore: number;
  pendingKycReviews: number;
  // Change percentages (optional - may come from backend or be calculated)
  changes?: {
    totalUsers?: string;
    activeAjos?: string;
    fundsInCirculation?: string;
    securityDepositPool?: string;
    defaultsThisMonth?: string;
    revenueEarned?: string;
    avgTrustScore?: string;
    pendingKycReviews?: string;
  };
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
}

export interface AjoDistributionItem {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface DefaultsChartItem {
  week: string;
  defaults: number;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  actor: string;
  time: string;
  timestamp: string;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueTrend: RevenueTrendItem[];
  ajoDistribution: AjoDistributionItem[];
  defaultsChart: DefaultsChartItem[];
  recentActivity: ActivityLogItem[];
}

// API Endpoints
const DASHBOARD_ENDPOINTS = {
  stats: "/auth/admin/dashboard/stats/",
  revenueTrend: "/auth/admin/dashboard/revenue-trend/",
  ajoDistribution: "/auth/admin/dashboard/ajo-distribution/",
  defaults: "/auth/admin/dashboard/defaults/",
  activity: "/auth/admin/dashboard/activity/",
};

// Helper to format relative time
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// Helper to get month name
const getMonthName = (monthIndex: number): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[monthIndex];
};

export const dashboardService = {
  // Get all dashboard data by aggregating from multiple endpoints
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      // Try to fetch from dedicated dashboard endpoint first
      const response = await api.get(DASHBOARD_ENDPOINTS.stats);
      return response.data.data;
    } catch {
      // Fallback: aggregate from individual endpoints
      return dashboardService.getAggregatedDashboardData();
    }
  },

  // Aggregated dashboard data from multiple endpoints
  getAggregatedDashboardData: async (): Promise<DashboardData> => {
    // Fetch all stats in parallel
    const [userStatsRes, ajoStatsRes, txStatsRes] = await Promise.all([
      api.get<{ data: UserStats }>("/auth/admin/users/stats/"),
      api.get<{ data: AjoStats }>("/auth/admin/ajos/stats/"),
      api.get<{ data: TransactionStats }>("/auth/admin/transactions/stats/"),
    ]);

    const userStats = userStatsRes.data.data;
    const ajoStats = ajoStatsRes.data.data;
    const txStats = txStatsRes.data.data;

    // Calculate pending KYC reviews
    const pendingKycReviews =
      (userStats.users_by_kyc_status?.pending || 0) +
      (userStats.users_by_kyc_status?.id_submitted || 0);

    // Build stats object
    const stats: DashboardStats = {
      totalUsers: userStats.total_users,
      activeAjos: ajoStats.active_ajos,
      fundsInCirculation: txStats.float_balance || 0,
      securityDepositPool: 0, // Will be populated if endpoint exists
      defaultsThisMonth: userStats.defaulted_users || ajoStats.at_risk_ajos || 0,
      revenueEarned: txStats.successful_this_month || 0,
      avgTrustScore: userStats.avg_trust_score,
      pendingKycReviews,
      changes: {
        totalUsers: "+12.5%",
        activeAjos: "+12.5%",
        fundsInCirculation: "+12.5%",
        securityDepositPool: "+12.5%",
        defaultsThisMonth: "+12.5%",
        revenueEarned: "+12.5%",
        avgTrustScore: "+12.5%",
        pendingKycReviews: "+12.5%",
      },
    };

    // Generate revenue trend (mock for now, replace with real endpoint when available)
    const revenueTrend = generateRevenueTrend();

    // Generate ajo distribution from stats
    const totalAjos = ajoStats.total_ajos || 1;
    const ajoDistribution: AjoDistributionItem[] = [
      {
        name: "Active",
        value: Math.round((ajoStats.active_ajos / totalAjos) * 100),
        count: ajoStats.active_ajos,
        color: "#35D49A",
      },
      {
        name: "Completed",
        value: Math.round((ajoStats.completed_ajos / totalAjos) * 100),
        count: ajoStats.completed_ajos,
        color: "#38BDF8",
      },
      {
        name: "Defaulted",
        value: Math.round((ajoStats.at_risk_ajos / totalAjos) * 100),
        count: ajoStats.at_risk_ajos,
        color: "#EF3E4A",
      },
    ];

    // Generate defaults chart (mock for now)
    const defaultsChart = generateDefaultsChart();

    // Generate recent activity (mock for now, replace with real endpoint when available)
    const recentActivity = generateRecentActivity();

    return {
      stats,
      revenueTrend,
      ajoDistribution,
      defaultsChart,
      recentActivity,
    };
  },

  // Get dashboard stats only
  getStats: async (): Promise<DashboardStats> => {
    const data = await dashboardService.getDashboardData();
    return data.stats;
  },

  // Get revenue trend
  getRevenueTrend: async (): Promise<RevenueTrendItem[]> => {
    try {
      const response = await api.get(DASHBOARD_ENDPOINTS.revenueTrend);
      return response.data.data;
    } catch {
      return generateRevenueTrend();
    }
  },

  // Get ajo distribution
  getAjoDistribution: async (): Promise<AjoDistributionItem[]> => {
    try {
      const response = await api.get(DASHBOARD_ENDPOINTS.ajoDistribution);
      return response.data.data;
    } catch {
      const ajoStatsRes = await api.get<{ data: AjoStats }>("/auth/admin/ajos/stats/");
      const ajoStats = ajoStatsRes.data.data;
      const totalAjos = ajoStats.total_ajos || 1;

      return [
        {
          name: "Active",
          value: Math.round((ajoStats.active_ajos / totalAjos) * 100),
          count: ajoStats.active_ajos,
          color: "#35D49A",
        },
        {
          name: "Completed",
          value: Math.round((ajoStats.completed_ajos / totalAjos) * 100),
          count: ajoStats.completed_ajos,
          color: "#38BDF8",
        },
        {
          name: "Defaulted",
          value: Math.round((ajoStats.at_risk_ajos / totalAjos) * 100),
          count: ajoStats.at_risk_ajos,
          color: "#EF3E4A",
        },
      ];
    }
  },

  // Get defaults chart data
  getDefaultsChart: async (): Promise<DefaultsChartItem[]> => {
    try {
      const response = await api.get(DASHBOARD_ENDPOINTS.defaults);
      return response.data.data;
    } catch {
      return generateDefaultsChart();
    }
  },

  // Get recent activity
  getRecentActivity: async (): Promise<ActivityLogItem[]> => {
    try {
      const response = await api.get(DASHBOARD_ENDPOINTS.activity);
      return response.data.data.map((item: { id: string; action: string; actor_name: string; timestamp: string }) => ({
        id: item.id,
        action: item.action,
        actor: item.actor_name,
        time: formatRelativeTime(item.timestamp),
        timestamp: item.timestamp,
      }));
    } catch {
      return generateRecentActivity();
    }
  },
};

// Helper functions to generate mock data when endpoints are not available
function generateRevenueTrend(): RevenueTrendItem[] {
  const currentMonth = new Date().getMonth();
  const months: RevenueTrendItem[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    months.push({
      month: getMonthName(monthIndex),
      revenue: Math.floor(200000 + Math.random() * 800000),
    });
  }

  return months;
}

function generateDefaultsChart(): DefaultsChartItem[] {
  return [
    { week: "Week 1", defaults: Math.floor(20 + Math.random() * 50) },
    { week: "Week 2", defaults: Math.floor(20 + Math.random() * 50) },
    { week: "Week 3", defaults: Math.floor(20 + Math.random() * 50) },
    { week: "Week 4", defaults: Math.floor(20 + Math.random() * 50) },
    { week: "Week 5", defaults: Math.floor(20 + Math.random() * 50) },
  ];
}

function generateRecentActivity(): ActivityLogItem[] {
  const now = new Date();
  return [
    {
      id: "1",
      action: "Approved KYC for user #12458",
      actor: "Admin User",
      time: "2 min ago",
      timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
    },
    {
      id: "2",
      action: "Default detected on Ajo #AJ-2845",
      actor: "System",
      time: "15 min ago",
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
    {
      id: "3",
      action: "Released SDF of ₦450K for Ajo #AJ-2801",
      actor: "Finance Admin",
      time: "1 hour ago",
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
    },
    {
      id: "4",
      action: "Approved offline migration for 24 participants",
      actor: "Operations Admin",
      time: "2 hours ago",
      timestamp: new Date(now.getTime() - 120 * 60000).toISOString(),
    },
    {
      id: "5",
      action: "Flagged user #12234 for suspicious activity",
      actor: "Risk Admin",
      time: "3 hours ago",
      timestamp: new Date(now.getTime() - 180 * 60000).toISOString(),
    },
  ];
}

export default dashboardService;
