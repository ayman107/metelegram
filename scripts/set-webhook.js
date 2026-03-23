import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function setWebhook() {
  if (!TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
  }

  // Get Vercel URL from argument or environment
  let webhookUrl = process.argv[2] || process.env.VERCEL_URL;
  
  if (!webhookUrl) {
    console.error('❌ Error: Please provide your Vercel URL as an argument.');
    console.log('Usage: node scripts/set-webhook.js https://your-app.vercel.app');
    process.exit(1);
  }

  // Ensure it ends with /webhook
  if (!webhookUrl.endsWith('/webhook')) {
    webhookUrl = webhookUrl.replace(/\/$/, '') + '/webhook';
  }

  console.log(`📡 Setting Telegram Webhook to: ${webhookUrl}`);

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TOKEN}/setWebhook`,
      { url: webhookUrl }
    );

    if (response.data.ok) {
      console.log('✅ Success! Webhook has been set.');
      console.log(`🔗 Bot: https://t.me/ayman107_bot`);
    } else {
      console.error('❌ Failed to set webhook:', response.data.description);
    }
  } catch (error) {
    console.error('❌ Error while setting webhook:', error.message);
  }
}

setWebhook();
