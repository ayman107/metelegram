import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function setWebhook() {
  if (!TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
  }

  console.log('🔍 Fetching Firebase function URL...');
  try {
    // Try without --format json just in case the version is old
    const listOutput = execSync('npx firebase functions:list').toString();
    console.log('📡 Output from firebase functions:list:\n' + listOutput);
    
    // Find URL using regex (matches https://... .a.run.app or similar)
    const urlMatch = listOutput.match(/https:\/\/\S+/);

    if (!urlMatch) {
      console.error('❌ Error: Could not find any function URL. Have you deployed yet?');
      process.exit(1);
    }

    const URL = urlMatch[0];
    console.log(`🚀 Found URL: ${URL}`);
    console.log('📡 Setting Telegram Webhook...');

    const response = await axios.post(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
      url: URL
    });

    if (response.data.ok) {
      console.log('✅ Success! Webhook has been set.');
      console.log(`🔗 Interface: https://t.me/ayman107_bot`);
    } else {
      console.error('❌ Failed to set webhook:', response.data.description);
    }
  } catch (error) {
    console.error('❌ Error while setting webhook:', error.message);
    console.log('\n💡 Hint: You can manually set the webhook by visiting:');
    console.log(`https://api.telegram.org/bot${TOKEN}/setWebhook?url=<YOUR_FUNCTION_URL>`);
  }
}

setWebhook();
