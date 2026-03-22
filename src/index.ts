import { createServer } from "http";
import { webhookCallback } from "grammy";
import { bot } from "./bot.js";
import { onRequest } from "firebase-functions/v2/https";

const port = Number(process.env.PORT) || 8080;

// 🚀 Firebase Functions Export (for Cloud Deployment)
export const aymanBot = onRequest({
  region: "us-central1",
  memory: "256MiB",
  timeoutSeconds: 60
}, webhookCallback(bot, "https"));

// 💻 Standard Server (for Local/Render Hosting)
// Only runs if NOT in a Cloud Function environment
if (!process.env.K_SERVICE && !process.env.FUNCTIONS_EMULATOR) {
    const server = createServer(webhookCallback(bot, "http"));
    server.listen(port, () => {
        console.log(`🚀 Bot is listening on port ${port}`);
    });
}

