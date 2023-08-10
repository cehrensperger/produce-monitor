require('dotenv').config();

const hostname = process.env.IP_ADDRESS;
const port = process.env.PORT;

let data = 5;



setTimeout(postData, 5000);

function postData() {
    fetch("http://" + hostname + ":" + port, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    setTimeout(postData, 5000);
}