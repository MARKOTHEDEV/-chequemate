"use client";

import { AdminLayout } from "@/components/layout";
import {
  ArrowLeft,
  User,
  Users,
  CreditCard,
  Wallet,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import transactionService, {
  TransactionDetail,
} from "@/services/transactionService";

// Transaction Type Badge
function TransactionTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<
    string,
    { label: string; bgColor: string; textColor: string }
  > = {
    contribution: {
      label: "Contribution",
      bgColor: "bg-[#DBEAFE]",
      textColor: "text-[#1447E6]",
    },
    payout: {
      label: "Payout",
      bgColor: "bg-[#DCFCE7]",
      textColor: "text-[#166534]",
    },
    wallet_credit: {
      label: "Wallet Credit",
      bgColor: "bg-[#F3E8FF]",
      textColor: "text-[#9333EA]",
    },
    wallet_debit: {
      label: "Wallet Debit",
      bgColor: "bg-[#FEF3C7]",
      textColor: "text-[#D97706]",
    },
    security_deposit: {
      label: "Security Deposit",
      bgColor: "bg-[#E0F2FE]",
      textColor: "text-[#0284C7]",
    },
  };

  const config = typeConfig[type] || typeConfig.contribution;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-normal ${config.bgColor} ${config.textColor}`}
    >
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
  return `${symbol}${amount.toLocaleString()}`;
}

// Info Card Component
function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#DADCE0] rounded-[10px] p-4 flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[#6B7280]">{icon}</div>
        <h3 className="text-lg font-semibold text-[#101828]">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// Info Row Component
function InfoRow({
  label,
  value,
  isMonospace = false,
}: {
  label: string;
  value: string;
  isMonospace?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[#6A7282]">{label}</p>
      <p
        className={`text-sm ${isMonospace ? "font-mono" : "font-medium"} text-[#101828]`}
      >
        {value}
      </p>
    </div>
  );
}

