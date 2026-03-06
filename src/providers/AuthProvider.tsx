"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface AuthProviderProps {
  children: ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = ["/login", "/forgot-password"];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait for hydration
    if (isLoading) return;

    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to login if not authenticated and trying to access protected route
      router.push("/login");
    } else if (isAuthenticated && isPublicRoute) {
      // Redirect to dashboard if authenticated and trying to access public route
      router.push("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#008A48] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
