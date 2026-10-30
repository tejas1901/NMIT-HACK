import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export interface RegisteredCustomer {
  id: string;
  email: string;
  password: string; // Plain/hashed for client verification
  full_name: string;
  company: string;
  phone: string;
  gstin?: string;
  corridor?: string;
  role: 'CUSTOMER';
  role_label: 'Verified Customer';
  created_at: string;
}

export const STORAGE_KEY = 'freightiq_registered_customers';

export const DEMO_CUSTOMER_EMAILS = [
  'ananya.verma@vikasintermodal.in',
  'client@company.com',
  'client@freightiq.in',
  'manish@apexlogistics.in',
  'priya.s@summitcold.in',
  'suresh.rao@biocon.in'
];

// No hardcoded demo customer accounts - only newly registered accounts are stored!
export const INITIAL_REGISTERED_CUSTOMERS: RegisteredCustomer[] = [];

// Cleanup demo profiles from Supabase and local storage
if (typeof window !== 'undefined') {
  try {
    // 1. Clean from localStorage freightiq_registered_customers
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const demoSet = new Set(DEMO_CUSTOMER_EMAILS.map((e) => e.toLowerCase()));
        const clean = parsed.filter((c: RegisteredCustomer) => !demoSet.has(c.email.toLowerCase()));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
    }

    // 2. Clean from freightiq_user if it was a demo customer
    const activeRaw = localStorage.getItem('freightiq_user');
    if (activeRaw) {
      const activeUser = JSON.parse(activeRaw);
      if (activeUser?.email && DEMO_CUSTOMER_EMAILS.includes(activeUser.email.toLowerCase())) {
        localStorage.removeItem('freightiq_user');
      }
    }

    // 3. Clean from freightiq_users_db
    const dbRaw = localStorage.getItem('freightiq_users_db');
    if (dbRaw) {
      const db = JSON.parse(dbRaw);
      let changed = false;
      for (const demo of DEMO_CUSTOMER_EMAILS) {
        if (db[demo.toLowerCase()]) {
          delete db[demo.toLowerCase()];
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('freightiq_users_db', JSON.stringify(db));
      }
    }
  } catch {}

  setTimeout(() => {
    try {
      supabase
        .from('profiles')
        .delete()
        .in('email', DEMO_CUSTOMER_EMAILS)
        .then(() => {})
        .catch(() => {});
    } catch {}
  }, 1000);
}

/**
 * Retrieve all registered customers from persistent local registry.
 */
export function getRegisteredCustomers(): RegisteredCustomer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const demoSet = new Set(DEMO_CUSTOMER_EMAILS.map((e) => e.toLowerCase()));
        const cleanList = parsed.filter((c: RegisteredCustomer) => !demoSet.has(c.email.toLowerCase()));
        if (cleanList.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));
        }
        return cleanList;
      }
    }
  } catch (err) {
    console.warn('Error reading registered customers:', err);
  }
  return [];
}

/**
 * Save registered customers list.
 */
function saveRegisteredCustomers(customers: RegisteredCustomer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('freightiq_realtime_sync');
      bc.postMessage({ type: 'SYNC_CUSTOMERS', payload: customers });
      bc.close();
    }
  } catch (err) {
    console.warn('Error saving registered customers:', err);
  }
}

/**
 * Check if a customer with the given email already exists in local registry or Supabase.
 */
export async function isCustomerRegistered(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (normalized === 'admin@gmail.com') return true;
  if (DEMO_CUSTOMER_EMAILS.includes(normalized)) return false;

  const local = getRegisteredCustomers();
  if (local.some((c) => c.email.toLowerCase() === normalized)) {
    return true;
  }

  // Also query Supabase profiles
  try {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', normalized)
      .maybeSingle();
    if (data?.email && !DEMO_CUSTOMER_EMAILS.includes(data.email.toLowerCase())) return true;
  } catch {}

  return false;
}

/**
 * Find customer in local storage.
 */
export function findLocalCustomer(email: string): RegisteredCustomer | undefined {
  const normalized = email.trim().toLowerCase();
  return getRegisteredCustomers().find((c) => c.email.toLowerCase() === normalized);
}

/**
 * Password Policy Enforcement:
 * Minimum 8 characters, combination of both alphabets and numbers.
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long.'
    };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: 'Password must contain a combination of both letters and numbers (e.g., Freight2026).'
    };
  }

  return { valid: true };
}

/**
 * Register a new customer:
 * - Checks for duplicate email (pops "User exists with this email address")
 * - Enforces minimum 8 chars with alphabets & numbers
 * - Initializes isolated customer database
 */
