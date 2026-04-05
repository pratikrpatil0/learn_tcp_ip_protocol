const http = require('http');
http.get('http://localhost:3000/grad-presentation', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode >= 400) {
      console.log('HTTP ERROR:', res.statusCode);
      console.log(data.slice(0, 1000));
    } else {
      console.log('SUCCESS!');
    }
  });
}).on('error', err => console.log('REQ ERROR:', err.message));
