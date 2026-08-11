/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Language = 'ar' | 'fr' | 'en';
export type Theme = 'dark' | 'light';
export type CarLocation = 'algeria';
export type FuelType = 'Essence' | 'Hybride' | 'Électrique' | 'Diesel';
export type Transmission = 'Automatic' | 'Manual';

export interface ServiceType {
  id: string;             // Unique identifier e.g. 'algeria_showroom', 'china_import', 'car_rental', 'bikes'
  nameAr: string;         // e.g. 'سيارات متوفرة في الجزائر'
  nameFr: string;         // e.g. 'Disponibles en Algérie'
  nameEn: string;         // e.g. 'Available in Algeria'
  badgeAr?: string;       // e.g. 'تسليم فوري 🇩🇿'
  badgeFr?: string;       // e.g. 'Livraison Immédiate 🇩🇿'
  badgeEn?: string;       // e.g. 'Immediate Delivery 🇩🇿'
  icon?: string;          // e.g. '🇩🇿', '🇨🇳', '🔑', '🏍️', '🚚'
  descriptionAr?: string; // e.g. 'متواجدة بصالة العرض وجاهزة للتسليم المباشر'
  descriptionFr?: string;
  descriptionEn?: string;
  enabled?: boolean;
}

export interface Car {
  id: string;
  brand: string;            // e.g. 'Geely', 'Chery', 'BYD', 'Changan', 'Jetour', 'DFSK'
  model: string;            // e.g. 'Coolray GF 2024'
  year: number;             // e.g. 2024
  priceDzd: number;         // e.g. 3850000 (0 means On Request / حسب الطلب)
  priceFormatted?: string;  // Custom display string if needed
  location: CarLocation;    // 'algeria' (متوفرة في الجزائر - تسليم فوري)
  serviceType?: string;     // ID of the ServiceType (e.g. 'algeria_showroom', 'china_import', 'car_rental', 'bikes', etc.)
  mainImage: string;        // Primary image URL or base64
  images: string[];         // Multiple images gallery
  phone: string;            // Dedicated phone for this car or showroom phone
  whatsapp: string;         // Dedicated WhatsApp number (international format e.g. +213550123456)
  mileage: string;          // e.g. '0 كم (جديدة)'
  transmission: Transmission;
  fuelType: FuelType;
  color?: string;           // e.g. 'أسود ميتاليك'
  exteriorColor?: string;   // e.g. 'أبيض لؤلؤي / Blanc Nacré'
  interiorColor?: string;   // e.g. 'جلد بني فخم / Cuir Marron'
  ficheTechnique?: string;     // PDF, Image, or Document Data URL
  ficheTechniqueName?: string; // e.g. 'Fiche_Technique_Tiggo8.pdf'
  specs: string[];          // e.g. ['فتحة سقف بانورامية', 'شاشة 12.3 بوصة', 'كاميرا 360°']
  description: {
    ar: string;
    fr: string;
    en: string;
  };
  featured?: boolean;
  createdAt?: string;
  // Rental specific fields
  rentalMinDays?: number;           // Minimum rental duration in days (e.g., 3 days)
  rentalAvailability?: 'both' | 'without_driver_only' | 'with_driver_only'; // Available options
  rentalPriceWithoutDriver?: number;// Price per day without driver in DZD
  rentalPriceWithDriver?: number;   // Price per day with driver in DZD
  rentalConditionsAr?: string;      // Obligations, rules & requirements with/without driver
  // China import / shipping specific fields
  shippingDuration?: string;        // e.g. "30 إلى 45 يوم", "45-60 days"
}

export interface FilterState {
  serviceType: string;
  brand: string;
  fuelType: string;
  transmission: string;
  search: string;
  minPrice: number;
  maxPrice: number;
}

export type ViewState =
  | { type: 'home' }
  | { type: 'car-detail'; car: Car }
  | { type: 'admin' };

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface ShowroomInfo {
  name: string;
  tagline?: string;
  taglineAr?: string;
  taglineFr?: string;
  taglineEn?: string;
  logoUrl?: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  adminEmail?: string;
  adminPassword?: string;
  addressAr: string;
  addressFr: string;
  addressEn: string;
  workingHoursAr: string;
  workingHoursFr: string;
  workingHoursEn: string;
  googleMapsUrl: string;
  mapEmbedUrl?: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  heroBgType: 'gradient' | 'image' | 'video';
  heroBgUrl: string;
  heroOverlayOpacity?: number;
  serviceTypes?: ServiceType[];
}
