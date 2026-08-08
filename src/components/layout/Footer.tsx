import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="MR SHEIN" width={56} height={56} className="rounded-full" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Paulin N'ZIAN — Votre Personal Shopper pour vos achats en Europe.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/33637036839"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF6500] transition-colors"
              >
                <span className="text-white text-xs font-bold">IG</span>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF6500] transition-colors"
              >
                <span className="text-white text-xs font-bold">FB</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/boutiques", label: "Boutiques en ligne" },
                { href: "/tarifs", label: "Tarifs" },
                { href: "/suivi", label: "Suivre votre colis" },
                { href: "/comment-ca-marche", label: "Comment ça marche" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#FF6500] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Bureau Paris</p>
                <p>Paris 18ème arrondissement</p>
              </li>
              <li>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Bureau Abidjan</p>
                <p>Cocody Faya, Abidjan</p>
              </li>
              <li>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">WhatsApp</p>
                <a href="https://wa.me/33637036839" className="hover:text-[#25D366] transition-colors">
                  +33 6 37 03 68 39
                </a>
              </li>
              <li>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Appels & SMS</p>
                <p>+225 07 77 06 13 30</p>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-semibold text-white mb-4">Prêt à commander ?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Envoyez-moi vos liens produits directement sur WhatsApp.
            </p>
            <a
              href="https://wa.me/33637036839"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-white text-sm font-semibold px-5 py-3 rounded-full transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Commander sur WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {year} Paulin N'ZIAN - Personal Shopper. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">
              Confidentialité
            </Link>
            <Link href="/cookies" className="hover:text-gray-300 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
