import google.generativeai as genai

# المفتاح الخاص بك
api_key = "AIzaSyD3WXzJQ6ysV0MK3r-W7MN5-hKChM5MkIw"

def test_api():
    try:
        print("[*] جاري الاتصال بخوادم جوجل...")
        genai.configure(api_key=api_key)
        
        # استخدام موديل Flash السريع
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # تجربة إرسال رسالة بسيطة
        print("[*] إرسال طلب تجريبي: 'Hello'...")
        response = model.generate_content("Hello, this is a test.")
        
        # فحص الرد
        if response.text:
            print(f"[+] نجاح! الرد من Gemini: {response.text}")
        else:
            print("[-] فشل: الرد فارغ. قد يكون هناك حجب (Safety Filter).")
            
    except Exception as e:
        print(f"[!] خطأ تقني: {str(e)}")
        if "API_KEY_INVALID" in str(e):
            print("[!] تنبيه: مفتاح الـ API غير صالح أو منتهي الصلاحية.")
        elif "quota" in str(e).lower():
            print("[!] تنبيه: لقد تجاوزت الحد المجاني المسموح به.")

if __name__ == "__main__":
    test_api()