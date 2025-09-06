const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8080';
const API_ENDPOINT = `${BASE_URL}/api/auth/register`;

// Additional test users to create (fixing the issues)
const additionalUsers = [
  {
    username: 'admin_user2',
    full_name: 'Admin User 2',
    email: 'admin2@admin.com',
    password: 'admin123456',
    subscription_type: 'lifetime',
    role: 'admin'
  },
  {
    username: 'test_user2',
    full_name: 'Test User 2',
    email: 'test2@example.com',
    password: 'test123456', // Fixed: 8+ characters
    subscription_type: 'free_trial',
    role: 'user'
  },
  {
    username: 'premium_user',
    full_name: 'Premium User',
    email: 'premium@example.com',
    password: 'premium123',
    subscription_type: '1_year',
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
      timeout: 10000
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

// Function to test device security (try different device)
async function testDeviceSecurity(email, password, original_device, new_device) {
  try {
    console.log(`\n🔒 Testing device security for: ${email}`);
    console.log(`   - Trying to login with different device: ${new_device}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
      device_id: new_device
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`❌ Security breach! Login should have been blocked!`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log(`✅ Device security working! Login blocked from different device`);
      console.log(`   - Message: ${error.response.data.message}`);
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
    }
    return null;
  }
}

// Main function
async function createAdditionalUsers() {
  console.log('🚀 Creating additional test users...');
  
  const results = [];
  
  for (const user of additionalUsers) {
    const result = await registerUser(user);
    results.push({ user, result });
    
    // Wait 1 second between registrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Additional Registration Summary:');
  const successful = results.filter(r => r.result !== null);
  const failed = results.filter(r => r.result === null);
  
  console.log(`✅ Successful: ${successful.length}/${additionalUsers.length}`);
  console.log(`❌ Failed: ${failed.length}/${additionalUsers.length}`);
  
  if (successful.length > 0) {
    console.log('\n🔐 Testing login for new users...');
    
    for (const { user, result } of successful) {
      const device_id = `DEVICE_${user.username.toUpperCase()}_001`;
      await testLogin(user.email, user.password, device_id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test device security with one user
    if (successful.length > 0) {
      const firstUser = successful[0].user;
      await testDeviceSecurity(
        firstUser.email, 
        firstUser.password, 
        `DEVICE_${firstUser.username.toUpperCase()}_001`,
        `HACKER_DEVICE_999`
      );
    }
  }
  
  console.log('\n🎉 Additional user creation completed!');
  
  return results;
}

// Run the script
if (require.main === module) {
  createAdditionalUsers().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createAdditionalUsers };
