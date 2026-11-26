import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { SavingsSection } from "@/components/home/SavingsSection";
import { HowToOrderSection } from "@/components/home/HowToOrderSection";
import { PartnerStores } from "@/components/home/PartnerStores";
import { StoresBand } from "@/components/home/StoresBand";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";
import { getTestimonials, getFAQs, getStores, getShippingRates } from "@/actions/public";

export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [testimonials, faqs, stores, shippingRates] = await Promise.all([
    getTestimonials(),
    getFAQs(),
    getStores(),
    getShippingRates(),
  ]);

  // Cheapest per-kg tariff from Admin → Tarifs, quoted in the hero receipt and the price ticket.
  const perKg = shippingRates
    .filter((rate) => rate.pricingType === "PER_KG" && rate.price !== null)
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
  const perKgRate = perKg?.price ? { name: perKg.name, price: perKg.price } : null;

  return (
    <>
      <HeroSection perKgRate={perKgRate} />
      <SavingsSection shippingRates={shippingRates} perKgRate={perKgRate} />
      <HowToOrderSection />
      <PartnerStores stores={stores} />
      <StoresBand stores={stores} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <ContactSection />
    </>
  );
}
