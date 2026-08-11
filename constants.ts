/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Car, ShowroomInfo, ServiceType } from './types';

export const DEFAULT_SERVICE_TYPES: ServiceType[] = [
  {
    id: 'algeria_showroom',
    nameAr: 'سيارات متوفرة في الجزائر',
    nameFr: 'Disponibles en Algérie',
    nameEn: 'Available in Algeria',
    badgeAr: 'تسليم فوري 🇩🇿',
    badgeFr: 'Livraison Immédiate 🇩🇿',
    badgeEn: 'Immediate Delivery 🇩🇿',
    icon: '🇩🇿',
    descriptionAr: 'سيارات جديدة متواجدة بصالة العرض وجاهزة للتسليم الفوري مع الوثائق الرسمية',
    descriptionFr: 'Véhicules neufs disponibles immédiatement en showroom.',
    descriptionEn: 'Brand new vehicles available immediately in showroom.',
    enabled: true
  },
  {
    id: 'china_import',
    nameAr: 'سيارات في الصين (جاهزة للاستيراد)',
    nameFr: 'Prêtes en Chine (Importation)',
    nameEn: 'Ready in China (Import)',
    badgeAr: 'طلب واستيراد 🇨🇳',
    badgeFr: 'Sur Commande 🇨🇳',
    badgeEn: 'Import on Demand 🇨🇳',
    icon: '🇨🇳',
    descriptionAr: 'سيارات حديثة متواجدة في الصين وجاهزة للشحن والاستيراد مباشرة للجزائر',
    descriptionFr: 'Véhicules neufs prêts en Chine pour importation directe.',
    descriptionEn: 'Brand new vehicles in China ready for direct import.',
    enabled: true
  },
  {
    id: 'car_rental',
    nameAr: 'كراء وتأجير السيارات',
    nameFr: 'Location de Voitures',
    nameEn: 'Car Rental Service',
    badgeAr: 'كراء وتأجير 🔑',
    badgeFr: 'Location 🔑',
    badgeEn: 'Rental Service 🔑',
    icon: '🔑',
    descriptionAr: 'أسطول سيارات حديثة ومريحة متاحة للكراء اليومي والأسبوعي والشهري',
    descriptionFr: 'Flotte de véhicules récents disponibles pour location courte et longue durée.',
    descriptionEn: 'Modern car fleet available for short and long-term rental.',
    enabled: true
  },
  {
    id: 'bikes',
    nameAr: 'دراجات نارية وسكوتر',
    nameFr: 'Motos & Scooters',
    nameEn: 'Motorcycles & Bikes',
    badgeAr: 'دراجات متاحة 🏍️',
    badgeFr: 'Motos & Scooters 🏍️',
    badgeEn: 'Bikes & Scooters 🏍️',
    icon: '🏍️',
    descriptionAr: 'مجموعة من الدراجات النارية والسكوتر العصرية بأفضل الأسعار',
    descriptionFr: 'Sélection de motos et scooters neufs aux meilleurs prix.',
    descriptionEn: 'Selection of brand new motorcycles and scooters at best prices.',
    enabled: true
  }
];

export const SHOWROOM_INFO: ShowroomInfo = {
  name: 'KADEX DZ',
  tagline: 'صالة العرض - تسليم فوري 🇩🇿',
  taglineAr: 'صالة العرض - تسليم فوري 🇩🇿',
  taglineFr: 'Showroom - Livraison Immédiate 🇩🇿',
  taglineEn: 'Showroom - Immediate Delivery 🇩🇿',
  logoUrl: '',
  phone1: '+213 550 12 34 56',
  phone2: '+213 770 98 76 54',
  whatsapp: '+213550123456',
  email: 'contact@kadex-dz.com',
  adminEmail: 'admin@nacer.dz',
  adminPassword: 'naceradmin#2026!Pass',
  addressAr: 'الشط، عنابة (الطريق الوطني)، الجزائر',
  addressFr: 'Echatt, Annaba, Algérie',
  addressEn: 'Echatt, Annaba, Algeria',
  workingHoursAr: 'من السبت إلى الخميس: 09:00 صباحاً - 07:00 مساءً',
  workingHoursFr: 'Samedi au Jeudi: 09h00 - 19h00',
  workingHoursEn: 'Saturday to Thursday: 09:00 AM - 07:00 PM',
  googleMapsUrl: 'https://maps.google.com/?q=36.9350,7.8680',
  mapEmbedUrl: '',
  facebook: 'https://facebook.com/kadex.dz',
  instagram: 'https://instagram.com/kadex.dz',
  tiktok: 'https://tiktok.com/@kadex_dz',
  heroBgType: 'gradient',
  heroBgUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1920',
  heroOverlayOpacity: 70,
  serviceTypes: DEFAULT_SERVICE_TYPES
};

