import sys
import os

# Add backend directory to python path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.smart_prediction import smart_prediction_service

service_data = {
    "id": "test-id",
    "name": "Mairie de Cocody",
    "type": "mairie",
    "total_queue_size": 15,
    "total_active_counters": 2,
    "is_open": True
}

print("Testing Smart Prediction...")
prediction = smart_prediction_service.predict_wait_time(service_data)
print(prediction)

if prediction['predicted_wait_time'] > 0:
    print("✅ Prediction logic works!")
else:
    print("❌ Prediction logic failed (0 wait time)")
