import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import pg from 'pg'
import request from 'supertest';
import readline from 'readline';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT;
const map = new Map();
const client = new pg.Client(
  {ssl: { rejectUnauthorized: false }}
);

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('./vite-project/dist/'));

map.set(0, 50);
map.set(1, 50);
map.set(4, 20);
map.set(5, 75);
map.set(2, 90);
map.set(3, 5);

// Connect to the database.
await client.connect();
console.log("Connected to database");

// Check for the existence of the produce table.
const tables = await client.query('SELECT FROM pg_catalog.pg_tables WHERE schemaname = \'public\' AND tablename = \'produce\'');

// Create a new table if it doesn't exist already.
if(tables.rows.length == 0) {
  console.log('Creating new table.');
  const res = await client.query('CREATE TABLE produce (id int primary key, name varchar(20));');
  console.log(res.rows);
} else {
  console.log('Table already exists, skipping table creation.');
}

// On a post request to the root endpoint, update the *percent* map and emit a websocket event to all connected clients.
app.post('/', (req, res) => {
    if(req.body.itemId == undefined || req.body.itemPercent == undefined) {
      res.status(400).json({
        message: "Invalid Data"
      });
    } else {
      map.set(req.body.itemId, req.body.itemPercent);
      console.log(map.entries());
      let itemId = req.body.itemId;
      let itemPercent = req.body.itemPercent;
      io.emit('update', {[itemId]:itemPercent});
    }

    res.status(200).json({
        message: "Success"
      });
});

// On a post request to the /nameMapping endpoint, update the name map on the database provided that the data is valid.
app.post('/nameMapping', (req, res) => {
  if(req.body.itemId == undefined || req.body.itemName == undefined) {
    console.log("received invalid data");
    res.status(400).json({
      message: "Invalid Data"
    });
  } else {
    // Insert into database.
    console.log("inserting new mapping into db");
    console.log(req.body.itemId, req.body.itemName);
    const query = {
      text: 'INSERT INTO produce(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2;',
      values: [req.body.itemId, req.body.itemName],
    }
    client.query(query).catch(() => {
      console.log('error with querying');
    });
  }
});

// No longer used. Was used for testing purposes.
// Gets a name from an internal idToNameMap that is stored in memory. (no longer exists)
app.get('/nameMapping', (req, res) => {
  if(req.body.itemId == undefined) {
    res.status(400).json({
      message: "Invalid Data"
    });
  } else {
    //select from database
    //res.send(idToNameMap.get(req.body.itemId));
  }
});

// On a get request to the /allNames mapping, query the database for all id to name mappings and return them.
app.get('/allNames', async (req, res) => {
  // Return all id to name mappings.
  const dbResponse = await client.query('SELECT p FROM produce p');
  const allNames = dbResponse.rows; 
  console.log(allNames);
  res.json(allNames);
});

// On a get request to the /allPercents mapping, return all id to percent mappings by
// converting the internally stored map to a JSON object and returning it.
app.get('/allPercents', (req, res) => {
  // return all id to percent mappings

  const percentsJSON = {};
  map.forEach((value, key) => {
    percentsJSON[parseInt(key)] = parseInt(value);
  });

  res.json(percentsJSON);
  console.log("sending all percents: ", percentsJSON);
  
})


// Start the server and set it to listen on the port specified in the .env file.
server.listen(port, process.env.IP_ADDRESS, () => {
  console.log('listening on ' + process.env.IP_ADDRESS + ':' + port);
});

// When the server is closed, close the database connection.
server.on('close', async () => {
  console.log('closing db connection');
  try {
    await client.end();
    console.log('server closing');
  } catch (error) {
    console.error('Error closing the database connection:', error);
  }
});

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', (line) => {
  if(line.indexOf('stop') != -1) {
    server.close();
  }
});
