/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { 
  Lock, Key, Plus, Edit2, Trash2, CheckCircle, ArrowRight, X, Image as ImageIcon, 
  Upload, Phone, MessageCircle, MapPin, RefreshCw, AlertTriangle, Shield, Eye,
  LayoutDashboard, Car as CarIcon, Settings, Search, LogOut, Download, Mail, Check,
  Gauge, Palette, ArrowUpRight, DollarSign, Globe, Layers, ChevronRight, Video,
  FileText, Star, Paperclip, Share2, ExternalLink, Compass, Navigation, Sparkles, Tag,
  Database, Server, HardDrive, CheckCircle2, Copy
} from 'lucide-react';
import { Car, Language, CarLocation, FuelType, Transmission, ShowroomInfo, ServiceType } from '../types';
import { getTranslation } from '../translations';
import { SHOWROOM_INFO, DEFAULT_SERVICE_TYPES } from '../constants';
import { parseMapLocation, resolveMapLocationAsync, DEFAULT_ALGERIA_COORDS } from '../lib/mapUtils';
import { 
  getStoredCredentials, 
  updateSupabaseCredentials, 
  testSupabaseHealth, 
  isValidSupabaseConfig,
  SupabaseHealthReport 
} from '../lib/supabaseClient';
import { syncAllToSupabase } from '../lib/dbService';

