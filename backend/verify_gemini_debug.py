import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {bool(api_key)}")

if api_key:
    genai.configure(api_key=api_key)
    try:
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
        
        print("\nTesting gemini-1.5-flash...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello")
        print(f"Response: {response.text}")
        
        print("\nTesting gemini-flash-latest...")
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Hello")
        print(f"Response: {response.text}")

    except Exception as e:
        print(f"Error: {e}")
