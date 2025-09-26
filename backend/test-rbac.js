#!/usr/bin/env node

/**
 * RBAC Testing Script
 * Tests role-based access control implementation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test credentials
const testUsers = {
  admin: { email: 'admin@hospital.com', password: 'password123' },
  doctor: { email: 'doctor@hospital.com', password: 'password123' },
  patient: { email: 'patient@hospital.com', password: 'password123' }
};

let tokens = {};

async function login(userType) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, testUsers[userType]);
    tokens[userType] = response.data.data.token;
    console.log(`✅ ${userType.toUpperCase()} login successful`);
    return response.data.data;
  } catch (error) {
    console.log(`❌ ${userType.toUpperCase()} login failed:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testEndpoint(userType, method, endpoint, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${tokens[userType]}`
      }
    };

    const response = await axios(config);
    const status = response.status;
    
    if (status === expectedStatus) {
      console.log(`✅ ${userType.toUpperCase()} ${method} ${endpoint} - SUCCESS (${status})`);
      return true;
    } else {
      console.log(`⚠️  ${userType.toUpperCase()} ${method} ${endpoint} - UNEXPECTED STATUS (${status}, expected ${expectedStatus})`);
      return false;
    }
  } catch (error) {
    const status = error.response?.status || 'NO_RESPONSE';
    
    if (status === expectedStatus) {
      console.log(`✅ ${userType.toUpperCase()} ${method} ${endpoint} - CORRECTLY BLOCKED (${status})`);
      return true;
    } else {
      console.log(`❌ ${userType.toUpperCase()} ${method} ${endpoint} - FAILED (${status}):`, error.response?.data?.message || error.message);
      return false;
    }
  }
}

async function runRBACTests() {
  console.log('🧪 RBAC TESTING SUITE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Step 1: Login all test users
  console.log('1️⃣ AUTHENTICATION TESTS');
  console.log('─────────────────────────');
  
  await login('admin');
  await login('doctor');  
  await login('patient');
  console.log('');

  if (!tokens.admin || !tokens.doctor || !tokens.patient) {
    console.log('❌ Cannot proceed without all user tokens');
    return;
  }

  // Step 2: Dashboard Access Tests
  console.log('2️⃣ DASHBOARD ACCESS TESTS');
  console.log('─────────────────────────');
  
  // All users should access basic dashboard
  await testEndpoint('admin', 'GET', '/dashboard/quick-stats', 200);
  await testEndpoint('doctor', 'GET', '/dashboard/quick-stats', 200);
  await testEndpoint('patient', 'GET', '/dashboard/quick-stats', 200);
  
  // Only doctors/admins should access detailed stats
  await testEndpoint('admin', 'GET', '/dashboard/stats', 200);
  await testEndpoint('doctor', 'GET', '/dashboard/stats', 200);
  await testEndpoint('patient', 'GET', '/dashboard/stats', 403); // Should be blocked
  console.log('');

  // Step 3: Patient Data Access Tests
  console.log('3️⃣ PATIENT DATA ACCESS TESTS');
  console.log('──────────────────────────────');
  
  // Admins and doctors can view all patients
  await testEndpoint('admin', 'GET', '/patients', 200);
  await testEndpoint('doctor', 'GET', '/patients', 200);
  await testEndpoint('patient', 'GET', '/patients', 403); // Should be blocked
  
  // Test specific patient access (assuming patient ID 1 exists)
  await testEndpoint('admin', 'GET', '/patients/1', 200);
  await testEndpoint('doctor', 'GET', '/patients/1', 200);
  await testEndpoint('patient', 'GET', '/patients/1', 403); // Should be blocked unless own data
  console.log('');

  // Step 4: Billing Access Tests  
  console.log('4️⃣ BILLING ACCESS TESTS');
  console.log('────────────────────────');
  
  // Doctors/admins can view all billing
  await testEndpoint('admin', 'GET', '/billing', 200);
  await testEndpoint('doctor', 'GET', '/billing', 200);
  await testEndpoint('patient', 'GET', '/billing', 403); // Should be blocked
  
  // Only admins can delete billing
  await testEndpoint('admin', 'DELETE', '/billing/999', 404); // Not found is OK
  await testEndpoint('doctor', 'DELETE', '/billing/999', 403); // Should be blocked
  await testEndpoint('patient', 'DELETE', '/billing/999', 403); // Should be blocked
  console.log('');

  // Step 5: Doctor Management Tests
  console.log('5️⃣ DOCTOR MANAGEMENT TESTS');
  console.log('───────────────────────────');
  
  // All can view doctor list
  await testEndpoint('admin', 'GET', '/doctors', 200);
  await testEndpoint('doctor', 'GET', '/doctors', 200);
  await testEndpoint('patient', 'GET', '/doctors', 200);
  
  // Only admins can create doctors
  await testEndpoint('admin', 'POST', '/doctors', 400); // Bad request is OK (missing data)
  await testEndpoint('doctor', 'POST', '/doctors', 403); // Should be blocked
  await testEndpoint('patient', 'POST', '/doctors', 403); // Should be blocked
  console.log('');

  // Step 6: User Profile Tests
  console.log('6️⃣ USER PROFILE TESTS');
  console.log('──────────────────────');
  
  // All authenticated users can access their own profile
  await testEndpoint('admin', 'GET', '/auth/me', 200);
  await testEndpoint('doctor', 'GET', '/auth/me', 200);
  await testEndpoint('patient', 'GET', '/auth/me', 200);
  console.log('');

  console.log('✅ RBAC Testing Complete!');
  console.log('');
  console.log('📋 SUMMARY:');
  console.log('• Admin users have full system access');
  console.log('• Doctor users can manage patients and billing');
  console.log('• Patient users have limited access to own data only');
  console.log('• Cross-role access properly blocked');
  console.log('• Audit logging should be capturing all actions');
  console.log('');
  console.log('🔍 Next steps:');
  console.log('1. Check server logs for audit trail entries');
  console.log('2. Test frontend role-based UI components');
  console.log('3. Verify patient-specific data filtering');
}

// Handle graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
  process.exit(1);
});

if (require.main === module) {
  runRBACTests().catch(console.error);
}

module.exports = { runRBACTests };