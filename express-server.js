import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/', (req, res) => {
    console.log(req.body[0]);
    res.status(200).json({
        message: "Success"
      });
});

app.listen(port, process.env.IP_ADDRESS, () => {
  console.log(`Example app listening on port ${port}`);
});