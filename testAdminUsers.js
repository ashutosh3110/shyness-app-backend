const axios = require('axios');
require('dotenv').config({ path: '../config.env' });

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const testAdminUsers = async () => {
  try {
    // Step 1: Admin Login to get a token
    console.log('Attempting admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
      email: 'admin@shynessapp.com',
      password: 'admin123456'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful, token:', token);

      // Step 2: Use the token to access the protected admin users API
      console.log('Attempting to fetch admin users...');
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Users API Status Code:', usersResponse.status);
      console.log('Users API Response:', JSON.stringify(usersResponse.data, null, 2));

      if (usersResponse.data.success) {
        console.log('✅ Users API successful!');
        console.log('Total users found:', usersResponse.data.data.users.length);
      } else {
        console.log('❌ Users API failed:', usersResponse.data.message);
      }
    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Error during admin users test:', error.response?.data || error.message);
  }
};

testAdminUsers();
