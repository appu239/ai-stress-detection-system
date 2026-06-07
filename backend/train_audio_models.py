import os
import librosa
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils import resample
from collections import Counter

# =========================
# FEATURE EXTRACTION
# =========================
def extract_features(file_path):
    audio, sr = librosa.load(file_path, sr=16000)

    # Fix length = 3 sec
    if len(audio) < 3 * sr:
        audio = np.pad(audio, (0, 3 * sr - len(audio)))
    else:
        audio = audio[:3 * sr]

    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    delta = librosa.feature.delta(mfcc)
    delta2 = librosa.feature.delta(mfcc, order=2)

    return np.hstack((
        np.mean(mfcc, axis=1),
        np.std(mfcc, axis=1),
        np.mean(delta, axis=1),
        np.mean(delta2, axis=1)
    ))

# =========================
# STRESS MAP
# =========================
stress_map = {
    'neutral': 0, 'calm': 0, 'happy': 0,
    'sad': 1, 'fear': 1, 'surprised': 1,
    'angry': 2, 'disgust': 2, 'boredom': 1
}

base_path = r"C:\Users\AparnaC\OneDrive\Desktop\STRESS LEVEL DETECTION PROJECT\Stress_Datasets"

X, y = [], []

# =========================
# LOAD DATA
# =========================
def load_data():
    # EMODB
    emodb_map = {'W':'angry','E':'disgust','A':'fear','T':'sad','L':'boredom','N':'neutral','F':'happy'}
    for root, _, files in os.walk(os.path.join(base_path, "EmoDB")):
        for file in files:
            if file.endswith(".wav"):
                try:
                    emotion = emodb_map.get(file[5])
                    if emotion:
                        X.append(extract_features(os.path.join(root, file)))
                        y.append(stress_map[emotion])
                except:
                    pass

    # RAVDESS
    ravdess_map = {'01':'neutral','02':'calm','03':'happy','04':'sad','05':'angry','06':'fear','07':'disgust','08':'surprised'}
    for root, _, files in os.walk(os.path.join(base_path, "RAVDESS")):
        for file in files:
            if file.endswith(".wav"):
                try:
                    emotion = ravdess_map.get(file.split("-")[2])
                    if emotion:
                        X.append(extract_features(os.path.join(root, file)))
                        y.append(stress_map[emotion])
                except:
                    pass

    # CREMA-D
    crema_map = {'ANG':'angry','DIS':'disgust','FEA':'fear','HAP':'happy','NEU':'neutral','SAD':'sad'}
    crema_path = os.path.join(base_path, "AudioWAV")
    for file in os.listdir(crema_path):
        if file.endswith(".wav"):
            try:
                parts = file.split("_")
                if len(parts) >= 3:
                    emotion = crema_map.get(parts[2])
                    if emotion:
                        X.append(extract_features(os.path.join(crema_path, file)))
                        y.append(stress_map[emotion])
            except:
                pass

    # TESS
    for root, _, files in os.walk(os.path.join(base_path, "TESS")):
        for file in files:
            if file.endswith(".wav"):
                try:
                    emotion = file.split("_")[-1].replace(".wav", "").lower()
                    if emotion in stress_map:
                        X.append(extract_features(os.path.join(root, file)))
                        y.append(stress_map[emotion])
                except:
                    pass

load_data()

print("Total samples:", len(X))
print("Before balance:", Counter(y))

# =========================
# CONVERT
# =========================
X = np.array(X)
y = np.array(y)

# =========================
# OVERSAMPLING
# =========================
X_bal, y_bal = [], []
max_count = max(Counter(y).values())

for label in np.unique(y):
    X_class = X[y == label]
    y_class = y[y == label]

    X_res, y_res = resample(
        X_class, y_class,
        replace=True,
        n_samples=max_count,
        random_state=42
    )

    X_bal.append(X_res)
    y_bal.append(y_res)

X = np.vstack(X_bal)
y = np.hstack(y_bal)

print("After balance:", Counter(y))

# =========================
# SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# =========================
# SCALE
# =========================
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# =========================
# TRAIN MODELS
# =========================
models = {
    "SVM": SVC(kernel='rbf', C=100, gamma=0.01, probability=True),
    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        random_state=42
    )
}

best_model = None
best_acc = 0
best_name = ""

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"{name} Accuracy: {acc}")

    if acc > best_acc:
        best_acc = acc
        best_model = model
        best_name = name

# =========================
# FINAL RESULT
# =========================
print("\nBEST MODEL:", best_name)
print("BEST ACCURACY:", best_acc)

# =========================
# SAVE BEST MODEL
# =========================
joblib.dump(best_model, "best_stress_model.pkl")
joblib.dump(scaler, "scaler.pkl")