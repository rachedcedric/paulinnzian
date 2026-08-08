import { adminGetSettings } from "@/actions/admin";
import { ParametresAdmin } from "@/components/admin/ParametresAdmin";

export default async function AdminParametresPage() {
  const settings = await adminGetSettings();
  return <ParametresAdmin initialSettings={settings} />;
}
