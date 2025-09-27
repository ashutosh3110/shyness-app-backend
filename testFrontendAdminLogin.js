const http = require('http');

function testFrontendAdminLogin() {
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
        console.log('Status Code:', res.statusCode);
        console.log('Response Headers:', res.headers);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Admin login successful!');
          console.log('Token:', response.data?.token);
          console.log('Admin:', response.data?.admin);
        } else {
          console.log('❌ Admin login failed:', response.message);
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

testFrontendAdminLogin();