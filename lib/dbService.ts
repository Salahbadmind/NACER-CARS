import { supabase, getSupabase, isValidSupabaseConfig } from './supabaseClient';
import { Car, ShowroomInfo } from '../types';
import { INITIAL_CARS, SHOWROOM_INFO } from '../constants';

const LOCAL_CARS_KEY = 'kadex_cars';
const LOCAL_INFO_KEY = 'kadex_showroom_info';
const LOCAL_SEEDED_KEY = 'kadex_has_seeded_v1';

// In-memory listeners for instantaneous UI sync
type CarsListener = (cars: Car[]) => void;
const carsListeners: Set<CarsListener> = new Set();

function notifyCarsListeners(cars: Car[]) {
  carsListeners.forEach(cb => cb(cars));
}

// Helper to remove undefined fields before writing
function cleanObject<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Fallback image if Base64 string is corrupt or oversized
const FALLBACK_CAR_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200';

export function sanitizeCarData(car: Car): Car {
  const cleaned = cleanObject(car);

  if (cleaned.mainImage && cleaned.mainImage.startsWith('data:') && cleaned.mainImage.length > 350000) {
    console.warn(`Car ${car.id} mainImage is oversized (${cleaned.mainImage.length} bytes). Truncating to fallback image.`);
    cleaned.mainImage = FALLBACK_CAR_IMAGE;
  }

  if (cleaned.images && Array.isArray(cleaned.images)) {
    cleaned.images = cleaned.images.map(img => {
      if (img && img.startsWith('data:') && img.length > 350000) {
        return FALLBACK_CAR_IMAGE;
      }
      return img;
    });
  }

  return cleaned;
}

// Helper to detect if a Supabase table does not exist in schema cache
export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.details || error.hint || String(error)).toLowerCase();
  const code = error.code;
  return (
    msg.includes('could not find the table') ||
    msg.includes('in the schema cache') ||
    (msg.includes('relation') && msg.includes('does not exist')) ||
    (msg.includes('table') && msg.includes('does not exist')) ||
    code === '42P01' ||
    code === 'PGRST200' ||
    code === 'PGRST204' ||
    code === 'PGRST301'
  );
}

// Helper to parse car data supporting camelCase, snake_case, and lowercase PostgreSQL column names
function parseCarData(data: Record<string, any>): Car {
  return {
    id: data.id,
    brand: data.brand || '',
    model: data.model || '',
    year: Number(data.year || 2024),
    priceDzd: Number(data.priceDzd ?? data.price_dzd ?? data.pricedzd ?? 0),
    priceFormatted: data.priceFormatted ?? data.price_formatted ?? data.priceformatted ?? '',
    location: data.location || 'algeria',
    serviceType: data.serviceType ?? data.service_type ?? data.servicetype ?? 'algeria_showroom',
    rentalMinDays: data.rentalMinDays ? Number(data.rentalMinDays) : (data.rental_min_days ? Number(data.rental_min_days) : (data.rentalmindays ? Number(data.rentalmindays) : undefined)),
    rentalAvailability: data.rentalAvailability ?? data.rental_availability ?? data.rentalavailability,
    rentalPriceWithoutDriver: data.rentalPriceWithoutDriver ? Number(data.rentalPriceWithoutDriver) : (data.rental_price_without_driver ? Number(data.rental_price_without_driver) : (data.rentalpricewithoutdriver ? Number(data.rentalpricewithoutdriver) : undefined)),
    rentalPriceWithDriver: data.rentalPriceWithDriver ? Number(data.rentalPriceWithDriver) : (data.rental_price_with_driver ? Number(data.rental_price_with_driver) : (data.rentalpricewithdriver ? Number(data.rentalpricewithdriver) : undefined)),
    rentalConditionsAr: data.rentalConditionsAr ?? data.rental_conditions_ar ?? data.rentalconditionsar,
    shippingDuration: data.shippingDuration ?? data.shipping_duration ?? data.shippingduration,
    phone: data.phone || '',
    whatsapp: data.whatsapp || '',
    mileage: data.mileage || '',
    color: data.color || '',
    exteriorColor: data.exteriorColor ?? data.exterior_color ?? data.exteriorcolor ?? data.color,
    interiorColor: data.interiorColor ?? data.interior_color ?? data.interiorcolor,
    fuelType: data.fuelType ?? data.fuel_type ?? data.fueltype ?? 'Essence',
    transmission: data.transmission ?? 'Automatic',
    mainImage: data.mainImage ?? data.main_image ?? data.mainimage ?? FALLBACK_CAR_IMAGE,
    images: Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? JSON.parse(data.images || '[]') : []),
    ficheTechnique: data.ficheTechnique ?? data.fiche_technique ?? data.fichetechnique,
    ficheTechniqueName: data.ficheTechniqueName ?? data.fiche_technique_name ?? data.fichetechniquename,
    specs: Array.isArray(data.specs) ? data.specs : (typeof data.specs === 'string' ? JSON.parse(data.specs || '[]') : []),
    description: typeof data.description === 'object' && data.description !== null ? data.description : { ar: '', fr: '', en: '' },
    featured: data.featured ?? true,
    createdAt: data.createdAt ?? data.created_at ?? data.createdat ?? new Date().toISOString()
  };
}

