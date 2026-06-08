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
# TEMP USER STORAGE
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
# PREDICTIONS
# =========================
def predict_audio(file_path):
    features = extract_audio_features(file_path)
    features_scaled = scaler.transform(features)
    return audio_model.predict(features_scaled)[0]

def predict_text(text):
    text = clean_text(text)
    vec = vectorizer.transform([text])
    pred = text_model.predict(vec)[0]
    return reverse_map[pred]

def final_prediction(audio_file=None, text=None):
    audio_pred = 0
    text_pred = 0

    # ✅ Handle optional inputs
    if audio_file:
        audio_pred = predict_audio(audio_file)

    if text:
        text_pred = predict_text(text)

    # If both present → combine
    if audio_file and text:
        final_score = (0.4 * audio_pred) + (0.6 * text_pred)
    elif text:
        final_score = text_pred
    else:
        final_score = audio_pred

    final_label = round(final_score)

    return label_map[final_label]

# =========================
# ROUTES
# =========================

@app.route("/")
def home():
    return "Backend is running"

# =========================
# REGISTER
# =========================
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True) if request.is_json else request.form

        if not data:
            return jsonify({"error": "No data received"}), 400

        name = data.get("name") or data.get("fullName")
        email = data.get("email") or data.get("workEmail")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "Missing fields"}), 400

        users.append({
            "name": name,
            "email": email,
            "password": password
        })

        return jsonify({"message": "User registered successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() if request.is_json else request.form

        if not data:
            return jsonify({"error": "No data received"}), 400

        email = data.get("email") or data.get("workEmail")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing fields"}), 400

        user = next(
            (u for u in users if u["email"] == email and u["password"] == password),
            None
        )

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({
            "token": "user_token_123",
            "role": "USER",
            "name": user["name"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# PREDICT (FIXED)
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        text = request.form.get("text")
        audio_file = request.files.get("audio")

        file_path = None

        # Save audio if exists
        if audio_file:
            file_path = "temp.wav"
            audio_file.save(file_path)

        # ❗ Only error if BOTH missing
        if not text and not audio_file:
            return jsonify({"error": "Provide text or audio"}), 400

        result = final_prediction(file_path, text)

        return jsonify({
            "predicted_stress_level": result,
            "confidence": 0.85,
            "speech_text": text if text else ""
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))