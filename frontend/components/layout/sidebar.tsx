"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, X } from "lucide-react";

import { sidebarMenus } from "@/constants/menus";
import { UserRole } from "@/types/auth";

type SidebarProps = {
  role?: UserRole;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Sidebar({ role, open = false, onOpenChange }: SidebarProps) {
  const pathname = usePathname();

  const menus = sidebarMenus.filter((menu) =>
    role ? menu.roles.includes(role) : false,
  );

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-slate-950/45 md:hidden"
          onClick={() => onOpenChange?.(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col overflow-y-auto bg-slate-950 text-white transition-transform md:fixed md:z-50 md:w-[280px] md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-[88px] flex items-center gap-3 px-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
            <GraduationCap size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold leading-tight">MANDA Gate</h1>
            <p className="text-xs font-medium text-slate-400">
              Portal Akademik
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup menu"
            className="ml-auto rounded-lg p-2 text-slate-100 hover:bg-slate-800 md:hidden"
            onClick={() => onOpenChange?.(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-5 py-2">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => onOpenChange?.(false)}
                className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-emerald-500 text-white font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{menu.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
