// Simple Browser Test Script
// Browser console में paste करें और run करें

console.log('🔍 Simple Admin Login Test...');

// Test admin login API
fetch('http://localhost:5000/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@shynessapp.com',
    password: 'admin123456'
  })
})
.then(response => {
  console.log('📊 Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('📊 Response Data:', data);
  
  if (data.success) {
    console.log('✅ Admin login successful!');
    console.log('🔑 Token:', data.data.token);
    console.log('👤 Admin:', data.data.admin);
    
    // Store in localStorage
    localStorage.setItem('adminToken', data.data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
    
    console.log('💾 Data stored in localStorage');
    console.log('🔍 Stored token:', localStorage.getItem('adminToken'));
    console.log('🔍 Stored admin:', localStorage.getItem('adminUser'));
  } else {
    console.log('❌ Admin login failed:', data.message);
  }
})
.catch(error => {
  console.log('❌ Error:', error);
});

