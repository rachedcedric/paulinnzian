import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { useSiteConfig } from "./SiteConfigContext";
import { CommunityLinks } from "./CommunityLinks";

interface FooterProps {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

export function Footer({ facebookUrl, instagramUrl, tiktokUrl }: FooterProps) {
  const {
    whatsappUrl,
    whatsappNumber,
    phoneCi,
    addressParis,
    addressAbidjan,
    siteName,
    siteSlogan,
  } = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-16 pb-44 sm:pb-8 [--focus-ring:var(--gold)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt={siteName} width={56} height={56} className="rounded-full" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {siteName} — {siteSlogan}
            </p>
            <div className="flex gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="w-4 h-4 text-ink" aria-hidden />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#E4405F] transition-colors"
              >
                <FaInstagram className="w-4 h-4 text-white" aria-hidden />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-colors"
              >
                <FaFacebookF className="w-4 h-4 text-white" aria-hidden />
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                title="TikTok"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white transition-colors group"
              >
                <SiTiktok className="w-4 h-4 text-white group-hover:text-black" aria-hidden />
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
                    className="text-sm text-gray-400 hover:text-[#D99A12] transition-colors"
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
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Bureau Paris</p>
                <p>{addressParis}</p>
              </li>
              <li>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Bureau Abidjan</p>
                <p>{addressAbidjan}</p>
              </li>
              <li>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">WhatsApp</p>
                <a href={whatsappUrl} className="hover:text-[#25D366] transition-colors">
                  {whatsappNumber}
                </a>
              </li>
              <li>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Appels & SMS</p>
                <p>{phoneCi}</p>
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
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-ink text-sm font-bold px-5 py-3 rounded-full transition-all"
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              Commander sur WhatsApp
            </a>
            <CommunityLinks className="mt-4 items-start" />
          </div>
        </div>

        <div className="mb-8 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <div>
            <p className="text-center text-xs font-semibold uppercase text-gray-400 sm:text-left">
              Partenaire transport
            </p>
            <p className="mt-1 text-center text-sm text-gray-300 sm:text-left">
              Expédition et acheminement avec Alizé Fret
            </p>
          </div>
          {/* Text wordmark, not an <img>: the old lazy SVG relied on fonts phones do not have, and next/image
              hides alt text, so whenever the image was not painted the box stayed empty. Text always renders. */}
          <a
            href="https://alizefret.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 transition-opacity hover:opacity-90"
          >
            <span className="font-display text-3xl italic leading-none text-[#1565C0]">alizé</span>
            <span className="flex flex-col items-start leading-none">
              <span className="text-2xl font-black tracking-[0.12em] text-[#0D47A1]">FRET</span>
              <span className="mt-1 bg-[#0D47A1] px-1.5 py-0.5 text-[10px] font-bold tracking-[0.14em] text-white">
                ENVOI COLIS GP
              </span>
            </span>
            <span className="sr-only">(site du partenaire transport, nouvel onglet)</span>
          </a>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {year} Paulin N'ZIAN - Personal Shopper. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
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
