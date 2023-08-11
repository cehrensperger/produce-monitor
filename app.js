import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
const hostname = process.env.IP_ADDRESS;
const port = process.env.PORT;

let numPosts = 0;
let data = 0;
const map = new Map();

const server = http.createServer((req, res) => {
    console.log(req.method);
    
    if(req.method == 'POST') {
        res.setHeader('Content-Type', 'text/html');
        let postedData = '';
        numPosts ++;
        req.on('data', (data) => {
            postedData += data;
        })

        req.on('end', () => {
            try {
                console.log(postedData);
                let array = Object.entries(JSON.parse(postedData));
                let key = array[0][0];
                let value = array[0][1];
                array[0] = key;
                array[1] = value;
                console.log(array);
                let responseMessage = "Mapping was set";

                if(Array.isArray(array)) {
                    if(array.length == 2) {
                        res.statusCode = 200;
                        map.set(array[0], array[1]);
                        
                    } else {
                        res.statusCode = 400;
                        responseMessage = "Received array was not of length 2.";
                    } 
                } else {
                    res.statusCode = 400;
                    responseMessage = "Received data was not an array.";
                }

                res.setHeader('Content-Length', responseMessage.length); // Adjust the content length based on response length
                res.end(responseMessage);
            } catch (error) {
                res.statusCode = 400;
                res.end("Error parsing JSON data");
            }
            
            
         });
    } else if(req.method === 'GET'){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(numPosts.toString());
    }
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});