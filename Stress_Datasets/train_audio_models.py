# ============================================================
# StressAI - Audio Stress Model Training (COMPLETE)
# Speech Dataset Training Script
# Datasets:
#   1. RAVDESS
#   2. TESS
#   3. EmoDB
#   4. SAVEE (AudioWAV)
#
# Usage:
#   cd Stress_Datasets
#   python train_audio_models.py
#
# Output:
#   ../backend/stress_model.pkl
#   ../backend/scaler.pkl
# ============================================================

import os
import re
import librosa
import joblib
import warnings
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

warnings.filterwarnings("ignore")

# ============================================================
# DATASET PATHS
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

RAVDESS_PATH = os.path.join(CURRENT_DIR, "RAVDESS", "audio_speech_actors_01-24")
TESS_PATH = os.path.join(CURRENT_DIR, "TESS", "TESS Toronto emotional speech set data")
EMODB_PATH = os.path.join(CURRENT_DIR, "EmoDB", "wav")
SAVEE_PATH = os.path.join(CURRENT_DIR, "AudioWAV")

# Output directory (backend folder)
OUTPUT_DIR = os.path.join(CURRENT_DIR, "..", "backend")

print("=" * 60)
print("StressAI - Audio Stress Model Training")
print("=" * 60)
print(f"RAVDESS : {RAVDESS_PATH}")
print(f"TESS    : {TESS_PATH}")
print(f"EmoDB   : {EMODB_PATH}")
print(f"SAVEE   : {SAVEE_PATH}")
print(f"Output  : {OUTPUT_DIR}")
print("=" * 60)

# ============================================================
# STRESS LABELS
# ============================================================

LOW_STRESS = 0
MODERATE_STRESS = 1
HIGH_STRESS = 2

label_names = {
    0: "Low Stress",
    1: "Moderate Stress",
    2: "High Stress"
}

# ============================================================
# EMOTION → STRESS MAPPING
# ============================================================

emotion_to_stress = {
    # Low Stress
    "neutral": LOW_STRESS,
    "calm": LOW_STRESS,
    "happy": LOW_STRESS,

    # Moderate Stress
    "sad": MODERATE_STRESS,
    "surprise": MODERATE_STRESS,

    # High Stress
    "angry": HIGH_STRESS,
    "fear": HIGH_STRESS,
    "fearful": HIGH_STRESS,
    "disgust": HIGH_STRESS,
}

# ============================================================
# FEATURE EXTRACTION
# (Same as final_model.py — 160 features)
# ============================================================

def extract_audio_features(file_path):
    """
    Extract 160 audio features:
    - 40 MFCC means
    - 40 Delta MFCC means
    - 40 Delta-Delta MFCC means
    - 40 MFCC standard deviations
    """
    try:
        audio, sr = librosa.load(file_path, sr=16000)

        # Pad / Trim to 3 seconds
        if len(audio) < 3 * sr:
            audio = np.pad(audio, (0, 3 * sr - len(audio)))
        else:
            audio = audio[:3 * sr]

        # MFCC
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)

        # Delta
        delta = librosa.feature.delta(mfcc)

        # Delta-Delta
        delta2 = librosa.feature.delta(mfcc, order=2)

        features = np.hstack((
            np.mean(mfcc, axis=1),
            np.mean(delta, axis=1),
            np.mean(delta2, axis=1),
            np.std(mfcc, axis=1)
        ))

        return features

    except Exception as e:
        print(f"  [SKIP] {file_path}: {e}")
        return None

# ============================================================
# DATA STORAGE
# ============================================================

X = []
y = []

dataset_count = {
    "RAVDESS": 0,
    "TESS": 0,
    "EmoDB": 0,
    "SAVEE": 0
}

# ============================================================
# 1. LOAD RAVDESS
# Filename format: 03-01-XX-XX-XX-XX-XX.wav
# 3rd number = emotion:
#   01=neutral, 02=calm, 03=happy, 04=sad,
#   05=angry, 06=fearful, 07=disgust, 08=surprised
# ============================================================

RAVDESS_EMOTIONS = {
    "01": "neutral",
    "02": "calm",
    "03": "happy",
    "04": "sad",
    "05": "angry",
    "06": "fearful",
    "07": "disgust",
    "08": "surprise"
}

print("\n[1/4] Loading RAVDESS...")

if os.path.exists(RAVDESS_PATH):
    for actor_dir in sorted(os.listdir(RAVDESS_PATH)):
        actor_path = os.path.join(RAVDESS_PATH, actor_dir)
        if not os.path.isdir(actor_path):
            continue

        for filename in os.listdir(actor_path):
            if not filename.endswith(".wav"):
                continue

            # Parse emotion from filename
            parts = filename.replace(".wav", "").split("-")
            if len(parts) >= 3:
                emotion_code = parts[2]
                emotion_name = RAVDESS_EMOTIONS.get(emotion_code)

                if emotion_name and emotion_name in emotion_to_stress:
                    stress_label = emotion_to_stress[emotion_name]
                    file_path = os.path.join(actor_path, filename)

                    features = extract_audio_features(file_path)
                    if features is not None:
                        X.append(features)
                        y.append(stress_label)
                        dataset_count["RAVDESS"] += 1

    print(f"  RAVDESS loaded: {dataset_count['RAVDESS']} samples")
