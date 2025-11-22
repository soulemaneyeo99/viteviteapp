import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.getcwd())

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print(f"GEMINI_API_KEY present: {'Yes' if key else 'No'}")
if key:
    print(f"Key length: {len(key)}")
    print(f"Key starts with: {key[:4]}...")

try:
    from app.ai.gemini_service import gemini_service
    print(f"Gemini Service Enabled: {gemini_service.enabled}")
except Exception as e:
    print(f"Error importing service: {e}")
