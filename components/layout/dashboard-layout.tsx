"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { canAccessPath, getDefaultPath } from "@/lib/role-access";
import { useAuthStore } from "@/store/auth-store";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isAuthenticated, loadAuth } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadAuth();
    queueMicrotask(() => setMounted(true));
  }, [loadAuth]);

  useEffect(() => {
    const token = localStorage.getItem("manda_token");

    if (mounted && !token && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (!mounted || !user) return;

    if (!canAccessPath(user.role, pathname)) {
      router.replace(getDefaultPath(user.role));
    }
  }, [mounted, pathname, router, user]);

  if (!mounted) {
    return null;
  }

  if (user && !canAccessPath(user.role, pathname)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={user?.role}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <div className="min-h-screen min-w-0 bg-slate-50 md:ml-[280px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-screen bg-slate-50">
          <div className="px-4 py-5 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
