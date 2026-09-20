import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getUnreadMessageCount } from "@/actions/admin";
import { Toaster } from "sonner";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const unreadMessages = await getUnreadMessageCount().catch((error) => {
    console.error("[admin] unread message count failed", error);
    return 0;
  });

  return (
    <>
      <AdminShell
        role={(session.user as { role?: string }).role}
        name={session.user.name || "Administrateur"}
        unreadMessages={unreadMessages}
      >
        {children}
      </AdminShell>
      <Toaster richColors position="top-right" />
    </>
  );
}
