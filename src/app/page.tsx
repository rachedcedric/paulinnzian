import { HeroSection } from "@/components/home/HeroSection";
import { HowToOrderSection } from "@/components/home/HowToOrderSection";
import { StoresBand } from "@/components/home/StoresBand";
import { TarifsTeaserSection } from "@/components/home/TarifsTeaserSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";
import { getTestimonials, getFAQs, getStores, getShippingRates } from "@/actions/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [testimonials, faqs, stores, shippingRates] = await Promise.all([
    getTestimonials(),
    getFAQs(),
    getStores(),
    getShippingRates(),
  ]);

  return (
    <>
      <HeroSection stores={stores} />
      <HowToOrderSection />
      <StoresBand stores={stores} />
      <TarifsTeaserSection shippingRates={shippingRates} />
      <ComparisonSection />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <ContactSection />
    </>
  );
}
