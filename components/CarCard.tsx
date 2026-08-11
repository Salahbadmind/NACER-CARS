/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo } from 'react';
import { Phone, MessageCircle, Eye, Fuel, Gauge, Calendar, FileText } from 'lucide-react';
import { Car, Language, ShowroomInfo, ServiceType } from '../types';
import { getTranslation } from '../translations';
import { DEFAULT_SERVICE_TYPES } from '../constants';

interface CarCardProps {
  car: Car;
  lang: Language;
  settings?: ShowroomInfo;
  onSelectCar: (car: Car) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, lang, settings, onSelectCar }) => {
  const t = getTranslation(lang);

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

  // Badge Color Style
  const badgeStyle = useMemo(() => {
    const stId = car.serviceType || 'algeria_showroom';
    if (stId === 'china_import') {
      return 'bg-amber-500 text-gray-950 border-amber-400';
    }
    if (stId === 'car_rental') {
      return 'bg-indigo-600 text-white border-indigo-400';
    }
    if (stId === 'bikes') {
      return 'bg-orange-500 text-white border-orange-400';
    }
    return 'bg-emerald-500 text-gray-950 border-emerald-400';
  }, [car.serviceType]);

  const formatDzd = (price: number) => {
    if (!price || price === 0) return t.priceOnRequest;
    return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(price) + ' د.ج';
  };

  const whatsappServiceDesc = useMemo(() => {
    if (car.serviceType === 'china_import') return 'طلب واستيراد من الصين';
    if (car.serviceType === 'car_rental') return 'طلب كراء وتأجير';
    if (car.serviceType === 'bikes') return 'استفسار عن دراجة نارية';
    return serviceTypeInfo.badgeAr || serviceTypeInfo.nameAr;
  }, [car.serviceType, serviceTypeInfo]);

  const whatsappLink = `https://wa.me/${(car.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(
    `${t.whatsappMessagePrefix} ${car.brand} ${car.model} (${car.year}) - [${whatsappServiceDesc}]`
  )}`;

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col group shadow-sm">
      
      {/* Top Image Container */}
      <div 
        onClick={() => onSelectCar(car)}
        className="relative h-36 sm:h-56 md:h-64 overflow-hidden bg-slate-100 dark:bg-gray-950 cursor-pointer"
      >
        <img
          src={car.mainImage}
          alt={`${car.brand} ${car.model}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Location & Status Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <span className={`inline-flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-black px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg border ${badgeStyle}`}>
            <span>{serviceTypeInfo.icon || '🏷️'}</span>
            <span>{badgeText}</span>
          </span>
        </div>

        {/* Fiche Technique Badge on Top Left */}
        {car.ficheTechnique && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-amber-500 text-gray-950 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg border border-amber-400">
              <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Fiche Technique</span>
            </span>
          </div>
        )}

        {/* Hover View Detail Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center max-sm:hidden">
          <button className="bg-amber-500 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye className="w-4 h-4" />
            <span>عرض الصور والمواصفات</span>
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Brand & Model Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {car.brand}
              </span>
              <h3 
                onClick={() => onSelectCar(car)}
                className="text-sm sm:text-lg font-black text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors line-clamp-1"
              >
                {car.model} <span className="text-slate-500 dark:text-gray-400 font-normal">({car.year})</span>
              </h3>
            </div>

            {/* Price Tag */}
            <div className="sm:text-right">
              <div className="text-xs sm:text-base font-extrabold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                {formatDzd(car.priceDzd)}
              </div>
            </div>
          </div>

          {/* Exterior & Interior Colors Tag */}
          {(car.exteriorColor || car.interiorColor || car.color) && (
            <div className="flex items-center gap-1.5 text-[9px] sm:text-xs text-slate-600 dark:text-gray-400 mb-2">
              <span className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-300 truncate max-w-[80px]">
                {car.exteriorColor || car.color}
              </span>
              {car.interiorColor && (
                <span className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold text-orange-600 dark:text-orange-300 truncate max-w-[80px]">
                  {car.interiorColor}
                </span>
              )}
            </div>
          )}

          {/* Quick Technical Specs Row */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 my-2 sm:my-3 p-1.5 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800/80 text-[10px] sm:text-xs text-slate-700 dark:text-gray-300">
            <div className="flex items-center gap-1 min-w-0">
              <Fuel className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="truncate">{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="truncate">{car.transmission === 'Automatic' ? 'أوتو' : 'يدوي'}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="truncate">{car.mileage || '0 كم'}</span>
            </div>
          </div>

          {/* Top Specs Pills */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {car.specs?.slice(0, 2).map((spec, idx) => (
              <span 
                key={idx}
                className="bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 text-[9px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded border border-slate-200 dark:border-gray-700/60 truncate max-w-[100px]"
              >
                • {spec}
              </span>
            ))}
            {car.specs && car.specs.length > 2 && (
              <span className="text-slate-500 dark:text-gray-500 text-[9px] sm:text-[11px] self-center">
                +{car.specs.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Direct Call & WhatsApp Action Buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-gray-800/80 grid grid-cols-2 gap-1.5 mt-auto">
          
          {/* Phone Call Button */}
          <a
            href={`tel:${car.phone}`}
            className="flex items-center justify-center gap-1 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-gray-950 font-bold text-[10px] sm:text-xs border border-amber-500/30 transition-all duration-200"
            title={t.btnCallNow}
          >
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="max-sm:hidden">{t.btnCallNow}</span>
            <span className="sm:hidden">{lang === 'ar' ? 'اتصل' : (lang === 'fr' ? 'Appeler' : 'Call')}</span>
          </a>

          {/* WhatsApp Chat Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold text-[10px] sm:text-xs border border-emerald-500/30 transition-all duration-200"
            title={t.btnWhatsApp}
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 fill-emerald-400/20 hover:fill-white" />
            <span className="max-sm:hidden">{t.btnWhatsApp}</span>
            <span className="sm:hidden">{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
          </a>

        </div>

      </div>

    </div>
  );
};

export default CarCard;