// Detail Box Component
function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#E5E7EB] rounded-[10px] px-4 py-4 flex-1">
      <p className="text-xs text-[#6A7282] mb-1">{label}</p>
      <p className="text-sm font-medium text-[#121212]">{value}</p>
    </div>
  );
}

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  // Fetch transaction details
  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => transactionService.getTransaction(transactionId),
    enabled: !!transactionId,
  });

  if (isLoading) {
    return (
      <AdminLayout title="Transaction Details">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-[#008A48] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !transaction) {
    return (
      <AdminLayout title="Transaction Details">
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#EF4444]">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Failed to load transaction</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-[#008A48] hover:underline"
          >
            Go back
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Transaction Details">
      <div className="px-[28px] pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#121212]" />
            </button>
            <span className="text-sm font-medium text-[#121212]">
              Transaction Details
            </span>
          </div>
          <button className="flex items-center gap-2 bg-[#008A48] text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-[#007A3D] transition-colors">
            Download Receipt
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`rounded-[10px] p-6 mb-6 ${
            transaction.status === "successful"
              ? "bg-[#DCFCE7] border border-[#B9F8CF]"
              : transaction.status === "failed"
                ? "bg-[#FEE2E2] border border-[#FECACA]"
                : "bg-[#FEF3C7] border border-[#FDE68A]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  transaction.status === "successful"
                    ? "bg-[#008236]"
                    : transaction.status === "failed"
                      ? "bg-[#EF4444]"
                      : "bg-[#D97706]"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2
                    className={`text-xl font-semibold ${
                      transaction.status === "successful"
                        ? "text-[#008236]"
                        : transaction.status === "failed"
                          ? "text-[#EF4444]"
                          : "text-[#D97706]"
                    }`}
                  >
                    {transaction.status === "successful"
                      ? "Success"
                      : transaction.status === "failed"
                        ? "Failed"
                        : "Pending"}
                  </h2>
                  <TransactionTypeBadge type={transaction.transaction_type} />
                </div>
                <p
                  className={`text-sm ${
                    transaction.status === "successful"
                      ? "text-[#008236]"
                      : transaction.status === "failed"
                        ? "text-[#EF4444]"
                        : "text-[#D97706]"
                  }`}
                >
                  Transaction completed successfully in{" "}
                  {transaction.completion_time}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-3xl font-bold ${
                  transaction.status === "successful"
                    ? "text-[#008236]"
                    : transaction.status === "failed"
                      ? "text-[#EF4444]"
                      : "text-[#D97706]"
                }`}
              >
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
              <p
                className={`text-sm ${
                  transaction.status === "successful"
                    ? "text-[#008236]"
                    : transaction.status === "failed"
                      ? "text-[#EF4444]"
                      : "text-[#D97706]"
                }`}
              >
                {transaction.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="flex gap-6 mb-6">
          {/* User Information */}
          <InfoCard
            icon={<User className="w-5 h-5" />}
            title="User Information"
          >
            <InfoRow label="Name" value={transaction.user.name} />
            <InfoRow label="User ID" value={transaction.user.id} />
            <div>
              <p className="text-xs text-[#6A7282]">Trust Score</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full">
                  <div
                    className="h-2 bg-[#00C950] rounded-full"
                    style={{ width: `${transaction.user.trust_score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[#101828]">
                  {transaction.user.trust_score}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Ajo Details */}
          <InfoCard icon={<Users className="w-5 h-5" />} title="Ajo Details">
            {transaction.ajo ? (
              <>
                <InfoRow label="Ajo Name" value={transaction.ajo.name} />
                <InfoRow label="Ajo ID" value={transaction.ajo.id} />
                <InfoRow label="Round" value={`Round ${transaction.ajo.round}`} />
              </>
            ) : (
              <p className="text-sm text-[#6B7280]">Not applicable</p>
            )}
          </InfoCard>

          {/* Payment Method */}
          <InfoCard
            icon={<CreditCard className="w-5 h-5" />}
            title="Payment Method"
          >
            <InfoRow label="Method" value={transaction.payment.method} />
            <InfoRow label="Provider" value={transaction.payment.provider} />
            <InfoRow
              label="Reference"
              value={transaction.payment.reference}
              isMonospace
            />
          </InfoCard>
        </div>

        {/* Transaction Details Section */}
        <div className="bg-white border border-[#DADCE0] rounded-[10px] p-6">
          <h2 className="text-xl font-bold text-[#008A48] text-center mb-6">
            Transaction Details
          </h2>

          {/* Amount Breakdown */}
          <div className="mb-10">
            <h3 className="text-base font-bold text-[#121212] mb-3">
              Amount Breakdown
            </h3>
            <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden">
              <div className="flex justify-between items-center px-4 py-4 border-b border-[#E5E7EB]">
                <span className="text-sm text-[#4A5565]">
                  Transaction Amount
                </span>
                <span className="text-sm font-semibold text-[#121212]">
                  {formatCurrency(transaction.breakdown.transaction_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-4 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <span className="text-sm text-[#4A5565]">Platform Fee</span>
                <span className="text-sm text-[#E7000B]">
                  -{formatCurrency(transaction.breakdown.platform_fee)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-4 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <span className="text-sm text-[#4A5565]">Processing Fee</span>
                <span className="text-sm text-[#E7000B]">
                  -{formatCurrency(transaction.breakdown.processing_fee)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-4 bg-[#EFF6FF]">
                <span className="text-sm font-semibold text-[#121212]">
                  Net Amount
                </span>
                <span className="text-base font-bold text-[#155DFC]">
                  {formatCurrency(transaction.breakdown.net_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance Impact */}
          <div className="mb-10">
            <h3 className="text-base font-bold text-[#121212] mb-4">
              Wallet Balance Impact
            </h3>
            <div className="flex gap-5">
              <div className="flex-1 border border-[#DADCE0] rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-[#6B7280]" />
                  <span className="text-sm text-[#4A5565]">Balance Before</span>
                </div>
                <p className="text-2xl font-semibold text-[#121212]">
                  {formatCurrency(transaction.wallet.balance_before)}
                </p>
              </div>
              <div className="flex-1 bg-[#F3FBFF] border border-[#C8EEFF] rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#38BDF8]" />
                  <span className="text-sm text-[#6F7278]">Balance After</span>
                </div>
                <p className="text-2xl font-semibold text-[#38BDF8]">
                  {formatCurrency(transaction.wallet.balance_after)}
                </p>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-[#121212] mb-3">
              Banking Details
            </h3>
            <div className="flex gap-4">
              <DetailBox
                label="Bank Name"
                value={transaction.banking.bank_name}
              />
              <DetailBox
                label="Account Number"
                value={transaction.banking.account_number}
              />
              <DetailBox
                label="Account Name"
                value={transaction.banking.account_name}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-[#121212] mb-3">
              Contact Information
            </h3>
            <div className="flex gap-6">
              <div className="flex-1 border border-[#DADCE0] rounded-[10px] px-4 py-4">
                <p className="text-xs text-[#6A7282] mb-1">Email</p>
                <p className="text-sm font-medium text-[#121212]">
                  {transaction.user.email}
                </p>
              </div>
              <div className="flex-1 border border-[#DADCE0] rounded-[10px] px-4 py-4">
                <p className="text-xs text-[#6A7282] mb-1">Phone</p>
                <p className="text-sm font-medium text-[#121212]">
                  {transaction.user.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div>
            <h3 className="text-lg font-semibold text-[#121212] mb-4">
              Transaction Metadata
            </h3>
            <div className="flex gap-4">
              <DetailBox
                label="IP Address"
                value={transaction.metadata.ip_address}
              />
              <DetailBox
                label="Device Type"
                value={transaction.metadata.device_type}
              />
              <DetailBox
                label="Device Model"
                value={transaction.metadata.device_model}
              />
              <DetailBox
                label="Location"
                value={transaction.metadata.location}
              />
              <div className="border border-[#DADCE0] rounded-[10px] px-4 py-4 flex-1">
                <p className="text-xs text-[#6A7282] mb-1">Session ID</p>
                <p className="text-sm font-mono text-[#121212]">
                  {transaction.metadata.session_id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
