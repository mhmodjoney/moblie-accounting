const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8080';
const API_ENDPOINT = `${BASE_URL}/api/auth/register`;

// Test users to create
const testUsers = [
  {
    username: 'john_doe',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    subscription_type: 'free_trial',
    role: 'user'
  },
  {
    username: 'jane_smith',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    subscription_type: '1_month',
    role: 'user'
  },
  {
    username: 'bob_wilson',
    full_name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    password: 'password123',
    subscription_type: '3_month',
    role: 'user'
  },
  {
    username: 'alice_brown',
    full_name: 'Alice Brown',
    email: 'alice.brown@example.com',
    password: 'password123',
    subscription_type: '6_month',
    role: 'user'
  },
  {
    username: 'admin_user',
    full_name: 'Admin User',
    email: 'admin@admin.com',
    password: 'admin123456',
    subscription_type: 'lifetime',
    role: 'admin'
  },
  {
    username: 'test_user',
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    subscription_type: 'free_trial',
    role: 'user'
  }
];

// Function to register a single user
async function registerUser(userData) {
  try {
    console.log(`\n🔄 Registering user: ${userData.username} (${userData.email})`);
    
    const response = await axios.post(API_ENDPOINT, userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`✅ Success: ${userData.username} registered successfully`);
    console.log(`   - User ID: ${response.data.user.id}`);
    console.log(`   - Role: ${response.data.user.role}`);
    console.log(`   - Status: ${response.data.user.status}`);
    console.log(`   - Subscription: ${response.data.user.subscription_type}`);
    console.log(`   - Subscription End: ${response.data.user.subscription_end}`);
    
    return response.data;
  } catch (error) {
    console.log(`❌ Error registering ${userData.username}:`);
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Message: ${error.response.data.message}`);
    } else if (error.request) {
      console.log(`   - Network Error: Could not connect to server`);
      console.log(`   - Make sure the server is running on ${BASE_URL}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
    return null;
  }
}

// Function to test login for a user
async function testLogin(email, password, device_id) {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
      device_id
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Login successful for ${email}`);
    console.log(`   - Token received: ${response.data.token ? 'Yes' : 'No'}`);
    console.log(`   - Device ID: ${response.data.user.device_id}`);
    console.log(`   - Status: ${response.data.user.status}`);
    
    return response.data;
  } catch (error) {
    console.log(`❌ Login failed for ${email}:`);
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Message: ${error.response.data.message}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
    return null;
  }
}

// Main function to create all users
async function createTestUsers() {
  console.log('🚀 Starting user creation process...');
  console.log(`📡 Server URL: ${BASE_URL}`);
  console.log(`📋 Total users to create: ${testUsers.length}`);
  
  const results = [];
  
  for (const user of testUsers) {
    const result = await registerUser(user);
    results.push({ user, result });
    
    // Wait 1 second between registrations to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Registration Summary:');
  const successful = results.filter(r => r.result !== null);
  const failed = results.filter(r => r.result === null);
  
  console.log(`✅ Successful: ${successful.length}/${testUsers.length}`);
  console.log(`❌ Failed: ${failed.length}/${testUsers.length}`);
  
  if (successful.length > 0) {
    console.log('\n🔐 Testing login for successful registrations...');
    
    for (const { user, result } of successful) {
      const device_id = `DEVICE_${user.username.toUpperCase()}_001`;
      await testLogin(user.email, user.password, device_id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🎉 User creation process completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Use the Postman collection to test the API endpoints');
  console.log('2. Try logging in with different device IDs to test device security');
  console.log('3. Use admin credentials to manage users');
  
  return results;
}

// Run the script
if (require.main === module) {
  createTestUsers().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createTestUsers, registerUser, testLogin };