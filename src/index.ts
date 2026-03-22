import { createServer } from "http";
import { webhookCallback } from "grammy";
import { bot } from "./bot.js";

const port = Number(process.env.PORT) || 8080;

// Create a standard HTTP server that handles the Telegram Webhook
const server = createServer(webhookCallback(bot, "http"));

server.listen(port, () => {
  console.log(`🚀 Bot is listening on port ${port}`);
});
