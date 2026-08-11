-- ==============================================================================
-- KADEX DZ SHOWROOM - COMPLETE SUPABASE SQL SCHEMA & MIGRATION
-- Copy and execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create the cars table (Algeria immediate delivery & services catalog)
CREATE TABLE IF NOT EXISTS public.cars (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year NUMERIC DEFAULT 2024,
    "priceDzd" NUMERIC DEFAULT 0,
    "priceFormatted" TEXT,
    location TEXT DEFAULT 'algeria',
    "serviceType" TEXT DEFAULT 'algeria_showroom',
    "mainImage" TEXT,
    images TEXT[],
    phone TEXT DEFAULT '+213 550 12 34 56',
    whatsapp TEXT DEFAULT '+213550123456',
    mileage TEXT DEFAULT '0 كم',
    transmission TEXT DEFAULT 'Automatic',
    "fuelType" TEXT DEFAULT 'Essence',
    color TEXT,
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "ficheTechnique" TEXT,
    "ficheTechniqueName" TEXT,
    specs TEXT[],
    description JSONB DEFAULT '{"ar": "", "fr": "", "en": ""}'::jsonb,
    featured BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "rentalMinDays" NUMERIC DEFAULT 1,
    "rentalAvailability" TEXT DEFAULT 'both',
    "rentalPriceWithoutDriver" NUMERIC,
    "rentalPriceWithDriver" NUMERIC,
    "rentalConditionsAr" TEXT,
    "shippingDuration" TEXT
);

-- 2. Create the showroom_info table (CMS settings & Admin credentials)
CREATE TABLE IF NOT EXISTS public.showroom_info (
    id TEXT PRIMARY KEY DEFAULT 'main',
    name TEXT DEFAULT 'KADEX DZ',
    tagline TEXT,
    "taglineAr" TEXT,
    "taglineFr" TEXT,
    "taglineEn" TEXT,
    "logoUrl" TEXT,
    phone1 TEXT DEFAULT '+213 550 12 34 56',
    phone2 TEXT DEFAULT '+213 770 98 76 54',
    whatsapp TEXT DEFAULT '+213550123456',
    email TEXT DEFAULT 'contact@kadex-dz.com',
    "adminEmail" TEXT DEFAULT 'admin@nacer.dz',
    "adminPassword" TEXT DEFAULT 'naceradmin#2026!Pass',
    "addressAr" TEXT DEFAULT 'حي البساتين، الشراقة (مقابل المركز التجاري)، الجزائر العاصمة',
    "addressFr" TEXT DEFAULT 'Cité Les Bosquets, Chéraga, Alger, Algérie',
    "addressEn" TEXT DEFAULT 'Les Bosquets, Cheraga, Algiers, Algeria',
    "workingHoursAr" TEXT DEFAULT 'السبت - الخميس: 08:30 صباحاً - 19:00 مساءً | الجمعة: مغلق',
    "workingHoursFr" TEXT DEFAULT 'Sam - Jeu: 08h30 - 19h00 | Vendredi: Fermé',
    "workingHoursEn" TEXT DEFAULT 'Sat - Thu: 08:30 AM - 07:00 PM | Friday: Closed',
    "googleMapsUrl" TEXT DEFAULT 'https://maps.google.com/?q=Cheraga+Algiers',
    "mapEmbedUrl" TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.830607928237!2d2.9482110764126746!3d36.76672327003784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128faf838423f001%3A0x6b8014522810a955!2sCheraga%2C%20Algiers%2C%20Algeria!5e0!3m2!1sen!2sdz!4v1710000000000!5m2!1sen!2sdz',
    facebook TEXT DEFAULT 'https://facebook.com',
    instagram TEXT DEFAULT 'https://instagram.com',
    tiktok TEXT DEFAULT 'https://tiktok.com',
    "heroBgType" TEXT DEFAULT 'gradient',
    "heroBgUrl" TEXT,
    "heroOverlayOpacity" NUMERIC DEFAULT 75,
    "serviceTypes" JSONB DEFAULT '[]'::jsonb
);

