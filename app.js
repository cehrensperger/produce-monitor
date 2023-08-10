require('dotenv').config();

const http = require('http');
const hostname = process.env.IP_ADDRESS;
const port = process.env.PORT;
let numPosts = 0;

const server = http.createServer((req, res) => {
    console.log(req.method);
    if(req.method == 'POST') {
        numPosts ++;
    }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain')
  res.end(numPosts.toString());
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});