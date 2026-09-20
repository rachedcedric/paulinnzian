"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Package, Store, DollarSign, Star, HelpCircle,
  MessageSquare, Settings, LogOut, X, Users,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/commandes", label: "Commandes", icon: Package },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/boutiques", label: "Boutiques", icon: Store },
  { href: "/admin/tarifs", label: "Tarifs", icon: DollarSign },
  { href: "/admin/temoignages", label: "Témoignages", icon: Star },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/utilisateurs", label: "Administrateurs", icon: UserCog, superAdminOnly: true },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, superAdminOnly: true },
];

interface Props {
  role?: string;
  unreadMessages?: number;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({ role, unreadMessages = 0, collapsed, mobileOpen, onCloseMobile }: Props) {
  const pathname = usePathname();
  const isOpen = mobileOpen;
  const setIsOpen = (open: boolean) => { if (!open) onCloseMobile(); };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-[#0B1018] flex flex-col z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          !collapsed && "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-black border-2 border-[#D99A12] flex items-center justify-center shrink-0">
                <span className="text-white font-black text-[10px] tracking-tight">PN</span>
              </div>
              <div>
                <p className="font-black text-white text-sm">PAULIN N&apos;ZIAN</p>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.superAdminOnly && role !== "SUPER_ADMIN") return null;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#D99A12] text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {item.href === "/admin/messages" && unreadMessages > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
