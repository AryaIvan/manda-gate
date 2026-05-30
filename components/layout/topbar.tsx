"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu size={18} />
        </Button>

        <div>
          <h2 className="font-semibold text-slate-900">MANDA Gate</h2>
          <p className="text-xs text-slate-500">
            Portal Akademik Terpadu MAN 2 Gresik
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-900">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-slate-500">{user?.role || "-"}</p>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}