// Merge Supabase fetched data with LocalStorage to preserve client-side files if remote DB schema lacks certain columns
function mergeWithLocalStorageCars(remoteCars: Car[]): Car[] {
  const localMap = new Map<string, Car>();
  try {
    const saved = localStorage.getItem(LOCAL_CARS_KEY);
    if (saved) {
      const parsed: Car[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach(c => localMap.set(c.id, c));
      }
    }
  } catch (e) {}

  return remoteCars.map(raw => {
    const parsed = parseCarData(raw);
    const local = localMap.get(parsed.id);
    if (local) {
      return {
        ...parsed,
        ficheTechnique: parsed.ficheTechnique || local.ficheTechnique,
        ficheTechniqueName: parsed.ficheTechniqueName || local.ficheTechniqueName,
        exteriorColor: parsed.exteriorColor || local.exteriorColor,
        interiorColor: parsed.interiorColor || local.interiorColor,
        rentalMinDays: parsed.rentalMinDays ?? local.rentalMinDays,
        rentalAvailability: parsed.rentalAvailability ?? local.rentalAvailability,
        rentalPriceWithoutDriver: parsed.rentalPriceWithoutDriver ?? local.rentalPriceWithoutDriver,
        rentalPriceWithDriver: parsed.rentalPriceWithDriver ?? local.rentalPriceWithDriver,
        rentalConditionsAr: parsed.rentalConditionsAr || local.rentalConditionsAr,
        shippingDuration: parsed.shippingDuration || local.shippingDuration,
      };
    }
    return parsed;
  });
}

// Convert camelCase object to snake_case
function toSnakeCasePayload(car: Car): Record<string, any> {
  const sanitized = sanitizeCarData(car);
  return {
    id: sanitized.id,
    brand: sanitized.brand,
    model: sanitized.model,
    year: sanitized.year,
    price_dzd: sanitized.priceDzd,
    price_formatted: sanitized.priceFormatted,
    location: sanitized.location,
    service_type: sanitized.serviceType || 'algeria_showroom',
    rental_min_days: sanitized.rentalMinDays,
    rental_availability: sanitized.rentalAvailability,
    rental_price_without_driver: sanitized.rentalPriceWithoutDriver,
    rental_price_with_driver: sanitized.rentalPriceWithDriver,
    rental_conditions_ar: sanitized.rentalConditionsAr,
    shipping_duration: sanitized.shippingDuration,
    phone: sanitized.phone,
    whatsapp: sanitized.whatsapp,
    mileage: sanitized.mileage,
    color: sanitized.color,
    exterior_color: sanitized.exteriorColor,
    interior_color: sanitized.interiorColor,
    fuel_type: sanitized.fuelType,
    transmission: sanitized.transmission,
    main_image: sanitized.mainImage,
    images: sanitized.images,
    fiche_technique: sanitized.ficheTechnique,
    fiche_technique_name: sanitized.ficheTechniqueName,
    specs: sanitized.specs,
    description: sanitized.description,
    featured: sanitized.featured,
    created_at: sanitized.createdAt
  };
}

