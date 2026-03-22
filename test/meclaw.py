import os
import requests
import pyautogui
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes

# --- الإعدادات النهائية ---
TELEGRAM_TOKEN = "8745888552:AAHEgmVc0qZzhpabnaiwmOjFFwE80CCi3XA"
GEMINI_KEY = "AIzaSyBGBmILkuJdB7wi4ODQzfZwpvrmbopEcRY"
OWNER_ID = 201003487776
ALLOWED_USERS = [OWNER_ID, 8296767829]

def get_available_model():
    """البحث التلقائي عن الموديل المتاح للحساب"""
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
    """الاتصال بـ Gemini واستخراج النص"""
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
    """دالة لتقطيع الرسائل الطويلة وإرسالها لضمان عدم حدوث خطأ 400"""
    if not text: return
    # تلجرام يسمح بـ 4096 حرف، سنستخدم 4000 للأمان
    for i in range(0, len(text), 4000):
        await update.message.reply_text(text[i:i+4000])

async def handle_commands(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ALLOWED_USERS:
        return

    text = update.message.text
    
    # أوامر التحكم (تصوير الشاشة)
    if text.lower() in ["صورة", "ss", "screenshot"]:
        try:
            pyautogui.screenshot("ss.png")
            await update.message.reply_photo(photo=open("ss.png", 'rb'), caption=f"📸 لقطة من Ayman PC")
            os.remove("ss.png")
        except Exception as e:
            await update.message.reply_text(f"❌ خطأ تصوير: {e}")
        return

    # معالجة النصوص الطويلة من Gemini
    response_text = get_gemini_response(text)
    await send_long_message(update, response_text)

if __name__ == "__main__":
    print(f"🚀 MeClaw V3.5 (Long Message Support) Online...")
    print(f"📡 Using Model: {ACTIVE_MODEL}")
    
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_commands))
    app.run_polling()