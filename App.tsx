/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CarGrid from './components/CarGrid';
import CarDetail from './components/CarDetail';
import AboutContact from './components/AboutContact';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { Car, Language, Theme, ViewState, ShowroomInfo } from './types';
import { INITIAL_CARS, SHOWROOM_INFO } from './constants';
import { 
  subscribeCars, 
  subscribeShowroomInfo, 
  saveCarToDb, 
  deleteCarFromDb, 
  saveShowroomInfoToDb 
} from './lib/dbService';

function App() {
  // Load cars state (initialized from localStorage or INITIAL_CARS while Supabase connects)
  const [cars, setCars] = useState<Car[]>(() => {
    try {
      const saved = localStorage.getItem('kadex_cars');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load cars from localStorage:", e);
    }
    return INITIAL_CARS;
  });

  // Load showroom settings
  const [showroomSettings, setShowroomSettings] = useState<ShowroomInfo>(() => {
    try {
      const saved = localStorage.getItem('kadex_showroom_info');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load showroom info from localStorage:", e);
    }
    return SHOWROOM_INFO;
  });

  // Real-time synchronization for Cars & Showroom Settings
  useEffect(() => {
    const unsubCars = subscribeCars((updatedCars) => {
      setCars(updatedCars);
      try {
        localStorage.setItem('kadex_cars', JSON.stringify(updatedCars));
      } catch (e) {
        console.warn("Quota error saving cars locally:", e);
      }
    });

    const unsubInfo = subscribeShowroomInfo((updatedInfo) => {
      setShowroomSettings(updatedInfo);
      try {
        localStorage.setItem('kadex_showroom_info', JSON.stringify(updatedInfo));
      } catch (e) {
        console.warn("Quota error saving info locally:", e);
      }
    });

    return () => {
      unsubCars();
      unsubInfo();
    };
  }, []);

  // Language state (default Arabic)
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('kadex_lang') as Language) || 'ar';
  });

  // Theme state (default dark)
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('kadex_theme') as Theme) || 'dark';
  });

  // View state
  const [view, setView] = useState<ViewState>({ type: 'home' });

  // Location filter state
  const [locationFilter, setLocationFilter] = useState<'all' | 'algeria'>('algeria');

  // Admin state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Active section for header nav highlight
  const [activeNavSection, setActiveNavSection] = useState('all');

  // Sync theme with HTML root class
  useEffect(() => {
    localStorage.setItem('kadex_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Sync language with HTML dir attribute
  useEffect(() => {
    localStorage.setItem('kadex_lang', lang);
    document.documentElement.lang = lang;
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [lang]);

  // Dynamic browser window/tab title update synced with showroom name and location
  useEffect(() => {
    const showroomName = showroomSettings?.name || 'KADEX DZ';
    if (lang === 'ar') {
      const cityDesc = showroomSettings?.addressAr?.includes('عنابة') 
        ? 'بعنابة (الشط)' 
        : showroomSettings?.addressAr 
        ? `في ${showroomSettings.addressAr.split('،')[0]}` 
        : 'بالجزائر';
      document.title = `${showroomName} - معرض السيارات الحديثة والفاخرة ${cityDesc} (تسليم فوري)`;
    } else if (lang === 'fr') {
      const cityDesc = showroomSettings?.addressFr?.includes('Annaba') 
        ? 'à Annaba (Echatt)' 
        : showroomSettings?.addressFr 
        ? `à ${showroomSettings.addressFr.split(',')[0]}` 
        : 'en Algérie';
      document.title = `${showroomName} - Showroom Automobile ${cityDesc} (Livraison Immédiate)`;
    } else {
      const cityDesc = showroomSettings?.addressEn?.includes('Annaba') 
        ? 'in Annaba (Echatt)' 
        : showroomSettings?.addressEn 
        ? `in ${showroomSettings.addressEn.split(',')[0]}` 
        : 'in Algeria';
      document.title = `${showroomName} - Modern Car Showroom ${cityDesc} (Immediate Delivery)`;
    }
  }, [showroomSettings, lang]);

  // Nav scroll or jump handler
  const handleNavClick = (sectionId: string) => {
    if (view.type !== 'home') {
      setView({ type: 'home' });
    }

    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId === 'algeria-section') {
      setLocationFilter('algeria');
      setActiveNavSection('algeria-section');
    } else if (sectionId === 'about-section') {
      setActiveNavSection('about-section');
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId) || document.getElementById('cars-grid');
      if (el) {
        const offset = 90;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  // Admin Car Handlers - Directly update DB & local state
  const handleSaveCar = async (carToSave: Car) => {
    try {
      setCars(prev => {
        const idx = prev.findIndex(c => c.id === carToSave.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = carToSave;
          return next;
        }
        return [carToSave, ...prev];
      });
      await saveCarToDb(carToSave);
    } catch (e: any) {
      console.error("Notice saving car to Supabase:", e?.message || e);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    try {
      setCars(prev => {
        const next = prev.filter(c => c.id !== carId);
        try {
          localStorage.setItem('kadex_cars', JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      // If user is currently viewing this deleted car in details, return to catalog home
      setView(currentView => {
        if (currentView.type === 'car-detail' && currentView.car?.id === carId) {
          return { type: 'home' };
        }
        return currentView;
      });

      await deleteCarFromDb(carId);
    } catch (e: any) {
      console.error("Notice deleting car from DB:", e?.message || e);
    }
  };

  const handleResetCatalog = async () => {
    try {
      setCars(INITIAL_CARS);
      for (const car of cars) {
        await deleteCarFromDb(car.id);
      }
      for (const car of INITIAL_CARS) {
        await saveCarToDb(car);
      }
    } catch (e: any) {
      console.error("Failed to reset catalog in DB:", e);
    }
  };

  const handleSaveSettings = async (newSettings: ShowroomInfo) => {
    setShowroomSettings(newSettings);
    try {
      localStorage.setItem('kadex_showroom_info', JSON.stringify(newSettings));
      if (newSettings.adminEmail && newSettings.adminPassword) {
        localStorage.setItem('kadex_admin_credentials', JSON.stringify({
          email: newSettings.adminEmail,
          pass: newSettings.adminPassword
        }));
      }
    } catch (e) {
      console.error("Failed to save showroom info to localStorage:", e);
    }
    try {
      await saveShowroomInfoToDb(newSettings);
    } catch (e: any) {
      console.error("Notice saving showroom info to Supabase:", e?.message || e);
    }
  };

  const handleUpdateAdminCredentials = async (newEmail: string, newPass: string) => {
    const updatedSettings: ShowroomInfo = {
      ...showroomSettings,
      adminEmail: newEmail.trim(),
      adminPassword: newPass.trim()
    };
    await handleSaveSettings(updatedSettings);
  };

  const handleAdminLogin = (email: string, pass: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    let savedEmail = showroomSettings.adminEmail || 'admin@nacer.dz';
    let savedPass = showroomSettings.adminPassword || 'naceradmin#2026!Pass';

    try {
      const savedCreds = localStorage.getItem('kadex_admin_credentials');
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        if (parsed.email) savedEmail = parsed.email;
        if (parsed.pass) savedPass = parsed.pass;
      }
    } catch (e) {}

    const targetEmail = savedEmail.trim().toLowerCase();
    const targetPass = savedPass.trim();

    const isMatchConfigured = (cleanEmail === targetEmail && cleanPass === targetPass);
    const isMatchDefault = (
      cleanEmail === 'admin@nacer.dz' &&
      (cleanPass === 'naceradmin#2026!pass' || cleanPass === 'naceradmin#2026!Pass' || cleanPass === 'nacerAdmin#2026!Pass')
    );

    if (isMatchConfigured || isMatchDefault) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0B0E14] text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      
      {/* Header Navigation */}
      <Navbar
        lang={lang}
        settings={showroomSettings}
        onLanguageChange={setLang}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        activeSection={activeNavSection}
        onNavClick={handleNavClick}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={isAdminLoggedIn}
      />

      <main>
        {view.type === 'home' && (
          <>
            {/* Hero Showcase */}
            <Hero
              lang={lang}
              settings={showroomSettings}
              onExploreClick={() => handleNavClick('algeria-section')}
            />

            {/* Cars Showcase Grid (Showroom Catalog in Algeria) */}
            <CarGrid
              cars={cars}
              lang={lang}
              settings={showroomSettings}
              selectedLocationFilter={locationFilter}
              onLocationTabChange={() => setLocationFilter('algeria')}
              onSelectCar={(car) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setView({ type: 'car-detail', car });
              }}
            />

            {/* About & Interactive Map & General Contact Section */}
            <AboutContact lang={lang} settings={showroomSettings} />
          </>
        )}

        {/* Car Detailed View */}
        {view.type === 'car-detail' && (
          <CarDetail
            car={view.car}
            allCars={cars}
            lang={lang}
            settings={showroomSettings}
            onBack={() => setView({ type: 'home' })}
            onSelectCar={(selectedCar) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setView({ type: 'car-detail', car: selectedCar });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        settings={showroomSettings}
        onNavClick={handleNavClick}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Owner / Admin Management Modal */}
      {isAdminOpen && (
        <AdminPanel
          cars={cars}
          lang={lang}
          settings={showroomSettings}
          isAdmin={isAdminLoggedIn}
          onLogin={handleAdminLogin}
          onLogout={() => setIsAdminLoggedIn(false)}
          onSaveCar={handleSaveCar}
          onDeleteCar={handleDeleteCar}
          onResetCatalog={handleResetCatalog}
          onSaveSettings={handleSaveSettings}
          onUpdateCredentials={handleUpdateAdminCredentials}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

    </div>
  );
}

export default App;
