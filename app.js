const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const { ProductModel } = require("./application/model/Product");

// Load Env
require("dotenv").config();

// Connect Database
require("./application/db")();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");
    return res.status(200).json({});
  }
  next();
});

// Create Product
app.post("/api/product", async (req, res, next) => {
  try {
    const { data } = req.body;
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];

      let obj = {};
      for (const key in curr) {
        obj[key] = curr[key];
      }
      obj["_id"] = new mongoose.Types.ObjectId();

      await new ProductModel(obj).save();
    }

    return res.json({
      message: "Product Created Successfully",
    });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

// Get Product
app.get("/api/product/:productID", async (req, res, next) => {
  try {
    const productID = req.params.productID;

    let where = {};
    if (productID != "-" && mongoose.isValidObjectId(productID)) {
      where["_id"] = productID;
    }

    const product = await ProductModel.find(where).exec();

    return res.json({
      message: "Products",
      data: product,
    });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

let channel, connection;

const connect = async (key) => {
  const amqpServer = process.env.AMQP_URL;
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();

  await channel.assertQueue(key);
};

// Order
app.post("/api/order", async (req, res, next) => {
  try {
    const { data } = req.body;
    await connect("ORDER");

    channel.sendToQueue("ORDER", Buffer.from(JSON.stringify(data)));
    console.log("[Order Send to queue]");

    return res.json({
      message: "Order Created Successfully",
    });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

const port = process.env.PORT || 8080;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Product Server Listen on ${port}`);
});