// Helper to upsert a car to Supabase with fallback for lowercased keys, snake_case, and dynamic pruning of missing columns
export async function upsertCarToSupabase(car: Car): Promise<void> {
  const client = getSupabase();
  if (!client) {
    throw new Error('لم يتم إعداد بيانات الاتصال بـ Supabase (URL & Key)');
  }
  const sanitized = sanitizeCarData(car);

  // Strategy 1: camelCase
  let payload: Record<string, any> = { ...sanitized };
  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await client.from('cars').upsert(payload);
    if (!error) {
      console.log(`Successfully saved car ${car.id} to Supabase!`);
      return;
    }
    if (isTableMissingError(error)) {
      throw new Error(`جدول public.cars غير موجود في مشروع Supabase. يرجى تنفيذ سكربت SQL في Supabase SQL Editor.`);
    }
    const missingColMatch = error.message?.match(/Could not find the '([^']+)' column/i);
    if (missingColMatch && missingColMatch[1]) {
      const missingKey = missingColMatch[1];
      delete payload[missingKey];
    } else {
      break;
    }
  }

  // Strategy 2: snake_case
  let snakePayload: Record<string, any> = toSnakeCasePayload(car);
  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await client.from('cars').upsert(snakePayload);
    if (!error) {
      console.log(`Successfully saved car ${car.id} to Supabase using snake_case!`);
      return;
    }
    if (isTableMissingError(error)) {
      throw new Error(`جدول public.cars غير موجود في مشروع Supabase. يرجى تنفيذ سكربت SQL في Supabase SQL Editor.`);
    }
    const missingColMatch = error.message?.match(/Could not find the '([^']+)' column/i);
    if (missingColMatch && missingColMatch[1]) {
      const missingKey = missingColMatch[1];
      delete snakePayload[missingKey];
    } else {
      break;
    }
  }

  // Strategy 3: lowercased keys
  let lowercasePayload: Record<string, any> = {};
  Object.keys(sanitized).forEach(key => {
    lowercasePayload[key.toLowerCase()] = (sanitized as any)[key];
  });
  let lastError: any = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await client.from('cars').upsert(lowercasePayload);
    if (!error) {
      console.log(`Successfully saved car ${car.id} to Supabase using lowercase columns!`);
      return;
    }
    if (isTableMissingError(error)) {
      throw new Error(`جدول public.cars غير موجود في مشروع Supabase. يرجى تنفيذ سكربت SQL في Supabase SQL Editor.`);
    }
    const missingColMatch = error.message?.match(/Could not find the '([^']+)' column/i);
    if (missingColMatch && missingColMatch[1]) {
      const missingKey = missingColMatch[1];
      delete lowercasePayload[missingKey];
    } else {
      lastError = error;
      break;
    }
  }
  if (lastError) {
    throw new Error(`فشل الحفظ في جدول cars: ${lastError.message || JSON.stringify(lastError)}`);
  }
}

/**
 * Subscribe to cars with automatic real-time updates via Supabase or LocalStorage fallback.
 */
