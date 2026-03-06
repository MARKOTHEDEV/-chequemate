"use client";

import { AdminLayout } from "@/components/layout";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService, {
  AdminUserDetail,
  UserTransaction,
  UserAjo,
  ActivityItem,
} from "@/services/userService";
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
  CircleEqual,
  Lock,
  RefreshCw,
  CheckCircle2,
  Loader2,
  AlertCircle,
  XCircle,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  UserPlus,
  MailCheck,
  ShieldCheck,
  IdCard,
  Camera,
  LogIn,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const tabs = [
  "Overview",
  "Ajo Participation",
  "Transactions",
  "KYC Details",
  "Activity Log",
];

// Helper functions
function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTrustScoreLabel(score: number) {
  if (score >= 150) return { label: "Excellent", color: "bg-[#DCFCE7] text-[#22C55E]" };
  if (score >= 100) return { label: "Good", color: "bg-[#FFE3D0] text-[#FB4E00]" };
  if (score >= 50) return { label: "Fair", color: "bg-[#FEF3C7] text-[#F59E0B]" };
  return { label: "Low", color: "bg-[#FEE2E2] text-[#EF4444]" };
}

function getKYCStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    completed: { label: "Approved", className: "bg-[#DCFCE7] text-[#22C55E] border-[#BBF7D0]" },
    id_verified: { label: "ID Verified", className: "bg-[#DBEAFE] text-[#3B82F6] border-[#BFDBFE]" },
    bvn_verified: { label: "BVN Verified", className: "bg-[#E0E7FF] text-[#6366F1] border-[#C7D2FE]" },
    id_submitted: { label: "Pending Review", className: "bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]" },
    pending: { label: "Not Started", className: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]" },
    rejected: { label: "Rejected", className: "bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]" },
    id_failed: { label: "Failed", className: "bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]" },
    bvn_failed: { label: "BVN Failed", className: "bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]" },
  };
  return statusConfig[status] || statusConfig.pending;
}

function getTransactionIcon(kind: string, direction: string) {
  if (direction === "CREDIT") return <ArrowDownLeft className="w-4 h-4 text-[#22C55E]" />;
  return <ArrowUpRight className="w-4 h-4 text-[#EF4444]" />;
}

function getActivityIcon(iconName: string) {
  const icons: Record<string, JSX.Element> = {
    "user-plus": <UserPlus className="w-4 h-4" />,
    "mail-check": <MailCheck className="w-4 h-4" />,
    "shield-check": <ShieldCheck className="w-4 h-4" />,
    "id-card": <IdCard className="w-4 h-4" />,
    "camera": <Camera className="w-4 h-4" />,
    "x-circle": <XCircle className="w-4 h-4" />,
    "lock": <Lock className="w-4 h-4" />,
    "credit-card": <CreditCard className="w-4 h-4" />,
    "arrow-up-right": <ArrowUpRight className="w-4 h-4" />,
    "users": <Users className="w-4 h-4" />,
    "log-in": <LogIn className="w-4 h-4" />,
  };
  return icons[iconName] || <Clock className="w-4 h-4" />;
}

