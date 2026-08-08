import { adminGetTestimonials } from "@/actions/admin";
import { TestimonialsAdmin } from "@/components/admin/TestimonialsAdmin";

export default async function AdminTemoignagesPage() {
  const items = await adminGetTestimonials();
  return <TestimonialsAdmin initialData={items} />;
}
