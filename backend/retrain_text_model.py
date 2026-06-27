"""
Retrain Text Stress Model
==========================
Run this script after updating stress_text_data.csv to regenerate:
  - text_model.pkl (trained classifier)
  - vectorizer.pkl (TF-IDF vectorizer)

Usage:
  python retrain_text_model.py
"""

import pandas as pd
import re
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score
import os

# =========================
# CONFIG
# =========================
CSV_FILE = "stress_text_data.csv"
MODEL_FILE = "text_model.pkl"
VECTORIZER_FILE = "vectorizer.pkl"

# =========================
# LOAD DATA
# =========================
print(f"Loading data from {CSV_FILE}...")
df = pd.read_csv(CSV_FILE)

# Remove empty rows
df = df.dropna(subset=["text", "label"])
df = df[df["text"].str.strip() != ""]
df["label"] = df["label"].str.strip()  # Remove trailing whitespace from labels

print(f"Total samples: {len(df)}")
print(f"\nLabel distribution:")
print(df["label"].value_counts())

# =========================
# TEXT CLEANING
# =========================
def clean_text(text):
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
print("\nTraining TF-IDF vectorizer...")
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),  # Use unigrams and bigrams for better short-text handling
    min_df=1,            # Include even single-occurrence words (important for short entries)
    sublinear_tf=True    # Apply sublinear TF scaling
)

X = vectorizer.fit_transform(df["clean_text"])
y = df["label"]

print(f"Feature matrix shape: {X.shape}")

# =========================
# TRAIN/TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTrain size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")

# =========================
# TRAIN MODEL (SVM)
# =========================
print("\nTraining SVM classifier...")
model = SVC(kernel="linear", probability=True, C=1.0, random_state=42)
model.fit(X_train, y_train)

# =========================
# EVALUATE
# =========================
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n{'='*50}")
print(f"Test Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
print(f"{'='*50}")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred))

# Cross-validation
print("Running 5-fold cross-validation...")
cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

# =========================
# TEST SPECIFIC INPUTS
# =========================
print(f"\n{'='*50}")
print("Testing specific inputs:")
print(f"{'='*50}")

test_inputs = [
    "sad",
    "tension",
    "I am feeling sad",
    "depressed",
    "I feel depressed",
    "happy",
    "I am feeling stressed",
    "I feel calm and relaxed",
    "I am overwhelmed",
    "feeling down",
    "I feel lonely",
    "crying",
    "I am fine",
    "hopeless",
    "I feel sad and lonely",
    "I am extremely stressed right now",
]

for text in test_inputs:
    cleaned = clean_text(text)
    vec = vectorizer.transform([cleaned])
    prediction = model.predict(vec)[0]
    proba = model.predict_proba(vec)[0]
    classes = model.classes_
    proba_str = ", ".join([f"{c}: {p:.2f}" for c, p in zip(classes, proba)])
    print(f"  '{text}' -> {prediction}  ({proba_str})")

# =========================
# SAVE MODEL
# =========================
print(f"\nSaving model to {MODEL_FILE}...")
joblib.dump(model, MODEL_FILE)

print(f"Saving vectorizer to {VECTORIZER_FILE}...")
joblib.dump(vectorizer, VECTORIZER_FILE)

print(f"\n[OK] Retraining complete!")
print(f"   - {MODEL_FILE}: {os.path.getsize(MODEL_FILE)} bytes")
print(f"   - {VECTORIZER_FILE}: {os.path.getsize(VECTORIZER_FILE)} bytes")
print(f"\nNext steps:")
print(f"  1. Test locally: python final_model.py")
print(f"  2. Push to Render: git add . && git commit -m 'retrain model' && git push")