-- Ensure all columns exist for existing databases (Migrations)
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "tagline" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "taglineAr" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "taglineFr" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "taglineEn" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "adminEmail" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "adminPassword" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "mapEmbedUrl" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "heroOverlayOpacity" NUMERIC;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "heroBgType" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "heroBgUrl" TEXT;
ALTER TABLE public.showroom_info ADD COLUMN IF NOT EXISTS "serviceTypes" JSONB;

ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "serviceType" TEXT DEFAULT 'algeria_showroom';
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "ficheTechnique" TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "ficheTechniqueName" TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "exteriorColor" TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "interiorColor" TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "rentalMinDays" NUMERIC;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "rentalAvailability" TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "rentalPriceWithoutDriver" NUMERIC;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "rentalPriceWithDriver" NUMERIC;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "rentalConditionsAr" TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS "shippingDuration" TEXT;

-- 3. Enable Row Level Security (RLS) & Set Permissive Policies
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on cars" ON public.cars;
DROP POLICY IF EXISTS "Allow public write on cars" ON public.cars;
DROP POLICY IF EXISTS "Allow public all on cars" ON public.cars;
CREATE POLICY "Allow public all on cars" ON public.cars FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on showroom_info" ON public.showroom_info;
DROP POLICY IF EXISTS "Allow public write on showroom_info" ON public.showroom_info;
DROP POLICY IF EXISTS "Allow public all on showroom_info" ON public.showroom_info;
CREATE POLICY "Allow public all on showroom_info" ON public.showroom_info FOR ALL USING (true) WITH CHECK (true);

-- 4. Seed Default Showroom Information
INSERT INTO public.showroom_info (
    id,
    name,
    "adminEmail",
    "adminPassword",
    phone1,
    phone2,
    whatsapp,
    email,
    "addressAr",
    "addressFr",
    "addressEn",
    "workingHoursAr",
    "workingHoursFr",
    "workingHoursEn",
    "googleMapsUrl",
    "mapEmbedUrl",
    facebook,
    instagram,
    tiktok,
    "heroBgType",
    "heroOverlayOpacity"
) VALUES (
    'main',
    'KADEX DZ',
    'admin@nacer.dz',
    'naceradmin#2026!Pass',
    '+213 550 12 34 56',
    '+213 770 98 76 54',
    '+213550123456',
    'contact@kadex-dz.com',
    'حي البساتين، الشراقة (مقابل المركز التجاري)، الجزائر العاصمة',
    'Cité Les Bosquets, Chéraga, Alger, Algérie',
    'Les Bosquets, Cheraga, Algiers, Algeria',
    'السبت - الخميس: 08:30 صباحاً - 19:00 مساءً | الجمعة: مغلق',
    'Sam - Jeu: 08h30 - 19h00 | Vendredi: Fermé',
    'Sat - Thu: 08:30 AM - 07:00 PM | Friday: Closed',
    'https://maps.google.com/?q=Cheraga+Algiers',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.830607928237!2d2.9482110764126746!3d36.76672327003784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128faf838423f001%3A0x6b8014522810a955!2sCheraga%2C%20Algiers%2C%20Algeria!5e0!3m2!1sen!2sdz!4v1710000000000!5m2!1sen!2sdz',
    'https://facebook.com',
    'https://instagram.com',
    'https://tiktok.com',
    'gradient',
    75
) ON CONFLICT (id) DO UPDATE SET
    "adminEmail" = COALESCE(public.showroom_info."adminEmail", EXCLUDED."adminEmail"),
    "adminPassword" = COALESCE(public.showroom_info."adminPassword", EXCLUDED."adminPassword");

