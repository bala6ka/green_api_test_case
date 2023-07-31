const amqp = require("amqplib");
const dotenv = require("dotenv");
const axios = require("axios");
const http = require("http");

dotenv.config();

const AMQP_URL = "amqp://rabbitmq:5672";
const RESULT_QUEUE = "result_queue";

async function sendTaskToQueue(data) {
  try {
    const conn = await amqp.connect(AMQP_URL);
    const channel = await conn.createChannel();
    const queue = "task_queue";
    const task = JSON.stringify(data);

    await channel.assertQueue(queue, { durable: true });
    await channel.sendToQueue(queue, Buffer.from(task), { persistent: true });

    sendLog("M1: Request received and sent to RabbitMQ: " + JSON.stringify(data));
  } catch (err) {
    console.log("M1: Error sending task to RabbitMQ:", err);
  }
}

async function receiveResultFromM2() {
  try {
    const conn = await amqp.connect(AMQP_URL);
    const channel = await conn.createChannel();

    await channel.assertQueue(RESULT_QUEUE, { durable: true });

    channel.consume(RESULT_QUEUE, (msg) => {
      const result = JSON.parse(msg.content.toString());
      sendLog("M1: Received result from M2: " + JSON.stringify(result.data));
    }, {
      noAck: true,
    });
  } catch (err) {
    console.error("M1: Error receiving result from M2:", err);
  }
}

async function handleRequest(req, res) {
  let body = [];

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", async () => {
    body = Buffer.concat(body).toString();

    const requestData = {
      url: req.url,
      method: req.method,
      data: [body],
    };

    sendTaskToQueue(requestData.data);

    res.writeHead(202, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "M1: Request received",
      })
    );
  });
}

async function startServer() {
  const PORT = 3000;

  const server = http.createServer(handleRequest);

  try {
    await receiveResultFromM2();
    server.listen(PORT, () => {
      sendLog("M1: Service has been started");
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("M1: Error starting server:", err);
  }
}

async function sendLog(message) {
  try {
    await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      params: {
        chat_id: `${process.env.TELEGRAM_GROUP_ID}`,
        text: message,
      },
    });
  } catch (e) {
    console.error(`Telegram: ${JSON.stringify(e)}`);
  }
}

startServer();
