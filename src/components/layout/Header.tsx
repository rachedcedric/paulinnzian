"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Package, Calculator, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "./SiteConfigContext";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/boutiques", label: "Boutiques en ligne" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/suivi", label: "Suivre votre colis", icon: Package },
  { href: "/contact", label: "Contact" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#090B10] border-2 border-[#D99A12] flex items-center justify-center shrink-0">
        <span className="text-white font-black text-xs sm:text-sm tracking-tight">PN</span>
        <Plane className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#D99A12] rotate-45" />
      </div>
      <div className="leading-tight">
        <p className="font-black text-black text-sm sm:text-lg tracking-tight whitespace-nowrap">PAULIN N&apos;ZIAN</p>
        <p className="text-[9px] sm:text-[10px] text-gray-500 font-semibold tracking-[0.2em] uppercase -mt-0.5">
          Personal Shopper
        </p>
      </div>
    </Link>
  );
}

export function Header() {
  const { whatsappUrl, whatsappNumber, announcementEnabled } = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300",
        announcementEnabled ? "top-9" : "top-0",
        scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-[#D99A12] transition-colors whitespace-nowrap"
              >
                {link.icon && <link.icon className="w-4 h-4 shrink-0" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/devis-achat"
              className="flex items-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:shadow-lg"
            >
              <Calculator className="w-4 h-4" />
              Devis d&apos;achat
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-2 bg-[#090B10] hover:bg-black text-white px-4 py-2.5 rounded-full transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span className="flex flex-col items-start leading-none">
                <span className="text-[9px] text-gray-400">WhatsApp</span>
                <span className="text-xs font-bold">{whatsappNumber}</span>
              </span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="xl:hidden border-t border-gray-100 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#D99A12] hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            <div className="pt-2 px-4 space-y-2">
              <Link
                href="/devis-achat"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#D99A12] text-white text-sm font-bold px-5 py-3 rounded-full w-full"
              >
                <Calculator className="w-4 h-4" />
                Devis d&apos;achat
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#090B10] text-white text-sm font-semibold px-5 py-3 rounded-full w-full"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
