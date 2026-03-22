import { Bot } from "grammy";
import { config } from "./config.js";
import { processUserMessage } from "./agent.js";

if (!config.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is required.");
}

export const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
    const userId = ctx.from?.id.toString();
    if (!userId) return;
    
    if (config.ALLOWED_USERS.length > 0 && !config.ALLOWED_USERS.includes(userId)) {
        return await ctx.reply("❌ Unauthorized access. You are not on the whitelist.");
    }
    
    await ctx.reply("🚀 **Ayman107 Bot** is online!\r\n\r\nI'm now running on **Cloud Hosting** for 24/7 availability.\r\nHow can I help you today?");
});

bot.command("status", async (ctx) => {
    await ctx.reply(`✅ **Bot Status**\nName: ayman107_bot\nMode: Webhooks (Firebase)\nEnvironment: Production\nMemory: Firestore`);
});

bot.on("message:text", async (ctx) => {
    const userId = ctx.from?.id.toString();
    if (!userId) return;
    
    if (config.ALLOWED_USERS.length > 0 && !config.ALLOWED_USERS.includes(userId)) {
        console.log(`Unauthorized message attempt from ${userId}`);
        return await ctx.reply("Unauthorized access.");
    }
    
    await ctx.replyWithChatAction("typing");
    
    try {
        const response = await processUserMessage(userId, ctx.message.text);
        await ctx.reply(response);
    } catch (error: any) {
        console.error("Bot error:", error);
        await ctx.reply(`Error processing message: ${error.message}`);
    }
});

bot.catch((err) => {
    console.error("Error while handling update:", err.error);
});
