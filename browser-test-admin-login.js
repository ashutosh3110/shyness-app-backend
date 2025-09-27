// Browser में run करने के लिए script
// Browser console में paste करें और run करें

console.log('🔍 Testing Admin Login...');

// Test 1: Check if admin login API is accessible
async function testAdminLoginAPI() {
  try {
    console.log('📡 Testing admin login API...');
    
    const response = await fetch('http://localhost:5000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@shynessapp.com',
        password: 'admin123456'
      })
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', response.headers);
    
    const data = await response.json();
    console.log('📊 Response Data:', data);
    
    if (response.ok) {
      console.log('✅ Admin login API working!');
      console.log('🔑 Token:', data.data?.token);
      console.log('👤 Admin:', data.data?.admin);
      
      // Test token storage
      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
      
      console.log('💾 Token stored in localStorage');
      console.log('🔍 Stored token:', localStorage.getItem('adminToken'));
      console.log('🔍 Stored admin:', localStorage.getItem('adminUser'));
      
      return data;
    } else {
      console.log('❌ Admin login API failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Admin login API error:', error);
    return null;
  }
}

// Test 2: Check if admin dashboard API is accessible
async function testAdminDashboardAPI(token) {
  try {
    console.log('📡 Testing admin dashboard API...');
    
    const response = await fetch('http://localhost:5000/api/admin/dashboard/overview', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Dashboard Response Status:', response.status);
    
    const data = await response.json();
    console.log('📊 Dashboard Response Data:', data);
    
    if (response.ok) {
      console.log('✅ Admin dashboard API working!');
      return data;
    } else {
      console.log('❌ Admin dashboard API failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Admin dashboard API error:', error);
    return null;
  }
}

// Test 3: Check localStorage
function testLocalStorage() {
  console.log('🔍 Testing localStorage...');
  
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  console.log('🔑 Admin Token:', adminToken);
  console.log('👤 Admin User:', adminUser);
  
  if (adminToken && adminUser) {
    console.log('✅ Admin data found in localStorage');
    return true;
  } else {
    console.log('❌ Admin data not found in localStorage');
    return false;
  }
}

// Test 4: Check current URL and route
function testCurrentRoute() {
  console.log('🔍 Testing current route...');
  
  console.log('📍 Current URL:', window.location.href);
  console.log('📍 Current Pathname:', window.location.pathname);
  
  if (window.location.pathname === '/admin/login') {
    console.log('✅ On admin login page');
  } else if (window.location.pathname === '/admin/dashboard') {
    console.log('✅ On admin dashboard page');
  } else {
    console.log('❌ Not on admin page:', window.location.pathname);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Admin Login Tests...');
  console.log('=====================================');
  
  // Test current route
  testCurrentRoute();
  console.log('-------------------------------------');
  
  // Test localStorage
  testLocalStorage();
  console.log('-------------------------------------');
  
  // Test admin login API
  const loginResult = await testAdminLoginAPI();
  console.log('-------------------------------------');
  
  if (loginResult) {
    // Test admin dashboard API
    await testAdminDashboardAPI(loginResult.data.token);
    console.log('-------------------------------------');
  }
  
  // Test localStorage again
  testLocalStorage();
  console.log('-------------------------------------');
  
  console.log('🏁 Tests completed!');
}

// Run tests
runAllTests();

