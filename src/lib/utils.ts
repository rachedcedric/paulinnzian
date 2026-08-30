import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateInput(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAnnouncementText(text: string, dateInput?: string): string {
  if (!dateInput) return text;
  const date = new Date(`${dateInput}T00:00:00`);
  if (Number.isNaN(date.getTime())) return text;
  return text ? `${text} ${formatDate(date)}` : formatDate(date);
}

export function encodeWhatsAppMessage(message: string): string {
  return encodeURIComponent(message);
}

export function getWhatsAppLink(base: string, message?: string): string {
  if (!message) return base;
  return `${base}?text=${encodeWhatsAppMessage(message)}`;
}
