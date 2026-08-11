import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'kadex_supabase_url';
const STORAGE_KEY_KEY = 'kadex_supabase_anon_key';

let serverFetchedUrl = '';
let serverFetchedKey = '';

export function getStoredCredentials(): { url: string; anonKey: string } {
  let url = '';
  let anonKey = '';

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      url = localStorage.getItem(STORAGE_URL_KEY) || '';
      anonKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
    } catch (e) {}
  }

  if (!url) {
    url = serverFetchedUrl
      || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL)
      || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL)
      || '';
  }

  if (!anonKey) {
    anonKey = serverFetchedKey
      || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
      || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY)
      || '';
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function isValidSupabaseConfig(url?: string, anonKey?: string): boolean {
  const creds = (url !== undefined && anonKey !== undefined) 
    ? { url: url.trim(), anonKey: anonKey.trim() } 
    : getStoredCredentials();
  
  return Boolean(
    creds.url &&
    creds.anonKey &&
    creds.url.startsWith('https://') &&
    creds.url.includes('.supabase.co') &&
    !creds.url.includes('your-supabase-project') &&
    !creds.anonKey.includes('your-supabase-anon-key')
  );
}

let currentClient: SupabaseClient | null = null;
let lastUrl = '';
let lastAnonKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredCredentials();
  if (isValidSupabaseConfig(url, anonKey)) {
    if (!currentClient || lastUrl !== url || lastAnonKey !== anonKey) {
      try {
        currentClient = createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        lastUrl = url;
        lastAnonKey = anonKey;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        currentClient = null;
      }
    }
    return currentClient;
  }
  currentClient = null;
  return null;
}

// Initialize on module load if configured
getSupabase();

export function updateSupabaseCredentials(url: string, anonKey: string): { success: boolean; error?: string } {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl && !cleanKey) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
    currentClient = null;
    lastUrl = '';
    lastAnonKey = '';
    return { success: true };
  }

  if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
    return { 
      success: false, 
      error: 'الرابط غير صحيح. يجب أن يبدأ بـ https:// وينتهي بـ .supabase.co (مثال: https://xyzcompany.supabase.co)' 
    };
  }

  if (cleanKey.length < 20) {
    return { 
      success: false, 
      error: 'مفتاح Supabase Anon Key قصير جداً. يرجى نسخ المفتاح الكامل من Supabase Dashboard -> Project Settings -> API' 
    };
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
      localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    } catch (e) {}
  }

  try {
    currentClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    lastUrl = cleanUrl;
    lastAnonKey = cleanKey;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'فشل الاتصال بـ Supabase' };
  }
}

export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.details || error.hint || String(error)).toLowerCase();
  const code = error.code;
  return (
    msg.includes('could not find the table') ||
    msg.includes('in the schema cache') ||
    (msg.includes('relation') && msg.includes('does not exist')) ||
    (msg.includes('table') && msg.includes('does not exist')) ||
    code === '42P01' ||
    code === 'PGRST200' ||
    code === 'PGRST204' ||
    code === 'PGRST301'
  );
}

export interface SupabaseHealthReport {
  ok: boolean;
  message: string;
  url: string;
  isConfigured: boolean;
  carsTable: {
    exists: boolean;
    writable: boolean;
    count: number;
    error?: string;
  };
  showroomTable: {
    exists: boolean;
    writable: boolean;
    foundMainRow: boolean;
    error?: string;
  };
  carsTableExists: boolean;
  carsCount: number;
  showroomInfoTableExists: boolean;
}