interface AdminPanelProps {
  cars: Car[];
  lang: Language;
  settings?: ShowroomInfo;
  isAdmin: boolean;
  onLogin: (email: string, pass: string) => boolean;
  onLogout: () => void;
  onSaveCar: (car: Car) => void;
  onDeleteCar: (carId: string) => void;
  onConvertLocation?: (carId: string) => void;
  onResetCatalog: () => void;
  onSaveSettings?: (newSettings: ShowroomInfo) => void;
  onUpdateCredentials?: (email: string, pass: string) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  cars,
  lang,
  settings,
  isAdmin,
  onLogin,
  onLogout,
  onSaveCar,
  onDeleteCar,
  onResetCatalog,
  onSaveSettings,
  onUpdateCredentials,
  onClose
}) => {
  const t = getTranslation(lang);

  // Email & Password Auth State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard Active Tab: 'overview' | 'inventory' | 'services' | 'settings' | 'security'
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'services' | 'settings' | 'security'>('overview');

  // CMS Settings Local Form State
  const initialSettings = settings || SHOWROOM_INFO;
  const [cmsName, setCmsName] = useState(initialSettings.name || 'KADEX DZ');
  const [cmsTagline, setCmsTagline] = useState(initialSettings.tagline || initialSettings.taglineAr || 'صالة العرض بعنابة (الشط) - تسليم فوري 🇩🇿');
  const [cmsLogoUrl, setCmsLogoUrl] = useState(initialSettings.logoUrl || '');
  const [cmsPhone1, setCmsPhone1] = useState(initialSettings.phone1 || '+213 550 12 34 56');
  const [cmsPhone2, setCmsPhone2] = useState(initialSettings.phone2 || '+213 661 98 76 54');
  const [cmsWhatsapp, setCmsWhatsapp] = useState(initialSettings.whatsapp || '+213550123456');
  const [cmsEmail, setCmsEmail] = useState(initialSettings.email || 'contact@kadex-dz.com');
  const [cmsAddressAr, setCmsAddressAr] = useState(initialSettings.addressAr || 'حي البساتين، الشراقة، الجزائر العاصمة');
  const [cmsAddressFr, setCmsAddressFr] = useState(initialSettings.addressFr || 'Cité Les Vergers, Chéraga, Alger');
  const [cmsAddressEn, setCmsAddressEn] = useState(initialSettings.addressEn || 'Les Vergers, Cheraga, Algiers');
  const [cmsWorkingHoursAr, setCmsWorkingHoursAr] = useState(initialSettings.workingHoursAr || 'السبت - الخميس: 08:30 صباحاً - 07:00 مساءً');
  const [cmsGoogleMapsUrl, setCmsGoogleMapsUrl] = useState(initialSettings.googleMapsUrl || 'https://maps.google.com/?q=36.7667,2.9500');
  const [cmsMapEmbedUrl, setCmsMapEmbedUrl] = useState(initialSettings.mapEmbedUrl || '');
  const [cmsHeroBgType, setCmsHeroBgType] = useState<'gradient' | 'image' | 'video'>(initialSettings.heroBgType || 'gradient');
  const [cmsHeroBgUrl, setCmsHeroBgUrl] = useState(initialSettings.heroBgUrl || '');
  const [cmsHeroOverlayOpacity, setCmsHeroOverlayOpacity] = useState<number>(initialSettings.heroOverlayOpacity ?? 75);
  const [cmsFacebook, setCmsFacebook] = useState(initialSettings.facebook || 'https://facebook.com');
  const [cmsInstagram, setCmsInstagram] = useState(initialSettings.instagram || 'https://instagram.com');
  const [cmsTiktok, setCmsTiktok] = useState(initialSettings.tiktok || 'https://tiktok.com');
  const [cmsSaveSuccess, setCmsSaveSuccess] = useState(false);
  const [mapResolving, setMapResolving] = useState(false);
  const [mapResolvedCoords, setMapResolvedCoords] = useState<{ lat?: number; lng?: number } | null>(() => {
    const p = parseMapLocation(initialSettings.googleMapsUrl || initialSettings.mapEmbedUrl);
    return p.lat && p.lng ? { lat: p.lat, lng: p.lng } : null;
  });

  // Service Types / Categories CMS State
  const [cmsServiceTypes, setCmsServiceTypes] = useState<ServiceType[]>(() => {
    if (initialSettings.serviceTypes && initialSettings.serviceTypes.length > 0) {
      return initialSettings.serviceTypes;
    }
    return DEFAULT_SERVICE_TYPES;
  });
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  // New/Edit Service Type Form State
  const [serviceFormId, setServiceFormId] = useState('');
  const [serviceFormNameAr, setServiceFormNameAr] = useState('');
  const [serviceFormNameFr, setServiceFormNameFr] = useState('');
  const [serviceFormNameEn, setServiceFormNameEn] = useState('');
  const [serviceFormBadgeAr, setServiceFormBadgeAr] = useState('');
  const [serviceFormBadgeFr, setServiceFormBadgeFr] = useState('');
  const [serviceFormBadgeEn, setServiceFormBadgeEn] = useState('');
  const [serviceFormIcon, setServiceFormIcon] = useState('🚗');
  const [serviceFormDescAr, setServiceFormDescAr] = useState('');
  const [serviceFormDescFr, setServiceFormDescFr] = useState('');
  const [serviceFormDescEn, setServiceFormDescEn] = useState('');

  // Admin Account & Credentials State (For Owner to change login info)
  const [adminEmailSetting, setAdminEmailSetting] = useState(initialSettings.adminEmail || 'admin@nacer.dz');
  const [newPasswordSetting, setNewPasswordSetting] = useState('');
  const [confirmPasswordSetting, setConfirmPasswordSetting] = useState('');
  const [showAdminNewPass, setShowAdminNewPass] = useState(false);
  const [showAdminConfirmPass, setShowAdminConfirmPass] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Auto-resolve Google Maps URLs and shortlinks
  React.useEffect(() => {
    const raw = (cmsGoogleMapsUrl || '').trim();
    if (!raw) {
      setMapResolvedCoords(null);
      return;
    }

    // Try synchronous parse first
    const sync = parseMapLocation(raw, cmsAddressAr || cmsAddressFr);
    if (sync.lat && sync.lng) {
      setMapResolvedCoords({ lat: sync.lat, lng: sync.lng });
      setCmsMapEmbedUrl(sync.embedUrl);
      return;
    }

    // If it's a shortened link or redirect URL, resolve asynchronously
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      let active = true;
      setMapResolving(true);
      const timer = setTimeout(async () => {
        try {
          const resolved = await resolveMapLocationAsync(raw, cmsAddressAr || cmsAddressFr);
          if (active && resolved) {
            if (resolved.embedUrl) setCmsMapEmbedUrl(resolved.embedUrl);
            if (resolved.lat && resolved.lng) {
              setMapResolvedCoords({ lat: resolved.lat, lng: resolved.lng });
            }
          }
        } catch (err) {
          console.warn('Map resolution warning:', err);
        } finally {
          if (active) setMapResolving(false);
        }
      }, 500);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [cmsGoogleMapsUrl, cmsAddressAr, cmsAddressFr]);

  // Sync settings whenever props update
  React.useEffect(() => {
    if (settings) {
      if (settings.name !== undefined) setCmsName(settings.name);
      if (settings.tagline !== undefined) setCmsTagline(settings.tagline);
      else if (settings.taglineAr !== undefined) setCmsTagline(settings.taglineAr);
      if (settings.logoUrl !== undefined) setCmsLogoUrl(settings.logoUrl || '');
      if (settings.phone1 !== undefined) setCmsPhone1(settings.phone1);
      if (settings.phone2 !== undefined) setCmsPhone2(settings.phone2);
      if (settings.whatsapp !== undefined) setCmsWhatsapp(settings.whatsapp);
      if (settings.email !== undefined) setCmsEmail(settings.email);
      if (settings.adminEmail !== undefined) setAdminEmailSetting(settings.adminEmail);
      if (settings.addressAr !== undefined) setCmsAddressAr(settings.addressAr);
      if (settings.addressFr !== undefined) setCmsAddressFr(settings.addressFr);
      if (settings.addressEn !== undefined) setCmsAddressEn(settings.addressEn);
      if (settings.workingHoursAr !== undefined) setCmsWorkingHoursAr(settings.workingHoursAr);
      if (settings.googleMapsUrl !== undefined) setCmsGoogleMapsUrl(settings.googleMapsUrl);
      if (settings.mapEmbedUrl !== undefined) setCmsMapEmbedUrl(settings.mapEmbedUrl);
      if (settings.heroBgType !== undefined) setCmsHeroBgType(settings.heroBgType);
      if (settings.heroBgUrl !== undefined) setCmsHeroBgUrl(settings.heroBgUrl);
      if (settings.heroOverlayOpacity !== undefined) setCmsHeroOverlayOpacity(settings.heroOverlayOpacity);
      if (settings.facebook !== undefined) setCmsFacebook(settings.facebook);
      if (settings.instagram !== undefined) setCmsInstagram(settings.instagram);
      if (settings.tiktok !== undefined) setCmsTiktok(settings.tiktok);
      if (settings.serviceTypes && settings.serviceTypes.length > 0) {
        setCmsServiceTypes(settings.serviceTypes);
      }
    }
  }, [settings]);

  // Save Service Types Helper
  const persistServiceTypes = (updatedList: ServiceType[]) => {
    setCmsServiceTypes(updatedList);
    const newSettings: ShowroomInfo = {
      ...initialSettings,
      name: cmsName,
      tagline: cmsTagline,
      taglineAr: cmsTagline,
      logoUrl: cmsLogoUrl,
      phone1: cmsPhone1,
      phone2: cmsPhone2,
      whatsapp: cmsWhatsapp,
      email: cmsEmail,
      addressAr: cmsAddressAr,
      addressFr: cmsAddressFr,
      addressEn: cmsAddressEn,
      workingHoursAr: cmsWorkingHoursAr,
      googleMapsUrl: cmsGoogleMapsUrl,
      mapEmbedUrl: cmsMapEmbedUrl,
      heroBgType: cmsHeroBgType,
      heroBgUrl: cmsHeroBgUrl,
      heroOverlayOpacity: cmsHeroOverlayOpacity,
      facebook: cmsFacebook,
      instagram: cmsInstagram,
      tiktok: cmsTiktok,
      serviceTypes: updatedList,
    };
    if (onSaveSettings) {
      onSaveSettings(newSettings);
    }
    setServiceSuccessMsg('تم حفظ وتحديث أنواع وخدمات المعرض بنجاح!');
    setTimeout(() => setServiceSuccessMsg(''), 4000);
  };

  const handleToggleServiceType = (id: string) => {
    const updated = cmsServiceTypes.map(st => {
      if (st.id === id) {
        return { ...st, enabled: st.enabled === false ? true : false };
      }
      return st;
    });
    persistServiceTypes(updated);
  };

  const handleDeleteServiceType = (id: string) => {
    if (id === 'algeria_showroom') {
      alert('لا يمكن حذف الصنف الأساسي (سيارات متوفرة في الجزائر)');
      return;
    }
    const updated = cmsServiceTypes.filter(st => st.id !== id);
    persistServiceTypes(updated);
  };

  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceFormId(`type_${Date.now()}`);
    setServiceFormNameAr('');
    setServiceFormNameFr('');
    setServiceFormNameEn('');
    setServiceFormBadgeAr('');
    setServiceFormBadgeFr('');
    setServiceFormBadgeEn('');
    setServiceFormIcon('🏷️');
    setServiceFormDescAr('');
    setServiceFormDescFr('');
    setServiceFormDescEn('');
    setIsAddingService(true);
  };

  const handleOpenEditService = (st: ServiceType) => {
    setEditingServiceId(st.id);
    setServiceFormId(st.id);
    setServiceFormNameAr(st.nameAr);
    setServiceFormNameFr(st.nameFr || '');
    setServiceFormNameEn(st.nameEn || '');
    setServiceFormBadgeAr(st.badgeAr || '');
    setServiceFormBadgeFr(st.badgeFr || '');
    setServiceFormBadgeEn(st.badgeEn || '');
    setServiceFormIcon(st.icon || '🏷️');
    setServiceFormDescAr(st.descriptionAr || '');
    setServiceFormDescFr(st.descriptionFr || '');
    setServiceFormDescEn(st.descriptionEn || '');
    setIsAddingService(true);
  };

  const handleSaveServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormNameAr.trim()) {
      alert('يرجى كتابة اسم الخدمة باللغة العربية');
      return;
    }

    const rawId = serviceFormId.trim() || `type_${Date.now()}`;
    const cleanId = rawId.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const newService: ServiceType = {
      id: cleanId,
      nameAr: serviceFormNameAr.trim(),
      nameFr: serviceFormNameFr.trim() || serviceFormNameAr.trim(),
      nameEn: serviceFormNameEn.trim() || serviceFormNameAr.trim(),
      badgeAr: serviceFormBadgeAr.trim() || serviceFormNameAr.trim(),
      badgeFr: serviceFormBadgeFr.trim() || serviceFormNameFr.trim() || serviceFormBadgeAr.trim(),
      badgeEn: serviceFormBadgeEn.trim() || serviceFormNameEn.trim() || serviceFormBadgeAr.trim(),
      icon: serviceFormIcon.trim() || '🏷️',
      descriptionAr: serviceFormDescAr.trim() || undefined,
      descriptionFr: serviceFormDescFr.trim() || undefined,
      descriptionEn: serviceFormDescEn.trim() || undefined,
      enabled: true,
    };

    let updatedList: ServiceType[];
    if (editingServiceId) {
      updatedList = cmsServiceTypes.map(st => st.id === editingServiceId ? newService : st);
    } else {
      updatedList = [...cmsServiceTypes, newService];
    }

    persistServiceTypes(updatedList);
    setIsAddingService(false);
    setEditingServiceId(null);
  };

  // Form Modal / Edit / Delete state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  // Delete car handler
  const handleConfirmDelete = async () => {
    if (!deletingCar) return;
    setIsDeleting(true);
    try {
      const urlsToDelete: string[] = [];
      if (deletingCar.mainImage) urlsToDelete.push(deletingCar.mainImage);
      if (Array.isArray(deletingCar.images)) {
        deletingCar.images.forEach(img => {
          if (img) urlsToDelete.push(img);
        });
      }
      if (deletingCar.ficheTechnique) urlsToDelete.push(deletingCar.ficheTechnique);

      await onDeleteCar(deletingCar.id);

      // Trigger background cleanup of Cloudflare R2 / local uploads assets
      if (urlsToDelete.length > 0) {
        deleteAssetsFromServer(urlsToDelete);
      }

      setDeleteSuccessMsg(`تم حذف سيارة ${deletingCar.brand} ${deletingCar.model} بنجاح!`);
      if (isFormOpen && editingCar?.id === deletingCar.id) {
        setIsFormOpen(false);
        setEditingCar(null);
      }
      setDeletingCar(null);
      setTimeout(() => {
        setDeleteSuccessMsg('');
      }, 4000);
    } catch (err) {
      console.error("Failed to delete car:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Car Form Fields (Vehicle specs & dynamic service type)
  const [carServiceType, setCarServiceType] = useState<string>('algeria_showroom');
  const [brand, setBrand] = useState('Chery');
  const [model, setModel] = useState('Tiggo 8 Pro Max');
  const [year, setYear] = useState<number>(2024);
  const [priceDzd, setPriceDzd] = useState<number>(5800000);
  const [phone, setPhone] = useState('+213 550 12 34 56');
  const [whatsapp, setWhatsapp] = useState('+213550123456');
  const [mileage, setMileage] = useState('0 كم (جديدة)');
  const [exteriorColor, setExteriorColor] = useState('أبيض لؤلؤي / Blanc Nacré');
  const [interiorColor, setInteriorColor] = useState('جلد بني فاخر / Cuir Marron');
  const [fuelType, setFuelType] = useState<FuelType>('Essence');
  const [transmission, setTransmission] = useState<Transmission>('Automatic');
  const [specsInput, setSpecsInput] = useState('شاشة 12.3 بوصة, كاميرا 360°, مقاعد جلدية, فتحة سقف بانوراما');
  const [descAr, setDescAr] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descEn, setDescEn] = useState('');
  
  // Rental specific form state
  const [rentalMinDays, setRentalMinDays] = useState<number>(3);
  const [rentalAvailability, setRentalAvailability] = useState<'both' | 'without_driver_only' | 'with_driver_only'>('both');
  const [rentalPriceWithoutDriver, setRentalPriceWithoutDriver] = useState<number>(9500);
  const [rentalPriceWithDriver, setRentalPriceWithDriver] = useState<number>(14000);
  const [rentalConditionsAr, setRentalConditionsAr] = useState('رخصة سياقة سارية لأكثر من سنتين + إيداع بطاقة الهوية أو ضمان مالي.');
  // China import / shipping state
  const [shippingDuration, setShippingDuration] = useState('30 إلى 45 يوم');
  
  // Fiche Technique & Photos
  const [ficheTechnique, setFicheTechnique] = useState('');
  const [ficheTechniqueName, setFicheTechniqueName] = useState('');
  const [mainImage, setMainImage] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Search in Admin Table
  const [adminSearch, setAdminSearch] = useState('');

  // Preset Color Options
  const EXTERIOR_COLOR_OPTIONS = [
    'أبيض لؤلؤي / Blanc Nacré',
    'أسود ميتاليك / Noir Métallisé',
    'رمادي ناردو / Gris Nardo',
    'رمادي فضي / Gris Argent',
    'أزرق ملكي / Bleu Nuit',
    'أحمر بوردو / Rouge Bordeau',
    'بني برونزي / Marron Bronze',
    'أخضر زيتي / Vert Olive',
    'ذهبي شامبانيا / Or Champagne'
  ];

  const INTERIOR_COLOR_OPTIONS = [
    'جلد بني فاخر / Cuir Marron',
    'جلد كونياك أنيق / Cuir Cognac',
    'جلد أسود مطرز / Cuir Noir',
    'جلد بيج ملكي / Cuir Beige',
    'جلد أحمر وأسود / Rouge & Noir',
    'قماش رمادي فخم / Tissu Gris',
    'جلد أبيض وأزرق / Cuir Blanc & Bleu'
  ];

  // Helper to compress images before saving (Iteratively adjusts quality & size to ensure <100KB)
  const compressImage = (dataUrl: string, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      // Check if it's already a regular URL (e.g., from unsplash or uploaded path)
      if (!dataUrl || !dataUrl.startsWith('data:')) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;
      img.onload = () => {
        let scale = 1.0;
        let currentQuality = quality;
        
        const tryCompress = (): string => {
          let width = Math.round(img.width * scale);
          let height = Math.round(img.height * scale);
          
          if (scale === 1.0 && (width > maxWidth || height > maxHeight)) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return dataUrl;
          
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg', currentQuality);
        };

        let result = tryCompress();
        let bytes = Math.round((result.length - result.indexOf(',') - 1) * 3 / 4);
        
        // Iteratively reduce size and quality if the image exceeds 100KB (102,400 bytes)
        let attempts = 0;
        const maxAttempts = 15;
        while (bytes > 100 * 1024 && attempts < maxAttempts) {
          attempts++;
          if (currentQuality > 0.3) {
            currentQuality -= 0.15;
          } else {
            scale *= 0.8;
            currentQuality = Math.max(0.15, currentQuality - 0.05);
          }
          result = tryCompress();
          bytes = Math.round((result.length - result.indexOf(',') - 1) * 3 / 4);
        }
        
        console.log(`Image compressed to ${Math.round(bytes / 1024)}KB after ${attempts} attempts.`);
        resolve(result);
      };
      img.onerror = () => resolve(dataUrl);
    });
  };

  // Helper to upload base64 images/files to the server-side Cloudflare/local backend
  const uploadImageToServer = async (base64Data: string): Promise<string> => {
    if (!base64Data || !base64Data.startsWith('data:')) {
      return base64Data;
    }
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      if (!response.ok) {
        throw new Error('Server returned error status');
      }
      const data = await response.json();
      return data.url || base64Data;
    } catch (err) {
      console.warn('Failed to upload image to server, using base64 fallback:', err);
      return base64Data;
    }
  };

  // Helper to delete unused images/files from the Cloudflare R2 bucket/local backend
  const deleteAssetsFromServer = async (urls: string[]): Promise<void> => {
    const cleanUrls = urls.filter(url => url && typeof url === 'string');
    if (cleanUrls.length === 0) return;
    try {
      console.log('Sending assets for deletion:', cleanUrls);
      const response = await fetch('/api/delete-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: cleanUrls })
      });
      if (!response.ok) {
        throw new Error('Server returned error status');
      }
      const data = await response.json();
      console.log('Deleted assets response:', data);
    } catch (err) {
      console.warn('Failed to delete assets from server:', err);
    }
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const rawBase64 = event.target.result as string;
        const compressed = await compressImage(rawBase64, 500, 500, 0.9);
        const finalUrl = await uploadImageToServer(compressed);
        setCmsLogoUrl(finalUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Car Photos Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const rawBase64 = event.target.result as string;
          const compressed = await compressImage(rawBase64);
          const finalUrl = await uploadImageToServer(compressed);
          setUploadedPhotos(prev => [...prev, finalUrl]);
          if (!mainImage || mainImage.includes('unsplash')) {
            setMainImage(finalUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Fiche Technique File Upload Handler
  const handleFicheTechniqueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const rawBase64 = event.target.result as string;
        const finalUrl = await uploadImageToServer(rawBase64);
        setFicheTechnique(finalUrl);
        setFicheTechniqueName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Hero Background File Upload Handler
  const handleHeroBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const rawBase64 = event.target.result as string;
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(rawBase64, 1920, 1080, 0.8);
          const finalUrl = await uploadImageToServer(compressed);
          setCmsHeroBgUrl(finalUrl);
          setCmsHeroBgType('image');
        } else {
          // Upload PDF, docs, or videos directly
          const finalUrl = await uploadImageToServer(rawBase64);
          setCmsHeroBgUrl(finalUrl);
          setCmsHeroBgType(file.type.startsWith('video/') ? 'video' : 'image');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Save General CMS Settings
  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanInput = (cmsGoogleMapsUrl || '').trim();

    // If user pasted full <iframe> HTML snippet, extract the src URL
    if (cleanInput.includes('<iframe')) {
      const srcMatch = cleanInput.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        cleanInput = srcMatch[1];
        setCmsGoogleMapsUrl(cleanInput);
      }
    }

    // Always compute fresh embed URL from current input, avoiding stale defaults
    const immediateParsed = parseMapLocation(cleanInput, cmsAddressAr || cmsAddressFr);
    let finalEmbed = immediateParsed.embedUrl;
    let finalDirect = cleanInput || immediateParsed.directMapsUrl;

    if (cleanInput.startsWith('http://') || cleanInput.startsWith('https://')) {
      try {
        const resolved = await resolveMapLocationAsync(cleanInput, cmsAddressAr || cmsAddressFr);
        if (resolved?.embedUrl) {
          finalEmbed = resolved.embedUrl;
        }
        if (resolved?.directMapsUrl) {
          finalDirect = resolved.directMapsUrl;
        }
        if (resolved?.lat && resolved?.lng) {
          setMapResolvedCoords({ lat: resolved.lat, lng: resolved.lng });
        }
      } catch (err) {
        console.warn('Map save resolution warning:', err);
      }
    } else if (immediateParsed.lat && immediateParsed.lng) {
      setMapResolvedCoords({ lat: immediateParsed.lat, lng: immediateParsed.lng });
    }

    setCmsMapEmbedUrl(finalEmbed);

    const newSettings: ShowroomInfo = {
      ...initialSettings,
      name: cmsName,
      tagline: cmsTagline,
      taglineAr: cmsTagline,
      logoUrl: cmsLogoUrl,
      phone1: cmsPhone1,
      phone2: cmsPhone2,
      whatsapp: cmsWhatsapp,
      email: cmsEmail,
      addressAr: cmsAddressAr,
      addressFr: cmsAddressFr,
      addressEn: cmsAddressEn,
      workingHoursAr: cmsWorkingHoursAr,
      googleMapsUrl: cleanInput,
      mapEmbedUrl: finalEmbed,
      heroBgType: cmsHeroBgType,
      heroBgUrl: cmsHeroBgUrl,
      heroOverlayOpacity: cmsHeroOverlayOpacity,
      facebook: cmsFacebook,
      instagram: cmsInstagram,
      tiktok: cmsTiktok,
      serviceTypes: cmsServiceTypes,
    };

    // Check for replaced/removed media for CMS Settings
    const settingsUrlsToDelete: string[] = [];
    if (initialSettings.logoUrl && initialSettings.logoUrl !== cmsLogoUrl) {
      settingsUrlsToDelete.push(initialSettings.logoUrl);
    }
    if (initialSettings.heroBgUrl && initialSettings.heroBgUrl !== cmsHeroBgUrl) {
      settingsUrlsToDelete.push(initialSettings.heroBgUrl);
    }
    if (settingsUrlsToDelete.length > 0) {
      deleteAssetsFromServer(settingsUrlsToDelete);
    }

    if (onSaveSettings) {
      onSaveSettings(newSettings);
    }
    setCmsSaveSuccess(true);
    setTimeout(() => setCmsSaveSuccess(false), 3500);
  };

  // Save Security Credentials (Admin Email & Password)
  const handleSaveSecurityCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);

    const emailToSet = adminEmailSetting.trim().toLowerCase();
    if (!emailToSet || !emailToSet.includes('@')) {
      setSecurityError('يرجى إدخال بريد إلكتروني صالح للإدارة (مثال: owner@nacer.dz)');
      return;
    }

    if (newPasswordSetting.trim().length > 0) {
      if (newPasswordSetting.trim().length < 6) {
        setSecurityError('يجب أن تتكون كلمة المرور الجديدة من 6 خانات أو أكثر.');
        return;
      }
      if (newPasswordSetting.trim() !== confirmPasswordSetting.trim()) {
        setSecurityError('كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين.');
        return;
      }
    }

    const passwordToSet = newPasswordSetting.trim() ? newPasswordSetting.trim() : (initialSettings.adminPassword || 'naceradmin#2026!Pass');

    const updatedSettings: ShowroomInfo = {
      ...initialSettings,
      adminEmail: emailToSet,
      adminPassword: passwordToSet,
    };

    if (onSaveSettings) {
      onSaveSettings(updatedSettings);
    }
    if (onUpdateCredentials) {
      onUpdateCredentials(emailToSet, passwordToSet);
    }

    setSecuritySuccess(true);
    setNewPasswordSetting('');
    setConfirmPasswordSetting('');
    setTimeout(() => setSecuritySuccess(false), 5000);
  };



  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('يرجى كتابة البريد الإلكتروني وكلمة المرور للدخول');
      return;
    }
    const success = onLogin(emailInput, passwordInput);
    if (!success) {
      setAuthError('بيانات الدخول غير صحيحة! يرجى التأكد من البريد الإلكتروني وكلمة المرور.');
    } else {
      setAuthError('');
      setPasswordInput('');
    }
  };

  const openAddModal = () => {
    setEditingCar(null);
    const defaultType = cmsServiceTypes.find(st => st.enabled !== false)?.id || 'algeria_showroom';
    setCarServiceType(defaultType);
    setBrand('Chery');
    setModel('Tiggo 8 Pro 2024');
    setYear(2024);
    setPriceDzd(4500000);
    setPhone(cmsPhone1 || '+213 550 12 34 56');
    setWhatsapp(cmsWhatsapp || '+213550123456');
    setMileage('0 كم (جديدة)');
    setExteriorColor('أبيض لؤلؤي / Blanc Nacré');
    setInteriorColor('جلد بني فاخر / Cuir Marron');
    setFuelType('Essence');
    setTransmission('Automatic');
    setSpecsInput('شاشة 12.3 بوصة, كاميرا 360°, مقاعد جلدية, فتحة سقف بانوراما');
    setDescAr('سيارة عائلية فاخرة مجهزة بجميع مواصفات الراحة والأمان متوفرة بلمح البصر في المعرض بالجزائر.');
    setDescFr('SUV neuf haut de gamme avec garantie et livraison immédiate.');
    setDescEn('Brand new luxury SUV with full options and immediate availability.');
    setRentalMinDays(3);
    setRentalAvailability('both');
    setRentalPriceWithoutDriver(9500);
    setRentalPriceWithDriver(14000);
    setRentalConditionsAr('رخصة سياقة سارية لأكثر من سنتين + إيداع بطاقة الهوية أو ضمان مالي.');
    setShippingDuration('30 إلى 45 يوم');
    setMainImage('');
    setUploadedPhotos([]);
    setFicheTechnique('');
    setFicheTechniqueName('');
    setIsFormOpen(true);
  };

  const openEditModal = (car: Car) => {
    setEditingCar(car);
    setCarServiceType(car.serviceType || 'algeria_showroom');
    setBrand(car.brand);
    setModel(car.model);
    setYear(car.year);
    setPriceDzd(car.priceDzd);
    setPhone(car.phone);
    setWhatsapp(car.whatsapp);
    setMileage(car.mileage || '0 كم');
    setExteriorColor(car.exteriorColor || car.color || 'أبيض لؤلؤي / Blanc Nacré');
    setInteriorColor(car.interiorColor || 'جلد بني فاخر / Cuir Marron');
    setFuelType(car.fuelType);
    setTransmission(car.transmission);
    setSpecsInput(car.specs ? car.specs.join(', ') : '');
    setDescAr(car.description?.ar || '');
    setDescFr(car.description?.fr || '');
    setDescEn(car.description?.en || '');
    setRentalMinDays(car.rentalMinDays || 3);
    setRentalAvailability(car.rentalAvailability || 'both');
    setRentalPriceWithoutDriver(car.rentalPriceWithoutDriver || car.priceDzd || 9500);
    setRentalPriceWithDriver(car.rentalPriceWithDriver || 14000);
    setRentalConditionsAr(car.rentalConditionsAr || 'رخصة سياقة سارية لأكثر من سنتين + إيداع بطاقة الهوية أو ضمان مالي.');
    setShippingDuration(car.shippingDuration || '30 إلى 45 يوم');
    setMainImage(car.mainImage || '');
    
    const existingImgs = [car.mainImage, ...(car.images || [])].filter((img, idx, self) => img && self.indexOf(img) === idx);
    setUploadedPhotos(existingImgs);
    setFicheTechnique(car.ficheTechnique || '');
    setFicheTechniqueName(car.ficheTechniqueName || '');
    setIsFormOpen(true);
  };

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();

    const allImages = uploadedPhotos.filter(Boolean);
    const fallbackImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200';
    
    const chosenMainImage = (mainImage && allImages.includes(mainImage)) 
      ? mainImage 
      : (allImages[0] || fallbackImage);

    const parsedSpecs = specsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const calculatedPriceDzd = Number(priceDzd) || 0;
    const calculatedFormattedPrice = calculatedPriceDzd > 0 
      ? `${new Intl.NumberFormat('fr-DZ').format(calculatedPriceDzd)} د.ج` 
      : 'حسب الطلب';

    const newCar: Car = {
      id: editingCar ? editingCar.id : `car-${Date.now()}`,
      brand: brand || 'Geely',
      model: model || 'Coolray',
      year: Number(year) || 2024,
      priceDzd: calculatedPriceDzd,
      priceFormatted: calculatedFormattedPrice,
      location: 'algeria', // Showroom inventory location
      serviceType: carServiceType || 'algeria_showroom',
      phone: phone || '+213 550 12 34 56',
      whatsapp: whatsapp || '+213550123456',
      mileage: mileage || '0 كم',
      exteriorColor: exteriorColor || 'أبيض لؤلؤي',
      interiorColor: interiorColor || 'جلد بني فاخر',
      color: exteriorColor || 'أبيض لؤلؤي',
      fuelType,
      transmission,
      mainImage: chosenMainImage,
      images: allImages.length > 0 ? allImages : [chosenMainImage],
      ficheTechnique: ficheTechnique || undefined,
      ficheTechniqueName: ficheTechniqueName || undefined,
      specs: parsedSpecs.length > 0 ? parsedSpecs : ['شاشة لمس عالية الدقة', 'كاميرا 360°'],
      description: {
        ar: descAr || `${brand} ${model} ${year} متوفرة الآن في صالة العرض للتسليم أو الطلب.`,
        fr: descFr || `${brand} ${model} ${year} disponible dans notre showroom.`,
        en: descEn || `${brand} ${model} ${year} available now in showroom.`
      },
      featured: true,
      createdAt: editingCar?.createdAt || new Date().toISOString().split('T')[0],
      rentalMinDays: carServiceType === 'car_rental' ? Number(rentalMinDays) || 3 : undefined,
      rentalAvailability: carServiceType === 'car_rental' ? rentalAvailability : undefined,
      rentalPriceWithoutDriver: carServiceType === 'car_rental' && rentalAvailability !== 'with_driver_only' ? Number(rentalPriceWithoutDriver) || calculatedPriceDzd : undefined,
      rentalPriceWithDriver: carServiceType === 'car_rental' && rentalAvailability !== 'without_driver_only' ? Number(rentalPriceWithDriver) || (calculatedPriceDzd + 4000) : undefined,
      rentalConditionsAr: carServiceType === 'car_rental' ? rentalConditionsAr : undefined,
      shippingDuration: carServiceType === 'china_import' ? shippingDuration : undefined
    };

    // Check for replaced/removed media if editing an existing car
    if (editingCar) {
      const oldUrls: string[] = [];
      if (editingCar.mainImage) oldUrls.push(editingCar.mainImage);
      if (Array.isArray(editingCar.images)) {
        editingCar.images.forEach(img => {
          if (img) oldUrls.push(img);
        });
      }
      if (editingCar.ficheTechnique) oldUrls.push(editingCar.ficheTechnique);

      // Unify new images & documents
      const newUrls = new Set<string>();
      if (chosenMainImage) newUrls.add(chosenMainImage);
      allImages.forEach(img => {
        if (img) newUrls.add(img);
      });
      if (ficheTechnique) newUrls.add(ficheTechnique);

      // Find any old URL that is NOT in the new list
      const orphanedUrls = oldUrls.filter(url => url && !newUrls.has(url));
      
      if (orphanedUrls.length > 0) {
        deleteAssetsFromServer(orphanedUrls);
      }
    }

    onSaveCar(newCar);
    setIsFormOpen(false);
  };

  // Calculations for dashboard analytics
  const totalCars = cars.length;
  const totalValuation = cars.reduce((acc, c) => acc + (c.priceDzd || 0), 0);
  const brandsCount = new Set(cars.map(c => c.brand)).size;

  const filteredCars = cars.filter(car => {
    const query = adminSearch.toLowerCase().trim();
    return !query || 
      car.brand.toLowerCase().includes(query) || 
      car.model.toLowerCase().includes(query) || 
      (car.exteriorColor && car.exteriorColor.toLowerCase().includes(query)) ||
      (car.interiorColor && car.interiorColor.toLowerCase().includes(query));
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Outer Container Modal */}
      <div className="bg-[#0D1117] border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-gray-100">
        
        {/* Admin Header Bar */}
        <div className="px-6 py-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-950 fill-gray-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl text-white font-cairo">
                  {settings?.name || cmsName || 'KADEX DZ'} <span className="text-amber-400">Executive Dashboard</span>
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-black px-2.5 py-0.5 rounded border border-emerald-500/30">
                  تسليم فوري بالجزائر 🇩🇿
                </span>
              </div>
              <p className="text-xs text-gray-400">
                لوحة التحكم الإدارية لإدارة مخزون المعرض بالجزائر وإعدادات النظام
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================== LOGIN SCREEN ==================== */}
        {!isAdmin ? (
          <div className="p-6 sm:p-12 flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white font-cairo">
                  تسجيل الدخول للوحة التحكم
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  أدخل البريد الإلكتروني وكلمة المرور الخاصة بالإدارة
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    البريد الإلكتروني (Admin Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="enter ur email"
                      className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    كلمة المرور (Admin Password)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:underline"
                    >
                      {showPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>

                {/* Auth Error Banner */}
                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 mt-2"
                >
                  تسجيل الدخول إلى لوحة التحكم
                </button>

              </form>

            </div>
          </div>
        ) : (
          /* ==================== LOGGED IN DASHBOARD VIEW ==================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Bar / Tabs */}
            <div className="px-6 py-3 bg-gray-900 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>نظرة عامة (Overview)</span>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'inventory'
                      ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <CarIcon className="w-4 h-4" />
                  <span>مخزون المعرض والمنتجات ({cars.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'services'
                      ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>أنواع وخدمات المعرض ({cmsServiceTypes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>إعدادات المعرض و CMS</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'security'
                      ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>تغيير إيميل وكلمة مرور المشرف</span>
                </button>


              </div>

              {/* Quick Add Car Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة سيارة للمعرض</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Stat 1: Total Stock in Algeria */}
                    <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-500/30 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400">السيارات المتوفرة بالمعرض</span>
                        <CarIcon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-3xl font-black text-white">{totalCars}</div>
                      <p className="text-[11px] text-gray-400 mt-1">متوفرة للتسليم الفوري في الشراقة 🇩🇿</p>
                    </div>

                    {/* Stat 2: Total Valuation */}
                    <div className="bg-gradient-to-br from-amber-950/40 to-gray-900 border border-amber-500/30 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-400">القيمة التقديرية للمخزون</span>
                        <DollarSign className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-400">
                        {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(totalValuation)} د.ج
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">إجمالي أسعار السيارات المعروضة</p>
                    </div>

                    {/* Stat 3: Available Brands */}
                    <div className="bg-gradient-to-br from-blue-950/40 to-gray-900 border border-blue-500/30 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400">الماركات المتوفرة</span>
                        <Star className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-3xl font-black text-white">{brandsCount}</div>
                      <p className="text-[11px] text-gray-400 mt-1">Geely, Chery, Jetour, BYD وغيرها</p>
                    </div>

                  </div>

                  {/* Quick Action Banner */}
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">
                        إضافة سيارة جديدة متوفرة في الجزائر (تسليم فوري)
                      </h4>
                      <p className="text-xs text-gray-400">
                        يمكنك إضافة الصور، الأسعار، المواصفات التقنية وتحميل البطاقة الفنية (Fiche Technique) مباشرة.
                      </p>
                    </div>
                    <button
                      onClick={openAddModal}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20 whitespace-nowrap"
                    >
                      + إضافة سيارة الآن
                    </button>
                  </div>

                  {/* Recent Inventory Preview */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h4 className="text-sm font-bold text-white mb-4">أحدث السيارات في المخزون:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cars.slice(0, 3).map(car => (
                        <div key={car.id} className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex gap-3 items-center">
                          <img
                            src={car.mainImage}
                            alt={car.model}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-cover rounded-lg shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-bold text-white truncate">{car.brand} {car.model}</h5>
                            <span className="text-[11px] text-amber-400 font-bold block">{car.priceFormatted || `${car.priceDzd} د.ج`}</span>
                            <span className="text-[10px] text-emerald-400">🇩🇿 تسليم فوري</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: INVENTORY (ALGERIA SHOWROOM CARS) */}
              {activeTab === 'inventory' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Delete Success Alert Banner */}
                  {deleteSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{deleteSuccessMsg}</span>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="ابحث بالماركة أو الموديل أو اللون..."
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onResetCatalog}
                        className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="استعادة السيارات الافتراضية"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>استعادة الافتراضي</span>
                      </button>

                      <button
                        onClick={openAddModal}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-gray-950 text-xs font-black flex items-center gap-1.5 shadow-md hover:bg-amber-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة سيارة</span>
                      </button>
                    </div>
                  </div>

                  {/* Inventory Table */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800">
                          <tr>
                            <th className="p-3">السيارة</th>
                            <th className="p-3">الموديل والسنة</th>
                            <th className="p-3">السعر بالدينار</th>
                            <th className="p-3">الألوان</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3 text-center">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {filteredCars.map(car => (
                            <tr key={car.id} className="hover:bg-gray-800/50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={car.mainImage}
                                    alt={car.model}
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-800 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-white">{car.brand}</div>
                                    <div className="text-[11px] text-gray-400">{car.fuelType} • {car.transmission}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-gray-200">{car.model}</div>
                                <div className="text-gray-400">{car.year} • {car.mileage}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-black text-amber-400 text-sm">
                                  {new Intl.NumberFormat('fr-DZ').format(car.priceDzd)} د.ج
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="text-gray-300 text-[11px]">{car.exteriorColor || car.color}</div>
                                {car.interiorColor && (
                                  <div className="text-orange-400 text-[10px]">{car.interiorColor}</div>
                                )}
                              </td>
                              <td className="p-3">
                                {(() => {
                                  const stInfo = cmsServiceTypes.find(st => st.id === (car.serviceType || 'algeria_showroom'));
                                  const badgeText = stInfo?.badgeAr || stInfo?.nameAr || 'تسليم فوري';
                                  const icon = stInfo?.icon || '🚗';
                                  return (
                                    <span className="bg-amber-500/10 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 w-fit">
                                      <span>{icon}</span>
                                      <span>{badgeText}</span>
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditModal(car)}
                                    className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-gray-950 transition-colors"
                                    title="تعديل السيارة"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingCar(car)}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                    title="حذف السيارة"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: SERVICES & CATEGORIES MANAGEMENT */}
              {activeTab === 'services' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Alert Message */}
                  {serviceSuccessMsg && (
                    <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{serviceSuccessMsg}</span>
                    </div>
                  )}

                  {/* Header & Quick Action */}
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-5 h-5 text-amber-400" />
                        <h4 className="text-base font-bold text-white font-cairo">
                          أنواع الخدمات والأصناف (Service Types & Categories)
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                        يمكنك إضافة أصناف وخدمات جديدة للمعرض مثل: <strong>سيارات في الصين جاهزة للاستيراد</strong>، <strong>كراء وتأجير السيارات</strong>، <strong>دراجات نارية وسكوتر</strong>، أو أي خدمة جديدة.
                        <br />
                        <span className="text-amber-400 font-semibold">ملاحظة ذكية:</span> الصنف المضاف لن يظهر للزوار في واجهة المعرض الرئيسية إلا إذا كان يحتوي على منتجات/سيارات معروضة بالفعل.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenAddService}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20 whitespace-nowrap flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ إضافة نوع أو خدمة جديدة</span>
                    </button>
                  </div>

                  {/* Service Types Cards List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cmsServiceTypes.map(st => {
                      const linkedCount = cars.filter(c => (c.serviceType || 'algeria_showroom') === st.id).length;
                      const isEnabled = st.enabled !== false;
                      const isBase = st.id === 'algeria_showroom';

                      return (
                        <div
                          key={st.id}
                          className={`bg-gray-900 border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                            isEnabled ? 'border-gray-800 hover:border-gray-700' : 'border-gray-800/50 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center shadow-inner">
                                  {st.icon || '🏷️'}
                                </span>
                                <div>
                                  <h5 className="font-bold text-white text-sm font-cairo flex items-center gap-2">
                                    <span>{st.nameAr}</span>
                                    {isBase && (
                                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                                        افتراضي
                                      </span>
                                    )}
                                  </h5>
                                  <span className="text-[11px] text-gray-400">ID: {st.id}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                    linkedCount > 0
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : 'bg-gray-800 text-gray-400 border-gray-700'
                                  }`}
                                >
                                  {linkedCount} {linkedCount === 1 ? 'منتج' : 'منتجات'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 py-2 border-t border-b border-gray-800/80 my-3 text-xs">
                              <div className="flex justify-between text-gray-400">
                                <span>شارة العرض (Badge):</span>
                                <span className="font-bold text-amber-400 bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                                  {st.badgeAr || st.nameAr}
                                </span>
                              </div>
                              {st.descriptionAr && (
                                <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                                  {st.descriptionAr}
                                </p>
                              )}
                              <div className="text-[11px] text-gray-500 flex items-center gap-3 pt-1">
                                <span>FR: {st.nameFr || '-'}</span>
                                <span>EN: {st.nameEn || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              onClick={() => handleToggleServiceType(st.id)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                isEnabled
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                              }`}
                            >
                              {isEnabled ? '✓ الصنف مفعّل' : '✕ الصنف معطّل'}
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditService(st)}
                                className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-gray-950 transition-colors text-xs font-bold flex items-center gap-1"
                                title="تعديل بيانات الصنف"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>تعديل</span>
                              </button>

                              {!isBase && (
                                <button
                                  onClick={() => handleDeleteServiceType(st.id)}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-1"
                                  title="حذف هذا الصنف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add / Edit Service Inline / Modal Form */}
                  {isAddingService && (
                    <div className="bg-gray-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h4 className="text-sm font-black text-amber-400 font-cairo flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          <span>{editingServiceId ? 'تعديل نوع الخدمة / الصنف' : 'إضافة نوع خدمة جديد (مثال: دراجات، كراء، استيراد من الصين)'}</span>
                        </h4>
                        <button
                          onClick={() => setIsAddingService(false)}
                          className="p-1 rounded bg-gray-900 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveServiceForm} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالعربية (Name Arabic) *</label>
                            <input
                              type="text"
                              value={serviceFormNameAr}
                              onChange={(e) => setServiceFormNameAr(e.target.value)}
                              placeholder="مثال: سيارات جاهزة في الصين للاستيراد"
                              required
                              className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">الشارة بالعربية (Badge Text) *</label>
                            <input
                              type="text"
                              value={serviceFormBadgeAr}
                              onChange={(e) => setServiceFormBadgeAr(e.target.value)}
                              placeholder="مثال: جاهزة للاستيراد 🇨🇳 أو كراء وتأجير 🔑"
                              className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">أيقونة الصنف (Emoji Icon)</label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={serviceFormIcon}
                                onChange={(e) => setServiceFormIcon(e.target.value)}
                                placeholder="🇨🇳, 🇩🇿, 🔑, 🏍️, 🚚, ⚡"
                                className="w-20 text-center text-lg bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-xl px-2 py-1.5 text-white"
                              />
                              <div className="flex gap-1 overflow-x-auto text-base">
                                {['🇩🇿', '🇨🇳', '🔑', '🏍️', '🚚', '⚡', '🏎️', '🛠️'].map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setServiceFormIcon(emoji)}
                                    className="p-1 rounded hover:bg-gray-800"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالفرنسية (Name French)</label>
                            <input
                              type="text"
                              value={serviceFormNameFr}
                              onChange={(e) => setServiceFormNameFr(e.target.value)}
                              placeholder="Ex: Voitures en Chine (Importation)"
                              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالإنجليزية (Name English)</label>
                            <input
                              type="text"
                              value={serviceFormNameEn}
                              onChange={(e) => setServiceFormNameEn(e.target.value)}
                              placeholder="Ex: China Ready to Import"
                              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">معرّف الصنف (ID Slug)</label>
                            <input
                              type="text"
                              value={serviceFormId}
                              onChange={(e) => setServiceFormId(e.target.value)}
                              placeholder="china_import"
                              disabled={!!editingServiceId}
                              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-400 disabled:opacity-60"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1">وصف مختصر للخدمة (Description)</label>
                          <textarea
                            value={serviceFormDescAr}
                            onChange={(e) => setServiceFormDescAr(e.target.value)}
                            placeholder="اكتب نبذة مختصرة تظهر للزبائن عند تصفح هذا القسم..."
                            rows={2}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingService(false)}
                            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20"
                          >
                            {editingServiceId ? 'حفظ تعديلات الصنف' : 'إضافة وحفظ الصنف'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: SHOWROOM CMS SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveCmsSettings} className="space-y-6 animate-fade-in">
                  
                  {cmsSaveSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span>تم حفظ وتحديث إعدادات المعرض و CMS بنجاح!</span>
                    </div>
                  )}

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-amber-400 border-b border-gray-800 pb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>بيانات وهوية المعرض (Showroom Info)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">اسم المعرض (Showroom Name)</label>
                        <input
                          type="text"
                          value={cmsName}
                          onChange={(e) => setCmsName(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1.5">شعار المعرض (Showroom Logo)</label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold cursor-pointer border border-gray-700 flex items-center gap-2 transition-colors">
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>اختيار ملف الشعار من جهازك</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                          {cmsLogoUrl && (
                            <div className="flex items-center gap-2 bg-gray-950 p-1.5 px-3 rounded-xl border border-gray-800">
                              <img
                                src={cmsLogoUrl}
                                alt="Logo Preview"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 object-contain rounded"
                              />
                              <span className="text-[11px] text-gray-400 font-medium">الشعار الحالي</span>
                              <button
                                type="button"
                                onClick={() => setCmsLogoUrl('')}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                                title="إلغاء الشعار"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          النص الفرعي للشعار في أعلى الموقع (Header Tagline / Subtitle)
                        </label>
                        <input
                          type="text"
                          value={cmsTagline}
                          onChange={(e) => setCmsTagline(e.target.value)}
                          placeholder="صالة العرض بعنابة (الشط) - تسليم فوري 🇩🇿"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          💡 هذا النص يظهر تحت اسم المعرض في شريط التنقل العلوي للموقع (Header).
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">الهاتف الأول للتواصل</label>
                        <input
                          type="text"
                          value={cmsPhone1}
                          onChange={(e) => setCmsPhone1(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">الهاتف الثاني للتواصل</label>
                        <input
                          type="text"
                          value={cmsPhone2}
                          onChange={(e) => setCmsPhone2(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">رقم الواتساب الرسمي (صيغة دولية)</label>
                        <input
                          type="text"
                          value={cmsWhatsapp}
                          onChange={(e) => setCmsWhatsapp(e.target.value)}
                          placeholder="+213550123456"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">البريد الإلكتروني العام للمعرض</label>
                        <input
                          type="email"
                          value={cmsEmail}
                          onChange={(e) => setCmsEmail(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-300 mb-1">عنوان المعرض (بالعربية)</label>
                        <input
                          type="text"
                          value={cmsAddressAr}
                          onChange={(e) => setCmsAddressAr(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-300 mb-1">ساعات العمل</label>
                        <input
                          type="text"
                          value={cmsWorkingHoursAr}
                          onChange={(e) => setCmsWorkingHoursAr(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Google Maps Location Settings */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="border-b border-gray-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-bold text-amber-400">
                          رابط وخريطة موقع المعرض على Google Maps
                        </h4>
                      </div>
                      {cmsGoogleMapsUrl && (
                        <a
                          href={cmsGoogleMapsUrl.startsWith('http') ? cmsGoogleMapsUrl : `https://maps.google.com/?q=${encodeURIComponent(cmsGoogleMapsUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                        >
                          <span>فتح واختبار الرابط في Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-gray-300">
                          رابط موقع المعرض على خرائط جوجل (Google Maps URL):
                        </label>
                        {mapResolving && (
                          <span className="text-[11px] text-amber-400 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>جاري معالجة الرابط...</span>
                          </span>
                        )}
                        {!mapResolving && mapResolvedCoords && (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>الإحداثيات: {mapResolvedCoords.lat?.toFixed(4)}, {mapResolvedCoords.lng?.toFixed(4)}</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={cmsGoogleMapsUrl}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.includes('<iframe')) {
                            const srcMatch = val.match(/src=["']([^"']+)["']/i);
                            if (srcMatch && srcMatch[1]) {
                              val = srcMatch[1];
                            }
                          }
                          setCmsGoogleMapsUrl(val);
                          const sync = parseMapLocation(val, cmsAddressAr || cmsAddressFr);
                          if (sync.embedUrl) {
                            setCmsMapEmbedUrl(sync.embedUrl);
                          }
                        }}
                        placeholder="https://maps.app.goo.gl/... أو https://maps.google.com/?q=36.935,7.868"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:border-amber-400 focus:outline-none"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        💡 الصق أي رابط من تطبيق خرائط Google أو إحداثيات GPS أو كود التضمين وسيظهر موقع المعرض مباشرة في الإطار أدناه.
                      </p>
                    </div>

                    {/* Live Preview Map Frame inside CMS */}
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>معاينة حية لإطار الخريطة (Live Map Preview):</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                          مفعل ومباشر
                        </span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950 h-56 relative">
                        <iframe
                          key={cmsMapEmbedUrl || cmsGoogleMapsUrl}
                          src={cmsMapEmbedUrl || parseMapLocation(cmsGoogleMapsUrl, cmsAddressAr || 'الشط، عنابة، الجزائر').embedUrl}
                          title="معاينة خريطة المعرض"
                          className="w-full h-full border-0"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Background Settings */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-amber-400 border-b border-gray-800 pb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>خلفية الواجهة الرئيسية (Hero Background Media)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setCmsHeroBgType('gradient')}
                        className={`p-3 rounded-xl border text-center text-xs font-bold ${
                          cmsHeroBgType === 'gradient'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-gray-950 border-gray-800 text-gray-400'
                        }`}
                      >
                        تدرج لوني افتراضي (Gradient)
                      </button>

                      <button
                        type="button"
                        onClick={() => setCmsHeroBgType('image')}
                        className={`p-3 rounded-xl border text-center text-xs font-bold ${
                          cmsHeroBgType === 'image'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-gray-950 border-gray-800 text-gray-400'
                        }`}
                      >
                        صورة بانورامية للمعرض (Photo)
                      </button>

                      <button
                        type="button"
                        onClick={() => setCmsHeroBgType('video')}
                        className={`p-3 rounded-xl border text-center text-xs font-bold ${
                          cmsHeroBgType === 'video'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-gray-950 border-gray-800 text-gray-400'
                        }`}
                      >
                        فيديو خلفية سينمائي (Video)
                      </button>
                    </div>

                    {cmsHeroBgType !== 'gradient' && (
                      <div className="space-y-3 pt-2">
                        <label className="block text-xs font-bold text-gray-300">
                          {cmsHeroBgType === 'video' ? 'تحميل ملف فيديو الخلفية (MP4 / WebM):' : 'تحميل صورة الخلفية:'}
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold cursor-pointer border border-gray-700 flex items-center gap-2 transition-colors">
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>{cmsHeroBgType === 'video' ? 'اختيار ملف فيديو من جهازك' : 'اختيار ملف صورة من جهازك'}</span>
                            <input type="file" accept={cmsHeroBgType === 'video' ? "video/mp4,video/webm" : "image/*"} onChange={handleHeroBgFileUpload} className="hidden" />
                          </label>
                          {cmsHeroBgUrl && (
                            <div className="flex items-center gap-2 bg-gray-950 p-1.5 px-3 rounded-xl border border-gray-800">
                              {cmsHeroBgType === 'video' ? (
                                <span className="text-[11px] text-gray-300 font-bold">تم تحميل ملف الفيديو</span>
                              ) : (
                                <img
                                  src={cmsHeroBgUrl}
                                  alt="Hero Background Preview"
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-9 object-cover rounded"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => setCmsHeroBgUrl('')}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                                title="إلغاء الملف"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Media Links */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-amber-400 border-b border-gray-800 pb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      <span>روابط منصات التواصل الاجتماعي (Social Media)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">رابط فيسبوك (Facebook)</label>
                        <input
                          type="text"
                          value={cmsFacebook}
                          onChange={(e) => setCmsFacebook(e.target.value)}
                          placeholder="https://facebook.com/kadex.dz"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">رابط انستغرام (Instagram)</label>
                        <input
                          type="text"
                          value={cmsInstagram}
                          onChange={(e) => setCmsInstagram(e.target.value)}
                          placeholder="https://instagram.com/kadex.dz"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">رابط تيك توك (TikTok)</label>
                        <input
                          type="text"
                          value={cmsTiktok}
                          onChange={(e) => setCmsTiktok(e.target.value)}
                          placeholder="https://tiktok.com/@kadex_dz"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-sm shadow-xl shadow-amber-500/20"
                  >
                    حفظ التغييرات في إعدادات المعرض
                  </button>

                </form>
              )}

              {/* TAB 4: SECURITY & ADMIN CREDENTIALS (CHANGE EMAIL & PASSWORD) */}
              {activeTab === 'security' && (
                <form onSubmit={handleSaveSecurityCredentials} className="space-y-6 max-w-xl mx-auto animate-fade-in">
                  
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
                    
                    <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white font-cairo">
                          تغيير بيانات الدخول للإدارة (Owner Credentials)
                        </h4>
                        <p className="text-xs text-gray-400">
                          يمكن لمالك المعرض تعديل البريد الإلكتروني وكلمة المرور في أي وقت لحماية حسابه
                        </p>
                      </div>
                    </div>

                    {/* Success Message */}
                    {securitySuccess && (
                      <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>تم تحديث وحفظ البريد الإلكتروني وكلمة المرور الجديدة بنجاح!</span>
                      </div>
                    )}

                    {/* Error Message */}
                    {securityError && (
                      <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                        <span>{securityError}</span>
                      </div>
                    )}

                    {/* Change Admin Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-200 mb-1.5">
                        البريد الإلكتروني الجديد للمشرف (Admin Email) *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={adminEmailSetting}
                          onChange={(e) => setAdminEmailSetting(e.target.value)}
                          placeholder="admin@nacer.dz"
                          className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 mt-1 block">
                        البريد الحالي المسجل: <strong className="text-amber-400">{initialSettings.adminEmail || 'admin@nacer.dz'}</strong>
                      </span>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-gray-200 mb-1.5">
                        كلمة المرور الجديدة (New Password)
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showAdminNewPass ? "text" : "password"}
                          value={newPasswordSetting}
                          onChange={(e) => setNewPasswordSetting(e.target.value)}
                          placeholder="اترك فارغاً إن لم ترغب بتغييرها"
                          className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminNewPass(!showAdminNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:underline"
                        >
                          {showAdminNewPass ? "إخفاء" : "إظهار"}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    {newPasswordSetting.trim().length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-gray-200 mb-1.5">
                          تأكيد كلمة المرور الجديدة (Confirm New Password) *
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showAdminConfirmPass ? "text" : "password"}
                            value={confirmPasswordSetting}
                            onChange={(e) => setConfirmPasswordSetting(e.target.value)}
                            placeholder="أعد كتابة كلمة المرور الجديدة"
                            className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminConfirmPass(!showAdminConfirmPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:underline"
                          >
                            {showAdminConfirmPass ? "إخفاء" : "إظهار"}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all mt-4"
                    >
                      حفظ وتحديث بيانات حساب المشرف
                    </button>

                  </div>

                </form>
              )}



            </div>
          </div>
        )}

      </div>

      {/* ==================== ADD / EDIT VEHICLE MODAL FORM ==================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0D1117] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-gray-100">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CarIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white font-cairo">
                  {editingCar ? `تعديل سيارة: ${editingCar.brand} ${editingCar.model}` : 'إضافة سيارة جديدة للمخزون (تسليم فوري بالجزائر)'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* SERVICE TYPE SELECTOR (CMS DYNAMIC) */}
              <div className="bg-gray-900 border-2 border-amber-500/30 p-4 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-cairo">
                      نوع الخدمة / الصنف (Service Type & Category) *
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    حدد الصنف الذي ينتمي إليه هذا العرض
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {cmsServiceTypes.map(st => {
                    const isSelected = carServiceType === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCarServiceType(st.id)}
                        className={`p-3 rounded-xl border text-right transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                        }`}
                      >
                        <span className="text-xl p-1.5 rounded-lg bg-gray-900 border border-gray-800 shrink-0">
                          {st.icon || '🚗'}
                        </span>
                        <div className="overflow-hidden">
                          <div className={`font-bold text-xs truncate ${isSelected ? 'text-amber-300' : 'text-gray-300'}`}>
                            {st.nameAr}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {st.badgeAr || st.nameAr}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONDITIONAL RENTAL SPECIFIC FIELDS */}
              {carServiceType === 'car_rental' && (
                <div className="bg-gradient-to-br from-amber-500/10 to-gray-900 border-2 border-amber-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔑</span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-cairo">
                      إعدادات كراء وتأجير السيارات (مع وبدون سائق والشروط)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-amber-400 mb-1">خيارات توفر السائق (Availability Option)</label>
                    <select
                      value={rentalAvailability}
                      onChange={(e) => setRentalAvailability(e.target.value as any)}
                      className="w-full bg-gray-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
                    >
                      <option value="both">كلا الخيارين متاحان (مع وبدون سائق - سعرين)</option>
                      <option value="without_driver_only">بدون سائق فقط (سعر واحد)</option>
                      <option value="with_driver_only">مع سائق إجباري فقط (سعر واحد)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">أقل عدد أيام للإيجار (Min Days)</label>
                      <input
                        type="number"
                        min={1}
                        value={rentalMinDays}
                        onChange={(e) => setRentalMinDays(Number(e.target.value))}
                        placeholder="3"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white"
                      />
                    </div>

                    {rentalAvailability !== 'with_driver_only' && (
                      <div>
                        <label className="block text-xs font-bold text-amber-400 mb-1">السعر بدون سائق (يومياً بالدينار)</label>
                        <input
                          type="number"
                          value={rentalPriceWithoutDriver}
                          onChange={(e) => setRentalPriceWithoutDriver(Number(e.target.value))}
                          placeholder="9500"
                          className="w-full bg-gray-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-bold"
                        />
                      </div>
                    )}

                    {rentalAvailability !== 'without_driver_only' && (
                      <div>
                        <label className="block text-xs font-bold text-emerald-400 mb-1">السعر مع سائق (يومياً بالدينار)</label>
                        <input
                          type="number"
                          value={rentalPriceWithDriver}
                          onChange={(e) => setRentalPriceWithDriver(Number(e.target.value))}
                          placeholder="14000"
                          className="w-full bg-gray-950 border border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs text-emerald-300 font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">التزامات وشروط العميل (مع وبدون سائق)</label>
                    <textarea
                      value={rentalConditionsAr}
                      onChange={(e) => setRentalConditionsAr(e.target.value)}
                      placeholder="رخصة سياقة سارية لأكثر من سنتين + إيداع بطاقة الهوية أو ضمان مالي + العمر الأدنى 23 سنة..."
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* CONDITIONAL CHINA IMPORT SPECIFIC FIELDS */}
              {carServiceType === 'china_import' && (
                <div className="bg-gradient-to-br from-blue-500/10 to-gray-900 border-2 border-blue-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇨🇳</span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 font-cairo">
                      إعدادات استيراد السيارات من الصين (مدة النقل والشحن)
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 mb-1">مدة النقل والشحن المتوقعة (Shipping Duration)</label>
                    <input
                      type="text"
                      value={shippingDuration}
                      onChange={(e) => setShippingDuration(e.target.value)}
                      placeholder="مثال: 30 إلى 45 يوم (شحن بحري مؤمن)"
                      className="w-full bg-gray-950 border border-blue-500/50 rounded-xl px-3 py-2.5 text-xs text-blue-300 font-bold"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      هذه المدة ستظهر بوضوح للزبون في صفحة تفاصيل السيارة كمدة النقل والشحن من المصانع في الصين إلى الميناء الجزائري.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: VEHICLE CORE SPECS & PRICING */}
              <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span className="bg-amber-500 text-gray-950 font-black px-2 py-0.5 rounded text-[11px]">البيانات الأساسية</span>
                  <span>معلومات ومواصفات السيارة والأسعار</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">الماركة (Brand) *</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="مثال: Chery, Geely, Jetour, BYD"
                      required
                      className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-white"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">الموديل (Model) *</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="مثال: Tiggo 8 Pro Max"
                      required
                      className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-white"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">سنة الصنع (Year) *</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      placeholder="2024"
                      required
                      className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-white"
                    />
                  </div>

                  {/* Price DZD */}
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1">
                      السعر بالدينار الجزائري (DZD) *
                    </label>
                    <input
                      type="number"
                      value={priceDzd}
                      onChange={(e) => setPriceDzd(Number(e.target.value))}
                      placeholder="مثال: 5800000 (0 لحسب الطلب)"
                      required
                      className="w-full bg-gray-950 border border-amber-500/60 focus:border-amber-400 rounded-xl py-2.5 px-3 text-xs text-amber-300 font-bold"
                    />
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">نوع الوقود</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as FuelType)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                    >
                      <option value="Essence">بنزين (Essence)</option>
                      <option value="Électrique">كهربائية 100% (Électrique)</option>
                      <option value="Hybride">هجينة (Hybride / PHEV)</option>
                      <option value="Diesel">مازوت (Diesel)</option>
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">علبة السرعة</label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value as Transmission)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                    >
                      <option value="Automatic">أوتوماتيك (Automatic)</option>
                      <option value="Manual">يدوي (Manual)</option>
                    </select>
                  </div>

                  {/* Mileage */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">المسافة المقطوعة</label>
                    <input
                      type="text"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="0 كم (جديدة)"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">هاتف التواصل للسيارة</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+213 550 12 34 56"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">رقم الواتساب (صيغة دولية)</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+213550123456"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                    />
                  </div>

                </div>

                {/* Colors Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">اللون الخارجي (Outside Color)</label>
                    <input
                      type="text"
                      value={exteriorColor}
                      onChange={(e) => setExteriorColor(e.target.value)}
                      placeholder="مثال: أبيض لؤلؤي / Blanc Nacré"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs text-white mb-2"
                    />
                    <div className="flex flex-wrap gap-1">
                      {EXTERIOR_COLOR_OPTIONS.slice(0, 5).map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setExteriorColor(col)}
                          className="text-[10px] px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                        >
                          {col.split('/')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">لون المقصورة (Inside Color)</label>
                    <input
                      type="text"
                      value={interiorColor}
                      onChange={(e) => setInteriorColor(e.target.value)}
                      placeholder="مثال: جلد بني فاخر / Cuir Marron"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs text-white mb-2"
                    />
                    <div className="flex flex-wrap gap-1">
                      {INTERIOR_COLOR_OPTIONS.slice(0, 4).map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setInteriorColor(col)}
                          className="text-[10px] px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                        >
                          {col.split('/')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">المواصفات والتجهيزات (افصل بينها بفارزة ",")</label>
                  <input
                    type="text"
                    value={specsInput}
                    onChange={(e) => setSpecsInput(e.target.value)}
                    placeholder="شاشة لمس 12.3 بوصة, كاميرا 360°, فتحة سقف بانوراما, مقاعد كهربائية مع تدفئة"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الوصف باللغة العربية</label>
                  <textarea
                    rows={2}
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً عن حالة السيارة، الضمان، والوثائق..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

              </div>

              {/* STEP 3: PHOTOS & FICHE TECHNIQUE */}
              <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span className="bg-amber-500 text-gray-950 font-black px-2 py-0.5 rounded text-[11px]">الصور والملفات</span>
                  <span>معرض الصور والبطاقة الفنية (Fiche Technique)</span>
                </h4>

                {/* Upload Photos from device */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">
                    تحميل صور السيارة من الجهاز (يمكن اختيار عدة صور دفعة واحدة):
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 hover:border-amber-400 rounded-2xl bg-gray-950 cursor-pointer transition-colors group">
                    <Upload className="w-8 h-8 text-gray-500 group-hover:text-amber-400 mb-2 transition-colors" />
                    <span className="text-xs font-bold text-gray-300">انقر هنا لاختيار صور من الجهاز أو السحب والإفلات</span>
                    <span className="text-[10px] text-gray-500 mt-1">يتم ضغط الصور تلقائياً لتسريع التحميل والتخزين</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Image Previews */}
                {uploadedPhotos.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-300 mb-2">الصور المرفوعة ({uploadedPhotos.length}) - انقر على صورة لتعيينها كرئيسية:</p>
                    <div className="flex flex-wrap gap-3">
                      {uploadedPhotos.map((img, idx) => (
                        <div key={idx} className="relative group/thumb">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className={`w-20 h-20 object-cover rounded-xl border-2 cursor-pointer transition-all ${
                              (mainImage === img || (!mainImage && idx === 0))
                                ? 'border-amber-400 ring-2 ring-amber-400/30'
                                : 'border-gray-800 opacity-70 hover:opacity-100'
                            }`}
                            onClick={() => setMainImage(img)}
                          />
                          {(mainImage === img || (!mainImage && idx === 0)) && (
                            <span className="absolute top-1 right-1 bg-amber-500 text-gray-950 text-[9px] font-black px-1 rounded shadow">
                              الرئيسية
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1.5 -left-1.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fiche Technique File Upload */}
                <div className="pt-2 border-t border-gray-800">
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    البطاقة الفنية (Fiche Technique / Technical Sheet):
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold cursor-pointer border border-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{ficheTechniqueName ? `تم اختيار: ${ficheTechniqueName}` : 'اختيار ملف البطاقة الفنية (PDF / DOC)'}</span>
                      <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleFicheTechniqueUpload} className="hidden" />
                    </label>
                    {ficheTechnique && (
                      <button
                        type="button"
                        onClick={() => { setFicheTechnique(''); setFicheTechniqueName(''); }}
                        className="p-2 text-red-400 hover:text-red-300"
                        title="إلغاء الملف"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-800">
                {editingCar ? (
                  <button
                    type="button"
                    onClick={() => setDeletingCar(editingCar)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف هذه السيارة</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20"
                  >
                    {editingCar ? 'حفظ التعديلات' : 'إضافة السيارة للمعرض'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================== IN-APP DELETE CONFIRMATION MODAL ==================== */}
      {deletingCar && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0D1117] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-right text-gray-100">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-cairo">
                  تأكيد حذف السيارة من المخزون
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف سيارة <strong className="text-white">{deletingCar.brand} {deletingCar.model}</strong> نهائياً من صالة العرض والمخزون؟
                </p>
              </div>
            </div>

            {/* Car Preview Summary */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
              <img
                src={deletingCar.mainImage}
                alt={deletingCar.model}
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-cover rounded-lg border border-gray-800 shrink-0"
              />
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate">
                  {deletingCar.brand} {deletingCar.model} ({deletingCar.year})
                </h4>
                <p className="text-xs text-amber-400 font-black mt-0.5">
                  {deletingCar.priceFormatted || `${new Intl.NumberFormat('fr-DZ').format(deletingCar.priceDzd)} د.ج`}
                </p>
                <span className="text-[10px] text-gray-400 block truncate">
                  {deletingCar.exteriorColor || deletingCar.color} • {deletingCar.mileage}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCar(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>نعم، حذف السيارة نهائياً</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
