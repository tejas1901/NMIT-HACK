import assert from 'node:assert';

const BASE_URL = 'http://localhost:3001';

async function testElevationSuite() {
  console.log('--- STARTING ADMIN ELEVATION TEST SUITE ---');

  // 1. Calling Admin route directly with customer demo / no elevation token -> Expect 403
  console.log('[Test 1] Customer session calling /api/admin/audit-logs without elevation token...');
  const res1 = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: {
      'x-demo-role': 'customer',
    },
  });
  console.log(`  Status: ${res1.status}`);
  assert.strictEqual(res1.status, 403, 'Should return 403 Forbidden without elevation token');
  const body1 = await res1.json();
  assert.strictEqual(body1.code, 'FORBIDDEN_ELEVATION_REQUIRED');
  console.log('  PASSED: 403 returned with FORBIDDEN_ELEVATION_REQUIRED.');

  // 2. Wrong admin password -> Expect 401 with generic "Incorrect password"
  console.log('[Test 2] Elevating with incorrect password...');
  const res2 = await fetch(`${BASE_URL}/api/auth/admin-elevate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'WrongPassword123!', userId: 'test-user' }),
  });
  console.log(`  Status: ${res2.status}`);
  assert.strictEqual(res2.status, 401, 'Should return 401 Unauthorized for wrong password');
  const body2 = await res2.json();
  assert.strictEqual(body2.error, 'Incorrect password');
  console.log('  PASSED: 401 returned with generic error message.');

  // 3. Elevating with correct admin password
  console.log('[Test 3] Elevating with correct admin password...');
  const res3 = await fetch(`${BASE_URL}/api/auth/admin-elevate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: '1234567890', userId: 'rajathgowda' }),
  });
  console.log(`  Status: ${res3.status}`);
  assert.strictEqual(res3.status, 200, 'Should return 200 OK for valid password');
  const body3 = await res3.json();
  assert.ok(body3.token, 'Should return an elevation JWT token');
  assert.strictEqual(body3.success, true);
  const elevationToken = body3.token;
  console.log(`  PASSED: Elevation token received: ${elevationToken.substring(0, 20)}...`);

  // 4. Calling Admin route with valid elevation token -> Expect 200
  console.log('[Test 4] Calling /api/admin/audit-logs with valid elevation token...');
  const res4 = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: {
      'x-admin-token': elevationToken,
    },
  });
  console.log(`  Status: ${res4.status}`);
  assert.strictEqual(res4.status, 200, 'Should allow admin access with valid elevation token');
  const body4 = await res4.json();
  assert.ok(Array.isArray(body4.data) || body4.success, 'Returned admin data payload');
  console.log('  PASSED: 200 OK with admin payload.');

  // 5. Token refresh behavior via /api/auth/admin-verify
  console.log('[Test 5] Calling /api/auth/admin-verify to extend active elevation token...');
  const res5 = await fetch(`${BASE_URL}/api/auth/admin-verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': elevationToken,
    },
  });
  console.log(`  Status: ${res5.status}`);
  assert.strictEqual(res5.status, 200, 'Should refresh elevation token successfully');
  const body5 = await res5.json();
  assert.strictEqual(body5.elevated, true);
  assert.ok(body5.token, 'Should return extended token');
  console.log('  PASSED: Elevation token successfully refreshed on activity.');

  // 6. Expired / forged token verification
  console.log('[Test 6] Calling /api/admin/audit-logs with forged/invalid token...');
  const res6 = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: {
      'x-admin-token': 'invalid.jwt.token',
    },
  });
  console.log(`  Status: ${res6.status}`);
  assert.strictEqual(res6.status, 403, 'Should reject forged token with 403');
  console.log('  PASSED: Invalid/forged token properly rejected.');

  console.log('--- ALL ELEVATION TESTS PASSED SUCCESSFULLY! ---');
}

testElevationSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
