import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
dotenv.config();

const app = express();
const port = process.env.PORT;
const map = new Map();

app.use(bodyParser.json());

app.use(express.static('./vite-project/dist/'));

app.post('/', (req, res) => {
    if(req.body.itemID == undefined || req.body.itemPercent == undefined) {
      res.status(400).json({
        message: "Invalid Data"
      });
    } else {
      map.set(req.body.itemID, req.body.itemPercent);
      console.log(map.entries());
    }

    res.status(200).json({
        message: "Success"
      });
});

app.listen(port, process.env.IP_ADDRESS, () => {
  console.log(`Example app listening on port ${port}`);
});