export function subscribeCars(
  onCarsUpdated: (cars: Car[]) => void,
  onError?: (error: Error) => void
): () => void {
  carsListeners.add(onCarsUpdated);

  let activeUnsubscribe: (() => void) | null = null;
  let isSubscribedToSupabase = false;

  const setupSubscription = () => {
    // Tear down previous sub if any
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    const client = getSupabase();

    if (!client || !isValidSupabaseConfig()) {
      isSubscribedToSupabase = false;
      // Local storage fallback
      try {
        const saved = localStorage.getItem(LOCAL_CARS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            onCarsUpdated(parsed);
          } else {
            onCarsUpdated(INITIAL_CARS);
          }
        } else {
          onCarsUpdated(INITIAL_CARS);
        }
      } catch (e) {
        onCarsUpdated(INITIAL_CARS);
      }
      return;
    }

    // We have a Supabase client!
    isSubscribedToSupabase = true;

    // Fetch initial cars from Supabase
    const fetchCars = async () => {
      try {
        const { data, error } = await client.from('cars').select('*');
        if (error) {
          if (isTableMissingError(error)) {
            console.info("Supabase table 'cars' not yet in schema cache. Using local cars catalog.");
            try {
              const saved = localStorage.getItem(LOCAL_CARS_KEY);
              if (saved) onCarsUpdated(JSON.parse(saved));
              else onCarsUpdated(INITIAL_CARS);
            } catch (e) {
              onCarsUpdated(INITIAL_CARS);
            }
            return;
          }
          throw error;
        }

        if (data && data.length > 0) {
          localStorage.setItem(LOCAL_SEEDED_KEY, 'true');
          const merged = mergeWithLocalStorageCars(data);
          onCarsUpdated(merged);
          try {
            localStorage.setItem(LOCAL_CARS_KEY, JSON.stringify(merged));
          } catch (e) {}
        } else {
          const hasSeeded = localStorage.getItem(LOCAL_SEEDED_KEY);
          if (!hasSeeded) {
            console.log('Seeding initial cars to Supabase...');
            localStorage.setItem(LOCAL_SEEDED_KEY, 'true');
            for (const car of INITIAL_CARS) {
              try {
                await upsertCarToSupabase(car);
              } catch (e) {}
            }
            onCarsUpdated(INITIAL_CARS);
          } else {
            try {
              const saved = localStorage.getItem(LOCAL_CARS_KEY);
              if (saved) onCarsUpdated(JSON.parse(saved));
              else onCarsUpdated([]);
            } catch (e) {
              onCarsUpdated([]);
            }
          }
        }
      } catch (err: any) {
        if (!isTableMissingError(err)) {
          console.warn('Notice querying cars from Supabase, using local state:', err?.message || err);
          if (onError) onError(err as Error);
        }
        try {
          const saved = localStorage.getItem(LOCAL_CARS_KEY);
          if (saved) onCarsUpdated(JSON.parse(saved));
          else onCarsUpdated(INITIAL_CARS);
        } catch (e) {
          onCarsUpdated(INITIAL_CARS);
        }
      }
    };

    fetchCars();

    // Set up real-time channel
    try {
      const channel = client
        .channel('public_cars')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, async () => {
          const { data } = await client.from('cars').select('*');
          if (data) {
            const merged = mergeWithLocalStorageCars(data);
            onCarsUpdated(merged);
            try {
              localStorage.setItem(LOCAL_CARS_KEY, JSON.stringify(merged));
            } catch (e) {}
          }
        })
        .subscribe();

      activeUnsubscribe = () => {
        client.removeChannel(channel);
      };
    } catch (e) {
      activeUnsubscribe = () => {};
    }
  };

  // Initial setup
  setupSubscription();

  // Listen to config changes and recreate subscription if we transition to Supabase
  const handleConfigLoaded = () => {
    if (!isSubscribedToSupabase) {
      console.log('Supabase config loaded! Upgrading subscription from LocalStorage to Supabase live.');
      setupSubscription();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('supabase-config-loaded', handleConfigLoaded);
  }

  return () => {
    carsListeners.delete(onCarsUpdated);
    if (activeUnsubscribe) {
      activeUnsubscribe();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('supabase-config-loaded', handleConfigLoaded);
    }
  };
}

