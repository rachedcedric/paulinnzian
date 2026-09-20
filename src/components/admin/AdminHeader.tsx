"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, Menu, Search } from "lucide-react";
import { ORDERS_TIMEZONE } from "@/lib/order-list";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Éditeur",
};

const longDate = () =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: ORDERS_TIMEZONE, day: "numeric", month: "long", year: "numeric" }).format(new Date());

interface Props {
  name: string;
  role?: string;
  unreadMessages: number;
  onToggleSidebar: () => void;
}

export function AdminHeader({ name, role, unreadMessages, onToggleSidebar }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "AD";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = query.trim();
    router.push(value ? `/admin/commandes?search=${encodeURIComponent(value)}` : "/admin/commandes");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button onClick={onToggleSidebar} aria-label="Ouvrir ou réduire le menu" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
        <Menu className="h-5 w-5" />
      </button>

      <form onSubmit={submit} className="relative min-w-0 max-w-xl flex-1" role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={100}
          placeholder="Rechercher une commande, un client, un numéro de suivi..."
          aria-label="Rechercher une commande"
          className="h-10 w-full rounded-lg border border-gray-100 bg-gray-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D99A12]"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-3 rounded-xl border border-gray-100 px-3 py-1.5 xl:flex" suppressHydrationWarning>
          <CalendarDays className="h-5 w-5 text-gray-500" />
          <div className="text-xs leading-tight">
            <p className="text-gray-500">Aujourd&apos;hui</p>
            <p className="font-semibold text-gray-800" suppressHydrationWarning>{longDate()}</p>
          </div>
        </div>

        <Link href="/admin/messages" aria-label={`Notifications${unreadMessages ? ` : ${unreadMessages} message(s) non lu(s)` : ""}`} className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {unreadMessages > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1018] text-xs font-bold text-white">{initials}</div>
          <div className="hidden text-xs leading-tight sm:block">
            <p className="font-semibold text-gray-900">{name}</p>
            <p className="text-gray-500">{ROLE_LABELS[role ?? ""] ?? "Administrateur"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