export async function testSupabaseHealth(): Promise<SupabaseHealthReport> {
  const { url, anonKey } = getStoredCredentials();
  const report: SupabaseHealthReport = {
    ok: false,
    message: '',
    url: url || 'غير محدد',
    isConfigured: isValidSupabaseConfig(url, anonKey),
    carsTable: { exists: false, writable: false, count: 0 },
    showroomTable: { exists: false, writable: false, foundMainRow: false },
    carsTableExists: false,
    carsCount: 0,
    showroomInfoTableExists: false
  };

  if (!report.isConfigured) {
    report.message = 'لم يتم إعداد بيانات الاتصال بـ Supabase بعد.';
    return report;
  }

  const client = getSupabase();
  if (!client) {
    report.message = 'فشل تهيئة عميل Supabase. يرجى التأكد من صحة الرابط والمفتاح.';
    return report;
  }

  // 1. Test cars table
  try {
    const { data: carsData, count, error: carsReadErr } = await client
      .from('cars')
      .select('id', { count: 'exact' })
      .limit(1);

    if (carsReadErr) {
      report.carsTable.error = carsReadErr.message;
      if (isTableMissingError(carsReadErr)) {
        report.carsTable.exists = false;
      } else {
        report.carsTable.exists = true;
      }
    } else {
      report.carsTable.exists = true;
      report.carsTable.count = count ?? (carsData ? carsData.length : 0);
      report.carsTable.writable = true;
    }
  } catch (e: any) {
    report.carsTable.error = e.message;
    if (isTableMissingError(e)) {
      report.carsTable.exists = false;
    }
  }

  // 2. Test showroom_info table
  try {
    const { data: infoData, error: infoReadErr } = await client
      .from('showroom_info')
      .select('id, name')
      .eq('id', 'main')
      .maybeSingle();

    if (infoReadErr) {
      report.showroomTable.error = infoReadErr.message;
      if (isTableMissingError(infoReadErr)) {
        report.showroomTable.exists = false;
      } else {
        report.showroomTable.exists = true;
      }
    } else {
      report.showroomTable.exists = true;
      report.showroomTable.foundMainRow = Boolean(infoData);
      report.showroomTable.writable = true;
    }
  } catch (e: any) {
    report.showroomTable.error = e.message;
    if (isTableMissingError(e)) {
      report.showroomTable.exists = false;
    }
  }

  report.carsTableExists = report.carsTable.exists;
  report.carsCount = report.carsTable.count;
  report.showroomInfoTableExists = report.showroomTable.exists;

  if (report.carsTable.exists && report.showroomTable.exists) {
    report.ok = true;
    report.message = '🟢 الاتصال سليم والجداول متصلة بنجاح مع Supabase!';
  } else if (!report.carsTable.exists || !report.showroomTable.exists) {
    report.ok = false;
    report.message = '⚠️ الاتصال بـ Supabase يعمل لكن الجداول غير موجودة أو لم يتم تنفيذ سكربت SQL بعد.';
  } else {
    report.ok = false;
    report.message = '⚠️ هناك خطأ في الوصول للجداول. يرجى التحقق من سياسات RLS في Supabase.';
  }

  return report;
}

// Proxy wrapper for backward compatibility
export const supabase: any = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) {
      if (prop === 'from') {
        return (table: string) => ({
          select: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured yet.', code: 'UNCONFIGURED' } }),
          upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured yet.', code: 'UNCONFIGURED' } }),
          insert: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured yet.', code: 'UNCONFIGURED' } }),
          delete: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured yet.', code: 'UNCONFIGURED' } }),
          update: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured yet.', code: 'UNCONFIGURED' } }),
        });
      }
      if (prop === 'channel') {
        return () => ({
          on: () => ({ subscribe: () => ({}) }),
          subscribe: () => ({})
        });
      }
      if (prop === 'removeChannel') {
        return () => ({});
      }
      return undefined;
    }
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});

export const isSupabaseConfigured = Boolean(
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem(STORAGE_URL_KEY)) ||
  serverFetchedUrl
);

// Fetch credentials from the server API at runtime (recovering platform secrets)
async function fetchCredentialsWithRetry(retries = 3, delay = 1000): Promise<void> {
  try {
    const res = await fetch('/api/supabase-credentials');
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    const data = await res.json();
    const u = data.url || '';
    const k = data.anonKey || '';
    if (u && k) {
      serverFetchedUrl = u.trim();
      serverFetchedKey = k.trim();
      
      const currentUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
      const currentKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
      
      if (serverFetchedUrl && serverFetchedKey && (currentUrl !== serverFetchedUrl || currentKey !== serverFetchedKey)) {
        localStorage.setItem(STORAGE_URL_KEY, serverFetchedUrl);
        localStorage.setItem(STORAGE_KEY_KEY, serverFetchedKey);
        
        // Force re-initialize
        getSupabase();
        
        // Dispatch custom event to notify components/services to re-fetch/re-subscribe
        window.dispatchEvent(new Event('supabase-config-loaded'));
      }
    }
  } catch (err) {
    if (retries > 0) {
      console.warn(`Failed to fetch Supabase credentials. Retrying in ${delay}ms... (${retries} attempts left)`);
      setTimeout(() => {
        fetchCredentialsWithRetry(retries - 1, delay * 1.5);
      }, delay);
    } else {
      console.warn('Failed to fetch runtime Supabase credentials from server after retries:', err);
    }
  }
}

if (typeof window !== 'undefined') {
  fetchCredentialsWithRetry();
}
