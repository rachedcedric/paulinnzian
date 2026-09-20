"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface Props {
  role?: string;
  name: string;
  unreadMessages: number;
  children: React.ReactNode;
}

export function AdminShell({ role, name, unreadMessages, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <AdminSidebar
        role={role}
        unreadMessages={unreadMessages}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`min-h-screen min-w-0 flex-1 transition-[margin] duration-300 ${collapsed ? "lg:ml-0" : "lg:ml-64"}`}>
        <AdminHeader
          name={name}
          role={role}
          unreadMessages={unreadMessages}
          onToggleSidebar={() => {
            // Below lg the sidebar is a drawer; from lg up it collapses.
            if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed((c) => !c);
            else setMobileOpen((o) => !o);
          }}
        />
        {children}
      </div>
    </div>
  );
}
