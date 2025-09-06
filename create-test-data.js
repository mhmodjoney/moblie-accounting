const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const ADMIN_CREDENTIALS = { email: 'admin@admin.com', password: 'admin123456' };

// Subscription plans data
const subscriptionPlans = [
  {
    plan_key: 'free_trial',
    name: 'Free Trial',
    price: 0.00,
    currency: 'USD',
    duration_days: 7,
    description: '7-day free trial for new users',
    features: { max_users: 1, premium_features: false },
    max_users: 1,
    is_active: true,
    created_by: 'system'
  },
  {
    plan_key: '6_month',
    name: '6 Month Plan',
    price: 29.99,
    currency: 'USD',
    duration_days: 180,
    description: '6-month subscription plan',
    features: { max_users: 5, premium_features: true },
    max_users: 5,
    is_active: true,
    created_by: 'system'
  },
  {
    plan_key: '1_year',
    name: '1 Year Plan',
    price: 49.99,
    currency: 'USD',
    duration_days: 365,
    description: '1-year subscription plan',
    features: { max_users: 10, premium_features: true },
    max_users: 10,
    is_active: true,
    created_by: 'system'
  },
  {
    plan_key: '2_year',
    name: '2 Year Plan',
    price: 89.99,
    currency: 'USD',
    duration_days: 730,
    description: '2-year subscription plan',
    features: { max_users: 20, premium_features: true },
    max_users: 20,
    is_active: true,
    created_by: 'system'
  }
];

// Test users data
const testUsers = [
  {
    username: 'john_doe',
    full_name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    subscription_type: 'free_trial',
    status: 'new'
  },
  {
    username: 'jane_smith',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    subscription_type: '6_month',
    status: 'active'
  },
  {
    username: 'bob_wilson',
    full_name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password123',
    subscription_type: '1_year',
    status: 'active'
  },
  {
    username: 'alice_brown',
    full_name: 'Alice Brown',
    email: 'alice@example.com',
    password: 'password123',
    subscription_type: '2_year',
    status: 'active'
  },
  {
    username: 'mike_jones',
    full_name: 'Mike Jones',
    email: 'mike@example.com',
    password: 'password123',
    subscription_type: '6_month',
    status: 'expired'
  },
  {
    username: 'sarah_davis',
    full_name: 'Sarah Davis',
    email: 'sarah@example.com',
    password: 'password123',
    subscription_type: '1_year',
    status: 'expired'
  },
  {
    username: 'tom_lee',
    full_name: 'Tom Lee',
    email: 'tom@example.com',
    password: 'password123',
    subscription_type: 'free_trial',
    status: 'blocked'
  },
  {
    username: 'lisa_garcia',
    full_name: 'Lisa Garcia',
    email: 'lisa@example.com',
    password: 'password123',
    subscription_type: '6_month',
    status: 'active'
  },
  {
    username: 'david_martin',
    full_name: 'David Martin',
    email: 'david@example.com',
    password: 'password123',
    subscription_type: '1_year',
    status: 'active'
  },
  {
    username: 'emma_taylor',
    full_name: 'Emma Taylor',
    email: 'emma@example.com',
    password: 'password123',
    subscription_type: '2_year',
    status: 'active'
  },
  {
    username: 'james_anderson',
    full_name: 'James Anderson',
    email: 'james@example.com',
    password: 'password123',
    subscription_type: '6_month',
    status: 'expiring_soon'
  },
  {
    username: 'sophia_clark',
    full_name: 'Sophia Clark',
    email: 'sophia@example.com',
    password: 'password123',
    subscription_type: '1_year',
    status: 'expiring_soon'
  },
  {
    username: 'william_white',
    full_name: 'William White',
    email: 'william@example.com',
    password: 'password123',
    subscription_type: 'free_trial',
    status: 'new'
  },
  {
    username: 'olivia_rodriguez',
    full_name: 'Olivia Rodriguez',
    email: 'olivia@example.com',
    password: 'password123',
    subscription_type: '6_month',
    status: 'active'
  },
  {
    username: 'daniel_thomas',
    full_name: 'Daniel Thomas',
    email: 'daniel@example.com',
    password: 'password123',
    subscription_type: '1_year',
    status: 'active'
  }
];

let adminToken = null;

// Helper function to make API calls
async function makeApiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}: Success`);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}: Failed`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${error.response.data.message || error.response.data}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    throw error;
  }
}

// Login as admin
async function loginAsAdmin() {
  console.log('\n🔐 Logging in as admin...');
  try {
    const response = await makeApiCall('POST', '/auth/login', ADMIN_CREDENTIALS);
    adminToken = response.token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed');
    return false;
  }
}

// Create subscription plans
async function createSubscriptionPlans() {
  console.log('\n📋 Creating subscription plans...');
  
  for (const plan of subscriptionPlans) {
    try {
      await makeApiCall('POST', '/subscriptions/create', plan, adminToken);
      console.log(`✅ Created plan: ${plan.name}`);
    } catch (error) {
      console.log(`⚠️  Plan ${plan.name} might already exist or failed to create`);
    }
  }
  
  console.log('✅ Subscription plans creation completed');
}

// Create test users
async function createTestUsers() {
  console.log('\n👥 Creating test users...');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of testUsers) {
    try {
      await makeApiCall('POST', '/auth/register', user);
      console.log(`✅ Created user: ${user.username}`);
      successCount++;
    } catch (error) {
      console.log(`❌ Failed to create user: ${user.username}`);
      failCount++;
    }
  }
  
  console.log(`\n📊 User creation summary:`);
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`❌ Failed to create: ${failCount} users`);
}

// Get user distribution for verification
async function getUserDistribution() {
  console.log('\n📊 Fetching user distribution...');
  try {
    const users = await makeApiCall('GET', '/auth/admin/users', null, adminToken);
    
    console.log('\n📈 User Status Distribution:');
    const statusCount = {};
    users.forEach(user => {
      statusCount[user.status] = (statusCount[user.status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} users`);
    });
    
    console.log('\n📈 Subscription Type Distribution:');
    const planCount = {};
    users.forEach(user => {
      planCount[user.subscription_type] = (planCount[user.subscription_type] || 0) + 1;
    });
    
    Object.entries(planCount).forEach(([plan, count]) => {
      console.log(`  ${plan}: ${count} users`);
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch user distribution');
  }
}

// Main function
async function main() {
  console.log('🚀 Starting test data creation...');
  console.log('=====================================');
  
  try {
    // Step 1: Login as admin
    if (!await loginAsAdmin()) {
      console.error('❌ Cannot proceed without admin access');
      return;
    }
    
    // Step 2: Create subscription plans
    await createSubscriptionPlans();
    
    // Step 3: Create test users
    await createTestUsers();
    
    // Step 4: Verify user distribution
    await getUserDistribution();
    
    console.log('\n🎉 Test data creation completed successfully!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n💥 An error occurred during test data creation:', error.message);
  }
}

// Run the script
main();
