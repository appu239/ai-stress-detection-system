"""
StressAI - Text Stress Model Training (COMPLETE)
==================================================
Trains text-based stress detection using TF-IDF + SVM / Random Forest.

Usage:
  cd backend
  python retrain_text_model.py

Output:
  text_model.pkl   (best classifier)
  vectorizer.pkl   (TF-IDF vectorizer)
"""

import pandas as pd
import re
import os
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
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

# =========================
# CONFIG
# =========================
CSV_FILE = "stress_text_data.csv"
MODEL_FILE = "text_model.pkl"
VECTORIZER_FILE = "vectorizer.pkl"

# =========================
# LOAD DATA
# =========================
print("=" * 60)
print("StressAI - Text Stress Model Training")
print("=" * 60)

print(f"\nLoading data from {CSV_FILE}...")
df = pd.read_csv(CSV_FILE)

# Remove empty rows
df = df.dropna(subset=["text", "label"])
df = df[df["text"].str.strip() != ""]

# CRITICAL FIX: Strip whitespace from labels (Windows \r\n causes mismatches)
df["label"] = df["label"].str.strip()

print(f"Total samples: {len(df)}")
print(f"\nLabel distribution:")
print(df["label"].value_counts())

# Verify expected labels
expected_labels = {"Low Stress", "Moderate Stress", "High Stress"}
actual_labels = set(df["label"].unique())

if actual_labels != expected_labels:
    print(f"\n[WARN] Unexpected labels found: {actual_labels - expected_labels}")
    print(f"[WARN] Missing labels: {expected_labels - actual_labels}")

# =========================
# TEXT CLEANING
# =========================
def clean_text(text):
    """Clean text: lowercase, remove special chars, strip whitespace."""
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z ]', '', text)
    return text.strip()

df["clean_text"] = df["text"].apply(clean_text)

# Remove any rows that became empty after cleaning
df = df[df["clean_text"].str.strip() != ""]

print(f"\nSamples after cleaning: {len(df)}")

# =========================
# VECTORIZE
# =========================
print("\nCreating TF-IDF features...")

# CRITICAL: Do NOT use stop_words="english" because it removes
# single-word inputs like "sad", "happy", "stressed" which are
# valid and important stress indicators.
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),     # Unigrams + bigrams
    min_df=1,               # Include single-occurrence words
    sublinear_tf=True       # Sublinear TF scaling
)

X = vectorizer.fit_transform(df["clean_text"])
y = df["label"]

print(f"Feature matrix shape: {X.shape}")
print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

# =========================
# TRAIN/TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTrain size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")

# =========================
# TRAIN SVM
# =========================
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
print(classification_report(y_test, svm_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, svm_pred))

# =========================
# TRAIN RANDOM FOREST
# =========================
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
print(classification_report(y_test, rf_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, rf_pred))

# =========================
# CROSS-VALIDATION
# =========================
print("\n" + "=" * 60)
print("CROSS-VALIDATION (5-fold)")
print("=" * 60)

svm_cv = cross_val_score(svm, X, y, cv=5, scoring="accuracy")
rf_cv = cross_val_score(rf, X, y, cv=5, scoring="accuracy")

print(f"SVM CV Accuracy           : {svm_cv.mean():.4f} (+/- {svm_cv.std()*2:.4f})")
print(f"Random Forest CV Accuracy : {rf_cv.mean():.4f} (+/- {rf_cv.std()*2:.4f})")

# =========================
# MODEL COMPARISON & SELECTION
# =========================
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

# =========================
# TEST SPECIFIC INPUTS
# =========================
print(f"\n{'=' * 60}")
print("Testing specific inputs:")
print(f"{'=' * 60}")

test_inputs = [
    ("sad", "Moderate Stress"),
    ("depressed", "High Stress"),
    ("tension", "Moderate Stress"),
    ("happy", "Low Stress"),
    ("calm", "Low Stress"),
    ("stressed", "High Stress"),
    ("anxious", "High Stress"),
    ("I feel sad", "Moderate Stress"),
    ("I feel depressed", "High Stress"),
    ("I am feeling stressed", "High Stress"),
    ("I feel calm and relaxed", "Low Stress"),
    ("I am overwhelmed", "High Stress"),
    ("feeling down", "Moderate Stress"),
    ("I feel lonely", "Moderate Stress"),
    ("crying", "High Stress"),
    ("I am fine", "Low Stress"),
    ("hopeless", "High Stress"),
    ("I feel sad and lonely", "Moderate Stress"),
    ("I am extremely stressed right now", "High Stress"),
]

correct = 0
total = len(test_inputs)

for text, expected in test_inputs:
    cleaned = clean_text(text)
    vec = vectorizer.transform([cleaned])
    prediction = best_model.predict(vec)[0]
    proba = best_model.predict_proba(vec)[0]
    classes = best_model.classes_
    proba_str = ", ".join([f"{c}: {p:.2f}" for c, p in zip(classes, proba)])

    status = "OK" if prediction == expected else "FAIL"
    if prediction == expected:
        correct += 1

    print(f"  [{status}] '{text}' -> {prediction}  (expected: {expected})  ({proba_str})")

print(f"\n  Specific input accuracy: {correct}/{total} ({correct/total*100:.0f}%)")

# =========================
# SAVE MODEL & VECTORIZER
# =========================
print(f"\nSaving model to {MODEL_FILE}...")
joblib.dump(best_model, MODEL_FILE)

print(f"Saving vectorizer to {VECTORIZER_FILE}...")
joblib.dump(vectorizer, VECTORIZER_FILE)

print(f"\n{'=' * 60}")
print(f"[OK] Training complete!")
print(f"  - {MODEL_FILE}     : {os.path.getsize(MODEL_FILE):,} bytes")
print(f"  - {VECTORIZER_FILE} : {os.path.getsize(VECTORIZER_FILE):,} bytes")
print(f"  - Best model       : {best_name}")
print(f"  - Test accuracy    : {best_accuracy*100:.2f}%")
print(f"{'=' * 60}")

print(f"\nNext steps:")
print(f"  1. Test locally: python final_model.py")
print(f"  2. Push to Render: git add . && git commit -m 'retrain model' && git push")