// Helper to parse showroom data supporting camelCase, snake_case, and lowercase PostgreSQL column names
function parseShowroomData(data: Record<string, any>): ShowroomInfo {
  return {
    name: data.name ?? SHOWROOM_INFO.name,
    tagline: data.tagline ?? SHOWROOM_INFO.tagline,
    taglineAr: data.taglineAr ?? data.taglinear ?? SHOWROOM_INFO.taglineAr,
    taglineFr: data.taglineFr ?? data.taglinefr ?? SHOWROOM_INFO.taglineFr,
    taglineEn: data.taglineEn ?? data.taglineen ?? SHOWROOM_INFO.taglineEn,
    logoUrl: data.logoUrl ?? data.logourl ?? SHOWROOM_INFO.logoUrl,
    phone1: data.phone1 ?? SHOWROOM_INFO.phone1,
    phone2: data.phone2 ?? SHOWROOM_INFO.phone2,
    whatsapp: data.whatsapp ?? SHOWROOM_INFO.whatsapp,
    email: data.email ?? SHOWROOM_INFO.email,
    adminEmail: data.adminEmail ?? data.adminemail ?? SHOWROOM_INFO.adminEmail,
    adminPassword: data.adminPassword ?? data.adminpassword ?? SHOWROOM_INFO.adminPassword,
    addressAr: data.addressAr ?? data.addressar ?? SHOWROOM_INFO.addressAr,
    addressFr: data.addressFr ?? data.addressfr ?? SHOWROOM_INFO.addressFr,
    addressEn: data.addressEn ?? data.addressen ?? SHOWROOM_INFO.addressEn,
    workingHoursAr: data.workingHoursAr ?? data.workinghoursar ?? SHOWROOM_INFO.workingHoursAr,
    workingHoursFr: data.workingHoursFr ?? data.workinghoursfr ?? SHOWROOM_INFO.workingHoursFr,
    workingHoursEn: data.workingHoursEn ?? data.workinghoursen ?? SHOWROOM_INFO.workingHoursEn,
    googleMapsUrl: data.googleMapsUrl ?? data.googlemapsurl ?? SHOWROOM_INFO.googleMapsUrl,
    mapEmbedUrl: data.mapEmbedUrl ?? data.mapembedurl ?? SHOWROOM_INFO.mapEmbedUrl,
    facebook: data.facebook ?? SHOWROOM_INFO.facebook,
    instagram: data.instagram ?? SHOWROOM_INFO.instagram,
    tiktok: data.tiktok ?? SHOWROOM_INFO.tiktok,
    heroBgType: data.heroBgType ?? data.herobgtype ?? SHOWROOM_INFO.heroBgType,
    heroBgUrl: data.heroBgUrl ?? data.herobgurl ?? SHOWROOM_INFO.heroBgUrl,
    heroOverlayOpacity: typeof data.heroOverlayOpacity === 'number' ? data.heroOverlayOpacity 
      : (typeof data.herooverlayopacity === 'number' ? data.herooverlayopacity : SHOWROOM_INFO.heroOverlayOpacity),
    serviceTypes: Array.isArray(data.serviceTypes) 
      ? data.serviceTypes 
      : (Array.isArray(data.servicetypes) 
        ? data.servicetypes 
        : (Array.isArray(data.service_types) 
          ? data.service_types 
          : SHOWROOM_INFO.serviceTypes || []))
  };
}

