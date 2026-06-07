import pandas as pd
import joblib
import re

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.svm import SVC
from sklearn.ensemble import VotingClassifier

# =========================
# LOAD DATA
# =========================
data = pd.read_csv("stress_text_data.csv")

# =========================
# CLEAN TEXT (IMPROVED)
# =========================
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z ]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

data["text"] = data["text"].apply(clean_text)

# labels
data["label"] = data["label"].str.strip()

X = data["text"]
y = data["label"]

# =========================
# SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# =========================
# TF-IDF (STRONG)
# =========================
vectorizer = TfidfVectorizer(
    ngram_range=(1, 3),
    max_features=12000,
    min_df=1,
    max_df=0.9,
    sublinear_tf=True
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)
from sklearn.model_selection import cross_val_score

svm_cv = SVC(kernel="linear", C=2, class_weight="balanced")

scores = cross_val_score(svm_cv, X_train_vec, y_train, cv=5)

print("\n🔥 REAL Accuracy (Cross Validation):", scores.mean())
# =========================
# MODEL COMPARISON
# =========================
models = {
    "Linear SVM": LinearSVC(C=3),
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "SVM (RBF)": SVC(kernel="rbf", C=2)
}

results = {}
best_model = None
best_accuracy = 0
best_name = ""

for name, model in models.items():
    print(f"\nTraining {name}...")

    model.fit(X_train_vec, y_train)
    pred = model.predict(X_test_vec)

    acc = accuracy_score(y_test, pred)
    results[name] = acc

    print(f"{name} Accuracy: {acc:.4f}")

    if acc > best_accuracy:
        best_accuracy = acc
        best_model = model
        best_name = name
        best_pred = pred

# =========================
# PRINT ALL ACCURACIES
# =========================
print("\n===== ALL MODEL ACCURACIES =====")
for name, acc in results.items():
    print(f"{name}: {acc*100:.2f}%")

# =========================
# BEST MODEL
# =========================
print("\n=========================")
print(f"BEST MODEL: {best_name}")
print(f"FINAL TEXT ACCURACY: {best_accuracy*100:.2f}%")

print("\nClassification Report:\n")
print(classification_report(y_test, best_pred))

# =========================
# SAVE BEST MODEL
# =========================
joblib.dump(best_model, "text_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

