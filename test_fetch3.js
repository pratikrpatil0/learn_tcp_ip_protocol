http = require('http');
http.get('http://localhost:3001/api/code?version=2&type=sender', (res) => {
   console.log('v2 status:', res.statusCode);
});
http.get('http://localhost:3001/api/code?version=10&type=sender', (res) => {
   console.log('v10 status:', res.statusCode);
});