// Helper to upsert showroom info with fallback to lowercased keys if PostgREST column names are lowercased
export async function upsertShowroomInfoToSupabase(info: ShowroomInfo): Promise<void> {
  const client = getSupabase();
  if (!client) {
    throw new Error('لم يتم إعداد بيانات الاتصال بـ Supabase (URL & Key)');
  }
  const cleaned = cleanObject(info);
  
  // Try 1: camelCase with dynamic missing column pruning
  let primaryPayload: Record<string, any> = { id: 'main', ...cleaned };
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await client.from('showroom_info').upsert(primaryPayload);
    if (!error) {
      console.log('Successfully saved showroom_info to Supabase!');
      return;
    }
    if (isTableMissingError(error)) {
      throw new Error(`جدول public.showroom_info غير موجود في مشروع Supabase. يرجى تنفيذ سكربت SQL في Supabase SQL Editor.`);
    }
    const missingColMatch = error.message?.match(/Could not find the '([^']+)' column/i);
    if (missingColMatch && missingColMatch[1]) {
      const missingKey = missingColMatch[1];
      delete primaryPayload[missingKey];
    } else {
      break;
    }
  }

  // Try 2: snake_case
  let snakePayload: Record<string, any> = {
    id: 'main',
    name: info.name,
    tagline: info.tagline,
    tagline_ar: info.taglineAr,
    tagline_fr: info.taglineFr,
    tagline_en: info.taglineEn,
    logo_url: info.logoUrl,
    phone1: info.phone1,
    phone2: info.phone2,
    whatsapp: info.whatsapp,
    email: info.email,
    admin_email: info.adminEmail,
    admin_password: info.adminPassword,
    address_ar: info.addressAr,
    address_fr: info.addressFr,
    address_en: info.addressEn,
    working_hours_ar: info.workingHoursAr,
    working_hours_fr: info.workingHoursFr,
    working_hours_en: info.workingHoursEn,
    google_maps_url: info.googleMapsUrl,
    map_embed_url: info.mapEmbedUrl,
    facebook: info.facebook,
    instagram: info.instagram,
    tiktok: info.tiktok,
    hero_bg_type: info.heroBgType,
    hero_bg_url: info.heroBgUrl,
    hero_overlay_opacity: info.heroOverlayOpacity,
    service_types: info.serviceTypes
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    const { error: snakeErr } = await client.from('showroom_info').upsert(snakePayload);
    if (!snakeErr) {
      console.log('Successfully saved showroom_info to Supabase using snake_case!');
      return;
    }
    if (isTableMissingError(snakeErr)) {
      throw new Error(`جدول public.showroom_info غير موجود في مشروع Supabase. يرجى تنفيذ سكربت SQL.`);
    }
    const missingColMatch = snakeErr.message?.match(/Could not find the '([^']+)' column/i);
    if (missingColMatch && missingColMatch[1]) {
      delete snakePayload[missingColMatch[1]];
    } else {
      break;
    }
  }

  // Try 3: lowercase key payload
  let lowercasePayload: Record<string, any> = {
    id: 'main',
    name: info.name,
    tagline: info.tagline,
    taglinear: info.taglineAr,
    taglinefr: info.taglineFr,
    taglineen: info.taglineEn,
    logourl: info.logoUrl,
    phone1: info.phone1,
    phone2: info.phone2,
    whatsapp: info.whatsapp,
    email: info.email,
    adminemail: info.adminEmail,
    adminpassword: info.adminPassword,
    addressar: info.addressAr,
    addressfr: info.addressFr,
    addressen: info.addressEn,
    workinghoursar: info.workingHoursAr,
    workinghoursfr: info.workingHoursFr,
    workinghoursen: info.workingHoursEn,
    googlemapsurl: info.googleMapsUrl,
    mapembedurl: info.mapEmbedUrl,
    facebook: info.facebook,
    instagram: info.instagram,
    tiktok: info.tiktok,
    herobgtype: info.heroBgType,
    herobgurl: info.heroBgUrl,
    herooverlayopacity: info.heroOverlayOpacity,
    servicetypes: info.serviceTypes
  };

  let lastError: any = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error: fallbackErr } = await client.from('showroom_info').upsert(lowercasePayload);
    if (!fallbackErr) {
      console.log('Successfully saved showroom_info to Supabase using lowercase fallback!');
      return;
    }
    if (isTableMissingError(fallbackErr)) {
      throw new Error(`جدول public.showroom_info غير موجود في مشروع Supabase.`);
    }
    const missingColMatch = fallbackErr.message?.match(/Could not find the '([^']+)' column/i);
    if (missingColMatch && missingColMatch[1]) {
      const missingKey = missingColMatch[1];
      delete lowercasePayload[missingKey];
    } else {
      lastError = fallbackErr;
      break;
    }
  }
  if (lastError) {
    throw new Error(`فشل حفظ إعدادات المعرض في Supabase: ${lastError.message || JSON.stringify(lastError)}`);
  }
}

/**
 * Subscribe to showroom settings with real-time updates from Supabase or LocalStorage.
 */
