import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT;
const map = new Map();

app.use(bodyParser.json());

app.use(express.static('./vite-project/dist/'));

app.post('/', (req, res) => {
    if(req.body.itemId == undefined || req.body.itemPercent == undefined) {
      res.status(400).json({
        message: "Invalid Data"
      });
    } else {
      map.set(req.body.itemId, req.body.itemPercent);
      console.log(map.entries());
      console.log(io.emit('update', {itemId: req.body.itemId, itemPercent:req.body.itemPercent}));
    }

    res.status(200).json({
        message: "Success"
      });
});

// app.listen(port, process.env.IP_ADDRESS, () => {
//   console.log(`Example app listening on port ${port}`);
// });

server.listen(port, process.env.IP_ADDRESS, () => {
  console.log('listening on *:3000');
});