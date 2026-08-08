import { HeroSection } from "@/components/home/HeroSection";
import { StoresMarquee } from "@/components/home/StoresMarquee";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { HowToOrderSection } from "@/components/home/HowToOrderSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";
import { getTestimonials, getFAQs, getStores } from "@/actions/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [testimonials, faqs, stores] = await Promise.all([
    getTestimonials(),
    getFAQs(),
    getStores(),
  ]);

  return (
    <>
      <HeroSection />
      <StoresMarquee stores={stores} />
      <WhyChooseSection />
      <HowToOrderSection />
      <ComparisonSection />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <ContactSection />
    </>
  );
}
