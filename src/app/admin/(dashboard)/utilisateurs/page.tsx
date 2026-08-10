import { adminGetUsers } from "@/actions/admin";
import { AdminUsers } from "@/components/admin/AdminUsers";

export default async function AdminUsersPage() {
  const users = await adminGetUsers();
  return <AdminUsers initialUsers={users} />;
}
