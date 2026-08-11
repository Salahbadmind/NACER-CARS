/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, MessageCircle, Clock, 
  ExternalLink, Video
} from 'lucide-react';
import { Language, ShowroomInfo } from '../types';
import { getTranslation } from '../translations';
import { SHOWROOM_INFO } from '../constants';
import { parseMapLocation, resolveMapLocationAsync, extractCoordinatesFromUrl, DEFAULT_ALGERIA_COORDS, ParsedLocation } from '../lib/mapUtils';

interface AboutContactProps {
  lang: Language;
  settings?: ShowroomInfo;
}

export function getEmbedMapUrl(googleMapsUrl?: string, mapEmbedUrl?: string, fallbackAddress?: string): string {
  const parsed = parseMapLocation(mapEmbedUrl || googleMapsUrl, fallbackAddress);
  return parsed.embedUrl;
}

const AboutContact: React.FC<AboutContactProps> = ({ lang, settings }) => {
  const t = getTranslation(lang);
  const info = settings || SHOWROOM_INFO;

  const defaultAddress = info.addressAr || info.addressFr || info.addressEn || "الشط، عنابة، الجزائر";
  
  // Dynamic Map State
  const [currentMap, setCurrentMap] = useState<ParsedLocation>(() => {
    const directUrl = (info.googleMapsUrl || '').trim();
    const embedUrl = (info.mapEmbedUrl || '').trim();
    if (embedUrl && (embedUrl.includes('maps/embed') || embedUrl.includes('output=embed') || embedUrl.includes('q='))) {
      const coords = extractCoordinatesFromUrl(embedUrl) || extractCoordinatesFromUrl(directUrl);
      return {
        lat: coords?.lat || DEFAULT_ALGERIA_COORDS.lat,
        lng: coords?.lng || DEFAULT_ALGERIA_COORDS.lng,
        placeName: defaultAddress,
        embedUrl: embedUrl,
        directMapsUrl: directUrl || (coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : embedUrl),
        isCustomCoords: true
      };
    }
    return parseMapLocation(directUrl || embedUrl, defaultAddress);
  });

  // Keep map synchronized with settings props (immediate parse + async shortlink resolution)
  useEffect(() => {
    const directUrl = (info.googleMapsUrl || '').trim();
    const embedUrl = (info.mapEmbedUrl || '').trim();

    if (embedUrl && (embedUrl.includes('maps/embed') || embedUrl.includes('output=embed') || embedUrl.includes('q='))) {
      const coords = extractCoordinatesFromUrl(embedUrl) || extractCoordinatesFromUrl(directUrl);
      setCurrentMap({
        lat: coords?.lat || DEFAULT_ALGERIA_COORDS.lat,
        lng: coords?.lng || DEFAULT_ALGERIA_COORDS.lng,
        placeName: defaultAddress,
        embedUrl: embedUrl,
        directMapsUrl: directUrl || (coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : embedUrl),
        isCustomCoords: true
      });
    } else {
      const immediateParsed = parseMapLocation(directUrl || embedUrl, defaultAddress);
      setCurrentMap(immediateParsed);
    }

    if (directUrl && (directUrl.startsWith('http://') || directUrl.startsWith('https://'))) {
      let isMounted = true;
      resolveMapLocationAsync(directUrl, defaultAddress).then((resolved) => {
        if (isMounted && resolved) {
          setCurrentMap(resolved);
        }
      }).catch((err) => {
        console.warn('AboutContact map resolution notice:', err);
      });

      return () => {
        isMounted = false;
      };
    }
  }, [info.googleMapsUrl, info.mapEmbedUrl, info.addressAr, info.addressFr, info.addressEn, defaultAddress]);

  const directMapsUrl = (info.googleMapsUrl && info.googleMapsUrl.trim().startsWith('http'))
    ? info.googleMapsUrl.trim()
    : currentMap.directMapsUrl;

  const embedMapUrl = currentMap.embedUrl;

  return (
    <section id="about-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3 shadow-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            {lang === 'ar' 
              ? `عن معرض ${info.name || 'السيارات'}` 
              : lang === 'fr' 
              ? `À Propos du Showroom ${info.name || 'Automobile'}` 
              : `About ${info.name || 'Showroom'}`}
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 font-cairo">
          {t.aboutSectionSub}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
          نحن في <span className="text-amber-600 dark:text-amber-400 font-bold">{info.name || 'معرضنا'}</span> نسعى لتقديم تشكيلة حصرية ومميزة من السيارات الحديثة والفاخرة مع التسليم الفوري والتجربة المباشرة وضمان الوثائق الرسمية 100%.
        </p>
      </div>

      {/* 4-Step Import Process Infographic */}
      <div className="mb-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-2xl">
        <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-8 font-cairo">
          {lang === 'ar'
            ? `كيف تقتني سيارتك مع ${info.name || 'معرضنا'}؟`
            : lang === 'fr'
            ? `Comment acheter votre véhicule avec ${info.name || 'notre showroom'} ?`
            : `How to buy your car with ${info.name || 'our showroom'}?`}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-xl border border-slate-200 dark:border-gray-800 relative group hover:border-amber-500/40 transition-colors">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-gray-950 font-black flex items-center justify-center text-sm mb-3">
              1
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t.step1Title}</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{t.step1Desc}</p>
          </div>

          <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-xl border border-slate-200 dark:border-gray-800 relative group hover:border-amber-500/40 transition-colors">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-gray-950 font-black flex items-center justify-center text-sm mb-3">
              2
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t.step2Title}</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{t.step2Desc}</p>
          </div>

          <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-xl border border-slate-200 dark:border-gray-800 relative group hover:border-amber-500/40 transition-colors">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-gray-950 font-black flex items-center justify-center text-sm mb-3">
              3
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t.step3Title}</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{t.step3Desc}</p>
          </div>

          <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-xl border border-slate-200 dark:border-gray-800 relative group hover:border-amber-500/40 transition-colors">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-gray-950 font-black flex items-center justify-center text-sm mb-3">
              4
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t.step4Title}</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{t.step4Desc}</p>
          </div>

        </div>
      </div>

      {/* Main Grid: Contact Cards & Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Side (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-gray-800 pb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span>{t.contactInfoTitle}</span>
            </h3>

            <div className="space-y-5 text-sm">
              
              {/* Address */}
              <div className="flex items-start gap-3">
                <a
                  href={directMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 hover:bg-amber-500 hover:text-gray-950 transition-colors"
                  title="فتح الموقع على خرائط جوجل"
                >
                  <MapPin className="w-5 h-5" />
                </a>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 block mb-0.5">{t.addressLabel}</span>
                  <span className="text-slate-800 dark:text-gray-200 font-bold block text-sm">
                    {lang === 'fr' ? info.addressFr : lang === 'en' ? info.addressEn : info.addressAr}
                  </span>
                  <a
                    href={directMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-1.5 hover:underline"
                  >
                    <span>فتح الموقع في تطبيق Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 block mb-0.5">{t.phoneLabel}</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs sm:text-sm font-bold">
                    {info.phone1 && (
                      <a 
                        href={`tel:${info.phone1.replace(/\s/g, '')}`} 
                        className="text-amber-600 dark:text-amber-400 hover:underline"
                        dir="ltr"
                      >
                        {info.phone1}
                      </a>
                    )}
                    {info.phone2 && (
                      <a 
                        href={`tel:${info.phone2.replace(/\s/g, '')}`} 
                        className="text-slate-700 dark:text-gray-300 hover:underline"
                        dir="ltr"
                      >
                        {info.phone2}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              {info.whatsapp && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 block mb-0.5">{t.whatsappLabel}</span>
                    <a 
                      href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs mt-1 transition-colors shadow-sm"
                    >
                      <span>تواصل عبر الواتساب الرسمي</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Working Hours */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 block mb-0.5">{t.workingHoursLabel}</span>
                  <span className="text-slate-800 dark:text-gray-200 font-medium">
                    {lang === 'fr' ? info.workingHoursFr : lang === 'en' ? info.workingHoursEn : info.workingHoursAr}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Social Media Links Card */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t.socialMediaTitle}</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {info.facebook && (
                <a
                  href={info.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 hover:border-blue-500 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold"
                >
                  <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span className="truncate">فيسبوك {info.name}</span>
                </a>
              )}

              {info.instagram && (
                <a
                  href={info.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 hover:border-pink-500 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold"
                >
                  <svg className="w-4 h-4 text-pink-500 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span className="truncate">انستغرام {info.name}</span>
                </a>
              )}

              {info.tiktok && (
                <a
                  href={info.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 hover:border-cyan-400 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold sm:col-span-2"
                >
                  <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">تيك توك {info.name}</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Location & Map Frame Side (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 sm:p-7 shadow-sm dark:shadow-xl flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-5 border-b border-slate-200 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base font-cairo">موقع صالة العرض على الخريطة</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{info.addressAr || defaultAddress}</p>
                  </div>
                </div>

                <a
                  href={directMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Map Iframe Frame */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 h-[340px] sm:h-[400px] shadow-inner mb-5">
                <iframe
                  key={embedMapUrl}
                  src={embedMapUrl}
                  title={`موقع ${info.name || 'معرض السيارات'} على الخريطة`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Action Button to Open Google Maps */}
            <div>
              <a
                href={directMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <MapPin className="w-5 h-5 fill-current" />
                <span>فتح الموقع في تطبيق Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default AboutContact;