// Tab Components
function OverviewTab({ user }: { user: AdminUserDetail }) {
  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Wallet Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-sm text-[#6B7280] mb-2">Total Deposits</p>
            <p className="text-2xl font-semibold text-[#22C55E]">
              {user.wallet_summary?.total_deposits || "₦0"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-sm text-[#6B7280] mb-2">Total Withdrawals</p>
            <p className="text-2xl font-semibold text-[#EF4444]">
              {user.wallet_summary?.total_withdrawals || "₦0"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-sm text-[#6B7280] mb-2">Current Balance</p>
            <p className="text-2xl font-semibold text-[#22C55E]">
              {user.wallet_summary?.current_balance || "₦0"}
            </p>
          </div>
        </div>
      </div>

      {/* Trust Score History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">Trust Score History</h3>
          <button className="flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors">
            <RefreshCw className="w-4 h-4" />
            Adjust Score
          </button>
        </div>
        <div className="bg-white flex flex-col overflow-hidden gap-[8px]">
          {user.trust_score_history?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-5 py-4 bg-[#F9FAFB] rounded-[10px]"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-sm font-semibold bg-[#FEF9C3] ${
                    item.score >= 75 ? "text-[#22C55E]" : item.score >= 70 ? "text-[#F59E0B]" : "text-[#EF4444]"
                  }`}
                >
                  {item.score}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{item.title}</p>
                  <p className="text-xs text-[#6B7280]">{item.date}</p>
                </div>
              </div>
              {item.is_current && (
                <span className="text-[12px] bg-[#E6F7FF] block py-[4px] px-[12px] rounded-[16px] font-medium text-[#0B648B]">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risk Flags */}
      <div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Risk Flags</h3>
        <div className="bg-[#F0FCF5] border-[1px] border-[#F0FCF5] rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#167954]" />
          <p className="text-sm text-[#167954]">
            No active risk flags. User in good standing.
          </p>
        </div>
      </div>
    </div>
  );
}

function AjoParticipationTab({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["userAjos", userId],
    queryFn: () => userService.getUserAjos(userId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load Ajo participation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280] mb-1">Total Ajos</p>
          <p className="text-xl font-semibold text-[#1A1A1A]">{data?.summary.total_ajos || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280] mb-1">Active</p>
          <p className="text-xl font-semibold text-[#22C55E]">{data?.summary.active_ajos || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280] mb-1">Completed</p>
          <p className="text-xl font-semibold text-[#3B82F6]">{data?.summary.completed_ajos || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280] mb-1">Contributed</p>
          <p className="text-xl font-semibold text-[#1A1A1A]">{data?.summary.total_contributed}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280] mb-1">Received</p>
          <p className="text-xl font-semibold text-[#22C55E]">{data?.summary.total_received}</p>
        </div>
      </div>

      {/* Ajo List */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F6F8FA]">
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Ajo Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Slot</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Contribution</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Frequency</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Progress</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data?.ajos?.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[#6B7280]">
                  No Ajo participation found
                </td>
              </tr>
            ) : (
              data?.ajos?.map((ajo) => (
                <tr key={ajo.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-[#1A1A1A]">{ajo.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        ajo.status === "active"
                          ? "bg-[#DCFCE7] text-[#22C55E]"
                          : ajo.status === "completed"
                            ? "bg-[#DBEAFE] text-[#3B82F6]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {ajo.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#6B7280]">#{ajo.slot_number || "TBD"}</td>
                  <td className="py-4 px-4 text-sm text-[#1A1A1A]">
                    {ajo.currency} {parseFloat(ajo.contribution_amount).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-[#6B7280] capitalize">{ajo.frequency}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#008A48] rounded-full"
                          style={{
                            width: `${ajo.total_cycles > 0 ? (ajo.contributions_made / ajo.total_cycles) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#6B7280]">
                        {ajo.contributions_made}/{ajo.total_cycles}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#6B7280]">{formatDate(ajo.joined_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ["userTransactions", userId, page],
    queryFn: () => userService.getUserTransactions(userId, { page, page_size: 10 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F6F8FA]">
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Amount</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Narration</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-[#6B7280]">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#6B7280]">
                  No transactions found
                </td>
              </tr>
            ) : (
              data?.results?.map((txn) => (
                <tr key={txn.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(txn.kind, txn.direction)}
                      <span className="text-sm font-medium text-[#1A1A1A]">
                        {txn.kind.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-sm font-medium ${
                        txn.direction === "CREDIT" ? "text-[#22C55E]" : "text-[#EF4444]"
                      }`}
                    >
                      {txn.direction === "CREDIT" ? "+" : "-"}
                      {txn.currency} {parseFloat(txn.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        txn.status === "SUCCESS"
                          ? "bg-[#DCFCE7] text-[#22C55E]"
                          : txn.status === "PENDING"
                            ? "bg-[#FEF3C7] text-[#F59E0B]"
                            : "bg-[#FEE2E2] text-[#EF4444]"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#6B7280] max-w-[200px] truncate">
                    {txn.narration || txn.ajo_name || "-"}
                  </td>
                  <td className="py-4 px-4 text-sm text-[#6B7280]">{formatDateTime(txn.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="p-4 flex items-center justify-between border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Page {data.page} of {data.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KYCDetailsTab({ user }: { user: AdminUserDetail }) {
  const kyc = user.kyc_profile;
  const kycStatus = getKYCStatusBadge(kyc?.status || "pending");

  return (
    <div className="space-y-6">
      {/* KYC Status Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">KYC Verification Status</h3>
          <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium border ${kycStatus.className}`}>
            {kycStatus.label}
          </span>
        </div>

        {/* Verification Steps */}
        <div className="grid grid-cols-3 gap-6">
          {/* BVN Verification */}
          <div className={`p-4 rounded-xl border ${kyc?.bvn_verified ? "bg-[#F0FCF5] border-[#BBF7D0]" : "bg-[#F9FAFB] border-[#E5E7EB]"}`}>
            <div className="flex items-center gap-3 mb-3">
              {kyc?.bvn_verified ? (
                <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
              ) : (
                <XCircle className="w-6 h-6 text-[#9CA3AF]" />
              )}
              <span className="font-medium text-[#1A1A1A]">BVN Verification</span>
            </div>
            <p className="text-sm text-[#6B7280]">
              {kyc?.bvn_verified ? "Verified" : "Not verified"}
            </p>
            {kyc?.bvn_full_name && (
              <p className="text-sm text-[#1A1A1A] mt-1">Name: {kyc.bvn_full_name}</p>
            )}
          </div>

          {/* ID Verification */}
          <div className={`p-4 rounded-xl border ${kyc?.id_verified ? "bg-[#F0FCF5] border-[#BBF7D0]" : "bg-[#F9FAFB] border-[#E5E7EB]"}`}>
            <div className="flex items-center gap-3 mb-3">
              {kyc?.id_verified ? (
                <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
              ) : (
                <XCircle className="w-6 h-6 text-[#9CA3AF]" />
              )}
              <span className="font-medium text-[#1A1A1A]">ID Document</span>
            </div>
            <p className="text-sm text-[#6B7280]">
              {kyc?.id_verified ? "Verified" : "Not verified"}
            </p>
          </div>

          {/* Liveness Check */}
          <div className={`p-4 rounded-xl border ${kyc?.liveness_verified ? "bg-[#F0FCF5] border-[#BBF7D0]" : "bg-[#F9FAFB] border-[#E5E7EB]"}`}>
            <div className="flex items-center gap-3 mb-3">
              {kyc?.liveness_verified ? (
                <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
              ) : (
                <XCircle className="w-6 h-6 text-[#9CA3AF]" />
              )}
              <span className="font-medium text-[#1A1A1A]">Liveness Check</span>
            </div>
            <p className="text-sm text-[#6B7280]">
              {kyc?.liveness_verified ? "Verified" : "Not verified"}
            </p>
          </div>
        </div>

        {/* Rejection Reason */}
        {kyc?.rejection_reason && (
          <div className="mt-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              <span className="font-medium text-[#EF4444]">Rejection Reason</span>
            </div>
            <p className="text-sm text-[#991B1B]">{kyc.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Employment Information */}
      {(kyc?.job_status || kyc?.job_role) && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Employment Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Job Status</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{kyc?.job_status || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Job Role</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{kyc?.job_role || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Verification Status */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Account Verification</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${user.is_email_verified ? "bg-[#F0FCF5] border-[#BBF7D0]" : "bg-[#F9FAFB] border-[#E5E7EB]"}`}>
            <div className="flex items-center gap-3">
              {user.is_email_verified ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#9CA3AF]" />
              )}
              <span className="text-sm font-medium text-[#1A1A1A]">Email Verified</span>
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${user.trust_score?.transaction_pin > 0 ? "bg-[#F0FCF5] border-[#BBF7D0]" : "bg-[#F9FAFB] border-[#E5E7EB]"}`}>
            <div className="flex items-center gap-3">
              {user.trust_score?.transaction_pin > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#9CA3AF]" />
              )}
              <span className="text-sm font-medium text-[#1A1A1A]">Transaction PIN Set</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityLogTab({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["userActivity", userId],
    queryFn: () => userService.getUserActivity(userId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load activity log</p>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    account: "bg-[#DBEAFE] text-[#3B82F6]",
    verification: "bg-[#DCFCE7] text-[#22C55E]",
    kyc: "bg-[#E0E7FF] text-[#6366F1]",
    security: "bg-[#FEF3C7] text-[#F59E0B]",
    transaction: "bg-[#F3F4F6] text-[#6B7280]",
    ajo: "bg-[#FCE7F3] text-[#EC4899]",
    login: "bg-[#E0E7FF] text-[#6366F1]",
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        {data?.activities?.length === 0 ? (
          <div className="py-10 text-center text-[#6B7280]">No activity found</div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {data?.activities?.map((activity, index) => (
              <div key={index} className="p-4 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[activity.type] || typeColors.account}`}>
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">{activity.action}</p>
                  <p className="text-sm text-[#6B7280]">{activity.description}</p>
                </div>
                <span className="text-xs text-[#9CA3AF]">{formatDateTime(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Overview");

  // Fetch user details
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["userDetail", userId],
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  });

  // Suspend mutation
  const suspendMutation = useMutation({
    mutationFn: (reason?: string) => userService.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDetail", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: () => userService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDetail", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="User Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout title="User Details">
        <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p>Failed to load user details</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-[#008A48] hover:underline"
          >
            Try again
          </button>
        </div>
      </AdminLayout>
    );
  }

  const trustScoreInfo = getTrustScoreLabel(user.trust_score?.total || 0);
  const kycStatus = getKYCStatusBadge(user.kyc_profile?.status || "pending");

  return (
    <AdminLayout title="User Details">
      <div className="px-[28px] space-y-6 bg-[#FFFFFF]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#6B7280] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-[#008A48] text-white rounded-lg text-sm font-medium hover:bg-[#007A3D] transition-colors">
              Send Notification
            </button>
            {user.is_active ? (
              <button
                onClick={() => suspendMutation.mutate("Suspended by admin")}
                disabled={suspendMutation.isPending}
                className="px-4 py-2.5 border border-[#EF4444] text-[#EF4444] rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
              >
                {suspendMutation.isPending ? "Suspending..." : "Suspend User"}
              </button>
            ) : (
              <button
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
                className="px-4 py-2.5 border border-[#22C55E] text-[#22C55E] rounded-lg text-sm font-medium hover:bg-[#F0FCF5] transition-colors disabled:opacity-50"
              >
                {activateMutation.isPending ? "Activating..." : "Activate User"}
              </button>
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-[#DBEAFE] flex items-center justify-center">
                <span className="text-3xl font-semibold text-[#3B82F6]">
                  {user.first_name?.[0] || ""}
                  {user.last_name?.[0] || ""}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-sm text-[#6B7280]">{user.email}</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[10px] font-[400] border ${
                user.is_active
                  ? "bg-[#E4F8ED] border-[#CAF0DD] text-[#168D67]"
                  : "bg-[#FEF2F2] border-[#FECACA] text-[#EF4444]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${user.is_active ? "bg-[#22C55E]" : "bg-[#EF4444]"}`}
              ></span>
              {user.is_active ? "Active" : "Suspended"}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-[200px] flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-[#E6F5ED] flex items-center justify-center mb-auto">
              <Wallet className="w-6 h-6 text-[#008A48]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Wallet Balance</p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">
                {user.wallet_summary?.current_balance || "₦0"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-[200px] flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-[#E6F5ED] flex items-center justify-center mb-auto">
              <Shield className="w-6 h-6 text-[#008A48]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Trust Score</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-[#1A1A1A]">{user.trust_score?.total || 0}</p>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${trustScoreInfo.color}`}>
                  {trustScoreInfo.label}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-[200px] flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-[#E6F5ED] flex items-center justify-center mb-auto">
              <CircleEqual className="w-6 h-6 text-[#008A48]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Active Ajo Groups</p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">{user.active_ajo_groups || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-[200px] flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-[#DCFCE7] flex items-center justify-center mb-auto">
              <Lock className="w-6 h-6 text-[#008A48]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Security Deposits</p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">{user.security_deposits || "₦0"}</p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] px-6 py-[40px]">
          <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-6">User Information</h3>
          <div className="grid grid-cols-3 gap-6 gap-y-[68px]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Email Address</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Phone Number</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{user.phone_number || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Debit Mode</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{user.debit_mode || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Date Joined</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{formatDate(user.date_joined)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Last Active</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{formatDateTime(user.last_login)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#008A48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">KYC Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${kycStatus.className}`}>
                  {kycStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-[#F3F4F6] rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors rounded-full ${
                activeTab === tab
                  ? "bg-white text-[#1A1A1A] shadow-sm font-[700]"
                  : "text-[#6B7280] hover:text-[#1A1A1A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && <OverviewTab user={user} />}
        {activeTab === "Ajo Participation" && <AjoParticipationTab userId={userId} />}
        {activeTab === "Transactions" && <TransactionsTab userId={userId} />}
        {activeTab === "KYC Details" && <KYCDetailsTab user={user} />}
        {activeTab === "Activity Log" && <ActivityLogTab userId={userId} />}
      </div>
    </AdminLayout>
  );
}