export function subscribeShowroomInfo(
  onInfoUpdated: (info: ShowroomInfo) => void
): () => void {
  let activeUnsubscribe: (() => void) | null = null;
  let isSubscribedToSupabase = false;

  const setupSubscription = () => {
    // Tear down previous sub if any
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    const client = getSupabase();

    if (!client || !isValidSupabaseConfig()) {
      isSubscribedToSupabase = false;
      try {
        const saved = localStorage.getItem(LOCAL_INFO_KEY);
        if (saved) {
          onInfoUpdated(JSON.parse(saved));
        } else {
          onInfoUpdated(SHOWROOM_INFO);
        }
      } catch (e) {
        onInfoUpdated(SHOWROOM_INFO);
      }
      return;
    }

    // We have a Supabase client!
    isSubscribedToSupabase = true;

    // Fetch initial info
    const fetchInfo = async () => {
      try {
        const { data, error } = await client
          .from('showroom_info')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();

        if (error) {
          if (isTableMissingError(error)) {
            try {
              const saved = localStorage.getItem(LOCAL_INFO_KEY);
              if (saved) onInfoUpdated(JSON.parse(saved));
              else onInfoUpdated(SHOWROOM_INFO);
            } catch (e) {
              onInfoUpdated(SHOWROOM_INFO);
            }
            return;
          }
          throw error;
        }

        if (data) {
          const parsed = parseShowroomData(data);
          onInfoUpdated(parsed);
          try {
            localStorage.setItem(LOCAL_INFO_KEY, JSON.stringify(parsed));
          } catch (e) {}
        } else {
          // Seed default showroom info
          try {
            const saved = localStorage.getItem(LOCAL_INFO_KEY);
            const initial = saved ? JSON.parse(saved) : SHOWROOM_INFO;
            await upsertShowroomInfoToSupabase(initial);
            onInfoUpdated(initial);
          } catch (e) {
            onInfoUpdated(SHOWROOM_INFO);
          }
        }
      } catch (err: any) {
        if (!isTableMissingError(err)) {
          console.warn('Notice querying showroom info from Supabase:', err?.message || err);
        }
        try {
          const saved = localStorage.getItem(LOCAL_INFO_KEY);
          if (saved) onInfoUpdated(JSON.parse(saved));
          else onInfoUpdated(SHOWROOM_INFO);
        } catch (e) {
          onInfoUpdated(SHOWROOM_INFO);
        }
      }
    };

    fetchInfo();

    // Set up real-time listener for showroom info
    try {
      const channel = client
        .channel('public_showroom_info')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'showroom_info' }, async () => {
          const { data } = await client
            .from('showroom_info')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();

          if (data) {
            const parsed = parseShowroomData(data);
            onInfoUpdated(parsed);
            try {
              localStorage.setItem(LOCAL_INFO_KEY, JSON.stringify(parsed));
            } catch (e) {}
          }
        })
        .subscribe();

      activeUnsubscribe = () => {
        client.removeChannel(channel);
      };
    } catch (e) {
      activeUnsubscribe = () => {};
    }
  };

  // Initial setup
  setupSubscription();

  // Listen to config changes and recreate subscription if we transition to Supabase
  const handleConfigLoaded = () => {
    if (!isSubscribedToSupabase) {
      console.log('Supabase config loaded! Upgrading showroom info subscription to Supabase live.');
      setupSubscription();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('supabase-config-loaded', handleConfigLoaded);
  }

  return () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('supabase-config-loaded', handleConfigLoaded);
    }
  };
}

/**
 * Save or update a car document in Supabase & LocalStorage.
 */
export async function saveCarToDb(car: Car): Promise<void> {
  const sanitized = sanitizeCarData(car);

  // Always update local storage for immediate responsiveness
  let updatedCars: Car[] = [];
  try {
    const saved = localStorage.getItem(LOCAL_CARS_KEY);
    const cars: Car[] = saved ? JSON.parse(saved) : INITIAL_CARS;
    const index = cars.findIndex(c => c.id === car.id);
    if (index >= 0) cars[index] = sanitized;
    else cars.unshift(sanitized);
    updatedCars = cars;
    localStorage.setItem(LOCAL_CARS_KEY, JSON.stringify(cars));
    notifyCarsListeners(updatedCars);
  } catch (e) {
    console.warn('Quota error saving cars locally:', e);
  }

  const client = getSupabase();
  if (client && isValidSupabaseConfig()) {
    try {
      await upsertCarToSupabase(sanitized);
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.info('Supabase notice: Table public.cars is not yet created in your Supabase project. The car is safely saved in local storage. Execute the SQL script in Supabase SQL Editor to enable cloud sync.');
      } else {
        console.warn('Notice syncing car to Supabase:', err?.message || err);
      }
    }
  }
}