else:
    print(f"  [WARN] RAVDESS path not found: {RAVDESS_PATH}")

# ============================================================
# 2. LOAD TESS
# Folder format: OAF_angry, YAF_sad, etc.
# Emotion is in folder name after underscore
# ============================================================

TESS_EMOTION_MAP = {
    "angry": "angry",
    "disgust": "disgust",
    "fear": "fear",
    "happy": "happy",
    "neutral": "neutral",
    "sad": "sad",
    "pleasant_surprise": "surprise",
    "pleasant_surprised": "surprise",
}

print("\n[2/4] Loading TESS...")

if os.path.exists(TESS_PATH):
    for folder in sorted(os.listdir(TESS_PATH)):
        folder_path = os.path.join(TESS_PATH, folder)
        if not os.path.isdir(folder_path):
            continue

        # Extract emotion from folder name (e.g., "OAF_angry" -> "angry")
        folder_lower = folder.lower()
        emotion_name = None

        for key, mapped_emotion in TESS_EMOTION_MAP.items():
            if key in folder_lower:
                emotion_name = mapped_emotion
                break

        if emotion_name is None or emotion_name not in emotion_to_stress:
            continue

        stress_label = emotion_to_stress[emotion_name]

        for filename in os.listdir(folder_path):
            if not filename.endswith(".wav"):
                continue

            file_path = os.path.join(folder_path, filename)
            features = extract_audio_features(file_path)
            if features is not None:
                X.append(features)
                y.append(stress_label)
                dataset_count["TESS"] += 1

    print(f"  TESS loaded: {dataset_count['TESS']} samples")
else:
    print(f"  [WARN] TESS path not found: {TESS_PATH}")

# ============================================================
# 3. LOAD EmoDB
# German emotional speech database
# Filename format: XXaXXYZ.wav
# Emotion letter (5th char position after the number block):
#   W = anger (Wut/Ärger)
#   L = boredom (Langeweile)
#   E = disgust (Ekel)
#   A = fear/anxiety (Angst)
#   F = happiness (Freude)
#   T = sadness (Trauer)
#   N = neutral
# ============================================================

EMODB_EMOTION_MAP = {
    "W": "angry",
    "L": "neutral",    # boredom → low stress
    "E": "disgust",
    "A": "fear",
    "F": "happy",
    "T": "sad",
    "N": "neutral",
}

print("\n[3/4] Loading EmoDB...")

if os.path.exists(EMODB_PATH):
    for filename in sorted(os.listdir(EMODB_PATH)):
        if not filename.endswith(".wav"):
            continue

        # EmoDB filename: e.g., "03a01Fa.wav"
        # The emotion letter is at index 5 (after pattern like "03a01")
        # Actually, EmoDB format: [speaker][text][emotion][version].wav
        # e.g., "03a01Fa" -> speaker=03, text=a01, emotion=F, version=a
        # We need to find the emotion letter
        basename = filename.replace(".wav", "")

        # Find emotion letter: it's the first uppercase letter after digits
        emotion_char = None
        for i, ch in enumerate(basename):
            # Skip first few chars (speaker + text code)
            if i >= 5 and ch.isupper():
                emotion_char = ch
                break

        if emotion_char is None:
            continue

        emotion_name = EMODB_EMOTION_MAP.get(emotion_char)
        if emotion_name is None or emotion_name not in emotion_to_stress:
            continue

        stress_label = emotion_to_stress[emotion_name]
        file_path = os.path.join(EMODB_PATH, filename)

        features = extract_audio_features(file_path)
        if features is not None:
            X.append(features)
            y.append(stress_label)
            dataset_count["EmoDB"] += 1

    print(f"  EmoDB loaded: {dataset_count['EmoDB']} samples")
else:
    print(f"  [WARN] EmoDB path not found: {EMODB_PATH}")

# ============================================================
# 4. LOAD SAVEE (AudioWAV)
# Filename format: XXXX_YYY_ZZZ_WW.wav
# e.g., "1001_DFA_FEA_XX.wav"
# Emotion code is 3rd segment:
#   ANG = angry, DIS = disgust, FEA = fear,
#   HAP = happy, NEU = neutral, SAD = sad
# ============================================================

SAVEE_EMOTION_MAP = {
    "ANG": "angry",
    "DIS": "disgust",
    "FEA": "fear",
    "HAP": "happy",
    "NEU": "neutral",
    "SAD": "sad",
}

print("\n[4/4] Loading SAVEE...")

