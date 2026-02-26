console.log('Node.js is working!');

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({message: 'Server is working!'}));
});

server.listen(5000, () => {
  console.log('✅ Test server running on http://localhost:5000');
});