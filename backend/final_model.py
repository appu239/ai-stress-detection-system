import librosa
import numpy as np
import joblib
import re

# =========================
# LOAD MODELS (FIXED NAMES)
# =========================
audio_model = joblib.load("stress_model.pkl")      # audio model
text_model = joblib.load("text_model.pkl")         # ✅ fixed name
vectorizer = joblib.load("vectorizer.pkl")
scaler = joblib.load("scaler.pkl")                 # ✅ added scaler

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
# AUDIO FEATURE EXTRACTION (160 FEATURES)
# =========================
def extract_audio_features(file_path):
    audio, sr = librosa.load(file_path, sr=16000)

    # Fix audio length (3 sec)
    if len(audio) < 3 * sr:
        audio = np.pad(audio, (0, 3 * sr - len(audio)))
    else:
        audio = audio[:3 * sr]

    # SAME AS TRAINING
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    delta = librosa.feature.delta(mfcc)
    delta2 = librosa.feature.delta(mfcc, order=2)

    features = np.hstack((
        np.mean(mfcc, axis=1),    # 40
        np.mean(delta, axis=1),   # 40
        np.mean(delta2, axis=1),  # 40
        np.std(mfcc, axis=1)      # 40
    ))  # TOTAL = 160

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
    features_scaled = scaler.transform(features)   # ✅ added scaling
    pred = audio_model.predict(features_scaled)[0] # ✅ use scaled features
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
# FINAL FUSION
# =========================
def final_prediction(audio_file, text):

    audio_pred = predict_audio(audio_file)
    text_pred = predict_text(text)

    # Weighted combination
    final_score = (0.4 * audio_pred) + (0.6 * text_pred)
    final_label = round(final_score)

    print("\n===== FINAL PREDICTION =====")
    print("Audio Prediction :", label_map[audio_pred])
    print("Text Prediction  :", label_map[text_pred])
    print("Final Prediction :", label_map[final_label])

    return label_map[final_label]

# =========================
# MAIN
# =========================
if __name__ == "__main__":

    # 👉 Make sure this file exists in backend folder
    audio_path = "test.wav"

    text_input = "I feel very stressed and overwhelmed"

    final_prediction(audio_path, text_input)