if os.path.exists(SAVEE_PATH):
    for filename in sorted(os.listdir(SAVEE_PATH)):
        if not filename.endswith(".wav"):
            continue

        # Parse: 1001_DFA_FEA_XX.wav -> parts[2] = "FEA"
        parts = filename.replace(".wav", "").split("_")
        if len(parts) >= 3:
            emotion_code = parts[2]
            emotion_name = SAVEE_EMOTION_MAP.get(emotion_code)

            if emotion_name and emotion_name in emotion_to_stress:
                stress_label = emotion_to_stress[emotion_name]
                file_path = os.path.join(SAVEE_PATH, filename)

                features = extract_audio_features(file_path)
                if features is not None:
                    X.append(features)
                    y.append(stress_label)
                    dataset_count["SAVEE"] += 1

    print(f"  SAVEE loaded: {dataset_count['SAVEE']} samples")
else:
    print(f"  [WARN] SAVEE path not found: {SAVEE_PATH}")

# ============================================================
# DATASET SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("DATASET SUMMARY")
print("=" * 60)

for ds_name, count in dataset_count.items():
    print(f"  {ds_name:10s}: {count} samples")

total_samples = len(X)
print(f"  {'TOTAL':10s}: {total_samples} samples")

if total_samples == 0:
    print("\n[ERROR] No samples loaded. Check dataset paths.")
    exit(1)

# Convert to numpy arrays
X = np.array(X)
y = np.array(y)

print(f"\nFeature matrix shape: {X.shape}")
print(f"Label distribution:")
for label_id, label_name in label_names.items():
    count = np.sum(y == label_id)
    print(f"  {label_name}: {count} ({count/len(y)*100:.1f}%)")

# ============================================================
# NORMALIZE FEATURES
# ============================================================

print("\nNormalizing features with StandardScaler...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ============================================================
# TRAIN/TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print(f"\nTrain samples: {len(X_train)}")
print(f"Test samples : {len(X_test)}")

# ============================================================
# TRAIN SVM
# ============================================================

print("\n" + "=" * 60)
print("TRAINING SVM")
print("=" * 60)

svm = SVC(
    kernel="linear",
    probability=True,
    C=1.0,
    random_state=42
)

svm.fit(X_train, y_train)
svm_pred = svm.predict(X_test)
svm_accuracy = accuracy_score(y_test, svm_pred)

print(f"\nSVM Accuracy  : {svm_accuracy*100:.2f}%")
print(f"Precision     : {precision_score(y_test, svm_pred, average='weighted'):.4f}")
print(f"Recall        : {recall_score(y_test, svm_pred, average='weighted'):.4f}")
print(f"F1 Score      : {f1_score(y_test, svm_pred, average='weighted'):.4f}")

print("\nClassification Report:")
print(classification_report(y_test, svm_pred, target_names=list(label_names.values())))

print("Confusion Matrix:")
print(confusion_matrix(y_test, svm_pred))

# ============================================================
# TRAIN RANDOM FOREST
# ============================================================

print("\n" + "=" * 60)
print("TRAINING RANDOM FOREST")
print("=" * 60)

rf = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

rf.fit(X_train, y_train)
rf_pred = rf.predict(X_test)
rf_accuracy = accuracy_score(y_test, rf_pred)

print(f"\nRandom Forest Accuracy : {rf_accuracy*100:.2f}%")
print(f"Precision              : {precision_score(y_test, rf_pred, average='weighted'):.4f}")
print(f"Recall                 : {recall_score(y_test, rf_pred, average='weighted'):.4f}")
print(f"F1 Score               : {f1_score(y_test, rf_pred, average='weighted'):.4f}")

print("\nClassification Report:")
print(classification_report(y_test, rf_pred, target_names=list(label_names.values())))

print("Confusion Matrix:")
print(confusion_matrix(y_test, rf_pred))

# ============================================================
# MODEL COMPARISON & SELECTION
# ============================================================

print("\n" + "=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

print(f"SVM Accuracy           : {svm_accuracy*100:.2f}%")
print(f"Random Forest Accuracy : {rf_accuracy*100:.2f}%")

if svm_accuracy >= rf_accuracy:
    best_model = svm
    best_name = "SVM"
    best_accuracy = svm_accuracy
else:
    best_model = rf
    best_name = "Random Forest"
    best_accuracy = rf_accuracy

print(f"\nBest Model: {best_name} ({best_accuracy*100:.2f}%)")

# ============================================================
# SAVE MODEL AND SCALER
# ============================================================

model_path = os.path.join(OUTPUT_DIR, "stress_model.pkl")
scaler_path = os.path.join(OUTPUT_DIR, "scaler.pkl")

print(f"\nSaving model to {model_path}...")
joblib.dump(best_model, model_path)

print(f"Saving scaler to {scaler_path}...")
joblib.dump(scaler, scaler_path)

print(f"\n{'=' * 60}")
print(f"[OK] Training complete!")
print(f"  - stress_model.pkl : {os.path.getsize(model_path):,} bytes")
print(f"  - scaler.pkl       : {os.path.getsize(scaler_path):,} bytes")
print(f"  - Best model       : {best_name}")
print(f"  - Test accuracy    : {best_accuracy*100:.2f}%")
print(f"  - Feature count    : 160 (MFCC + Delta + Delta2 + Std)")
print(f"  - Datasets used    : {', '.join(k for k, v in dataset_count.items() if v > 0)}")
print(f"{'=' * 60}")
