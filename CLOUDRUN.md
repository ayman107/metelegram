# 🐾 Ayman107 Bot - Firebase Cloud Edition

![Bot Status](https://img.shields.io/badge/Status-Cloud_Ready-brightgreen?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Firebase_Functions_v2-orange?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-Cloud_Firestore-blue?style=for-the-badge)

Your personal AI agent is fully prepared to take over the cloud! 🚀

## 🌟 Key Features
- **24/7 Availability**: Running on Firebase Serverless Functions.
- **Bot Handle**: ayman107_bot
- **Persistent Memory**: Uses Google Cloud Firestore for long-term user history.
- **One-Click Webhooks**: Automated configuration script.

## 🛠️ Deployment Steps (Automated)

I have already pre-configured everything. To finalize and get your link, please follow these 3 quick commands:

### 1. Account Link
Connect your environment to your Firebase account:
```powershell
npx firebase login
```

### 2. Project Selection
If you have multiple projects, link this folder to your target one:
```powershell
npx firebase use --add
```

### 3. One-Click Launch 🚀
Roll out the code and the database configuration:
```powershell
npm run deploy
```

## 📡 Webhook Setup
Once the deployment finishes, run this command to tell Telegram where your server is:
```powershell
npm run set-webhook
```

---

## 🔗 Potential Dashboard Links
- **Telegram Bot**: [https://t.me/ayman107_bot](https://t.me/ayman107_bot)
- **Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)

**Note**: To operate for free while accessing external LLMs (Groq), make sure your Firebase project is on the **Blaze** plan. The first 2 million calls are free!
