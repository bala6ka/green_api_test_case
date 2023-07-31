# Test Case for Green Api

## Description

This project consists of two microservices that interact with each other through a RabbitMQ message broker. M1 acts as the frontend service, receiving incoming HTTP POST requests and forwarding the data to M2 for further processing. M2 serves as the backend service, processing tasks asynchronously and sending the results back to M1. The application integrates with a Telegram bot for logging and notifications.

## How to Use

1. Create a Telegram bot using the BotFather bot: [BotFather](https://t.me/BotFather)
2. Add the created bot to a public channel with necessary permissions.
3. Obtain the Telegram bot token and channel ID.
4. Create a `.env` file and set the following variables:
   ```
   TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
   TELEGRAM_GROUP_ID=YOUR_TELEGRAM_GROUP_ID
   ```
5. Install Docker on your system.
6. Run the application using the following command:
   ```bash
   docker-compose up -d --build
   ```
7. Send a POST request to the M1 service at `http://localhost:3000` with your data to initiate task processing.
8. Monitor the logs and notifications in the specified Telegram group to track the progress of the tasks.

## Dependencies

- Node.js
- Docker
- RabbitMQ
- Telegram Bot (created using BotFather)

The project demonstrates effective communication between microservices using RabbitMQ as a message broker. It provides a practical example of building a scalable and decoupled architecture using Docker containers and RabbitMQ messaging for seamless task processing.
