/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, Phone, MessageCircle, MapPin, Fuel, Gauge, 
  Calendar, Check, ShieldCheck, Share2, Maximize2, X, ChevronLeft, ChevronRight,
  FileText, Download
} from 'lucide-react';
import { Car, Language, ShowroomInfo, ServiceType } from '../types';
import { getTranslation } from '../translations';
import { DEFAULT_SERVICE_TYPES } from '../constants';

interface CarDetailProps {
  car: Car;
  allCars: Car[];
  lang: Language;
  settings?: ShowroomInfo;
  onBack: () => void;
  onSelectCar: (car: Car) => void;
}

const CarDetail: React.FC<CarDetailProps> = ({
  car,
  allCars,
  lang,
  settings,
  onBack,
  onSelectCar
}) => {
  const t = getTranslation(lang);
  
  // Gallery state
  const galleryImages = [car.mainImage, ...(car.images || [])].filter((img, idx, self) => self.indexOf(img) === idx);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const rentalAvailability = car.rentalAvailability || 'both';
  const [rentalMode, setRentalMode] = useState<'without_driver' | 'with_driver'>(
    rentalAvailability === 'with_driver_only' ? 'with_driver' : 'without_driver'
  );

  const activeRentalPrice = rentalAvailability === 'with_driver_only'
    ? (car.rentalPriceWithDriver || car.priceDzd)
    : rentalAvailability === 'without_driver_only'
    ? (car.rentalPriceWithoutDriver || car.priceDzd)
    : rentalMode === 'with_driver'
    ? (car.rentalPriceWithDriver || (car.priceDzd + 4000))
    : (car.rentalPriceWithoutDriver || car.priceDzd);

  const serviceTypeInfo: ServiceType = useMemo(() => {
    const list = settings?.serviceTypes && settings.serviceTypes.length > 0
      ? settings.serviceTypes
      : DEFAULT_SERVICE_TYPES;
    return list.find(st => st.id === car.serviceType) || list.find(st => st.id === 'algeria_showroom') || {
      id: 'algeria_showroom',
      nameAr: 'سيارات متوفرة في الجزائر',
      nameFr: 'Disponibles en Algérie',
      nameEn: 'Available in Algeria',
      badgeAr: 'تسليم فوري 🇩🇿',
      badgeFr: 'Livraison Immédiate 🇩🇿',
      badgeEn: 'Immediate Delivery 🇩🇿',
      icon: '🇩🇿'
    };
  }, [settings?.serviceTypes, car.serviceType]);

  const badgeText = useMemo(() => {
    if (lang === 'fr') return serviceTypeInfo.badgeFr || serviceTypeInfo.nameFr;
    if (lang === 'en') return serviceTypeInfo.badgeEn || serviceTypeInfo.nameEn;
    return serviceTypeInfo.badgeAr || serviceTypeInfo.nameAr;
  }, [lang, serviceTypeInfo]);

  const badgeStyle = useMemo(() => {
    const stId = car.serviceType || 'algeria_showroom';
    if (stId === 'china_import') return 'bg-amber-500 text-gray-950 border-amber-400';
    if (stId === 'car_rental') return 'bg-indigo-600 text-white border-indigo-400';
    if (stId === 'bikes') return 'bg-orange-500 text-white border-orange-400';
    return 'bg-emerald-500 text-gray-950 border-emerald-400';
  }, [car.serviceType]);

  const formatDzd = (price: number) => {
    if (!price || price === 0) return t.priceOnRequest;
    return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(price) + ' د.ج';
  };

  const currentDesc = car.description?.[lang] || car.description?.ar || '';

  const whatsappServiceDesc = useMemo(() => {
    if (car.serviceType === 'china_import') return 'طلب واستيراد من الصين';
    if (car.serviceType === 'car_rental') return 'طلب كراء وتأجير';
    if (car.serviceType === 'bikes') return 'استفسار عن دراجة نارية';
    return serviceTypeInfo.badgeAr || serviceTypeInfo.nameAr;
  }, [car.serviceType, serviceTypeInfo]);

  const whatsappLink = `https://wa.me/${(car.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(
    `${t.whatsappMessagePrefix} ${car.brand} ${car.model} (${car.year}) - ${formatDzd(car.priceDzd)} - [${whatsappServiceDesc}]`
  )}`;

  const similarCars = allCars
    .filter(c => c.id !== car.id && (c.brand === car.brand))
    .slice(0, 3);

  const [copied, setCopied] = useState(false);

  const showroomName = settings?.name || 'KADEX DZ';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car.brand} ${car.model} - ${showroomName}`,
        text: `شاهد سيارة ${car.brand} ${car.model} في معرض ${showroomName} الجزائر`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* Top Navigation & Share Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-300 border border-slate-200 dark:border-gray-800 text-sm font-bold shadow-sm transition-all"
        >
          <ArrowRight className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>{t.backToCars}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-300 border border-slate-200 dark:border-gray-800 text-xs font-bold shadow-sm transition-all"
        >
          <Share2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>{copied ? 'تم نسخ الرابط! ✓' : 'مشاركة الإعلان'}</span>
        </button>
      </div>

      {/* Main Grid: Gallery on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gallery Section (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main Large Image Container */}
          <div className="relative h-[380px] sm:h-[480px] bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 group shadow-2xl">
            <img
              src={galleryImages[activeImageIndex] || car.mainImage}
              alt={`${car.brand} ${car.model}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Location & Service Badge Overlay */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`text-xs font-black px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 border ${badgeStyle}`}>
                <span>{serviceTypeInfo.icon || '🏷️'}</span>
                <span>{badgeText}</span>
              </span>
            </div>

            {/* Full Screen Zoom Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-gray-950/80 hover:bg-amber-500 text-white hover:text-gray-950 border border-gray-800 transition-all shadow-lg"
              title="تكبير الصورة"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* Previous / Next Image Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white border border-gray-700 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white border border-gray-700 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Gallery Thumbnails List */}
          {galleryImages.length > 1 && (
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2">{t.galleryTitle}</p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/30 scale-95'
                        : 'border-gray-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Details & Direct Contact Section (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          <div>
            {/* Brand, Title & Price Header */}
            <div className="border-b border-gray-800 pb-6 mb-6">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                {car.brand}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2 font-cairo">
                {car.model} <span className="text-gray-400 font-normal">({car.year})</span>
              </h1>

              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-black text-amber-400">
                  {car.serviceType === 'car_rental' ? formatDzd(activeRentalPrice) : formatDzd(car.priceDzd)}
                  {car.serviceType === 'car_rental' && <span className="text-xs text-gray-400 font-normal mr-1">/ يومياً</span>}
                </span>
                {car.priceDzd > 0 && (
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                    <span>{serviceTypeInfo.icon || '🏷️'}</span>
                    <span>{badgeText}</span>
                  </span>
                )}
              </div>
            </div>

            {/* RENTAL OPTIONS WIDGET (IF CAR RENTAL) */}
            {car.serviceType === 'car_rental' && (
              <div className="bg-gradient-to-br from-amber-500/15 via-gray-950 to-gray-950 border-2 border-amber-500/40 p-4 sm:p-5 rounded-2xl mb-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔑</span>
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider font-cairo">
                      خيارات كراء وتأجير السيارة (مع وبدون سائق)
                    </h3>
                  </div>
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                    أقل مدة: {car.rentalMinDays || 3} أيام
                  </span>
                </div>

                {/* Toggle Mode Buttons or single option */}
                {rentalAvailability === 'both' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRentalMode('without_driver')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        rentalMode === 'without_driver'
                          ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-md font-black'
                          : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800'
                      }`}
                    >
                      <span>بدون سائق 🚗</span>
                      <span className="text-[11px] opacity-90">{formatDzd(car.rentalPriceWithoutDriver || car.priceDzd)} / يوم</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRentalMode('with_driver')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        rentalMode === 'with_driver'
                          ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-md font-black'
                          : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800'
                      }`}
                    >
                      <span>مع سائق محترف 👨‍✈️</span>
                      <span className="text-[11px] opacity-90">{formatDzd(car.rentalPriceWithDriver || (car.priceDzd + 4000))} / يوم</span>
                    </button>
                  </div>
                ) : rentalAvailability === 'with_driver_only' ? (
                  <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5"><span>👨‍✈️</span> <span>متوفر مع سائق محترف فقط</span></span>
                    <span className="text-amber-400">{formatDzd(car.rentalPriceWithDriver || car.priceDzd)} / يوم</span>
                  </div>
                ) : (
                  <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5"><span>🚗</span> <span>متوفر بدون سائق فقط</span></span>
                    <span className="text-amber-400">{formatDzd(car.rentalPriceWithoutDriver || car.priceDzd)} / يوم</span>
                  </div>
                )}

                {/* Obligations & Conditions */}
                {car.rentalConditionsAr && (
                  <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-xs space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>شروط والتزامات العميل ({rentalMode === 'with_driver' ? 'مع سائق' : 'بدون سائق'}):</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {car.rentalConditionsAr}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CHINA IMPORT & SHIPPING WIDGET (IF CHINA IMPORT) */}
            {car.serviceType === 'china_import' && (
              <div className="bg-gradient-to-br from-blue-500/15 via-gray-950 to-gray-950 border-2 border-blue-500/40 p-4 sm:p-5 rounded-2xl mb-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇨🇳</span>
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider font-cairo">
                    تفاصيل الاستيراد والشحن من الصين
                  </h3>
                </div>

                <div className="bg-gray-900/90 p-3.5 rounded-xl border border-gray-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="text-gray-400">مدة النقل والشحن:</span>
                    <span className="font-bold text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded border border-blue-500/30">
                      {car.shippingDuration || '30 إلى 45 يوم'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    شحن بحري مؤمن بالكامل من المصانع مباشرة إلى الميناء الجزائري مع إتمام كافة عقود الاستيراد والتخليص الجمركي رسمياً.
                  </p>
                </div>
              </div>
            )}

            {/* Direct Contact Buttons */}
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 mb-6">
              <p className="text-xs font-bold text-gray-300 mb-3 text-center">
                تواصل مباشر وحجز حيني مع مسؤول المبيعات:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone Call */}
                <a
                  href={`tel:${car.phone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
                >
                  <Phone className="w-5 h-5 fill-gray-950" />
                  <span>{t.btnCallNow}</span>
                </a>

                {/* WhatsApp Chat */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{t.btnWhatsApp}</span>
                </a>
              </div>

              <div className="mt-3 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>ضمان المعاملات القانونية وخدمة العملاء في المعرض</span>
              </div>
            </div>

            {/* Key Specs Matrix */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-950 p-4 rounded-xl border border-gray-800/80 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-500 block">{t.yearLabel}</span>
                  <span className="font-bold">{car.year}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-500 block">{t.mileageLabel} / الكيلومترات</span>
                  <span className="font-bold">{car.mileage || '0 كم'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Fuel className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-500 block">{t.fuelLabel}</span>
                  <span className="font-bold">{car.fuelType}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-500 block">{t.locationLabel} / الصنف</span>
                  <span className="font-bold text-amber-300">{badgeText}</span>
                </div>
              </div>

              {/* Exterior Color */}
              <div className="flex items-center gap-2 text-gray-300 col-span-2 sm:col-span-1 pt-2 border-t border-gray-800">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-200 border border-amber-300 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-500 block">اللون الخارجي (Outside Color)</span>
                  <span className="font-bold text-amber-300">{car.exteriorColor || car.color || 'أبيض لؤلؤي / Blanc'}</span>
                </div>
              </div>

              {/* Interior Color */}
              <div className="flex items-center gap-2 text-gray-300 col-span-2 sm:col-span-1 pt-2 border-t border-gray-800">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-orange-800 to-amber-900 border border-orange-700 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-500 block">لون المقصورة (Inside Color)</span>
                  <span className="font-bold text-amber-300">{car.interiorColor || 'جلد فخم / Cuir'}</span>
                </div>
              </div>
            </div>

            {/* Fiche Technique (Technical Sheet) Download Banner */}
            {car.ficheTechnique && (
              <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-gray-950 flex items-center justify-center shrink-0 font-black shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">البطاقة الفنية (Fiche Technique)</h4>
                    <p className="text-[11px] text-amber-300/80 truncate max-w-[170px] sm:max-w-xs">{car.ficheTechniqueName || 'الملف الفني للسيارة (PDF / Doc)'}</p>
                  </div>
                </div>
                <a
                  href={car.ficheTechnique}
                  download={car.ficheTechniqueName || `${car.brand}_${car.model}_Fiche_Technique`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.03]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل / معاينة</span>
                </a>
              </div>
            )}

            {/* Equipment & Features List */}
            {car.specs && car.specs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{t.specsTitle}:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {car.specs.map((spec, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800 text-xs text-gray-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Car Description */}
            {currentDesc && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-2">{t.descriptionTitle}:</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-gray-950/40 p-4 rounded-xl border border-gray-800/60">
                  {currentDesc}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Similar Cars */}
      {similarCars.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">{t.similarCarsTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarCars.map(sCar => (
              <div 
                key={sCar.id}
                onClick={() => onSelectCar(sCar)}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-amber-500/50 cursor-pointer p-4 transition-all"
              >
                <img
                  src={sCar.mainImage}
                  alt={sCar.model}
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h4 className="font-bold text-white">{sCar.brand} {sCar.model}</h4>
                <div className="text-amber-400 font-bold text-sm mt-1">{formatDzd(sCar.priceDzd)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img
              src={galleryImages[activeImageIndex]}
              alt="Zoomed View"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CarDetail;
