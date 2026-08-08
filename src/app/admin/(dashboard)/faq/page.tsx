import { adminGetFAQs } from "@/actions/admin";
import { FAQAdmin } from "@/components/admin/FAQAdmin";

export default async function AdminFAQPage() {
  const items = await adminGetFAQs();
  return <FAQAdmin initialData={items} />;
}
