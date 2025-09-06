const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

// Admin user data
const adminUser = {
  username: 'admin',
  full_name: 'System Administrator',
  email: 'admin@admin.com',
  password: 'admin123456',
  subscription_type: 'free_trial',
  role: 'admin'
};

async function createAdmin() {
  console.log('🔐 Creating admin user...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123456');
    console.log('Role: admin');
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.message.includes('already exists')) {
      console.log('✅ Admin user already exists!');
    } else {
      console.error('❌ Failed to create admin user:', error.response?.data?.message || error.message);
    }
  }
}

createAdmin();
