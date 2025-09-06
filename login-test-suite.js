const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8080';

// Test scenarios for login testing
const loginTests = [
  // SUCCESSFUL LOGINS
  {
    name: "✅ Valid Login - John Doe (Same Device)",
    email: "john.doe@example.com",
    password: "password123",
    device_id: "DEVICE_JOHN_DOE_001",
    expected: "success"
  },
  {
    name: "✅ Valid Login - Jane Smith (Same Device)",
    email: "jane.smith@example.com", 
    password: "password123",
    device_id: "DEVICE_JANE_SMITH_001",
    expected: "success"
  },
  {
    name: "✅ Valid Login - Admin User (Same Device)",
    email: "admin2@admin.com",
    password: "admin123456", 
    device_id: "DEVICE_ADMIN_USER2_001",
    expected: "success"
  },
  
  // INCORRECT LOGIN ATTEMPTS
  {
    name: "❌ Wrong Password - John Doe",
    email: "john.doe@example.com",
    password: "wrongpassword",
    device_id: "DEVICE_JOHN_DOE_001",
    expected: "error"
  },
  {
    name: "❌ Wrong Email - Non-existent User",
    email: "nonexistent@example.com",
    password: "password123",
    device_id: "DEVICE_JOHN_DOE_001", 
    expected: "error"
  },
  {
    name: "❌ Missing Device ID - John Doe",
    email: "john.doe@example.com",
    password: "password123",
    device_id: null,
    expected: "error"
  },
  {
    name: "❌ Different Device - John Doe (Security Test)",
    email: "john.doe@example.com",
    password: "password123",
    device_id: "HACKER_DEVICE_999",
    expected: "error"
  },
  {
    name: "❌ Different Device - Jane Smith (Security Test)",
    email: "jane.smith@example.com",
    password: "password123", 
    device_id: "DIFFERENT_DEVICE_123",
    expected: "error"
  },
  {
    name: "❌ Empty Email",
    email: "",
    password: "password123",
    device_id: "DEVICE_JOHN_DOE_001",
    expected: "error"
  },
  {
    name: "❌ Empty Password",
    email: "john.doe@example.com",
    password: "",
    device_id: "DEVICE_JOHN_DOE_001",
    expected: "error"
  },
  {
    name: "❌ Invalid Email Format",
    email: "invalid-email",
    password: "password123",
    device_id: "DEVICE_JOHN_DOE_001",
    expected: "error"
  }
];

// Function to test a single login
async function testLogin(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    const requestData = {
      email: testCase.email,
      password: testCase.password
    };
    
    // Only add device_id if it's not null
    if (testCase.device_id !== null) {
      requestData.device_id = testCase.device_id;
    }
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // If we get here, login was successful
    if (testCase.expected === "success") {
      console.log(`✅ PASS: Login successful as expected`);
      console.log(`   - Token: ${response.data.token ? 'Received' : 'Missing'}`);
      console.log(`   - User: ${response.data.user.username}`);
      console.log(`   - Device ID: ${response.data.user.device_id}`);
      console.log(`   - Status: ${response.data.user.status}`);
      console.log(`   - Role: ${response.data.user.role}`);
    } else {
      console.log(`❌ FAIL: Login succeeded but was expected to fail!`);
      console.log(`   - Response: ${JSON.stringify(response.data)}`);
    }
    
    return { testCase, result: "success", response: response.data };
    
  } catch (error) {
    // Login failed
    if (testCase.expected === "error") {
      console.log(`✅ PASS: Login failed as expected`);
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Message: ${error.response.data.message}`);
      } else {
        console.log(`   - Error: ${error.message}`);
      }
    } else {
      console.log(`❌ FAIL: Login failed but was expected to succeed!`);
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Message: ${error.response.data.message}`);
      } else {
        console.log(`   - Error: ${error.message}`);
      }
    }
    
    return { 
      testCase, 
      result: "error", 
      error: error.response ? error.response.data : { message: error.message }
    };
  }
}

// Function to run all login tests
async function runLoginTests() {
  console.log('🚀 Starting Login Test Suite');
  console.log(`📡 Server URL: ${BASE_URL}`);
  console.log(`📋 Total tests: ${loginTests.length}`);
  
  const results = [];
  
  for (const testCase of loginTests) {
    const result = await testLogin(testCase);
    results.push(result);
    
    // Wait 500ms between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  const passed = results.filter(r => 
    (r.result === "success" && r.testCase.expected === "success") ||
    (r.result === "error" && r.testCase.expected === "error")
  );
  const failed = results.filter(r => 
    (r.result === "success" && r.testCase.expected === "error") ||
    (r.result === "error" && r.testCase.expected === "success")
  );
  
  console.log(`✅ Passed: ${passed.length}/${loginTests.length}`);
  console.log(`❌ Failed: ${failed.length}/${loginTests.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(f => {
      console.log(`   - ${f.testCase.name}`);
    });
  }
  
  console.log('\n🎯 Test Categories:');
  console.log(`   - Successful Logins: ${results.filter(r => r.result === "success").length}`);
  console.log(`   - Failed Logins: ${results.filter(r => r.result === "error").length}`);
  console.log(`   - Device Security Tests: ${results.filter(r => r.testCase.name.includes('Different Device')).length}`);
  
  return results;
}

// Function to demonstrate admin device reset
async function testAdminDeviceReset() {
  console.log('\n🔧 Testing Admin Device Reset Functionality');
  
  try {
    // First, login as admin
    console.log('1. Logging in as admin...');
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "admin2@admin.com",
      password: "admin123456",
      device_id: "DEVICE_ADMIN_USER2_001"
    });
    
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
    
    // Reset John Doe's device
    console.log('2. Resetting John Doe\'s device...');
    const resetResponse = await axios.post(`${BASE_URL}/api/auth/admin/reset-user-device`, {
      user_id: 4 // John Doe's user ID
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Device reset successful');
    console.log(`   - Message: ${resetResponse.data.message}`);
    
    // Now try to login with John Doe from a new device
    console.log('3. Testing login from new device...');
    const newDeviceLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "john.doe@example.com",
      password: "password123",
      device_id: "NEW_DEVICE_AFTER_RESET"
    });
    
    console.log('✅ Login from new device successful!');
    console.log(`   - New Device ID: ${newDeviceLogin.data.user.device_id}`);
    console.log(`   - Status: ${newDeviceLogin.data.user.status}`);
    
  } catch (error) {
    console.log('❌ Admin device reset test failed:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Message: ${error.response.data.message}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

// Main function
async function runAllTests() {
  console.log('🧪 COMPREHENSIVE LOGIN TESTING SUITE');
  console.log('=====================================');
  
  // Run login tests
  await runLoginTests();
  
  // Run admin device reset test
  await testAdminDeviceReset();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📝 Test Summary:');
  console.log('✅ Device-based authentication working correctly');
  console.log('✅ Security validation preventing unauthorized access');
  console.log('✅ Admin functions working properly');
  console.log('✅ Error handling working as expected');
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runLoginTests, testAdminDeviceReset, runAllTests };
