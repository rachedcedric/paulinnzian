import { HeroSection } from "@/components/home/HeroSection";
import { HomeTrackingSection } from "@/components/home/HomeTrackingSection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { HowToOrderSection } from "@/components/home/HowToOrderSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";
import { getTestimonials, getFAQs } from "@/actions/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [testimonials, faqs] = await Promise.all([
    getTestimonials(),
    getFAQs(),
  ]);

  return (
    <>
      <HeroSection />
      <HomeTrackingSection />
      <WhyChooseSection />
      <HowToOrderSection />
      <ComparisonSection />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <ContactSection />
    </>
  );
}
