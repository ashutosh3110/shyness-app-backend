const http = require('http');

function testAdminLogin() {
  const postData = JSON.stringify({
    email: 'admin@shynessapp.com',
    password: 'admin123456'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
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
        if (res.statusCode === 200) {
          console.log('✅ Admin login successful!');
          console.log('Admin role:', response.data.admin.role);
          console.log('Token:', response.data.token);
        } else {
          console.log('❌ Admin login failed:', response.message);
          console.log('Status Code:', res.statusCode);
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

testAdminLogin();

