// A simple test to see if we can post to the express server.

import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// IP address and port of the server that is hosting the React website and 
// processing idToPercentMap and idToNameMap requests.
const hostname = process.env.IP_ADDRESS;
const port = process.env.PORT;

let numRetries = 0;
let maxRetries = 1;

// Test data
let data = {
    "itemId": 3,
    "itemPercent": 20
};


// Post the test data to the server every 5 seconds.
postData();

function postData() {

    console.log("fetching");

    // Post the data to the server (hosted on the same machine that hosts the React website)
    // The server is listening on port 3000, and the endpoint is '/'
    // When it receives the POST request, provided that the data is valid, it will update its
    // internal idToPercentMap with the new data and emit a websocket event to all connected clients
    // so that anyone viewing the React website will see the new data immediately.
    fetch("http://" + hostname + ":" + port, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((res) => {
        return res.json();
    }).then((data) => {
        console.log(data);
    }).catch(error => {
        console.log(error);
    }).finally(() => {
        setTimeout(postData, 5000);
    });
}