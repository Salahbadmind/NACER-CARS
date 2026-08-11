/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Language } from './types';

export const translations = {
  ar: {
    // Showroom Identity
    brandName: 'KADEX DZ',
    showroomTagline: 'معرض كادكس - سيارات حديثة وفاخرة متوفرة في الجزائر (تسليم فوري)',
    showroomSubTitle: 'سيارات فاخرة وحديثة متوفرة بالمعرض للتسليم الفوري مع وبدون سائق وبأسعار تنافسية وضمان وشفافية تامة.',
    
    // Navigation
    navCarsAlgeria: 'السيارات المتوفرة (تسليم فوري)',
    navAboutContact: 'عن المعرض والتواصل',
    navAdmin: 'لوحة التحكم',
    
    // Hero & Stats
    heroTitle: 'المحطة الموثوقة لاقتناء سيارتك في الجزائر - تسليم فوري',
    heroBadge: 'متوفرة في الجزائر 🇩🇿 تسليم فوري',
    statInAlgeria: 'متوفرة في الجزائر',
    statFeature1Title: 'تسليم فوري ومعاينة حينية',
    statFeature1Desc: 'جميع السيارات متواجدة فعلياً في صالة العرض وجاهزة للتسليم المباشر مع المعاينة والتجربة.',
    statFeature2Title: 'وثائق رسمية وقانونية 100%',
    statFeature2Desc: 'ملفات إدارية جاهزة ومطابقة للمعايير لتسهيل استخراج البطاقة الرمادية والتسجيل الفوري.',
    
    // Search & Filters
    searchPlaceholder: 'ابحث عن الماركة أو الموديل (مثل: Chery, Geely, BYD, Jetour)...',
    filterAll: 'جميع السيارات المتوفرة',
    filterInAlgeria: 'في الجزائر (تسليم فوري)',
    filterBrand: 'الماركة',
    filterFuel: 'نوع الوقود',
    filterTransmission: 'علبة السرعة',
    filterAllBrands: 'جميع الماركات',
    filterAllFuels: 'جميع أنواع الوقود',
    filterAllTransmissions: 'جميع العلب',
    clearFilters: 'إعادة ضبط الفلاتر',
    noCarsFound: 'لم يتم العثور على سيارات تطابق خيارات البحث.',
    
    // Car Status Badges
    badgeInAlgeria: 'متوفرة في الجزائر 🇩🇿 (تسليم فوري)',
    immediateDelivery: 'تسليم فوري بالمعرض',
    priceOnRequest: 'السعر حسب الطلب',
    
    // Car Details
    yearLabel: 'سنة الصنع',
    mileageLabel: 'المسافة المقطوعة',
    fuelLabel: 'نوع الوقود',
    transmissionLabel: 'علبة السرعة',
    colorLabel: 'اللون الخارجي',
    interiorColorLabel: 'لون المقصورة (الداخل)',
    locationLabel: 'الموقع والحالة',
    specsTitle: 'المواصفات والتجهيزات',
    descriptionTitle: 'تفاصيل السيارة',
    galleryTitle: 'معرض الصور (انقر للتكبير)',
    backToCars: 'العودة لجميع السيارات',
    similarCarsTitle: 'سيارات أخرى متوفرة بالمعرض',
    
    // Contact & Actions
    btnCallNow: 'اتصل الآن بالهاتف',
    btnWhatsApp: 'تواصل عبر واتساب',
    btnDirectContact: 'تواصل مباشر مع المعرض',
    whatsappMessagePrefix: 'مرحباً، أود الاستفسار عن سيارة:',
    
    // About & Contact Section
    aboutSectionTitle: 'عن المعرض',
    aboutSectionSub: 'شريكك الموثوق لاقتناء وتأجير السيارات الحديثة والفاخرة وكافة ولايات الوطن',
    contactInfoTitle: 'أرقام التواصل والعنوان',
    locationMapTitle: 'موقع المعرض على الخريطة',
    addressLabel: 'العنوان',
    phoneNumbersLabel: 'أرقام الهاتف',
    whatsappLabel: 'الواتساب الرسمي',
    workingHoursLabel: 'ساعات العمل',
    socialMediaTitle: 'تابعنا على مواقع التواصل الاجتماعي',
    
    // Process Steps
    processTitle: 'كيف تقتني سيارتك معنا؟',
    step1Title: '1. اختيار السيارة والمعاينة',
    step1Desc: 'تصفح السيارات المتوفرة أو تفضل بزيارة صالة العرض لمعاينة السيارة على أرض الواقع.',
    step2Title: '2. التواصل والاتفاق على السعر',
    step2Desc: 'تواصل معنا مباشرة عبر الهاتف أو الواتساب للاطلاع على البطاقة التقنية والأسعار والضمان.',
    step3Title: '3. تجهيز الملف الإداري والقانوني',
    step3Desc: 'نقوم بتجهيز كافة الوثائق الرسمية والمطابقة الإدارية لتسهيل إجراءات التسجيل.',
    step4Title: '4. التسليم الفوري للسيارة',
    step4Desc: 'استلم مفاتيح سيارتك ووثائقها فوراً واستمتع بتجربة قيادة استثنائية.',
    
    // Admin Panel
    adminTitle: 'لوحة تحكم المشرف (إدارة المعرض)',
    adminLoginTitle: 'تسجيل دخول المشرف',
    adminPasswordPlaceholder: 'أدخل رمز الدخول (الافتراضي: 1234)',
    adminLoginBtn: 'دخول',
    adminLogoutBtn: 'خروج من المشرف',
    adminAddCarBtn: '+ إضافة سيارة جديدة',
    adminEditCarTitle: 'تعديل بيانات السيارة',
    adminAddCarTitle: 'إضافة سيارة جديدة للمخزون (تسليم فوري)',
    adminCarListTitle: 'إدارة مخزون المعرض',
    
    // Admin Form Fields
    fieldBrand: 'الماركة (Brand)',
    fieldModel: 'الموديل (Model)',
    fieldYear: 'السنة (Year)',
    fieldPriceDzd: 'السعر بالدينار الجزائري (DZD)',
    fieldPriceNote: 'ضع 0 إذا كان السعر "حسب الطلب"',
    fieldLocation: 'مكان السيارة وحالتها',
    fieldLocAlgeria: 'في الجزائر (تسليم فوري)',
    fieldPhone: 'رقم الهاتف للتواصل لهذه السيارة',
    fieldWhatsApp: 'رقم الواتساب (صيغة دولية مثل: +213550123456)',
    fieldMileage: 'المسافة المقطوعة',
    fieldFuel: 'نوع الوقود',
    fieldTransmission: 'علبة السرعة',
    fieldExteriorColor: 'اللون الخارجي (Outside Color)',
    fieldInteriorColor: 'لون المقصورة (Inside Color)',
    fieldSpecs: 'المواصفات الرئيسية (افصل بينها بفارزة ",")',
    fieldDescAr: 'الوصف باللغة العربية',
    fieldDescFr: 'الوصف باللغة الفرنسية',
    fieldDescEn: 'الوصف باللغة الإنجليزية',
    fieldMainImage: 'رابط الصورة الرئيسية',
    fieldGalleryImages: 'روابط الصور الإضافية (رابط في كل سطر)',
    fieldUploadLocalPhoto: 'أو قم بتحميل صور من جهازك:',
    
    // Admin Actions
    btnSaveCar: 'حفظ السيارة',
    btnCancel: 'إلغاء',
    btnEdit: 'تعديل',
    btnDelete: 'حذف',
    confirmDelete: 'هل أنت متأكد من رغبتك في حذف هذه السيارة من المخزون؟',
    carSavedSuccess: 'تم حفظ السيارة بنجاح في المعرض!',
    carDeletedSuccess: 'تم حذف السيارة بنجاح.',
    resetDefaultData: 'استعادة المخزون الافتراضي',
    
    // AI Assistant
    assistantName: 'مساعد كادكس الذكي 🤖',
    assistantSubtitle: 'اسألني عن السيارات المتوفرة بالمعرض، الأسعار، والمواصفات التقنية',
    assistantPlaceholder: 'اكتب سؤالك هنا...',
    assistantSend: 'إرسال',
    
    // Footer
    footerRights: 'جميع الحقوق محفوظة © KADEX DZ - معرض السيارات بعنابة (الشط)',
  },

  fr: {
    // Showroom Identity
    brandName: 'KADEX DZ',
    showroomTagline: 'KADEX DZ - Véhicules Récents & Disponibles en Algérie (Livraison Immédiate)',
    showroomSubTitle: 'Voitures modernes et luxueuses disponibles en stock à Annaba (Echatt) pour livraison immédiate avec garantie et transparence totale.',
    
    // Navigation
    navCarsAlgeria: 'Disponibles en Algérie (Immédiat)',
    navAboutContact: 'À Propos & Contact',
    navAdmin: 'Panneau Admin',
    
    // Hero & Stats
    heroTitle: 'Votre Showroom de Confiance en Algérie - Livraison Immédiate',
    heroBadge: 'Disponible en Algérie 🇩🇿 Livraison Immédiate',
    statInAlgeria: 'En Stock en Algérie',
    statFeature1Title: 'Livraison Immédiate & Essai Direct',
    statFeature1Desc: 'Tous les véhicules sont visibles dans notre showroom à Annaba (Echatt), prêts à être livrés immédiatement.',
    statFeature2Title: 'Documents Officiels & Garantie',
    statFeature2Desc: 'Dossiers administratifs conformes pour une immatriculation rapide et sans tracas.',
    
    // Search & Filters
    searchPlaceholder: 'Rechercher marque ou modèle (ex: Chery, Geely, BYD, Jetour)...',
    filterAll: 'Tous les Véhicules en Stock',
    filterInAlgeria: 'En Algérie (Livraison Immédiate)',
    filterBrand: 'Marque',
    filterFuel: 'Carburant',
    filterTransmission: 'Boîte de Vitesse',
    filterAllBrands: 'Toutes les Marques',
    filterAllFuels: 'Tous Carburants',
    filterAllTransmissions: 'Toutes Boîtes',
    clearFilters: 'Réinitialiser',
    noCarsFound: 'Aucun véhicule ne correspond à vos critères de recherche.',
    
    // Car Status Badges
    badgeInAlgeria: 'Disponible en Algérie 🇩🇿 (Livraison Immédiate)',
    immediateDelivery: 'Livraison Immédiate au Showroom',
    priceOnRequest: 'Prix sur Demande',
    
    // Car Details
    yearLabel: 'Année',
    mileageLabel: 'Kilométrage',
    fuelLabel: 'Carburant',
    transmissionLabel: 'Boîte de Vitesse',
    colorLabel: 'Couleur Extérieure',
    interiorColorLabel: 'Couleur Intérieure',
    locationLabel: 'Emplacement & Statut',
    specsTitle: 'Équipements & Options',
    descriptionTitle: 'Détails du Véhicule',
    galleryTitle: 'Galerie Photos (Cliquez pour agrandir)',
    backToCars: 'Retour au catalogue',
    similarCarsTitle: 'Autres véhicules disponibles',
    
    // Contact & Actions
    btnCallNow: 'Appeler Directement',
    btnWhatsApp: 'Discuter sur WhatsApp',
    btnDirectContact: 'Contact Direct Showroom',
    whatsappMessagePrefix: 'Bonjour KADEX DZ, je souhaite me renseigner sur le véhicule:',
    
    // About & Contact Section
    aboutSectionTitle: 'À Propos de KADEX DZ Showroom',
    aboutSectionSub: 'Votre partenaire d\'excellence pour l\'achat de véhicules neufs et récents à Annaba (Echatt) et partout en Algérie.',
    contactInfoTitle: 'Coordonnées & Adresse',
    locationMapTitle: 'Localisation du Showroom (Echatt, Annaba, Algérie)',
    addressLabel: 'Adresse',
    phoneNumbersLabel: 'Téléphones',
    whatsappLabel: 'WhatsApp Officiel',
    workingHoursLabel: 'Heures d\'ouverture',
    socialMediaTitle: 'Suivez-nous sur les Réseaux Sociaux',
    
    // Process Steps
    processTitle: 'Comment acheter votre véhicule avec KADEX DZ ?',
    step1Title: '1. Choix du Véhicule & Visite',
    step1Desc: 'Sélectionnez votre voiture en ligne ou visitez notre showroom à Annaba (Echatt) pour la découvrir de près.',
    step2Title: '2. Contact & Détails du Prix',
    step2Desc: 'Appelez-nous ou envoyez un message WhatsApp pour obtenir la fiche technique et les options.',
    step3Title: '3. Dossier Administratif',
    step3Desc: 'Nous préparons tous les documents légaux nécessaires à l\'immatriculation immédiate.',
    step4Title: '4. Livraison Immédiate',
    step4Desc: 'Prenez le volant de votre nouveau véhicule en toute sérénité dès aujourd\'hui.',
    
    // Admin Panel
    adminTitle: 'Administration du Showroom KADEX DZ',
    adminLoginTitle: 'Connexion Administrateur',
    adminPasswordPlaceholder: 'Code PIN (Défaut: 1234)',
    adminLoginBtn: 'Se Connecter',
    adminLogoutBtn: 'Déconnexion Admin',
    adminAddCarBtn: '+ Ajouter un Véhicule',
    adminEditCarTitle: 'Modifier le Véhicule',
    adminAddCarTitle: 'Ajouter un Véhicule (Livraison Immédiate)',
    adminCarListTitle: 'Gestion du Stock',
    
    // Admin Form Fields
    fieldBrand: 'Marque',
    fieldModel: 'Modèle',
    fieldYear: 'Année',
    fieldPriceDzd: 'Prix en DZD (Dinars)',
    fieldPriceNote: 'Mettre 0 pour "Prix sur demande"',
    fieldLocation: 'Emplacement Actuel',
    fieldLocAlgeria: 'En Algérie (Livraison Immédiate)',
    fieldPhone: 'Téléphone de Contact',
    fieldWhatsApp: 'Numéro WhatsApp (+213...)',
    fieldMileage: 'Kilométrage',
    fieldFuel: 'Carburant',
    fieldTransmission: 'Boîte de vitesse',
    fieldExteriorColor: 'Couleur extérieure',
    fieldInteriorColor: 'Couleur intérieure',
    fieldSpecs: 'Options & Équipements (séparés par des virgules)',
    fieldDescAr: 'Description en Arabe',
    fieldDescFr: 'Description en Français',
    fieldDescEn: 'Description en Anglais',
    fieldMainImage: 'URL Image Principale',
    fieldGalleryImages: 'URL Images Galerie (une par ligne)',
    fieldUploadLocalPhoto: 'Ou importer depuis l\'appareil:',
    
    // Admin Actions
    btnSaveCar: 'Enregistrer',
    btnCancel: 'Annuler',
    btnEdit: 'Modifier',
    btnDelete: 'Supprimer',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce véhicule ?',
    carSavedSuccess: 'Véhicule enregistré avec succès !',
    carDeletedSuccess: 'Véhicule supprimé.',
    resetDefaultData: 'Réinitialiser Catalogue Défaut',
    
    // AI Assistant
    assistantName: 'Assistant IA KADEX 🤖',
    assistantSubtitle: 'Posez vos questions sur nos véhicules en stock, prix et caractéristiques techniques',
    assistantPlaceholder: 'Écrivez votre question ici...',
    assistantSend: 'Envoyer',
    
    // Footer
    footerRights: 'Tous droits réservés © KADEX DZ - Showroom Automobile Annaba (Echatt)',
  },

  en: {
    // Showroom Identity
    brandName: 'KADEX DZ',
    showroomTagline: 'KADEX DZ - Modern Cars in Algeria (Immediate Delivery)',
    showroomSubTitle: 'Premium and modern vehicles in stock at our Annaba (Echatt) showroom available for immediate handover with full warranty.',
    
    // Navigation
    navCarsAlgeria: 'Available in Algeria (In Stock)',
    navAboutContact: 'About & Contact',
    navAdmin: 'Admin Portal',
    
    // Hero & Stats
    heroTitle: 'Your Trusted Car Showroom in Algeria - Immediate Delivery',
    heroBadge: 'In Algeria 🇩🇿 Immediate Delivery',
    statInAlgeria: 'Available in Stock',
    statFeature1Title: 'Immediate Delivery & Live Inspection',
    statFeature1Desc: 'All vehicles are physically present in our Annaba (Echatt) showroom and ready for immediate test-drive and delivery.',
    statFeature2Title: 'Official Documents & Warranty',
    statFeature2Desc: 'Compliant administrative files for quick registration and full peace of mind.',
    
    // Search & Filters
    searchPlaceholder: 'Search brand or model (e.g. Chery, Geely, BYD, Jetour)...',
    filterAll: 'All Vehicles in Stock',
    filterInAlgeria: 'In Algeria (Immediate Delivery)',
    filterBrand: 'Brand',
    filterFuel: 'Fuel Type',
    filterTransmission: 'Transmission',
    filterAllBrands: 'All Brands',
    filterAllFuels: 'All Fuels',
    filterAllTransmissions: 'All Transmissions',
    clearFilters: 'Clear Filters',
    noCarsFound: 'No vehicles match your search criteria.',
    
    // Car Status Badges
    badgeInAlgeria: 'Available in Algeria 🇩🇿 (Immediate Delivery)',
    immediateDelivery: 'Immediate Showroom Delivery',
    priceOnRequest: 'Price on Request',
    
    // Car Details
    yearLabel: 'Year',
    mileageLabel: 'Mileage',
    fuelLabel: 'Fuel',
    transmissionLabel: 'Transmission',
    colorLabel: 'Exterior Color',
    interiorColorLabel: 'Interior Color',
    locationLabel: 'Location & Status',
    specsTitle: 'Features & Equipment',
    descriptionTitle: 'Vehicle Description',
    galleryTitle: 'Photo Gallery (Click to enlarge)',
    backToCars: 'Back to all cars',
    similarCarsTitle: 'Other available vehicles',
    
    // Contact & Actions
    btnCallNow: 'Call Phone Now',
    btnWhatsApp: 'Chat on WhatsApp',
    btnDirectContact: 'Direct Showroom Contact',
    whatsappMessagePrefix: 'Hello KADEX DZ, I would like to inquire about the car:',
    
    // About & Contact Section
    aboutSectionTitle: 'About KADEX DZ Showroom',
    aboutSectionSub: 'Your trusted partner for buying brand new & recent modern cars in Annaba (Echatt) and across Algeria.',
    contactInfoTitle: 'Contact Information & Address',
    locationMapTitle: 'Showroom Location Map (Echatt, Annaba, Algeria)',
    addressLabel: 'Address',
    phoneNumbersLabel: 'Phone Numbers',
    whatsappLabel: 'Official WhatsApp',
    workingHoursLabel: 'Working Hours',
    socialMediaTitle: 'Follow Us on Social Media',
    
    // Process Steps
    processTitle: 'How to Buy Your Car with KADEX DZ',
    step1Title: '1. Select Your Vehicle & Visit',
    step1Desc: 'Browse available cars online or visit our showroom in Annaba (Echatt) for an in-person viewing.',
    step2Title: '2. Contact & Pricing Details',
    step2Desc: 'Call or WhatsApp us to get technical sheets, pricing breakdown, and warranty details.',
    step3Title: '3. Administrative & Registration File',
    step3Desc: 'We prepare all official documentation for prompt vehicle registration.',
    step4Title: '4. Immediate Handover',
    step4Desc: 'Drive away in your new car with complete peace of mind today.',
    
    // Admin Panel
    adminTitle: 'KADEX DZ Admin Portal',
    adminLoginTitle: 'Admin Login',
    adminPasswordPlaceholder: 'Enter PIN Code (Default: 1234)',
    adminLoginBtn: 'Login',
    adminLogoutBtn: 'Logout Admin',
    adminAddCarBtn: '+ Add New Vehicle',
    adminEditCarTitle: 'Edit Vehicle Details',
    adminAddCarTitle: 'Add New Vehicle to Inventory (Immediate Delivery)',
    adminCarListTitle: 'Inventory Management',
    
    // Admin Form Fields
    fieldBrand: 'Brand Name',
    fieldModel: 'Model Name',
    fieldYear: 'Year',
    fieldPriceDzd: 'Price in DZD',
    fieldPriceNote: 'Set 0 for "Price on Request"',
    fieldLocation: 'Current Location',
    fieldLocAlgeria: 'In Algeria (Immediate Delivery)',
    fieldPhone: 'Contact Phone Number',
    fieldWhatsApp: 'WhatsApp Number (+213...)',
    fieldMileage: 'Mileage',
    fieldFuel: 'Fuel Type',
    fieldTransmission: 'Transmission',
    fieldExteriorColor: 'Exterior Color',
    fieldInteriorColor: 'Interior Color',
    fieldSpecs: 'Key Features (separated by commas)',
    fieldDescAr: 'Arabic Description',
    fieldDescFr: 'French Description',
    fieldDescEn: 'English Description',
    fieldMainImage: 'Main Image URL',
    fieldGalleryImages: 'Additional Gallery Image URLs (one per line)',
    fieldUploadLocalPhoto: 'Or upload photos from device:',
    
    // Admin Actions
    btnSaveCar: 'Save Vehicle',
    btnCancel: 'Cancel',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this vehicle from inventory?',
    carSavedSuccess: 'Vehicle saved successfully to showroom inventory!',
    carDeletedSuccess: 'Vehicle deleted.',
    resetDefaultData: 'Reset Default Catalog',
    
    // AI Assistant
    assistantName: 'KADEX AI Assistant 🤖',
    assistantSubtitle: 'Ask me about available cars in showroom, pricing, and specs',
    assistantPlaceholder: 'Type your question here...',
    assistantSend: 'Send',
    
    // Footer
    footerRights: 'All rights reserved © KADEX DZ - Car Showroom Annaba (Echatt)',
  }
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.ar;
}
