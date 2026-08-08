import { OrderStatus, PricingType, MessageStatus, Role } from "@prisma/client";

export type { OrderStatus, PricingType, MessageStatus, Role };

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  websiteUrl: string;
  category: string;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRate {
  id: string;
  name: string;
  rate: number;
  currencyFrom: string;
  currencyTo: string;
  description: string | null;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface ShippingRate {
  id: string;
  name: string;
  pricingType: PricingType;
  price: number | null;
  percentage: number | null;
  description: string | null;
  estimatedDelivery: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  storeName: string | null;
  storeOrderNumber: string | null;
  amount: number | null;
  packageCount: number | null;
  weight: number | null;
  destinationCity: string;
  destinationCountry: string;
  internalNotes: string | null;
  status: OrderStatus;
  orderDate: Date;
  trackingEvents: TrackingEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  title: string;
  description: string | null;
  location: string | null;
  eventDate: Date;
  displayOrder: number;
  createdAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string | null;
  rating: number;
  comment: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettings {
  site_name: string;
  site_slogan: string;
  whatsapp_number: string;
  whatsapp_link: string;
  phone_ci: string;
  address_paris: string;
  address_abidjan: string;
  facebook_url: string;
  instagram_url: string;
  hero_title: string;
  hero_subtitle: string;
  meta_description: string;
  [key: string]: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PURCHASED: "Commande effectuée",
  RECEIVED_PARIS: "Reçu à Paris",
  SHIPPED_DESTINATION: "Expédié vers la destination",
  ARRIVED_DESTINATION: "Arrivé à destination",
  DELIVERED: "Livré au client",
  CANCELLED: "Annulé",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "text-yellow-600 bg-yellow-50",
  PURCHASED: "text-blue-600 bg-blue-50",
  RECEIVED_PARIS: "text-purple-600 bg-purple-50",
  SHIPPED_DESTINATION: "text-orange-600 bg-orange-50",
  ARRIVED_DESTINATION: "text-teal-600 bg-teal-50",
  DELIVERED: "text-green-600 bg-green-50",
  CANCELLED: "text-red-600 bg-red-50",
};

export const STORE_CATEGORIES = [
  "Tous",
  "Mode",
  "Beauté",
  "High-Tech",
  "Sport",
  "Maison",
  "Marketplace",
  "Luxe",
];
