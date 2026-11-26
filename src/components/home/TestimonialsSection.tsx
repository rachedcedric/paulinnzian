import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@/types";

// All reviews visible at once (swipe row on mobile): no auto-rotation, which had no pause control (WCAG 2.2.2).
export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-title" className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep sm:text-sm">Ils me font confiance</p>
        <h2 id="testimonials-title" className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
          Ce que disent mes clients
        </h2>

        <ul
          tabIndex={0}
          aria-label="Avis clients, faites défiler pour tout lire"
          className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <li key={testimonial.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
              <figure className="flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-black/10">
                <div role="img" aria-label={`Note : ${testimonial.rating} sur 5`} className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      aria-hidden
                      className={`h-5 w-5 ${i < testimonial.rating ? "fill-gold text-gold" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-gray-800">
                  « {testimonial.comment} »
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {testimonial.photo ? (
                    <Image
                      src={testimonial.photo}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-lg font-bold text-gold"
                    >
                      {testimonial.name.charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block font-bold text-ink">{testimonial.name}</span>
                    <span className="block text-sm text-gray-600">Client vérifié</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
