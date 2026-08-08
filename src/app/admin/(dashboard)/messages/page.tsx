import { adminGetMessages } from "@/actions/admin";
import { MessagesAdmin } from "@/components/admin/MessagesAdmin";

export default async function AdminMessagesPage() {
  const messages = await adminGetMessages();
  return <MessagesAdmin initialData={messages} />;
}
