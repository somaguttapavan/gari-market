import kagglehub
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# 1. Download Dataset
print("Downloading dataset...")
path = kagglehub.dataset_download("atharvaingle/crop-recommendation-dataset")
print(f"Path: {path}")

# Find the CSV file
csv_file = None
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith(".csv"):
            csv_file = os.path.join(root, file)
            break

if not csv_file:
    raise FileNotFoundError("No CSV file found in dataset")

# 2. Load Data
print(f"Loading data from {csv_file}...")
df = pd.read_csv(csv_file)
print(f"Data shape: {df.shape}")
print(df.head())

# 3. Preprocessing
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

# 4. Train Model
print("Training Random Forest Classifier...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {acc * 100:.2f}%")

# 6. Save Model
model_path = os.path.join("backend", "crop_model.pkl")
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
