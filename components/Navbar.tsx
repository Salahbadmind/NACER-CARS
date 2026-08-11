/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Moon, Sun, Globe, ShieldCheck, Lock, Car as CarIcon } from 'lucide-react';
import { Language, Theme, ShowroomInfo } from '../types';
import { getTranslation } from '../translations';

interface NavbarProps {
  lang: Language;
  settings?: ShowroomInfo;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeToggle: () => void;
  activeSection: string;
  onNavClick: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  lang,
  settings,
  onLanguageChange,
  theme,
  onThemeToggle,
  activeSection,
  onNavClick,
  onOpenAdmin,
  isAdmin
}) => {
  const t = getTranslation(lang);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-gray-950/95 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:min-h-[80px] flex items-center justify-between gap-2">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavClick('top')}
          className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group py-1 min-w-0"
        >
          {settings?.logoUrl ? (
            <div className="relative group/logo shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-600/40 rounded-xl blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 -z-10" />
              
              <div className="h-10 sm:h-16 max-w-[110px] sm:max-w-[280px] flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900/90 p-1 sm:p-1.5 border border-amber-500/30 dark:border-amber-400/40 shadow-md group-hover:scale-105 transition-all duration-300">
                <img
                  src={settings.logoUrl}
                  alt={settings.name || 'KADEX DZ Logo'}
                  className="max-h-full max-w-full object-contain rounded-lg transform scale-150 sm:scale-165 transition-transform duration-300"
                />
              </div>
            </div>
          ) : (
            <div className="relative group/logo shrink-0">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 shadow-md group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-gray-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                  <CarIcon className="w-5 h-5 sm:w-8 sm:h-8 text-amber-400" />
                </div>
              </div>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-base sm:text-2xl tracking-wide text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                {settings?.name ? settings.name : <>KADEX <span className="text-amber-500 dark:text-amber-400">DZ</span></>}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block truncate">
              {lang === 'fr'
                ? (settings?.taglineFr || settings?.tagline || 'Showroom à Annaba (Echatt) - Livraison Immédiate 🇩🇿')
                : lang === 'en'
                ? (settings?.taglineEn || settings?.tagline || 'Showroom in Annaba (Echatt) - Immediate Delivery 🇩🇿')
                : (settings?.taglineAr || settings?.tagline || 'صالة العرض بعنابة (الشط) - تسليم فوري 🇩🇿')}
            </p>
          </div>
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Language Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors">
              <Globe className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="uppercase font-bold text-[11px] sm:text-xs">{lang}</span>
            </button>
            <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-1 hidden group-hover:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-1 min-w-[120px] z-50">
              <button
                onClick={() => onLanguageChange('ar')}
                className={`w-full text-right px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${
                  lang === 'ar' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>العربية</span>
                <span>🇩🇿</span>
              </button>
              <button
                onClick={() => onLanguageChange('fr')}
                className={`w-full text-right px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${
                  lang === 'fr' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>Français</span>
                <span>🇫🇷</span>
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`w-full text-right px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${
                  lang === 'en' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>English</span>
                <span>🇬🇧</span>
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
            )}
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
              isAdmin
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40 shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
            title={t.navAdmin}
          >
            <Lock className={`w-3.5 h-3.5 ${isAdmin ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}`} />
            <span className="hidden sm:inline">{isAdmin ? 'المشرف' : t.navAdmin}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (Sleek, Compact, Non-wrapping) */}
      <div className="md:hidden flex items-center justify-between border-t border-gray-200 dark:border-gray-800/80 bg-gray-50/95 dark:bg-gray-900/95 py-1.5 px-2 text-xs gap-1.5">
        <button
          onClick={() => onNavClick('algeria-section')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-colors whitespace-nowrap text-[11px] flex items-center justify-center gap-1 ${
            activeSection === 'algeria-section' || activeSection === 'all' 
              ? 'bg-amber-500 text-gray-950 shadow-sm font-black' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          <span>🚗</span>
          <span>السيارات المتاحة</span>
        </button>
        <button
          onClick={() => onNavClick('about-section')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-colors whitespace-nowrap text-[11px] flex items-center justify-center gap-1 ${
            activeSection === 'about-section' 
              ? 'bg-amber-500 text-gray-950 shadow-sm font-black' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          <span>📍</span>
          <span>المعرض والخريطة</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
