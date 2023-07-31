const amqp = require("amqplib");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const AMQP_URL = "amqp://rabbitmq:5672";
const RESULT_QUEUE = "result_queue";

async function processTask(data) {
  sendLog("M2: Processing task: " + JSON.stringify(data));
  await new Promise((resolve) => setTimeout(resolve, 3000));
  sendLog(
    "M2: Task processed successfully: " +
      JSON.stringify({ result: "Processed task successfully", data })
  );
  return { result: "Processed task successfully", data };
}

async function startMicroservice() {
  try {
    const conn = await amqp.connect(AMQP_URL);
    const channel = await conn.createChannel();
    const queue = "task_queue";
    const resultQueue = RESULT_QUEUE; // Use the constant instead of hardcoding the queue name

    await channel.assertQueue(queue, { durable: true });
    await channel.prefetch(1);

    channel.consume(queue, async (msg) => {
      const data = JSON.parse(msg.content.toString());

      sendLog("M2: Received task: " + JSON.stringify(data));

      const result = await processTask(data);

      await channel.assertQueue(resultQueue, { durable: true });
      await channel.sendToQueue(
        resultQueue,
        Buffer.from(JSON.stringify(result)),
        { persistent: true }
      );

      sendLog("M2: Processed task: " + JSON.stringify(result));

      channel.ack(msg);
    });
  } catch (err) {
    console.error("M2: Error processing task:", err);
  }
}

async function initializeMicroservice() {
  try {
    await startMicroservice(); // Wait for the microservice to start before sending the log
    sendLog("M2: Service has been started");
  } catch (err) {
    console.error("M2: Error initializing microservice:", err);
  }
}

async function sendLog(message) {
  try {
    await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        params: {
          chat_id: `${process.env.TELEGRAM_GROUP_ID}`,
          text: message,
        },
      }
    );
  } catch (e) {
    console.error(`Telegram: ${JSON.stringify(e)}`);
  }
}

initializeMicroservice();
