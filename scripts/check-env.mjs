#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

console.log('=====================================================');
console.log('   FREIGHTIQ PLATFORM ENVIRONMENT INTEGRITY CHECK');
console.log('=====================================================\n');

const REQUIRED_VARS = [
  { key: 'SUPABASE_URL', desc: 'Supabase Cloud URL', validate: (v) => v.startsWith('http') },
  { key: 'SUPABASE_ANON_KEY', desc: 'Supabase Anonymous / Publishable Key', validate: (v) => v.length > 10 },
  { key: 'ADMIN_PASSWORD_HASH', desc: 'Bcrypt Hash for Admin Elevation', validate: (v) => v.startsWith('$2') },
  { key: 'ADMIN_JWT_SECRET', desc: 'Secret for Admin elevation JWT', validate: (v) => v.length >= 16 },
  { key: 'USD_INR_RATE', desc: 'USD to INR Currency Conversion Constant', validate: (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 },
];

const OPTIONAL_VARS = [
  { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase Service Role Key (for background admin sync)' },
  { key: 'QPIAI_API_KEY', desc: 'QpiAI QCloud API Key (falls back to local statevector simulator if missing)' },
  { key: 'N8N_WEBHOOK_URL', desc: 'n8n Incident Webhook URL' },
  { key: 'N8N_WEBHOOK_SECRET', desc: 'Shared secret for n8n inbound verification' },
  { key: 'ML_SERVICE_URL', desc: 'FastAPI microservice endpoint (default http://localhost:8000)' },
  { key: 'GATEWAY_PORT', desc: 'Node Gateway Port (default 3001)' },
];

let hasErrors = false;
let missingRequired = [];

console.log('[+] Checking REQUIRED Environment Variables:');
for (const item of REQUIRED_VARS) {
  const val = process.env[item.key];
  if (!val) {
    console.error(`  ❌ MISSING: ${item.key} - ${item.desc}`);
    missingRequired.push(item.key);
    hasErrors = true;
  } else if (item.validate && !item.validate(val)) {
    console.error(`  ⚠️ INVALID: ${item.key} - Failed validation criteria`);
    hasErrors = true;
  } else {
    console.log(`  ✅ OK: ${item.key}`);
  }
}

console.log('\n[+] Checking SERVICE INTEGRATIONS & FALLBACKS:');
for (const item of OPTIONAL_VARS) {
  const val = process.env[item.key];
  if (!val) {
    console.log(`  ℹ️  OPTIONAL (Default / Fallback Active): ${item.key} (${item.desc})`);
  } else {
    console.log(`  ✅ CONFIGURED: ${item.key}`);
  }
}

console.log('\n-----------------------------------------------------');
if (hasErrors) {
  console.error(`❌ ENVIRONMENT CHECK FAILED! Missing: ${missingRequired.join(', ')}`);
  console.error('Please configure your .env file or copy from .env.example.');
  process.exit(1);
} else {
  console.log('✅ ALL REQUIRED ENVIRONMENT VARIABLES VERIFIED AND VALID!');
  process.exit(0);
}
