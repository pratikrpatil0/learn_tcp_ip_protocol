http = require('http');
http.get('http://localhost:3001/api/code?type=sender&version=10', (res) => {
   let body = '';
   res.on('data', chunk => body += chunk);
   res.on('end', () => console.log(body.substring(0, 1000)));
});
