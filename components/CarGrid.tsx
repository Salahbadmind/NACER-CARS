/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, Car as CarIcon, MapPin, Sparkles, Layers, Tag } from 'lucide-react';
import { Car, Language, FilterState, ShowroomInfo, ServiceType } from '../types';
import { getTranslation } from '../translations';
import { DEFAULT_SERVICE_TYPES } from '../constants';
import CarCard from './CarCard';

interface CarGridProps {
  cars: Car[];
  lang: Language;
  settings?: ShowroomInfo;
  onSelectCar: (car: Car) => void;
  selectedLocationFilter?: 'all' | 'algeria';
  onLocationTabChange?: (location: 'all' | 'algeria') => void;
}

const CarGrid: React.FC<CarGridProps> = ({
  cars,
  lang,
  settings,
  onSelectCar,
}) => {
  const t = getTranslation(lang);

  // Retrieve all configured service types (fallback to default)
  const allConfiguredServiceTypes = useMemo(() => {
    const list = settings?.serviceTypes && settings.serviceTypes.length > 0
      ? settings.serviceTypes
      : DEFAULT_SERVICE_TYPES;
    return list.filter(st => st.enabled !== false);
  }, [settings?.serviceTypes]);

  // Count products for each service type in current inventory
  const serviceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cars.forEach(car => {
      const typeKey = car.serviceType || 'algeria_showroom';
      counts[typeKey] = (counts[typeKey] || 0) + 1;
    });
    return counts;
  }, [cars]);

  // CRITICAL USER CONSTRAINT: Only show service types that actually have at least 1 product!
  // "if he add type it need show up here with if there is no product with new type dont show it"
  const activeServiceTypesWithProducts = useMemo(() => {
    return allConfiguredServiceTypes.filter(st => (serviceTypeCounts[st.id] || 0) > 0);
  }, [allConfiguredServiceTypes, serviceTypeCounts]);

  const [filters, setFilters] = useState<FilterState>({
    serviceType: 'all',
    brand: 'all',
    fuelType: 'all',
    transmission: 'all',
    search: '',
    minPrice: 0,
    maxPrice: 20000000
  });

  // Extract unique brands from cars
  const brands = useMemo(() => {
    const set = new Set<string>();
    cars.forEach(c => {
      if (c.brand) set.add(c.brand);
    });
    return Array.from(set).sort();
  }, [cars]);

  // Filter cars logic
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      // Service type filter
      if (filters.serviceType !== 'all') {
        const carType = car.serviceType || 'algeria_showroom';
        if (carType !== filters.serviceType) {
          return false;
        }
      }
      // Brand filter
      if (filters.brand !== 'all' && car.brand.toLowerCase() !== filters.brand.toLowerCase()) {
        return false;
      }
      // Fuel filter
      if (filters.fuelType !== 'all' && car.fuelType !== filters.fuelType) {
        return false;
      }
      // Transmission filter
      if (filters.transmission !== 'all' && car.transmission !== filters.transmission) {
        return false;
      }
      // Search query
      if (filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const matchTitle = `${car.brand} ${car.model} ${car.year}`.toLowerCase().includes(query);
        const matchSpecs = car.specs?.some(s => s.toLowerCase().includes(query));
        const matchColor = `${car.exteriorColor || car.color || ''} ${car.interiorColor || ''}`.toLowerCase().includes(query);
        if (!matchTitle && !matchSpecs && !matchColor) return false;
      }

      return true;
    });
  }, [cars, filters]);

  const resetFilters = () => {
    setFilters({
      serviceType: 'all',
      brand: 'all',
      fuelType: 'all',
      transmission: 'all',
      search: '',
      minPrice: 0,
      maxPrice: 20000000
    });
  };

  // Resolve current active service type object
  const currentSelectedType = useMemo(() => {
    if (filters.serviceType === 'all') return null;
    return allConfiguredServiceTypes.find(st => st.id === filters.serviceType) || null;
  }, [filters.serviceType, allConfiguredServiceTypes]);

  const getLocalizedName = (st: ServiceType) => {
    if (lang === 'fr') return st.nameFr || st.nameAr;
    if (lang === 'en') return st.nameEn || st.nameAr;
    return st.nameAr;
  };

  const getLocalizedBadge = (st: ServiceType) => {
    if (lang === 'fr') return st.badgeFr || st.badgeAr || st.nameFr;
    if (lang === 'en') return st.badgeEn || st.badgeAr || st.nameEn;
    return st.badgeAr || st.nameAr;
  };

  return (
    <section id="cars-grid" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Showroom Header & Stock Count */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-gray-800 pb-6">
        
        {/* Dynamic Status Badge */}
        <div className="flex flex-wrap items-center gap-2.5 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:via-amber-500/20 dark:to-teal-500/20 border border-emerald-500/30 dark:border-emerald-500/40 px-4 py-2.5 rounded-2xl shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-sm font-black text-slate-900 dark:text-emerald-300 font-cairo">
            {currentSelectedType 
              ? `${currentSelectedType.icon || '🏷️'} ${getLocalizedBadge(currentSelectedType)}`
              : (activeServiceTypesWithProducts.length === 1 && activeServiceTypesWithProducts[0]
                  ? `${activeServiceTypesWithProducts[0].icon || '🇩🇿'} ${getLocalizedBadge(activeServiceTypesWithProducts[0])}`
                  : '✨ كافة الخدمات والأصناف المتاحة')}
          </span>
          <span className="text-xs bg-emerald-600 dark:bg-emerald-500 text-white dark:text-gray-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
            {filteredCars.length} {lang === 'ar' ? 'متوفر' : (lang === 'fr' ? 'disponibles' : 'available')}
          </span>
        </div>

        {/* Section Heading */}
        <div className="text-center md:text-left">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider block">
            {settings?.name ? `${settings.name} Showroom` : 'KADEX DZ Showroom'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-cairo">
            {currentSelectedType 
              ? (lang === 'ar' ? currentSelectedType.descriptionAr || currentSelectedType.nameAr : (lang === 'fr' ? currentSelectedType.descriptionFr || currentSelectedType.nameFr : currentSelectedType.descriptionEn || currentSelectedType.nameEn))
              : (activeServiceTypesWithProducts.length === 1 && activeServiceTypesWithProducts[0]
                  ? (lang === 'ar' ? activeServiceTypesWithProducts[0].descriptionAr || activeServiceTypesWithProducts[0].nameAr : getLocalizedName(activeServiceTypesWithProducts[0]))
                  : (settings?.tagline || settings?.taglineAr || 'مخزون السيارات والخدمات المتاحة'))}
          </h2>
        </div>

      </div>

      {/* Dynamic Service Types Category Tabs (Only rendered when more than 1 service type has products) */}
      {activeServiceTypesWithProducts.length > 1 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            
            {/* All Products Tab */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, serviceType: 'all' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                filters.serviceType === 'all'
                  ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-800'
              }`}
            >
              <span>✨</span>
              <span>{lang === 'ar' ? 'جميع الخدمات والأصناف' : (lang === 'fr' ? 'Tous les Services' : 'All Services')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filters.serviceType === 'all'
                  ? 'bg-gray-950/20 text-gray-950'
                  : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
              }`}>
                {cars.length}
              </span>
            </button>

            {/* Service Type Tabs (Only those with products > 0) */}
            {activeServiceTypesWithProducts.map(st => {
              const count = serviceTypeCounts[st.id] || 0;
              const isSelected = filters.serviceType === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setFilters(prev => ({ ...prev, serviceType: st.id }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-800'
                  }`}
                >
                  <span className="text-sm">{st.icon || '🏷️'}</span>
                  <span>{getLocalizedName(st)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected
                      ? 'bg-gray-950/20 text-gray-950'
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Controls Bar */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm dark:shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t.searchPlaceholder}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Service Type Dropdown Filter (if multiple active types) */}
          {activeServiceTypesWithProducts.length > 1 ? (
            <div>
              <select
                value={filters.serviceType}
                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-amber-500 transition-colors font-bold"
              >
                <option value="all">✨ كافة الأصناف ({cars.length})</option>
                {activeServiceTypesWithProducts.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.icon || '🏷️'} {getLocalizedName(st)} ({serviceTypeCounts[st.id] || 0})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Brand Filter when no extra service dropdown is needed */
            <div>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="all">{t.filterAllBrands}</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fuel Filter */}
          <div>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">{t.filterAllFuels}</option>
              <option value="Essence">بنزين (Essence)</option>
              <option value="Électrique">كهربائية (Électrique)</option>
              <option value="Hybride">هجينة (Hybride)</option>
              <option value="Diesel">مازوت (Diesel)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>{t.clearFilters}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Car Cards Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredCars.map(car => (
            <CarCard
              key={car.id}
              car={car}
              lang={lang}
              settings={settings}
              onSelectCar={onSelectCar}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-8 max-w-xl mx-auto shadow-sm">
          <CarIcon className="w-12 h-12 text-amber-500/50 dark:text-amber-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.noCarsFound}</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
            جرب إعادة ضبط الفلاتر أو البحث باسم ماركة أخرى أو التواصل معنا عبر الهاتف للاستفسار عن السيارات القادمة.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 bg-amber-500 text-gray-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-md"
          >
            {t.clearFilters}
          </button>
        </div>
      )}

    </section>
  );
};

export default CarGrid;

