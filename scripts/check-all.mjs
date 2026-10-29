#!/usr/bin/env node
import { execSync } from 'child_process';
import http from 'http';

console.log('================================================================');
console.log('       FREIGHTIQ UNIFIED SYSTEM VERIFICATION (CHECK:ALL)       ');
console.log('================================================================\n');

const results = [];

function runStep(name, cmd) {
  process.stdout.write(`[*] Checking: ${name}... `);
  try {
    const out = execSync(cmd, { stdio: 'pipe' });
    console.log('✅ PASS');
    results.push({ test: name, status: 'PASS', details: 'Completed with code 0' });
    return true;
  } catch (err) {
    console.log('❌ FAIL');
    const msg = err.stderr ? err.stderr.toString().slice(0, 150) : err.message;
    results.push({ test: name, status: 'FAIL', details: msg.replace(/\n/g, ' ') });
    return false;
  }
}

async function checkHttp(name, url, expectedStatus = 200) {
  process.stdout.write(`[*] Healthcheck: ${name} (${url})... `);
  return new Promise((resolve) => {
    http.get(url, (res) => {
      if (res.statusCode === expectedStatus) {
        console.log('✅ PASS');
        results.push({ test: name, status: 'PASS', details: `HTTP ${res.statusCode}` });
        resolve(true);
      } else {
        console.log(`❌ FAIL (Status ${res.statusCode})`);
        results.push({ test: name, status: 'FAIL', details: `Unexpected status: ${res.statusCode}` });
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ FAIL (${err.message})`);
      results.push({ test: name, status: 'FAIL', details: err.message });
      resolve(false);
    });
  });
}

async function main() {
  // 1. Static and Env Checks
  runStep('Environment Integrity', 'node scripts/check-env.mjs');
  runStep('Frontend TypeScript (tsc --noEmit)', 'npx tsc --noEmit');
  runStep('Node Gateway TypeScript (tsc --noEmit)', 'cd backend-node && npx tsc --noEmit');
  runStep('Production Frontend Build (vite build)', 'npm run build');

  // 2. Healthchecks
  await checkHttp('Node Gateway Healthcheck', 'http://localhost:3001/health');
  await checkHttp('FastAPI ML Healthcheck', 'http://localhost:8000/ml/health');
  await checkHttp('Frontend Client Availability', 'http://localhost:3000/');

  // 3. Automated Backend Tests
  runStep('Pytest API & Security Suite (10 tests)', 'pytest -v tests/test_api_endpoints.py');

  // 4. End-to-End Playwright Responsive Suite
  runStep('Playwright 4-Viewport E2E Tests (1600, 1280, 768, 390)', 'node tests/test_e2e_playwright.mjs');

  // Print Summary Table
  console.log('\n================================================================');
  console.log('                    OVERALL SYSTEM TEST TABLE                   ');
  console.log('================================================================');
  console.log('| Step / Verification Scope                         | Status | Details');
  console.log('|---------------------------------------------------|--------|-----------------------------');
  for (const r of results) {
    const padName = r.test.padEnd(51, ' ');
    const padStatus = (r.status === 'PASS' ? '✅ PASS' : '❌ FAIL').padEnd(6, ' ');
    console.log(`| ${padName} | ${padStatus} | ${r.details}`);
  }
  console.log('================================================================');

  const failed = results.filter(r => r.status === 'FAIL');
  if (failed.length > 0) {
    console.error(`\n❌ SYSTEM CHECK COMPLETED WITH ${failed.length} FAILURE(S).`);
    process.exit(1);
  } else {
    console.log('\n🎉 ALL SYSTEM CHECKS AND SECURITY TESTS PASSED 100%! READY FOR PRODUCTION.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Check:all fatal error:', err);
  process.exit(1);
});
