import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const hostname = process.env.IP_ADDRESS;
const port = process.env.PORT;

let numRetries = 0;
let maxRetries = 1;

let data = ["bananas", 5];



postData(true);

function postData(retry) {

    if(!retry) {
        numRetries ++;
    } else {
        numRetries = 0;
    }

    if(numRetries > maxRetries) {
        return;
    }

    console.log("fetching");
    fetch("http://" + hostname + ":" + port, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((res) => {
        res.text().then((text) => {
            console.log(text);
        });
    }).catch(error => {
        console.log(error);
        postData(false);
    }).finally(() => {
        if(retry && numRetries <= maxRetries) {
            setTimeout(postData, 5000, true);
        }
    });
}