import os
import json
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
import xml.etree.ElementTree as ET
from sklearn.model_selection import train_test_split
from collections import Counter

# ============================================================
# CONFIG
# ============================================================
DATASET_LAMA  = r'D:\dataset-sapi\train'
DATASET_RAPLI = r'D:\dataset-sapi\train-rapli'
MODEL_SAVE    = r'D:\gestha-backend\model\gestha_model_v2.pth'
EPOCHS        = 30
BATCH_SIZE    = 16
LR            = 0.0001
IMG_SIZE      = 224

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"✅ Device: {device}")

# ============================================================
# TRANSFORM
# ============================================================
transform_train = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

transform_val = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ============================================================
# DATASET LAMA - Pascal VOC (XML)
# ============================================================
class PascalVOCDataset(Dataset):
    def __init__(self, folder, transform=None):
        self.folder = folder
        self.transform = transform
        self.samples = []

        for xml_file in os.listdir(folder):
            if not xml_file.endswith('.xml'):
                continue
            tree = ET.parse(os.path.join(folder, xml_file))
            root = tree.getroot()
            filename = root.find('filename').text
            img_path = os.path.join(folder, filename)
            if not os.path.exists(img_path):
                continue
            for obj in root.findall('object'):
                label_raw = obj.find('name').text.strip().lower()
                if 'tidak' in label_raw or 'tidakhamil' in label_raw:
                    label = 0
                else:
                    label = 1
                self.samples.append((img_path, label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        img = Image.open(img_path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, label

# ============================================================
# DATASET BARU - COCO JSON
# ============================================================
class COCODataset(Dataset):
    def __init__(self, folder, transform=None):
        self.folder = folder
        self.transform = transform
        self.samples = []

        json_path = os.path.join(folder, '_annotations.coco.json')
        with open(json_path, 'r') as f:
            coco = json.load(f)

        cat_map = {}
        for cat in coco['categories']:
            name = cat['name'].lower()
            if 'tidak' in name or 'tidakhamil' in name:
                cat_map[cat['id']] = 0
            elif 'hamil' in name:
                cat_map[cat['id']] = 1

        id_to_file = {img['id']: img['file_name'] for img in coco['images']}

        for ann in coco['annotations']:
            cat_id = ann['category_id']
            if cat_id not in cat_map:
                continue
            img_path = os.path.join(folder, id_to_file[ann['image_id']])
            if not os.path.exists(img_path):
                continue
            self.samples.append((img_path, cat_map[cat_id]))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        img = Image.open(img_path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, label

# ============================================================
# LOAD & GABUNG DATASET
# ============================================================
print("\n📂 Loading dataset...")

dataset_lama  = PascalVOCDataset(DATASET_LAMA,  transform=None)
dataset_rapli = COCODataset(DATASET_RAPLI, transform=None)

all_samples = dataset_lama.samples + dataset_rapli.samples
print(f"  Dataset lama  : {len(dataset_lama.samples)} foto")
print(f"  Dataset Rapli : {len(dataset_rapli.samples)} foto")
print(f"  Total gabungan: {len(all_samples)} foto")

dist = Counter(label for _, label in all_samples)
print(f"  Hamil         : {dist[1]} foto")
print(f"  Tidak Hamil   : {dist[0]} foto")

train_samples, val_samples = train_test_split(
    all_samples, test_size=0.2, random_state=42,
    stratify=[s[1] for s in all_samples]
)
print(f"\n  Train : {len(train_samples)} foto")
print(f"  Val   : {len(val_samples)} foto")

# ============================================================
# CUSTOM DATASET DARI LIST SAMPLES
# ============================================================
class SampleDataset(Dataset):
    def __init__(self, samples, transform):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        img = Image.open(img_path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, label

train_dataset = SampleDataset(train_samples, transform_train)
val_dataset   = SampleDataset(val_samples,   transform_val)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

# ============================================================
# CLASS WEIGHTS (atasi imbalanced dataset)
# ============================================================
total          = len(train_samples)
n_tidak_hamil  = sum(1 for _, l in train_samples if l == 0)
n_hamil        = sum(1 for _, l in train_samples if l == 1)

weight_tidak_hamil = total / (2 * n_tidak_hamil)
weight_hamil       = total / (2 * n_hamil)
class_weights = torch.tensor([weight_tidak_hamil, weight_hamil], dtype=torch.float).to(device)

print(f"\n⚖️  Class weights → TidakHamil: {weight_tidak_hamil:.2f} | Hamil: {weight_hamil:.2f}")

# ============================================================
# MODEL - EfficientNet B0
# ============================================================
print("\n🧠 Membangun model EfficientNet B0...")
model = models.efficientnet_b0(weights='IMAGENET1K_V1')
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
model = model.to(device)

criterion = nn.CrossEntropyLoss(weight=class_weights)
optimizer = torch.optim.Adam(model.parameters(), lr=LR)
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3, factor=0.5, verbose=True)

# ============================================================
# TRAINING LOOP
# ============================================================
print(f"\n🚀 Mulai training {EPOCHS} epoch...\n")
best_val_acc = 0.0

for epoch in range(EPOCHS):
    # --- TRAIN ---
    model.train()
    train_loss, train_correct = 0, 0
    for imgs, labels in train_loader:
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        train_loss += loss.item()
        train_correct += (outputs.argmax(1) == labels).sum().item()

    # --- VAL ---
    model.eval()
    val_loss, val_correct = 0, 0
    val_preds, val_labels = [], []
    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            val_loss += criterion(outputs, labels).item()
            preds = outputs.argmax(1)
            val_correct += (preds == labels).sum().item()
            val_preds.extend(preds.cpu().tolist())
            val_labels.extend(labels.cpu().tolist())

    train_acc = train_correct / len(train_dataset) * 100
    val_acc   = val_correct   / len(val_dataset)   * 100
    scheduler.step(val_loss)

    # Hitung per-class accuracy
    hamil_correct      = sum(p == l == 1 for p, l in zip(val_preds, val_labels))
    hamil_total        = sum(l == 1 for l in val_labels)
    tidak_hamil_correct = sum(p == l == 0 for p, l in zip(val_preds, val_labels))
    tidak_hamil_total  = sum(l == 0 for l in val_labels)

    hamil_acc      = hamil_correct / hamil_total * 100 if hamil_total else 0
    tidak_hamil_acc = tidak_hamil_correct / tidak_hamil_total * 100 if tidak_hamil_total else 0

    is_best = val_acc > best_val_acc
    print(f"Epoch [{epoch+1:02d}/{EPOCHS}] "
          f"Train Acc: {train_acc:.1f}% | "
          f"Val Acc: {val_acc:.1f}% "
          f"(Hamil: {hamil_acc:.1f}% | TidakHamil: {tidak_hamil_acc:.1f}%)"
          + (" ⭐ BEST" if is_best else ""))

    if is_best:
        best_val_acc = val_acc
        os.makedirs(os.path.dirname(MODEL_SAVE), exist_ok=True)
        torch.save(model.state_dict(), MODEL_SAVE)

print(f"\n✅ Training selesai! Best Val Acc: {best_val_acc:.1f}%")
print(f"✅ Model disimpan di: {MODEL_SAVE}")