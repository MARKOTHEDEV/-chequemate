"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  RefreshCw,
  CreditCard,
  Shield,
  Lock,
  FileCheck,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

const channelMenuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Users", href: "/users", icon: Users },
  { name: "Ajo", href: "/ajo", icon: RefreshCw },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Trust Score", href: "/trust-score", icon: Shield },
  { name: "Security Deposit", href: "/security-deposit", icon: Lock },
  { name: "KYC & Compliance", href: "/kyc", icon: FileCheck },
  { name: "Notification", href: "/notifications", icon: Bell },
  { name: "Revenue and Reports", href: "/reports", icon: BarChart3 },
];

const supportMenuItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help Center", href: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[272px] bg-[#121212] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-6 mb-4">
        <span className="text-[#1A7F64] font-semibold text-xl">ChequeMate</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4">
        {/* Channels Section */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
            CHANNELS
          </p>
          <div className="flex flex-col gap-2">
            {channelMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <div key={item.name} className="relative">
                  {active && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#70C8A1] rounded-r" />
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-[14px] rounded-lg transition-colors ${
                      active
                        ? "bg-[#002C1A] text-[#70C8A1]"
                        : "text-[#9CA3AF] hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supports Section */}
        <div>
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
            SUPPORTS
          </p>
          <div className="flex flex-col gap-2">
            {supportMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <div key={item.name} className="relative">
                  {active && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#70C8A1] rounded-r" />
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-[14px] rounded-lg transition-colors ${
                      active
                        ? "bg-[#002C1A] text-[#70C8A1]"
                        : "text-[#9CA3AF] hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