export const INITIAL_CARS: Car[] = [
  {
    id: 'car-1',
    brand: 'Chery',
    model: 'Tiggo 7 Pro Max',
    year: 2024,
    priceDzd: 4250000,
    priceFormatted: '4,250,000 د.ج',
    location: 'algeria',
    serviceType: 'algeria_showroom',
    mainImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 550 12 34 56',
    whatsapp: '+213550123456',
    mileage: '0 كم (جديدة 2024)',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'أسود ميتاليك / Noir Métallisé',
    specs: [
      'شاشة مزدوجة HD مقاس 12.3 بوصة',
      'فتحة سقف بانورامية كهربائية',
      'رؤية شاملة كاميرات 360°',
      'مقاعد جلد فاخرة مع تبريد وتدفئة',
      'نظام صوتي سوني Sony مكون من 8 مكبرات',
      'عجلات ألومنيوم 18 بوصة رياضية'
    ],
    description: {
      ar: 'شيري تيجو 7 برو ماكس 2024 متوفرة الآن في صالة العرض بتسليم فوري. سيارة SUV عائلية فخمة ومريحة ومجهزة بأحدث تقنيات الأمان والسلامة الذكية.',
      fr: 'Chery Tiggo 7 Pro Max 2024 disponible immédiatement dans notre showroom. Un SUV familial puissant, élégant et suréquipé avec garantie.',
      en: 'Chery Tiggo 7 Pro Max 2024 available for immediate delivery at our showroom. A stylish family SUV packed with smart technology.'
    },
    featured: true,
    createdAt: '2026-07-20'
  },
  {
    id: 'car-2',
    brand: 'Geely',
    model: 'Coolray GF Flagship',
    year: 2024,
    priceDzd: 3980000,
    priceFormatted: '3,980,000 د.ج',
    location: 'algeria',
    mainImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 550 12 34 56',
    whatsapp: '+213550123456',
    mileage: '0 كم',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'فضايي / Gris Métallisé',
    specs: [
      'محرك 1.5 터보 بقوة 177 حصان',
      'علبة سرعة أوتوماتيكية دبل كلتش 7 سرعات',
      'نظام قيادة ذاتية L2 فرامل طوارئ تلقائية',
      'شاشة عدادات رقمية وشاشة ترفيه 12.3 بوصة',
      'جناح خلفي رياضي وفتحة سقف بانوراما'
    ],
    description: {
      ar: 'جيلي كولراي فل جينيريشن 2024 متوفرة باللون الفضي الرياضي بطلب فوري في صالة العرض. محرك قوي جداً وتصميم رياضي هجومي مع مقاعد جلد مطعمة بالكاربون فايبر.',
      fr: 'Geely Coolray GF 2024 disponible en stock au showroom. Design agressif et sportif, moteur 1.5 Turbo 177 ch et intérieur cuir sport.',
      en: 'Geely Coolray GF 2024 in stock at our showroom. Sporty design, 1.5 Turbo engine with 177 HP and futuristic interior.'
    },
    featured: true,
    createdAt: '2026-07-21'
  },
  {
    id: 'car-3',
    brand: 'Jetour',
    model: 'Dashing Luxury',
    year: 2024,
    priceDzd: 4850000,
    priceFormatted: '4,850,000 د.ج',
    location: 'algeria',
    mainImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 770 98 76 54',
    whatsapp: '+213770987654',
    mileage: '0 كم (جديدة)',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'رمادي غامق / Gris Anthracite',
    specs: [
      'محرك 1.6 Turbo بقوة 197 حصان',
      'شاشة تحكم مركزية عملاقة 15.6 بوصة',
      'مقابض أبواب مخفية كهربائية',
      'مقاعد ذكية بتدفئة وتبريد ومساج',
      'إضاءة محيطية ambient light 64 لون'
    ],
    description: {
      ar: 'جيتور داشينج لوكس 2024 الفاخرة متوفرة في صالة العرض تسليم حيني. تصميم مستقبلي مستوحى من الطائرات مع مقصورة فائقة الفخامة.',
      fr: 'Jetour Dashing Luxury 2024 disponible immédiatement au showroom. SUV futuriste d\'exception avec moteur 1.6T 197ch.',
      en: 'Jetour Dashing Luxury 2024 available in our showroom. Futuristic SUV with 1.6T 197 HP engine and ultra-luxurious cabin.'
    },
    featured: true,
    createdAt: '2026-07-22'
  },
  {
    id: 'car-4',
    brand: 'DFSK',
    model: 'Fengon 500 CVT',
    year: 2024,
    priceDzd: 2980000,
    priceFormatted: '2,980,000 د.ج',
    location: 'algeria',
    mainImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 550 12 34 56',
    whatsapp: '+213550123456',
    mileage: '0 كم',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'أبيض ناصع / Blanc Pur',
    specs: [
      'سعر اقتصادي منافس جداً في السوق الجزائري',
      'فتحة سقف مجهزة',
      'شاشة لمس متعددة الوظائف',
      'كاميرا وحساسات ركن خلفية',
      'نظام توفير الوقود'
    ],
    description: {
      ar: 'دي أف اس كي فينجون 500 خيار ممتاز واقتصادي متوفر في صالة العرض بجميع الضمانات. تسليم فوري.',
      fr: 'DFSK Fengon 500 automatique, le choix économique idéal disponible au showroom avec livraison immédiate.',
      en: 'DFSK Fengon 500 automatic, great affordable SUV available at our showroom with immediate delivery.'
    },
    featured: false,
    createdAt: '2026-07-23'
  },

  // All Vehicles available in Algeria (Immediate Delivery)
  {
    id: 'car-5',
    brand: 'BYD',
    model: 'Song Plus EV / DM-i 2024',
    year: 2024,
    priceDzd: 5600000,
    priceFormatted: '5,600,000 د.ج',
    location: 'algeria',
    mainImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 550 12 34 56',
    whatsapp: '+213550123456',
    mileage: '0 كم (جديدة)',
    transmission: 'Automatic',
    fuelType: 'Électrique',
    color: 'كحلي ميتاليك / Bleu Nuit',
    exteriorColor: 'كحلي ميتاليك / Bleu Nuit',
    interiorColor: 'جلد بيج فاخر / Cuir Beige',
    specs: [
      'بطارية بليد بلاس Blade Battery الأكثر أماناً في العالم',
      'مدى سير كهربائي يصل إلى 605 كم للشحنة الواحدة',
      'شاشة تحكم قابلة للدوران كهربائياً مقاس 15.6 بوصة',
      'نظام قيادة ذكي DiPilot أمان كامل',
      'شحن سريع 30 دقيقة من 30% إلى 80%'
    ],
    description: {
      ar: 'بي واي دي سونغ بلاس الكهربائية / الهجينة متوفرة الآن في صالة العرض بتسليم فوري وجميع الوثائق القانونية.',
      fr: 'BYD Song Plus EV / DM-i disponible immédiatement dans notre showroom avec livraison rapide.',
      en: 'BYD Song Plus EV / DM-i available in our showroom for immediate delivery with full documentation.'
    },
    featured: true,
    createdAt: '2026-07-18'
  },
  {
    id: 'car-6',
    brand: 'Changan',
    model: 'CS55 Plus Tech',
    year: 2024,
    priceDzd: 4100000,
    priceFormatted: '4,100,000 د.ج',
    location: 'algeria',
    mainImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 770 98 76 54',
    whatsapp: '+213770987654',
    mileage: '0 كم',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'رمادي مات / Gris Mat',
    exteriorColor: 'رمادي مات / Gris Mat',
    interiorColor: 'أحمر وأسود رياضي / Rouge & Noir Sport',
    specs: [
      'محرك Blue Core 1.5 Turbo بقوة 188 حصان',
      'علبة سرعة 7 DCT مائية',
      'نظام صوتي بيونير Pioneer عالمي',
      'كاميرا تسجل الطريق dashcam مدمجة',
      'مقصورة حمراء رياضية فريدة'
    ],
    description: {
      ar: 'شانجان سي اس 55 بلاس تك متوفرة في صالة العرض بتسليم فوري ومعاينة حينية.',
      fr: 'Changan CS55 Plus Tech disponible en stock immédiat au showroom.',
      en: 'Changan CS55 Plus Tech in stock for immediate delivery at our showroom.'
    },
    featured: false,
    createdAt: '2026-07-19'
  },
  {
    id: 'car-7',
    brand: 'Great Wall Motors',
    model: 'Tank 300 4x4 Off-Road',
    year: 2024,
    priceDzd: 7200000,
    priceFormatted: '7,200,000 د.ج',
    location: 'algeria',
    mainImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 550 12 34 56',
    whatsapp: '+213550123456',
    mileage: '0 كم',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'أسود مات صحراوي / Noir Mat',
    exteriorColor: 'أسود مات صحراوي / Noir Mat',
    interiorColor: 'جلد أسود ملكي / Cuir Noir',
    specs: [
      'دفع رباعي حقيقي 4x4 مع قفل دفرنس أمامي وخلفي',
      'محرك 2.0T بقوة 227 حصان وعزم 387 نيوتن',
      'ناقل حركة ZF الألماني 8 سرعات أوتوماتيك',
      'نظام قيادة الالتفاف حول النقطة Tank Turn',
      'مقاعد جلد طبيعي مع تبريد ونظام صوتي عالي الجودة'
    ],
    description: {
      ar: 'تانك 300 الجبارة للطرق الوعرة والصحراء متوفرة بالمعرض بتسليم فوري مع كامل التجهيزات.',
      fr: 'Great Wall Tank 300 4x4 tout-terrain d\'exception. En stock au showroom pour livraison immédiate.',
      en: 'Great Wall Tank 300 4x4 Off-Road in stock in our showroom for immediate delivery.'
    },
    featured: true,
    createdAt: '2026-07-15'
  },
  {
    id: 'car-8',
    brand: 'Exeed',
    model: 'RX 2.0T Flagship',
    year: 2024,
    priceDzd: 6400000,
    priceFormatted: '6,400,000 د.ج',
    location: 'algeria',
    mainImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 770 98 76 54',
    whatsapp: '+213770987654',
    mileage: '0 كم',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'أبيض لؤلؤي / Blanc Nacré',
    exteriorColor: 'أبيض لؤلؤي / Blanc Nacré',
    interiorColor: 'جلد أحمر عنابي / Cuir Bordeaux',
    specs: [
      'نظام تعليق CDC هيدروليكي ذكي لفخامة مطلقة',
      'محرك 2.0T بقوة 261 حصان وعزم 400 نيوتن',
      'نظام صوتي سوني Sony مكون من 14 مكبر صوت في المساند',
      'عرض المعلومات على الزجاج الأمامي HUD مع الواقع المعزز',
      'عطور فاخرة مدمجة في نظام التكييف'
    ],
    description: {
      ar: 'إكسيد أر اكس الفاخرة متوفرة في صالة العرض بتسليم فوري. قمة الفخامة والتكنولوجيا.',
      fr: 'Exeed RX 2.0T Flagship disponible immédiatement au showroom.',
      en: 'Exeed RX 2.0T Flagship available for immediate delivery at our showroom.'
    },
    featured: false,
    createdAt: '2026-07-17'
  },
  {
    id: 'rental-car-1',
    brand: 'Hyundai',
    model: 'Accent RB Automatic (كراء اليوم)',
    year: 2024,
    priceDzd: 9500,
    priceFormatted: '9,500 د.ج / يومياً',
    location: 'algeria',
    serviceType: 'car_rental',
    mainImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 550 12 34 56',
    whatsapp: '+213550123456',
    mileage: 'ممشى قليل (مكيّفة بالكامل)',
    transmission: 'Automatic',
    fuelType: 'Essence',
    color: 'أبيض / Blanc',
    specs: ['مكيف هواء ممتاز', 'شاشة بلوتوث', 'حساسات ركن'],
    description: {
      ar: 'هيونداي أكسنت RB للإيجار اليومي أو الأسبوعي أو الشهري. متوفرة بخيارين (بدون سائق أو مع سائق محترف في المعرض وكافة الولايات).',
      fr: 'Hyundai Accent RB disponible pour location avec ou sans chauffeur.',
      en: 'Hyundai Accent RB available for rental with or without driver.'
    },
    featured: true,
    createdAt: '2026-08-01',
    rentalMinDays: 3,
    rentalPriceWithoutDriver: 9500,
    rentalPriceWithDriver: 13500,
    rentalConditionsAr: 'الالتزامات والشروط: • رخصة سياقة سارية المفعول لأكثر من سنتين. • إيداع بطاقة الهوية أو جواز السفر + ضمان مالي مسترد. • العمر الأدنى للسائق: 23 سنة. • يتوفر خيار السائق الخاص براتب يومي شامل.'
  },
  {
    id: 'china-car-1',
    brand: 'BYD',
    model: 'Han EV Luxury Flagship (استيراد من الصين)',
    year: 2024,
    priceDzd: 6100000,
    priceFormatted: '6,100,000 د.ج (سعر الشحن شامل)',
    location: 'algeria',
    serviceType: 'china_import',
    mainImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'
    ],
    phone: '+213 550 12 34 56',
    whatsapp: '+213550123456',
    mileage: '0 كم (جديدة تماماً من المصنع)',
    transmission: 'Automatic',
    fuelType: 'Électrique',
    color: 'أزرق سماوي ميتاليك / Bleu Céleste',
    specs: ['مدى سير 715 كم بشحنة واحدة', 'دفع رباعي كهربائي فائق', 'شاشة旋转 15.6 بوصة'],
    description: {
      ar: 'بي واي دي هان الكهربائية الفاخرة متوفرة للطلب والاستيراد المباشر من مصانع الصين إلى الميناء الجزائري مع ضمان شامل وعقود قانونية موثقة.',
      fr: 'BYD Han EV disponible sur commande pour importation directe de Chine vers l\'Algérie.',
      en: 'BYD Han EV available for order and direct import from China to Algeria with full legal contract.'
    },
    featured: true,
    createdAt: '2026-08-02',
    shippingDuration: '30 إلى 45 يوم (شحن بحري مؤمن بالكامل مع التخليص الجمركي)'
  }
];
