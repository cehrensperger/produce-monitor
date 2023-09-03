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
const idToNameMap = new Map();
const client = new pg.Client(
  {ssl: { rejectUnauthorized: false }}
);

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('./vite-project/dist/'));

await client.connect();
console.log("Connected to database");
const tables = await client.query('SELECT FROM pg_catalog.pg_tables WHERE schemaname = \'public\' AND tablename = \'produce\'');
if(tables.rows.length == 0) {
  console.log('Creating new table.');
  const res = await client.query('CREATE TABLE produce (id int primary key, name varchar(20));');
  console.log(res.rows);
} else {
  console.log('Table already exists, skipping table creation.');
}

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

app.post('/nameMapping', (req, res) => {
  if(req.body.itemId == undefine || req.body.itemName == undefined) {
    res.status(400).json({
      message: "Invalid Data"
    });
  } else {
    idToNameMap.set(req.body.itemId, req.body.itemName);
  }
});

app.get('/nameMapping', (req, res) => {
  if(req.body.itemId == undefined) {
    res.status(400).json({
      message: "Invalid Data"
    });
  } else {
    res.send(idToNameMap.get(req.body.itemId));
  }
});

app.get('/allNames', async (req, res) => {
  // return all id to name mappings
  const dbResponse = await client.query('SELECT p FROM produce p');
  const allNames = dbResponse.rows; 
  res.json(allNames);   //JSON-ify?
});

app.get('/allPercents', (req, res) => {
  // return all id to percent mappings
  res.send(idToNameMap);   // JSON-ify?
})

// app.listen(port, process.env.IP_ADDRESS, () => {
//   console.log(`Example app listening on port ${port}`);
// });

server.listen(port, process.env.IP_ADDRESS, () => {
  console.log('listening on *:3000');
});

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

// request(app)
//   .get('/allNmes')
//   .expect((res) => {
//     console.log(res);
//   });