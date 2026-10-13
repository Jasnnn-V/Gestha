import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import torch.nn as nn
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Menggunakan: {device}")

# Load MobileNetV2
model = models.mobilenet_v2(weights=None)
model.classifier = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(model.last_channel, 128),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(128, 1),
    nn.Sigmoid()
)

# Load model trained kalau ada
MODEL_PATH = r'D:\gestha-backend\model_sapi_v2.pth'
if os.path.exists(MODEL_PATH):
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    print("✅ Model trained berhasil dimuat!")
else:
    print("⚠️ Model trained belum ada, pakai pretrained ImageNet")

model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_image(filepath):
    img = Image.open(filepath).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(tensor)
        prob = torch.sigmoid(output).item()
    status = "HAMIL" if prob >= 0.5 else "TIDAK HAMIL"
    confidence = prob if prob >= 0.5 else 1 - prob
    return {
        "status": status,
        "confidence": round(confidence, 4),
        "estimasi_usia": None
    }