/**
 * Delete a car from Supabase & LocalStorage.
 */
export async function deleteCarFromDb(carId: string): Promise<void> {
  let filteredCars: Car[] = [];
  try {
    const saved = localStorage.getItem(LOCAL_CARS_KEY);
    let currentCars: Car[] = INITIAL_CARS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentCars = parsed;
        }
      } catch (err) {}
    }
    filteredCars = currentCars.filter(c => c.id !== carId);
    try {
      localStorage.setItem(LOCAL_CARS_KEY, JSON.stringify(filteredCars));
    } catch (e) {}
    notifyCarsListeners(filteredCars);
  } catch (e) {
    console.warn('Error handling local car deletion:', e);
  }

  const client = getSupabase();
  if (client && isValidSupabaseConfig()) {
    try {
      const { error } = await client.from('cars').delete().eq('id', carId);
      if (error && !isTableMissingError(error)) {
        console.warn('Notice deleting car from Supabase:', error.message);
      }
    } catch (err: any) {
      if (!isTableMissingError(err)) {
        console.warn('Notice deleting car from Supabase:', err?.message || err);
      }
    }
  }
}

/**
 * Save showroom settings to Supabase & LocalStorage.
 */
export async function saveShowroomInfoToDb(info: ShowroomInfo): Promise<void> {
  try {
    localStorage.setItem(LOCAL_INFO_KEY, JSON.stringify(info));
  } catch (e) {}

  const client = getSupabase();
  if (client && isValidSupabaseConfig()) {
    try {
      await upsertShowroomInfoToSupabase(info);
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.info('Supabase notice: Table public.showroom_info is not yet created in your Supabase project. Settings are safely saved in local storage. Execute the SQL script in Supabase SQL Editor to enable cloud sync.');
      } else {
        console.warn('Notice syncing showroom info to Supabase:', err?.message || err);
      }
    }
  }
}

/**
 * Push and synchronize all current local cars and showroom settings directly to Supabase.
 */
export async function syncAllToSupabase(): Promise<{ 
  success: boolean; 
  uploadedCarsCount: number; 
  error?: string;
}> {
  const client = getSupabase();
  if (!client || !isValidSupabaseConfig()) {
    return {
      success: false,
      uploadedCarsCount: 0,
      error: 'Supabase project is not connected yet. Please enter your Project URL and Anon Key first.'
    };
  }

  // 1. Get current showroom info and sync
  let currentInfo = SHOWROOM_INFO;
  try {
    const savedInfo = localStorage.getItem(LOCAL_INFO_KEY);
    if (savedInfo) currentInfo = JSON.parse(savedInfo);
  } catch (e) {}

  try {
    await upsertShowroomInfoToSupabase(currentInfo);
  } catch (err: any) {
    if (isTableMissingError(err)) {
      return {
        success: false,
        uploadedCarsCount: 0,
        error: 'Table public.showroom_info does not exist in Supabase yet. Please copy and run the SQL script in Supabase SQL Editor first.'
      };
    }
    console.warn('Failed to sync showroom info:', err);
  }

  // 2. Get current cars and sync
  let currentCars = INITIAL_CARS;
  try {
    const savedCars = localStorage.getItem(LOCAL_CARS_KEY);
    if (savedCars) {
      const parsed = JSON.parse(savedCars);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentCars = parsed;
      }
    }
  } catch (e) {}

  let successCount = 0;
  let tableMissing = false;
  for (const car of currentCars) {
    try {
      await upsertCarToSupabase(car);
      successCount++;
    } catch (err: any) {
      if (isTableMissingError(err)) {
        tableMissing = true;
        break;
      }
      console.error(`Failed to push car ${car.id} during sync:`, err);
    }
  }

  if (tableMissing) {
    return {
      success: false,
      uploadedCarsCount: successCount,
      error: 'Table public.cars does not exist in Supabase yet. Please copy and run the SQL script in Supabase SQL Editor to create tables, then click sync again.'
    };
  }

  return {
    success: true,
    uploadedCarsCount: successCount
  };
}
