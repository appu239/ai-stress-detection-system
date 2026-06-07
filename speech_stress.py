import os
import librosa
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

# Dataset path
DATASET_PATH = "Stress_Datasets"

# Stress labels mapping
LABELS = {
    "neutral": 0,
    "calm": 0,
    "happy": 0,
    "sad": 1,
    "angry": 2,
    "fearful": 2
}

X = []
y = []

# MFCC extraction
def extract_mfcc(file_path):
    audio, sr = librosa.load(file_path, mono=True, duration=3)
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    return np.mean(mfcc.T, axis=0)

# Load datasets
for root, dirs, files in os.walk(DATASET_PATH):
    for file in files:
        if file.endswith(".wav"):
            file_path = os.path.join(root, file)

            # Detect emotion from filename
            label = None
            for emotion in LABELS:
                if emotion in file.lower():
                    label = LABELS[emotion]
                    break

            if label is not None:
                try:
                    features = extract_mfcc(file_path)
                    X.append(features)
                    y.append(label)
                except:
                    pass

# Convert to numpy
X = np.array(X)
y = np.array(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = SVC(kernel="linear", probability=True)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, "stress_model.pkl")

print("stress_model.pkl created successfully")
