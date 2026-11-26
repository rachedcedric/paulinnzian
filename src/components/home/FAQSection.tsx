import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/types";

// Native <details>: keyboard and screen-reader support built in, no client JavaScript.
export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq-title" className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep sm:text-sm">Questions fréquentes</p>
          <h2 id="faq-title" className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Tout ce que vous devez savoir
          </h2>
          <p className="mt-4 text-gray-700">
            Une autre question ?{" "}
            <Link href="/contact" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-deep">
              Écrivez-moi
            </Link>
            , je réponds 7j/7.
          </p>
        </div>

        <div className="divide-y divide-black/10 border-y border-black/10">
          {faqs.map((faq) => (
            <details key={faq.id} className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-bold text-ink sm:text-lg [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-gold-deep transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="whitespace-pre-line pb-5 pr-8 leading-relaxed text-gray-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
