const http = require('http');

function testAdminToken() {
  // First login to get token
  const loginData = JSON.stringify({
    email: 'admin@shynessapp.com',
    password: 'admin123456'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (res.statusCode === 200) {
          const token = response.data.token;
          console.log('✅ Login successful, token:', token);
          
          // Now test dashboard overview with token
          testDashboardOverview(token);
        } else {
          console.log('❌ Login failed:', response.message);
        }
      } catch (error) {
        console.log('❌ Error parsing login response:', error.message);
      }
    });
  });

  loginReq.on('error', (error) => {
    console.log('❌ Login request error:', error.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testDashboardOverview(token) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard/overview',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Status Code:', res.statusCode);
        console.log('Dashboard Overview Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Dashboard overview successful!');
        } else {
          console.log('❌ Dashboard overview failed:', response.message);
        }
      } catch (error) {
        console.log('❌ Error parsing dashboard response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Dashboard request error:', error.message);
  });

  req.end();
}

testAdminToken();

