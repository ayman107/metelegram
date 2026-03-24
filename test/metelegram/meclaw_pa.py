import os
import requests
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes

TELEGRAM_TOKEN = "8745888552:AAHEgmVc0qZzhpabnaiwmOjFFwE80CCi3XA"
GEMINI_KEY = "AIzaSyD97wJQGCXlahh7exzFVNhvnQIjed4Nz3I"
OWNER_ID = 201003487776
ALLOWED_USERS = [OWNER_ID, 8296767829]

def get_available_model():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_KEY}"
    try:
        response = requests.get(url)
        models = response.json().get('models', [])
        for m in models:
            if "generateContent" in m.get('supportedGenerationMethods', []):
                return m['name']
        return "models/gemini-1.5-flash"
    except:
        return "models/gemini-1.5-flash"

ACTIVE_MODEL = get_available_model()

def get_gemini_response(prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/{ACTIVE_MODEL}:generateContent?key={GEMINI_KEY}"
    headers = {'Content-Type': 'application/json'}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()
        if 'candidates' in data:
            return data['candidates'][0]['content']['parts'][0]['text']
        return f"⚠️ رد غير متوقع: {str(data)}"
    except Exception as e:
        return f"❌ خطأ تقني: {str(e)}"

async def send_long_message(update, text):
    if not text: return
    for i in range(0, len(text), 4000):
        await update.message.reply_text(text[i:i+4000])

async def handle_commands(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ALLOWED_USERS:
        return

    text = update.message.text
    response_text = get_gemini_response(text)
    await send_long_message(update, response_text)

if __name__ == "__main__":
    print(f"🚀 MeClaw V3.5 Online on PythonAnywhere...")
    print(f"📡 Using Model: {ACTIVE_MODEL}")
    
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_commands))
    app.run_polling()