-- 5. Seed Initial Cars (if table is empty)
INSERT INTO public.cars (
    id, brand, model, year, "priceDzd", "priceFormatted", location, "serviceType", "mainImage", images,
    phone, whatsapp, mileage, transmission, "fuelType", color, "exteriorColor", "interiorColor",
    specs, description, featured
) VALUES
(
    'car-algeria-1',
    'Chery',
    'Tiggo 8 Pro Max Luxury',
    2024,
    5800000,
    '5,800,000 د.ج',
    'algeria',
    'algeria_showroom',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    ARRAY[
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200'
    ],
    '+213 550 12 34 56',
    '+213550123456',
    '0 كم (جديدة)',
    'Automatic',
    'Essence',
    'أبيض لؤلؤي / Blanc Nacré',
    'أبيض لؤلؤي / Blanc Nacré',
    'جلد بني فاخر / Cuir Marron',
    ARRAY['محرك 2.0 TGDI توربو قوة 254 حصان', 'علبة سرعة 7DCT أوتوماتيك', 'دفع رباعي ذكي AWD', 'شاشة مزدوجة 24.6 بوصة', 'نظام صوتي Sony 8 مكبرات', 'كاميرا 540° محيطية بانورامية'],
    '{"ar": "سيارة شيري تيجو 8 برو ماكس الفاخرة متوفرة حالياً بالمعرض في الجزائر العاصمة للتسليم الفوري مع كافة الوثائق الرسمية والضمان.", "fr": "Chery Tiggo 8 Pro Max disponible immédiatement à notre showroom d''Alger avec garantie complète.", "en": "Chery Tiggo 8 Pro Max in stock in Algiers ready for immediate delivery with full warranty."}'::jsonb,
    true
),
(
    'car-algeria-2',
    'Geely',
    'Coolray GF Plus',
    2024,
    4450000,
    '4,450,000 د.ج',
    'algeria',
    'algeria_showroom',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    ARRAY[
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    '+213 550 12 34 56',
    '+213550123456',
    '0 كم (جديدة)',
    'Automatic',
    'Essence',
    'رمادي ناردو / Gris Nardo',
    'رمادي ناردو / Gris Nardo',
    'جلد أحمر وأسود رياضي / Rouge & Noir',
    ARRAY['محرك 1.5 لتر تيربو 177 حصان', 'فتحة سقف بانورامية كهربائية', 'ركن ذاتي ذكي Auto-Park', 'نظام قيادة رياضي Sport Plus'],
    '{"ar": "جيلي كولراي نسخة GF الرياضية متوفرة في صالة العرض بالشراقة - تسليم فوري وبطاقة صفراء جاهزة.", "fr": "Geely Coolray GF disponible immédiatement en showroom à Alger.", "en": "Geely Coolray GF available in Algiers showroom with immediate delivery."}'::jsonb,
    true
),
(
    'car-algeria-3',
    'Jetour',
    'Dashing 1.6T Luxury',
    2024,
    4900000,
    '4,900,000 د.ج',
    'algeria',
    'algeria_showroom',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
    ARRAY[
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    '+213 550 12 34 56',
    '+213550123456',
    '0 كم (جديدة)',
    'Automatic',
    'Essence',
    'أسود ميتاليك / Noir Métallisé',
    'أسود ميتاليك / Noir Métallisé',
    'جلد كونياك أنيق / Cuir Cognac',
    ARRAY['شاشة مركزية عملاقة 15.6 بوصة', 'شاحن لاسلكي سريع 50W', 'مقابض أبواب كهربائية مخفية', 'أنظمة مساعدة القيادة الذكية L2'],
    '{"ar": "جيتور داشينغ التصميم المستقبلي والتقنيات الفاخرة متوفرة للتسليم الحيني بالمعرض.", "fr": "Jetour Dashing neuve disponible pour livraison immédiate au showroom.", "en": "Jetour Dashing available now in Algiers for immediate delivery."}'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Realtime Publications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'cars'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cars;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'showroom_info'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.showroom_info;
    END IF;
END $$;
