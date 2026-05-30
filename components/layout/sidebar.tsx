"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { sidebarMenus } from "@/constants/menus";
import { UserRole } from "@/types/auth";

type SidebarProps = {
  role?: UserRole;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const menus = sidebarMenus.filter((menu) =>
    role ? menu.roles.includes(role) : false
  );

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-emerald-900 text-white min-h-screen">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-emerald-800">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <GraduationCap size={24} />
        </div>

        <div>
          <h1 className="font-bold leading-tight">MANDA Gate</h1>
          <p className="text-xs text-emerald-100">MAN 2 Gresik</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                isActive
                  ? "bg-white text-emerald-900 font-semibold"
                  : "text-emerald-50 hover:bg-emerald-800"
              }`}
            >
              <Icon size={18} />
              <span>{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <p className="text-xs text-emerald-100">
          Portal Akademik Terpadu
        </p>
      </div>
    </aside>
  );
}