"use client";

import { AdminLayout } from "@/components/layout";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ajoService, { AjoDetail, AjoMemberDetail, AjoCycle, AjoContribution, AjoActivityItem } from "@/services/ajoService";
import {
  ArrowLeft,
  Wallet,
  Shield,
  Clock,
  Lock,
  Calendar,
  Banknote,
  FileText,
  Users,
  AlertTriangle,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  Mail,
  UserPlus,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

const tabs = [
  "Overview",
  "Members",
  "Payout Schedule",
  "Transactions",
  "Activity Log",
];

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

// Format date
function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Format date short (Jan 15)
function formatDateShort(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Member Status Badge Component
function MemberStatusBadge({ status }: { status: AjoMemberDetail["status"] }) {
  const styles = {
    accepted: "bg-[#F0FDF4] text-[#00A63E] border-[#B9F8CF]",
    invited: "bg-[#FEFCE8] text-[#D08700] border-[#FFF085]",
    pending_registration: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
    declined: "bg-[#FEF2F2] text-[#E7000B] border-[#FFC9C9]",
    removed: "bg-[#FEF2F2] text-[#E7000B] border-[#FFC9C9]",
    blocked: "bg-[#7F1D1D] text-white border-[#7F1D1D]",
  };

  const labels = {
    accepted: "Active",
    invited: "Invited",
    pending_registration: "Pending",
    declined: "Declined",
    removed: "Removed",
    blocked: "Blocked",
  };

  return (
    <span
      className={`inline-flex items-center px-[10px] py-[4px] rounded-full text-[12px] font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// Members Tab Component
function MembersTab({ ajoId, currency }: { ajoId: string; currency: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ["ajoMembers", ajoId],
    queryFn: () => ajoService.getAjoMembers(ajoId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#008A48] animate-spin" />
      </div>
    );
  }

  const filteredMembers = members?.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-[24px]">
      {/* Search */}
      <div className="relative w-[320px]">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-[40px] pl-[40px] pr-[12px] bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#121212] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#008A48]"
        />
      </div>

      {/* Members Table */}
      <div className="bg-white border border-[#DADCE0] rounded-[10px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Slot
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Member
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Security Deposit
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Contributed
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Received
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Debt
              </th>
              <th className="px-[16px] py-[14px]"></th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers?.map((member) => (
              <>
                <tr
                  key={member.id}
                  className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors ${
                    member.status === "blocked" ? "bg-[#FEF2F2]" : ""
                  }`}
                >
                  <td className="px-[16px] py-[16px]">
                    <span className="w-[32px] h-[32px] bg-[#E6F5ED] rounded-full flex items-center justify-center text-[14px] font-bold text-[#008A48]">
                      {member.slot_number ?? "-"}
                    </span>
                  </td>
                  <td className="px-[16px] py-[16px]">
                    <div>
                      <p className="text-[14px] font-medium text-[#121212]">
                        {member.name}
                      </p>
                      <p className="text-[12px] text-[#6B7280]">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-[16px] py-[16px]">
                    <MemberStatusBadge status={member.status} />
                  </td>
                  <td className="px-[16px] py-[16px]">
                    <div className="flex items-center gap-[8px]">
                      {member.security_deposit_paid ? (
                        <CheckCircle className="w-[16px] h-[16px] text-[#00A63E]" />
                      ) : (
                        <XCircle className="w-[16px] h-[16px] text-[#9CA3AF]" />
                      )}
                      <span className="text-[14px] text-[#121212]">
                        {formatCurrency(member.security_deposit_amount, currency)}
                      </span>
                    </div>
                  </td>
                  <td className="px-[16px] py-[16px]">
                    <span className="text-[14px] font-medium text-[#121212]">
                      {formatCurrency(member.total_contributed, currency)}
                    </span>
                  </td>
                  <td className="px-[16px] py-[16px]">
                    <span className="text-[14px] font-medium text-[#121212]">
                      {formatCurrency(member.total_received, currency)}
                    </span>
                  </td>
                  <td className="px-[16px] py-[16px]">
                    {member.has_debt ? (
                      <span className="text-[14px] font-medium text-[#E7000B]">
                        {formatCurrency(member.debt_amount, currency)}
                      </span>
                    ) : (
                      <span className="text-[14px] text-[#9CA3AF]">-</span>
                    )}
                  </td>
                  <td className="px-[16px] py-[16px]">
                    <button
                      onClick={() =>
                        setExpandedMember(
                          expandedMember === member.id ? null : member.id
                        )
                      }
                      className="p-[8px] hover:bg-[#F3F4F6] rounded-full transition-colors"
                    >
                      {expandedMember === member.id ? (
                        <ChevronUp className="w-[16px] h-[16px] text-[#6B7280]" />
                      ) : (
                        <ChevronDown className="w-[16px] h-[16px] text-[#6B7280]" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedMember === member.id && (
                  <tr key={`${member.id}-expanded`} className="bg-[#F9FAFB]">
                    <td colSpan={8} className="px-[16px] py-[20px]">
                      <div className="flex gap-[48px]">
                        <div className="space-y-[8px]">
                          <p className="text-[12px] text-[#6B7280]">Invited At</p>
                          <p className="text-[14px] font-medium text-[#121212]">
                            {formatDate(member.invited_at)}
                          </p>
                        </div>
                        <div className="space-y-[8px]">
                          <p className="text-[12px] text-[#6B7280]">Responded At</p>
                          <p className="text-[14px] font-medium text-[#121212]">
                            {formatDate(member.responded_at)}
                          </p>
                        </div>
                        <div className="space-y-[8px]">
                          <p className="text-[12px] text-[#6B7280]">Contributions Made</p>
                          <p className="text-[14px] font-medium text-[#121212]">
                            {member.contributions_made}
                          </p>
                        </div>
                        {member.security_deposit_paid && (
                          <div className="space-y-[8px]">
                            <p className="text-[12px] text-[#6B7280]">Deposit Paid At</p>
                            <p className="text-[14px] font-medium text-[#121212]">
                              {formatDate(member.security_deposit_paid_at)}
                            </p>
                          </div>
                        )}
                        {member.status === "blocked" && (
                          <div className="space-y-[8px] flex-1">
                            <p className="text-[12px] text-[#E7000B] font-medium">Block Reason</p>
                            <p className="text-[14px] text-[#E7000B]">
                              {member.block_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Cycle Status Badge Component
function CycleStatusBadge({ status }: { status: AjoCycle["status"] }) {
  const styles = {
    completed: "bg-[#F0FDF4] text-[#00A63E] border-[#B9F8CF]",
    active: "bg-[#EFF6FF] text-[#155DFC] border-[#BEDBFF]",
    pending: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
    overdue: "bg-[#FEF2F2] text-[#E7000B] border-[#FFC9C9]",
  };

  return (
    <span
      className={`inline-flex items-center px-[10px] py-[4px] rounded-full text-[12px] font-medium border capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Payout Status Badge Component
function PayoutStatusBadge({ status }: { status: AjoCycle["payout_status"] }) {
  const styles = {
    completed: "bg-[#F0FDF4] text-[#00A63E]",
    processing: "bg-[#FEFCE8] text-[#D08700]",
    pending: "bg-[#F3F4F6] text-[#6B7280]",
    failed: "bg-[#FEF2F2] text-[#E7000B]",
  };

  return (
    <span
      className={`inline-flex items-center px-[8px] py-[2px] rounded text-[11px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Payout Schedule Tab Component
function PayoutScheduleTab({ ajoId, currency }: { ajoId: string; currency: string }) {
  const { data: cycles, isLoading } = useQuery({
    queryKey: ["ajoCycles", ajoId],
    queryFn: () => ajoService.getAjoCycles(ajoId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#008A48] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      {/* Summary Cards */}
      <div className="flex gap-[12px]">
        <div className="w-[200px] h-[80px] bg-[#F0FDF4] border border-[#B9F8CF] rounded-[10px] p-[16px]">
          <p className="text-[12px] text-[#6B7280]">Completed Cycles</p>
          <p className="text-[20px] font-bold text-[#00A63E] mt-[4px]">
            {cycles?.filter((c) => c.status === "completed").length}
          </p>
        </div>
        <div className="w-[200px] h-[80px] bg-[#EFF6FF] border border-[#BEDBFF] rounded-[10px] p-[16px]">
          <p className="text-[12px] text-[#6B7280]">Active Cycle</p>
          <p className="text-[20px] font-bold text-[#155DFC] mt-[4px]">
            {cycles?.find((c) => c.status === "active")?.cycle_number ?? "-"}
          </p>
        </div>
        <div className="w-[200px] h-[80px] bg-[#F3F4F6] border border-[#E5E7EB] rounded-[10px] p-[16px]">
          <p className="text-[12px] text-[#6B7280]">Pending Cycles</p>
          <p className="text-[20px] font-bold text-[#6B7280] mt-[4px]">
            {cycles?.filter((c) => c.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Cycles Table */}
      <div className="bg-white border border-[#DADCE0] rounded-[10px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Cycle
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Recipient
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Period
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Collection
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Payout
              </th>
            </tr>
          </thead>
          <tbody>
            {cycles?.map((cycle) => (
              <tr
                key={cycle.id}
                className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors ${
                  cycle.status === "active" ? "bg-[#F0F9FF]" : ""
                }`}
              >
                <td className="px-[16px] py-[16px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="w-[28px] h-[28px] bg-[#E6F5ED] rounded-full flex items-center justify-center text-[12px] font-bold text-[#008A48]">
                      {cycle.cycle_number}
                    </span>
                    <span className="text-[14px] font-medium text-[#121212]">
                      Cycle {cycle.cycle_number}
                    </span>
                  </div>
                </td>
                <td className="px-[16px] py-[16px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] rounded px-[6px] py-[2px]">
                      Slot {cycle.recipient_slot_number}
                    </span>
                    <span className="text-[14px] text-[#121212]">
                      {cycle.recipient_name}
                    </span>
                  </div>
                </td>
                <td className="px-[16px] py-[16px]">
                  <div className="text-[13px] text-[#6B7280]">
                    {formatDateShort(cycle.start_date)} - {formatDateShort(cycle.end_date)}
                  </div>
                </td>
                <td className="px-[16px] py-[16px]">
                  <CycleStatusBadge status={cycle.status} />
                </td>
                <td className="px-[16px] py-[16px]">
                  <div className="space-y-[4px]">
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[80px] h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cycle.collection_percentage === 100
                              ? "bg-[#00A63E]"
                              : cycle.collection_percentage >= 80
                                ? "bg-[#D08700]"
                                : "bg-[#E7000B]"
                          }`}
                          style={{ width: `${cycle.collection_percentage}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-[#6B7280]">
                        {cycle.collection_percentage}%
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      {formatCurrency(cycle.total_collected, currency)} / {formatCurrency(cycle.expected_total, currency)}
                    </div>
                  </div>
                </td>
                <td className="px-[16px] py-[16px]">
                  <div className="space-y-[4px]">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[14px] font-medium text-[#121212]">
                        {formatCurrency(cycle.payout_amount, currency)}
                      </span>
                      <PayoutStatusBadge status={cycle.payout_status} />
                    </div>
                    {cycle.payout_date && (
                      <p className="text-[11px] text-[#9CA3AF]">
                        Paid: {formatDate(cycle.payout_date)}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Contribution Status Badge
function ContributionStatusBadge({ status }: { status: AjoContribution["status"] }) {
  const styles = {
    paid: "bg-[#F0FDF4] text-[#00A63E] border-[#B9F8CF]",
    pending: "bg-[#FEFCE8] text-[#D08700] border-[#FFF085]",
    overdue: "bg-[#FEF2F2] text-[#E7000B] border-[#FFC9C9]",
  };

  return (
    <span
      className={`inline-flex items-center px-[10px] py-[4px] rounded-full text-[12px] font-medium border capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Transactions Tab Component
function TransactionsTab({ ajoId, currency }: { ajoId: string; currency: string }) {
  const [selectedCycle, setSelectedCycle] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: contributions, isLoading } = useQuery({
    queryKey: ["ajoContributions", ajoId],
    queryFn: () => ajoService.getAjoContributions(ajoId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#008A48] animate-spin" />
      </div>
    );
  }

  // Get unique cycles for filter
  const cycles = [...new Set(contributions?.map((c) => c.cycle_number))].sort((a, b) => b - a);

  const filteredContributions = contributions?.filter((c) => {
    if (selectedCycle !== "all" && c.cycle_number !== selectedCycle) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  // Summary stats
  const totalPaid = contributions?.filter((c) => c.status === "paid").length ?? 0;
  const totalPending = contributions?.filter((c) => c.status === "pending").length ?? 0;
  const totalOverdue = contributions?.filter((c) => c.status === "overdue").length ?? 0;

  return (
    <div className="space-y-[24px]">
      {/* Summary Cards */}
      <div className="flex gap-[12px]">
        <div className="w-[160px] h-[70px] bg-[#F0FDF4] border border-[#B9F8CF] rounded-[10px] p-[14px]">
          <p className="text-[11px] text-[#6B7280]">Paid</p>
          <p className="text-[18px] font-bold text-[#00A63E]">{totalPaid}</p>
        </div>
        <div className="w-[160px] h-[70px] bg-[#FEFCE8] border border-[#FFF085] rounded-[10px] p-[14px]">
          <p className="text-[11px] text-[#6B7280]">Pending</p>
          <p className="text-[18px] font-bold text-[#D08700]">{totalPending}</p>
        </div>
        <div className="w-[160px] h-[70px] bg-[#FEF2F2] border border-[#FFC9C9] rounded-[10px] p-[14px]">
          <p className="text-[11px] text-[#6B7280]">Overdue</p>
          <p className="text-[18px] font-bold text-[#E7000B]">{totalOverdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-[12px]">
        <select
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="h-[40px] px-[12px] bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:border-[#008A48]"
        >
          <option value="all">All Cycles</option>
          {cycles.map((c) => (
            <option key={c} value={c}>
              Cycle {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-[40px] px-[12px] bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:border-[#008A48]"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#DADCE0] rounded-[10px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Cycle
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Member
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-[16px] py-[14px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Paid At
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredContributions?.map((contribution) => (
              <tr
                key={contribution.id}
                className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors ${
                  contribution.status === "overdue" ? "bg-[#FFFBEB]" : ""
                }`}
              >
                <td className="px-[16px] py-[16px]">
                  <span className="text-[14px] font-medium text-[#121212]">
                    Cycle {contribution.cycle_number}
                  </span>
                </td>
                <td className="px-[16px] py-[16px]">
                  <div>
                    <p className="text-[14px] font-medium text-[#121212]">
                      {contribution.member_name}
                    </p>
                    <p className="text-[12px] text-[#6B7280]">
                      {contribution.member_email}
                    </p>
                  </div>
                </td>
                <td className="px-[16px] py-[16px]">
                  <span className="text-[14px] font-semibold text-[#121212]">
                    {formatCurrency(contribution.amount, currency)}
                  </span>
                </td>
                <td className="px-[16px] py-[16px]">
                  <ContributionStatusBadge status={contribution.status} />
                </td>
                <td className="px-[16px] py-[16px]">
                  <span className="text-[13px] text-[#6B7280]">
                    {contribution.paid_at ? formatDate(contribution.paid_at) : "-"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContributions?.length === 0 && (
          <div className="text-center py-[40px] text-[#6B7280]">
            No contributions found
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Icon Component
function ActivityIcon({ type }: { type: AjoActivityItem["type"] }) {
  const iconMap = {
    member_joined: <UserPlus className="w-[16px] h-[16px] text-[#00A63E]" />,
    member_left: <Users className="w-[16px] h-[16px] text-[#6B7280]" />,
    member_blocked: <Ban className="w-[16px] h-[16px] text-[#E7000B]" />,
    contribution_paid: <DollarSign className="w-[16px] h-[16px] text-[#00A63E]" />,
    payout_completed: <Wallet className="w-[16px] h-[16px] text-[#155DFC]" />,
    cycle_started: <Activity className="w-[16px] h-[16px] text-[#155DFC]" />,
    cycle_completed: <CheckCircle className="w-[16px] h-[16px] text-[#00A63E]" />,
    ajo_activated: <CheckCircle className="w-[16px] h-[16px] text-[#008A48]" />,
    settings_changed: <FileText className="w-[16px] h-[16px] text-[#6B7280]" />,
    dispute_opened: <AlertTriangle className="w-[16px] h-[16px] text-[#FB4E00]" />,
  };

  const bgMap = {
    member_joined: "bg-[#E6F5ED]",
    member_left: "bg-[#F3F4F6]",
    member_blocked: "bg-[#FEE2E2]",
    contribution_paid: "bg-[#E6F5ED]",
    payout_completed: "bg-[#EFF6FF]",
    cycle_started: "bg-[#EFF6FF]",
    cycle_completed: "bg-[#E6F5ED]",
    ajo_activated: "bg-[#E6F5ED]",
    settings_changed: "bg-[#F3F4F6]",
    dispute_opened: "bg-[#FFEFE5]",
  };

  return (
    <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center ${bgMap[type]}`}>
      {iconMap[type]}
    </div>
  );
}

// Format relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// Activity Log Tab Component
function ActivityLogTab({ ajoId }: { ajoId: string }) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["ajoActivityLog", ajoId],
    queryFn: () => ajoService.getAjoActivityLog(ajoId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#008A48] animate-spin" />
      </div>
    );
  }

  // Group activities by date
  const groupedActivities: Record<string, AjoActivityItem[]> = {};
  activities?.forEach((activity) => {
    const dateKey = new Date(activity.timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    groupedActivities[dateKey].push(activity);
  });

  return (
    <div className="space-y-[32px]">
      {Object.entries(groupedActivities).map(([date, dayActivities]) => (
        <div key={date}>
          <h4 className="text-[14px] font-semibold text-[#6B7280] mb-[16px]">{date}</h4>
          <div className="space-y-[12px]">
            {dayActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-[16px] bg-white border border-[#E5E7EB] rounded-[10px] p-[16px]"
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-[#121212]">
                        {activity.title}
                      </p>
                      <p className="text-[13px] text-[#6B7280] mt-[4px]">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-[12px] text-[#9CA3AF] whitespace-nowrap ml-[16px]">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  {activity.actor_name && (
                    <p className="text-[12px] text-[#9CA3AF] mt-[8px]">
                      by {activity.actor_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {activities?.length === 0 && (
        <div className="text-center py-[40px] text-[#6B7280]">
          No activity yet
        </div>
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ ajo }: { ajo: AjoDetail }) {
  return (
    <div className="space-y-[100px]">
      {/* Ajo Settings */}
      <div className="space-y-[40px]">
        <h3 className="text-[20px] font-bold text-[#121212] tracking-[-0.4px]">
          Ajo Settings
        </h3>
        <div className="flex gap-[371px]">
          <div className="w-[224px] space-y-[68px]">
            <div className="space-y-[8px]">
              <p className="text-[12px] text-[#6F7278] leading-[16px]">
                Security Deposit
              </p>
              <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                {ajo.security_deposit_percentage}% of contribution
              </p>
            </div>
            <div className="space-y-[8px]">
              <p className="text-[12px] text-[#6F7278] leading-[16px]">
                Missed Payment Penalty
              </p>
              <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                {ajo.missed_payment_penalty}
              </p>
            </div>
          </div>
          <div className="w-[166px] space-y-[68px]">
            <div className="space-y-[8px]">
              <p className="text-[12px] text-[#6F7278] leading-[16px]">
                Grace Period
              </p>
              <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                {ajo.grace_period_days} Days
              </p>
            </div>
            <div className="space-y-[8px]">
              <p className="text-[12px] text-[#6F7278] leading-[16px]">
                Creator
              </p>
              <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                {ajo.creator_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Round Payment Status */}
      <div className="space-y-[24px]">
        <h3 className="text-[18px] font-bold text-[#121212] tracking-[-0.36px]">
          Current Round Payment Status
        </h3>
        <div className="flex gap-[12px]">
          {/* Paid */}
          <div className="w-[266px] h-[100px] bg-[#F0FDF4] border border-[#B9F8CF] rounded-[10px] p-[23px]">
            <p className="text-[14px] font-medium text-[#4A5565] tracking-[-0.28px]">
              Paid
            </p>
            <p className="text-[20px] font-bold text-[#00A63E] tracking-[-0.4px] mt-[6px]">
              {ajo.paid_count}
            </p>
          </div>
          {/* Pending */}
          <div className="w-[266px] h-[100px] bg-[#FEFCE8] border border-[#FFF085] rounded-[10px] p-[23px]">
            <p className="text-[14px] font-medium text-[#4A5565] tracking-[-0.28px]">
              Pending
            </p>
            <p className="text-[20px] font-bold text-[#D08700] tracking-[-0.4px] mt-[6px]">
              {ajo.pending_count}
            </p>
          </div>
          {/* Overdue */}
          <div className="w-[266px] h-[100px] bg-[#FEF2F2] border border-[#FFC9C9] rounded-[10px] p-[23px]">
            <p className="text-[14px] font-medium text-[#4A5565] tracking-[-0.28px]">
              Overdue
            </p>
            <p className="text-[20px] font-bold text-[#E7000B] tracking-[-0.4px] mt-[6px]">
              {ajo.overdue_count}
            </p>
          </div>
          {/* Collection Rate */}
          <div className="w-[266px] h-[100px] bg-[#EFF6FF] border border-[#BEDBFF] rounded-[10px] p-[23px]">
            <p className="text-[14px] font-medium text-[#4A5565] tracking-[-0.28px]">
              Collection Rate
            </p>
            <p className="text-[20px] font-bold text-[#155DFC] tracking-[-0.4px] mt-[6px]">
              {ajo.collection_rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Active Disputes */}
      <div className="space-y-[24px]">
        <h3 className="text-[18px] font-bold text-[#121212] tracking-[-0.36px]">
          Active Disputes
        </h3>
        {ajo.active_disputes.length === 0 ? (
          <div className="bg-[#F0FCF5] border border-[#B8E6D4] rounded-[10px] p-[16px] flex items-center gap-[12px]">
            <div className="w-[20px] h-[20px] text-[#008A48]">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#008A48]">
              No active disputes
            </p>
          </div>
        ) : (
          ajo.active_disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-[#FFEFE5] border border-[#FFC7A1] rounded-[10px] h-[69px] px-[16px] flex items-center justify-between"
            >
              <div className="flex items-center gap-[12px]">
                <div className="w-[20px] h-[20px] text-[#FB4E00]">
                  <AlertTriangle className="w-full h-full" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#121212] tracking-[-0.28px]">
                    {dispute.title}
                  </p>
                  <p className="text-[12px] font-medium text-[#6F7278] tracking-[-0.24px]">
                    Reported by {dispute.reported_by} regarding{" "}
                    {dispute.reported_against} • {formatDate(dispute.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="bg-[#FFE3D0] text-[#FB4E00] text-[12px] font-medium px-[8px] py-[4px] rounded-full tracking-[-0.24px]">
                  Open
                </span>
                <button className="text-[12px] font-medium text-[#00ACFA] px-[16px] py-[6px] tracking-[-0.24px]">
                  Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AjoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ajoId = params.id as string;
  const [activeTab, setActiveTab] = useState("Overview");

  // Fetch Ajo details
  const {
    data: ajo,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ajoDetail", ajoId],
    queryFn: () => ajoService.getAjoDetail(ajoId),
    enabled: !!ajoId,
  });

  if (isLoading) {
    return (
      <AdminLayout title="Ajo Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !ajo) {
    return (
      <AdminLayout title="Ajo Details">
        <div className="flex flex-col items-center justify-center py-20 text-[#EF4444]">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p>Failed to load Ajo details</p>
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

  return (
    <AdminLayout title="Ajo Details">
      <div className="px-[32px] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between h-[46px] mb-[28px]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-[16px] text-[#121212]"
          >
            <ArrowLeft className="w-[20px] h-[20px]" />
            <span className="text-[14px] font-medium tracking-[-0.28px]">
              Back
            </span>
          </button>

          <div className="flex items-center gap-[10px]">
            <button className="w-[140px] h-[42px] bg-[#008A48] text-white rounded-[8px] text-[14px] font-medium tracking-[-0.28px] shadow-sm hover:bg-[#007A3D] transition-colors">
              Send Notification
            </button>
            <button className="w-[140px] h-[42px] bg-white border border-[#FECACE] text-[#EF3E4A] rounded-[10px] text-[14px] font-medium tracking-[-0.28px] shadow-sm hover:bg-[#FEF2F2] transition-colors">
              Suspend User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-[12px] mb-[41px]">
          {/* Total Pool */}
          <div className="w-[266px] h-[220px] bg-white border border-[#DADCE0] rounded-[12px] p-[23px]">
            <div className="w-[48px] h-[48px] bg-[#E6F5ED] rounded-[8px] flex items-center justify-center mb-[32px]">
              <Wallet className="w-[24px] h-[24px] text-[#008A48]" />
            </div>
            <div className="space-y-[12px]">
              <p className="text-[14px] text-[#6F7278] tracking-[-0.28px]">
                Total Pool
              </p>
              <p className="text-[24px] font-bold text-[#121212] tracking-[-0.48px]">
                {formatCurrency(ajo.total_pool, ajo.currency)}
              </p>
            </div>
            <p className="text-[14px] text-[#6F7278] tracking-[-0.28px] mt-[16px]">
              {formatCurrency(ajo.per_member_amount, ajo.currency)} per member
            </p>
          </div>

          {/* Participants */}
          <div className="w-[266px] h-[220px] bg-white border border-[#DADCE0] rounded-[12px] p-[23px]">
            <div className="w-[48px] h-[48px] bg-[#E6F5ED] rounded-[8px] flex items-center justify-center mb-[32px]">
              <Shield className="w-[24px] h-[24px] text-[#008A48]" />
            </div>
            <div className="space-y-[12px]">
              <p className="text-[14px] text-[#6F7278] tracking-[-0.28px]">
                Participants
              </p>
              <p className="text-[24px] font-bold text-[#121212] tracking-[-0.48px]">
                {ajo.participant_count}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="w-[266px] h-[220px] bg-white border border-[#DADCE0] rounded-[12px] p-[23px]">
            <div className="w-[48px] h-[48px] bg-[#E6F5ED] rounded-[8px] flex items-center justify-center mb-[32px]">
              <Clock className="w-[24px] h-[24px] text-[#008A48]" />
            </div>
            <div className="space-y-[12px]">
              <p className="text-[14px] text-[#6F7278] tracking-[-0.28px]">
                Progress
              </p>
              <p className="text-[24px] font-bold text-[#121212] tracking-[-0.48px]">
                {ajo.current_cycle}/{ajo.total_cycles}
              </p>
            </div>
          </div>

          {/* Next Payout */}
          <div className="w-[266px] h-[220px] bg-white border border-[#DADCE0] rounded-[12px] p-[23px]">
            <div className="w-[48px] h-[48px] bg-[#E6F5ED] rounded-[8px] flex items-center justify-center mb-[32px]">
              <Lock className="w-[24px] h-[24px] text-[#008A48]" />
            </div>
            <div className="space-y-[12px]">
              <p className="text-[14px] text-[#6F7278] tracking-[-0.28px]">
                Next Payout
              </p>
              <p className="text-[24px] font-bold text-[#121212] tracking-[-0.48px]">
                {formatDateShort(ajo.next_payout_date)}
              </p>
              <p className="text-[14px] text-[#6F7278] tracking-[-0.28px]">
                {ajo.next_payout_recipient}
              </p>
            </div>
          </div>
        </div>

        {/* Ajo Information Card */}
        <div className="bg-white border border-[#DADCE0] rounded-[10px] p-[23px] pt-[39px] h-[408px] mb-[48px]">
          <h3 className="text-[20px] font-bold text-[#121212] tracking-[-0.4px] mb-[40px]">
            Ajo Information
          </h3>

          <div className="flex gap-[185px] mb-[68px]">
            {/* Column 1 */}
            <div className="w-[224px] space-y-[68px]">
              <div className="flex gap-[12px]">
                <Users className="w-[24px] h-[24px] text-[#008A48] flex-shrink-0" />
                <div className="space-y-[8px]">
                  <p className="text-[12px] text-[#6F7278] leading-[16px]">
                    Creator
                  </p>
                  <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                    {ajo.creator_name}
                  </p>
                </div>
              </div>
              <div className="flex gap-[12px]">
                <Calendar className="w-[24px] h-[24px] text-[#008A48] flex-shrink-0" />
                <div className="space-y-[8px]">
                  <p className="text-[12px] text-[#6F7278] leading-[16px]">
                    Cycle Frequency
                  </p>
                  <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px] capitalize">
                    {ajo.frequency}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="w-[166px] space-y-[68px]">
              <div className="flex gap-[12px]">
                <Calendar className="w-[24px] h-[24px] text-[#008A48] flex-shrink-0" />
                <div className="space-y-[8px]">
                  <p className="text-[12px] text-[#6F7278] leading-[16px]">
                    Start Date
                  </p>
                  <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                    {formatDate(ajo.start_date)}
                  </p>
                </div>
              </div>
              <div className="flex gap-[12px]">
                <Banknote className="w-[24px] h-[24px] text-[#008A48] flex-shrink-0" />
                <div className="space-y-[8px]">
                  <p className="text-[12px] text-[#6F7278] leading-[16px]">
                    Currency
                  </p>
                  <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                    {ajo.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="w-[292px] space-y-[68px]">
              <div className="flex gap-[12px]">
                <Calendar className="w-[24px] h-[24px] text-[#008A48] flex-shrink-0" />
                <div className="space-y-[8px]">
                  <p className="text-[12px] text-[#6F7278] leading-[16px]">
                    Expected Completion
                  </p>
                  <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                    {formatDate(ajo.expected_completion)}
                  </p>
                </div>
              </div>
              <div className="flex gap-[12px]">
                <FileText className="w-[24px] h-[24px] text-[#008A48] flex-shrink-0" />
                <div className="space-y-[8px]">
                  <p className="text-[12px] text-[#6F7278] leading-[16px]">
                    Security Deposits
                  </p>
                  <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                    {formatCurrency(ajo.security_deposits, ajo.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex gap-[12px]">
            <FileText className="w-[24px] h-[24px] text-[#008A48] flex-shrink-0" />
            <div className="space-y-[8px]">
              <p className="text-[12px] text-[#6F7278] leading-[16px]">
                Description
              </p>
              <p className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
                {ajo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#F6F8FB] border border-[#E6E8EC] rounded-full h-[60px] flex items-center px-[15px] mb-[32px]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-[38px] py-[13px] text-[14px] font-medium rounded-[24px] transition-colors tracking-[-0.28px] ${
                activeTab === tab
                  ? "bg-white text-[#121212] font-bold text-[16px] tracking-[-0.32px]"
                  : "text-[#6F7278] hover:text-[#121212]"
              }`}
            >
              {tab === "Members" ? `Members (${ajo.participant_count})` : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-[40px]">
          {activeTab === "Overview" && <OverviewTab ajo={ajo} />}
          {activeTab === "Members" && (
            <MembersTab ajoId={ajoId} currency={ajo.currency} />
          )}
          {activeTab === "Payout Schedule" && (
            <PayoutScheduleTab ajoId={ajoId} currency={ajo.currency} />
          )}
          {activeTab === "Transactions" && (
            <TransactionsTab ajoId={ajoId} currency={ajo.currency} />
          )}
          {activeTab === "Activity Log" && <ActivityLogTab ajoId={ajoId} />}
        </div>
      </div>
    </AdminLayout>
  );
}
