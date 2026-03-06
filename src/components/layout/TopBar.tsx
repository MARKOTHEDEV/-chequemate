"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userName = user ? `${user.first_name} ${user.last_name}` : "Admin User";
  const userRole = user?.is_superuser ? "Super Admin" : "Admin";

  return (
    <header className="h-[72px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-[32px]">
      {/* Page Title */}
      <div>
        <h1 className="text-[20px] font-[700] text-[#1A1A1A]">{title}</h1>
        {subtitle && <p className="text-sm text-[#6B7280]">{subtitle}</p>}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Icon Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors">
            <Moon className="w-5 h-5 text-[#6B7280]" strokeWidth={1.5} />
          </button>

          {/* Notification Bell */}
          <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors relative">
            <Bell className="w-5 h-5 text-[#6B7280]" strokeWidth={1.5} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-[#EF4444] rounded-full"></span>
          </button>
        </div>

        {/* User Menu with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-[24px] hover:opacity-80 transition-opacity"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-[#1A1A1A]">{userName}</p>
              <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                {userRole}
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </span>
            </div>

            {/* Avatar */}
            <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-[#DBEAFE]">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="48" height="48" fill="#DBEAFE" />
                <ellipse cx="24" cy="14" rx="10" ry="8" fill="#7C3AED" />
                <path
                  d="M14 16C14 16 16 8 24 8C32 8 34 16 34 16"
                  fill="#7C3AED"
                />
                <ellipse cx="24" cy="20" rx="8" ry="9" fill="#FDDCAB" />
                <circle cx="21" cy="19" r="1" fill="#1F2937" />
                <circle cx="27" cy="19" r="1" fill="#1F2937" />
                <path
                  d="M22 23C22 23 24 25 26 23"
                  stroke="#1F2937"
                  strokeWidth="0.5"
                  fill="none"
                />
                <path
                  d="M12 48C12 38 16 32 24 32C32 32 36 38 36 48"
                  fill="#3B82F6"
                />
                <path d="M24 32L22 36L24 48L26 36L24 32Z" fill="#F59E0B" />
                <path
                  d="M20 32L24 36L28 32"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#E5E7EB] shadow-lg py-2 z-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to profile if needed
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#1A1A1A] hover:bg-[#F9FAFB] transition-colors"
              >
                <User className="w-4 h-4 text-[#6B7280]" />
                Profile
              </button>
              <div className="border-t border-[#E5E7EB] my-1" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
