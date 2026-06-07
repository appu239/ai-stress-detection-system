import librosa
import numpy as np
import joblib
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# =========================
# TEMP USER STORAGE (for demo)
# =========================
users = []

# =========================
# LOAD MODELS
# =========================
audio_model = joblib.load("stress_model.pkl")
text_model = joblib.load("text_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")
scaler = joblib.load("scaler.pkl")

# =========================
# LABEL MAP
# =========================
label_map = {
    0: "Low Stress",
    1: "Moderate Stress",
    2: "High Stress"
}

reverse_map = {
    "Low Stress": 0,
    "Moderate Stress": 1,
    "High Stress": 2
}

# =========================
# AUDIO FEATURE EXTRACTION
# =========================
def extract_audio_features(file_path):
    audio, sr = librosa.load(file_path, sr=16000)

    if len(audio) < 3 * sr:
        audio = np.pad(audio, (0, 3 * sr - len(audio)))
    else:
        audio = audio[:3 * sr]

    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    delta = librosa.feature.delta(mfcc)
    delta2 = librosa.feature.delta(mfcc, order=2)

    features = np.hstack((
        np.mean(mfcc, axis=1),
        np.mean(delta, axis=1),
        np.mean(delta2, axis=1),
        np.std(mfcc, axis=1)
    ))

    return features.reshape(1, -1)

# =========================
# TEXT CLEANING
# =========================
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z ]', '', text)
    return text

# =========================
# AUDIO PREDICTION
# =========================
def predict_audio(file_path):
    features = extract_audio_features(file_path)
    features_scaled = scaler.transform(features)
    pred = audio_model.predict(features_scaled)[0]
    return pred

# =========================
# TEXT PREDICTION
# =========================
def predict_text(text):
    text = clean_text(text)
    vec = vectorizer.transform([text])
    pred = text_model.predict(vec)[0]
    return reverse_map[pred]

# =========================
# FINAL PREDICTION
# =========================
def final_prediction(audio_file, text):
    audio_pred = predict_audio(audio_file)
    text_pred = predict_text(text)

    final_score = (0.4 * audio_pred) + (0.6 * text_pred)
    final_label = round(final_score)

    return label_map[final_label]

# =========================
# ROUTES
# =========================

@app.route("/")
def home():
    return "Backend is running"

# 🔐 REGISTER
@app.route("/register", methods=["POST"])
def register():
    data = request.json

    if not data:
        return jsonify({"error": "No data received"}), 400

    users.append(data)
    return jsonify({"message": "User registered successfully"}), 200

# 🔐 LOGIN
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    if not data:
        return jsonify({"error": "No data received"}), 400

    return jsonify({"message": "Login successful"}), 200

# 🎯 PREDICT
@app.route("/predict", methods=["POST"])
def predict():
    text = request.form.get("text")
    audio_file = request.files.get("audio")

    if not text or not audio_file:
        return jsonify({"error": "Missing input"}), 400

    file_path = "temp.wav"
    audio_file.save(file_path)

    result = final_prediction(file_path, text)

    return jsonify({"prediction": result}), 200

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))