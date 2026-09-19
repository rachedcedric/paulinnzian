import { adminListOrders } from "@/actions/admin";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAdminRole, MANAGER_ROLES } from "@/lib/admin-permissions";

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await adminListOrders(await searchParams);

  const session = await auth();
  const user = session?.user?.id
    ? await prisma.adminUser.findUnique({ where: { id: session.user.id }, select: { role: true } })
    : null;
  const canManage = !!user && hasAdminRole(user.role, MANAGER_ROLES);

  return <OrdersAdmin {...data} canManage={canManage} />;
}