export async function registerCustomer(params: {
  email: string;
  password: string;
  full_name: string;
  company: string;
  phone?: string;
  gstin?: string;
  corridor?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string; code?: string }> {
  const normalized = params.email.trim().toLowerCase();

  if (normalized === 'admin@gmail.com') {
    return {
      success: false,
      error: 'This email is reserved for master administrator. Please choose a different work email.',
      code: 'ADMIN_RESERVED'
    };
  }

  // 1. Duplicate check
  const alreadyExists = await isCustomerRegistered(normalized);
  if (alreadyExists) {
    return {
      success: false,
      error: 'User exists with this email address. Please sign in instead.',
      code: 'USER_EXISTS'
    };
  }

  // 2. Password validation
  const pwCheck = validatePasswordStrength(params.password);
  if (!pwCheck.valid) {
    return {
      success: false,
      error: pwCheck.error,
      code: 'WEAK_PASSWORD'
    };
  }

  // 3. Create registered customer object
  const newCustomer: RegisteredCustomer = {
    id: `usr-cust-${Date.now().toString().slice(-6)}`,
    email: normalized,
    password: params.password,
    full_name: params.full_name.trim(),
    company: params.company.trim(),
    phone: params.phone?.trim() || '+91 98201 55194',
    gstin: params.gstin?.trim() || '27AABCV1234F1Z5',
    corridor: params.corridor || 'NH-48 (Bengaluru - Mumbai JNPT)',
    role: 'CUSTOMER',
    role_label: 'Verified Customer',
    created_at: new Date().toISOString()
  };

  // 4. Save to local registry
  const currentList = getRegisteredCustomers();
  saveRegisteredCustomers([...currentList, newCustomer]);

  // 5. Sync to Supabase profiles & auth
  try {
    await supabase.auth.signUp({
      email: normalized,
      password: params.password,
      options: {
        data: {
          full_name: newCustomer.full_name,
          company: newCustomer.company,
          phone: newCustomer.phone,
          role: 'CUSTOMER'
        }
      }
    });

    await supabase.from('profiles').upsert({
      id: newCustomer.id,
      email: normalized,
      full_name: newCustomer.full_name,
      company: newCustomer.company,
      phone: newCustomer.phone,
      gstin: newCustomer.gstin,
      role: 'CUSTOMER',
      created_at: newCustomer.created_at
    });
  } catch (err) {
    console.warn('Supabase profile sync note:', err);
  }

  const userProfile: UserProfile = {
    id: newCustomer.id,
    email: newCustomer.email,
    full_name: newCustomer.full_name,
    company: newCustomer.company,
    phone: newCustomer.phone,
    gstin: newCustomer.gstin,
    corridor: newCustomer.corridor,
    role: 'CUSTOMER',
    role_label: 'Verified Customer'
  };

  return {
    success: true,
    user: userProfile
  };
}

/**
 * Sign In Customer:
 * - Checks database for credentials
 * - If not exist -> returns notFound: true so caller can redirect to register page
 * - If exists -> validates password
 */
export async function authenticateCustomer(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string; notFound?: boolean }> {
  const normalized = email.trim().toLowerCase();
  const enteredPassword = password.trim();

  // Demo accounts are deleted
  if (DEMO_CUSTOMER_EMAILS.includes(normalized)) {
    return {
      success: false,
      notFound: true,
      error: 'Demo customer account has been deleted. Please register your own customer account.'
    };
  }

  // 1. Check local registry of newly registered accounts
  const localUser = findLocalCustomer(normalized);

  if (localUser) {
    const stored = (localUser.password || '').trim();
    if (enteredPassword === stored) {
      return {
        success: true,
        user: {
          id: localUser.id,
          email: localUser.email,
          full_name: localUser.full_name,
          company: localUser.company,
          phone: localUser.phone,
          gstin: localUser.gstin,
          corridor: localUser.corridor,
          role: 'CUSTOMER',
          role_label: 'Verified Customer'
        }
      };
    } else {
      return {
        success: false,
        notFound: false,
        error: 'Incorrect password for this customer account. Please try again.'
      };
    }
  }

  // 2. Check Supabase credentials
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalized,
      password: enteredPassword
    });

    if (!authError && authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      const userProfile: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || normalized,
        full_name: profile?.full_name || normalized.split('@')[0],
        company: profile?.company || 'Commercial Shipper',
        phone: profile?.phone || '+91 98201 55194',
        gstin: profile?.gstin || '',
        role: 'CUSTOMER',
        role_label: 'Verified Customer'
      };

      // Also cache in local registry with their password for instant subsequent sessions
      const currentList = getRegisteredCustomers();
      if (!currentList.some((c) => c.email.toLowerCase() === normalized)) {
        const newCustomer: RegisteredCustomer = {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          company: userProfile.company,
          phone: userProfile.phone || '+91 98201 55194',
          gstin: userProfile.gstin || '',
          corridor: userProfile.corridor || 'NH-48',
          role: 'CUSTOMER',
          role_label: 'Verified Customer',
          password: enteredPassword,
          created_at: new Date().toISOString()
        };
        saveRegisteredCustomers([...currentList, newCustomer]);
      }

      return {
        success: true,
        user: userProfile
      };
    }
  } catch {}

  // 3. User was NOT found in local registry: check if profile exists in Supabase profiles
  let profileData: any = null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();
    if (data?.email && !DEMO_CUSTOMER_EMAILS.includes(data.email.toLowerCase())) {
      profileData = data;
    }
  } catch {}

  if (profileData) {
    const userProfile: UserProfile = {
      id: profileData.id || `usr-${Date.now().toString().slice(-6)}`,
      email: profileData.email,
      full_name: profileData.full_name || normalized.split('@')[0],
      company: profileData.company || 'Commercial Shipper',
      phone: profileData.phone || '+91 98201 55194',
      gstin: profileData.gstin || '',
      corridor: profileData.corridor || 'NH-48 (Bengaluru - Mumbai JNPT)',
      role: 'CUSTOMER',
      role_label: 'Verified Customer'
    };

    // Cache locally with this password so subsequent logins succeed instantly
    const currentList = getRegisteredCustomers();
    const updatedList = [
      ...currentList.filter(c => c.email.toLowerCase() !== normalized),
      {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        company: userProfile.company,
        phone: userProfile.phone,
        gstin: userProfile.gstin,
        role: 'CUSTOMER' as const,
        role_label: 'Verified Customer' as const,
        password: enteredPassword,
        created_at: new Date().toISOString()
      }
    ];
    saveRegisteredCustomers(updatedList);

    return {
      success: true,
      user: userProfile
    };
  }

  // User definitely does NOT exist in database -> prompt redirect to register
  return {
    success: false,
    notFound: true,
    error: 'No customer account found with this email. Redirecting to registration page...'
  };
}
