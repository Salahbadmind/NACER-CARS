/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ShieldCheck, Car, FileCheck2, Sparkles } from 'lucide-react';
import { Language, ShowroomInfo } from '../types';
import { getTranslation } from '../translations';

interface HeroProps {
  lang: Language;
  settings?: ShowroomInfo;
  onExploreClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ lang, settings, onExploreClick }) => {
  const t = getTranslation(lang);

  const bgType = settings?.heroBgType || 'gradient';
  const bgUrl = settings?.heroBgUrl;
  const overlayOpacity = (settings?.heroOverlayOpacity ?? 70) / 100;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 text-slate-900 dark:text-white pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-slate-200 dark:border-gray-800 transition-colors duration-200">
      
      {/* CMS Media Background: Photo or Video */}
      {bgType === 'image' && bgUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={bgUrl}
            alt="Showroom Hero Background"
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0 bg-black/70 dark:bg-gray-950/80 backdrop-blur-[2px]"
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}

      {bgType === 'video' && bgUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src={bgUrl}
          >
            <source src={bgUrl} type="video/mp4" />
          </video>
          <div 
            className="absolute inset-0 bg-black/75 dark:bg-gray-950/85 backdrop-blur-[2px]"
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}

      {/* Decorative background grid and lighting for default gradient view */}
      {bgType === 'gradient' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Hero Tagline */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs sm:text-sm font-bold tracking-wide shadow-sm ${
            bgType !== 'gradient'
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 backdrop-blur-md'
              : 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
            <span>{t.heroBadge}</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          {lang === 'ar' ? (
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight sm:leading-[1.2] mb-4 sm:mb-6 font-alexandria">
              <span className={`block font-extrabold text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 tracking-wide ${
                bgType !== 'gradient' ? 'text-gray-100 drop-shadow-md' : 'text-slate-800 dark:text-gray-100'
              }`}>
                المحطة الموثوقة في رحلتك
              </span>
              <span className="relative inline-block mt-1 font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
                لاقتناء السيارة المثالية
                <span className="block h-1 w-24 sm:w-40 mx-auto mt-2 sm:mt-3 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full opacity-80" />
              </span>
            </h1>
          ) : (
            <h1 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4 sm:mb-6 font-alexandria ${
              bgType !== 'gradient' ? 'text-white drop-shadow-md' : 'text-slate-900 dark:text-white'
            }`}>
              {t.heroTitle}
            </h1>
          )}
          <p className={`text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-cairo px-2 ${
            bgType !== 'gradient' ? 'text-gray-200 drop-shadow' : 'text-slate-600 dark:text-gray-300'
          }`}>
            {t.showroomSubTitle}
          </p>
        </div>

        {/* Feature Cards Grid Banner */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
          
          {/* Card 1: Immediate Delivery in Algeria */}
          <div 
            style={{ backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }}
            className="border p-4 sm:p-6 rounded-2xl transition-all shadow-sm group bg-white/10 dark:bg-white/[0.03] border-slate-300/40 dark:border-white/10 backdrop-blur-[1px] hover:bg-white/20 dark:hover:bg-white/[0.07] hover:border-amber-500/50"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className={`text-base sm:text-lg font-bold mb-1.5 ${bgType !== 'gradient' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {t.statInAlgeria} (تسليم فوري)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${bgType !== 'gradient' ? 'text-gray-200' : 'text-slate-600 dark:text-gray-300'}`}>
              تشكيلة متنوعة من سيارات Geely, Chery, Jetour, BYD متواجدة حالياً في صالة العرض ({settings?.name || 'KADEX DZ'}) للمعاينة الحينية والتسليم المباشر.
            </p>
          </div>

          {/* Card 2: Transparency & Warranty */}
          <div 
            style={{ backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }}
            className="border p-4 sm:p-6 rounded-2xl transition-all shadow-sm group bg-white/10 dark:bg-white/[0.03] border-slate-300/40 dark:border-white/10 backdrop-blur-[1px] hover:bg-white/20 dark:hover:bg-white/[0.07] hover:border-amber-500/50"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className={`text-base sm:text-lg font-bold mb-1.5 ${bgType !== 'gradient' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {t.statFeature1Title || 'تسليم فوري ومعاينة حينية'}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${bgType !== 'gradient' ? 'text-gray-200' : 'text-slate-600 dark:text-gray-300'}`}>
              {t.statFeature1Desc || `جميع السيارات متواجدة فعلياً في صالة العرض (${settings?.name || 'KADEX DZ'}) وجاهزة للتسليم المباشر مع المعاينة والتجربة.`}
            </p>
          </div>

          {/* Card 3: 100% Official Legal Documents */}
          <div 
            style={{ backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }}
            className="border p-4 sm:p-6 rounded-2xl transition-all shadow-sm group bg-white/10 dark:bg-white/[0.03] border-slate-300/40 dark:border-white/10 backdrop-blur-[1px] hover:bg-white/20 dark:hover:bg-white/[0.07] hover:border-amber-500/50"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className={`text-base sm:text-lg font-bold mb-1.5 ${bgType !== 'gradient' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {t.statFeature2Title || 'وثائق رسمية وقانونية 100%'}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${bgType !== 'gradient' ? 'text-gray-200' : 'text-slate-600 dark:text-gray-300'}`}>
              {t.statFeature2Desc || 'ملفات إدارية جاهزة ومطابقة للمعايير لتسهيل استخراج البطاقة الرمادية والتسجيل الفوري.'}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
