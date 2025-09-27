const axios = require('axios');
require('dotenv').config({ path: '../config.env' });

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const testAdminOverview = async () => {
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

      // Step 2: Use the token to access the protected admin overview API
      console.log('Attempting to fetch admin overview...');
      const overviewResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/overview`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Overview API Status Code:', overviewResponse.status);
      console.log('Overview API Response:', JSON.stringify(overviewResponse.data, null, 2));

      if (overviewResponse.data.success) {
        console.log('✅ Overview API successful!');
        const stats = overviewResponse.data.data.stats;
        console.log('📊 Stats:', {
          totalUsers: stats.totalUsers,
          totalVideos: stats.totalVideos,
          totalTopics: stats.totalTopics,
          totalRewards: stats.totalRewards,
          pendingVideos: stats.pendingVideos,
          validVideos: stats.validVideos,
          invalidVideos: stats.invalidVideos
        });
      } else {
        console.log('❌ Overview API failed:', overviewResponse.data.message);
      }
    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Error during admin overview test:', error.response?.data || error.message);
  }
};

testAdminOverview();
