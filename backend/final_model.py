import librosa
import numpy as np
import joblib
import re
import os
import tempfile
import logging
import json
import uuid
import threading
from pathlib import Path
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# =========================
# LOGGING
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)

# =========================
# USER STORAGE
# =========================
try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False
    logger.warning("bcrypt not available — passwords will be stored as-is")

USER_FILE = "users.json"
HISTORY_FILE = "history.json"


# =========================
# USER FUNCTIONS
# =========================
def load_users():
    if os.path.exists(USER_FILE):
        try:
            with open(USER_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    return []


def save_users(users):
    with open(USER_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


def hash_password(password):
    """Hash password with bcrypt if available."""
    if BCRYPT_AVAILABLE:
        return bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    return password


def check_password(password, stored):
    """Verify password against stored hash."""
    if BCRYPT_AVAILABLE:
        try:
            return bcrypt.checkpw(
                password.encode("utf-8"),
                stored.encode("utf-8")
            )
        except (ValueError, AttributeError):
            return password == stored

    return password == stored


users = load_users()


# =========================
# HISTORY FUNCTIONS
# =========================
def load_history():
    """
    Load saved stress analysis history.
    If history.json does not exist, return an empty list.
    """
    if not os.path.exists(HISTORY_FILE):
        return []

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

            if isinstance(data, list):
                return data

            return []

    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"History load error: {e}")
        return []


def save_history(history):
    """
    Save all stress analysis records to history.json.
    """
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)

    except IOError as e:
        logger.error(f"History save error: {e}")
        raise


# =========================
# LOAD MODELS
# =========================
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_ERRORS = {}
audio_model = None
scaler = None
text_model = None
vectorizer = None

try:
    audio_model = joblib.load(os.path.join(MODEL_DIR, "stress_model.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    if (
        getattr(audio_model, "n_features_in_", None) != 160
        or getattr(scaler, "n_features_in_", None) != 160
    ):
        raise ValueError("Audio model and scaler must accept the 160 MFCC features")
    if set(int(label) for label in audio_model.classes_) != {0, 1, 2}:
        raise ValueError("Audio model must contain all three stress classes")
    logger.info("Audio model and scaler loaded successfully")
except Exception as e:
    MODEL_ERRORS["audio"] = str(e)
    audio_model = None
    scaler = None
    logger.exception("Audio model could not be loaded")

try:
    text_model = joblib.load(os.path.join(MODEL_DIR, "text_model.pkl"))
    vectorizer = joblib.load(os.path.join(MODEL_DIR, "vectorizer.pkl"))
    if getattr(text_model, "n_features_in_", None) != len(vectorizer.vocabulary_):
        raise ValueError("Text model and vectorizer feature dimensions do not match")
    if set(str(label) for label in text_model.classes_) != {
        "Low Stress",
        "Moderate Stress",
        "High Stress",
    }:
        raise ValueError("Text model must contain all three stress classes")
    logger.info("Text model and vectorizer loaded successfully")
except Exception as e:
    MODEL_ERRORS["text"] = str(e)
    text_model = None
    vectorizer = None
    logger.exception("Text model could not be loaded")


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

_transcription_model = None
_transcription_model_lock = threading.Lock()


# =========================
# AUDIO FEATURE EXTRACTION
# =========================
def extract_audio_features(file_path):
    """
    Extract 160 audio features matching training pipeline:

    40 MFCC means
    + 40 Delta means
    + 40 Delta2 means
    + 40 MFCC standard deviations
    """

    try:
        audio, sr = librosa.load(file_path, sr=16000, mono=True)
    except Exception as e:
        logger.exception("Unable to decode uploaded audio")
        raise ValueError(
            f"Unable to decode audio file ({type(e).__name__})"
        ) from e
    if audio.size == 0:
        raise ValueError("The uploaded audio file contains no audio samples")

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

    if features.shape != (160,) or not np.isfinite(features).all():
        raise ValueError("Audio feature extraction returned invalid features")

    return features.reshape(1, -1)


# =========================
# TEXT CLEANING
# =========================
def clean_text(text):
    text = text.lower()

    text = re.sub(
        r'[^a-zA-Z ]',
        '',
        text
    )

    return text.strip()


# =========================
# AUDIO PREDICTION
# =========================
def predict_audio(file_path):
    """
    Predict stress from audio file.

    Returns:
        (label_int, confidence)
    """

    if audio_model is None or scaler is None:
        raise RuntimeError("Audio prediction model is unavailable")

    features = extract_audio_features(file_path)
    features_scaled = scaler.transform(features)
    prediction = audio_model.predict(features_scaled)[0]
    prediction_id = int(prediction)
    if prediction_id not in label_map:
        raise ValueError(f"Audio model returned unknown class {prediction!r}")

    confidence = None
    if hasattr(audio_model, "predict_proba"):
        classes = list(audio_model.classes_)
        confidence = float(
            audio_model.predict_proba(features_scaled)[0][classes.index(prediction)]
        )

    return prediction_id, confidence


# =========================
# TEXT PREDICTION
# =========================
def predict_text(text):
    """
    Predict stress from text.

    Returns:
        (label_int, confidence)
    """

    if text_model is None or vectorizer is None:
        raise RuntimeError("Text prediction model is unavailable")

    cleaned_text = clean_text(text)
    if not cleaned_text:
        raise ValueError(
            "The text model supports English-language text only; "
            "no supported characters were found."
        )

    features = vectorizer.transform([cleaned_text])
    prediction = str(text_model.predict(features)[0]).strip()
    if prediction not in reverse_map:
        raise ValueError(f"Text model returned unknown class {prediction!r}")

    confidence = None
    if len(cleaned_text.split()) >= 3 and hasattr(text_model, "predict_proba"):
        classes = list(text_model.classes_)
        confidence = float(
            text_model.predict_proba(features)[0][classes.index(prediction)]
        )

    return reverse_map[prediction], confidence


def transcribe_audio(file_path, language=None):
    """Transcribe an audio file with a lazily loaded faster-whisper model."""
    global _transcription_model

    if _transcription_model is None:
        with _transcription_model_lock:
            if _transcription_model is None:
                try:
                    from faster_whisper import WhisperModel
                except ImportError as e:
                    raise RuntimeError(
                        "Speech transcription requires faster-whisper; "
                        "install backend requirements."
                    ) from e

                _transcription_model = WhisperModel(
                    os.environ.get("WHISPER_MODEL", "base"),
                    device=os.environ.get("WHISPER_DEVICE", "cpu"),
                    compute_type=os.environ.get("WHISPER_COMPUTE_TYPE", "int8"),
                )

    segments, _ = _transcription_model.transcribe(
        file_path,
        language=language or None,
        beam_size=5,
        vad_filter=True,
    )
    return " ".join(segment.text.strip() for segment in segments).strip()


# ============================================================
# ROUTES
# ============================================================

# =========================
# HOME
# =========================
@app.route("/")
def home():
    return "Backend is running"


# =========================
# HEALTH
# =========================
@app.route("/health")
def health():
    audio_loaded = audio_model is not None and scaler is not None
    text_loaded = text_model is not None and vectorizer is not None
    return jsonify({
        "status": "ok" if audio_loaded and text_loaded else "error",
        "models_loaded": audio_loaded and text_loaded,
        "audio_model_loaded": audio_loaded,
        "text_model_loaded": text_loaded,
        "model_errors": MODEL_ERRORS,
    }), 200 if audio_loaded and text_loaded else 503


# =========================
# REGISTER
# =========================
@app.route("/register", methods=["POST"])
def register():

    try:

        data = (
            request.get_json(force=True)
            if request.is_json
            else request.form
        )

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        name = (
            data.get("name")
            or data.get("fullName")
        )

        email = (
            data.get("email")
            or data.get("workEmail")
        )

        password = data.get("password")

        if not name or not email or not password:
            return jsonify({
                "error": "Missing fields"
            }), 400

        existing = next(
            (
                u for u in users
                if u["email"] == email
            ),
            None
        )

        if existing:
            return jsonify({
                "error": (
                    "User with this email "
                    "already exists"
                )
            }), 409

        users.append({
            "name": name,
            "email": email,
            "password": hash_password(password)
        })

        save_users(users)

        logger.info(
            f"User registered: {email}"
        )

        return jsonify({
            "message":
            "User registered successfully"
        }), 200

    except Exception as e:

        logger.error(
            f"Register error: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():

    try:

        data = (
            request.get_json()
            if request.is_json
            else request.form
        )

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        email = (
            data.get("email")
            or data.get("workEmail")
        )

        password = data.get("password")

        if not email or not password:
            return jsonify({
                "error": "Missing fields"
            }), 400

        user = next(
            (
                u for u in users
                if u["email"] == email
                and check_password(
                    password,
                    u["password"]
                )
            ),
            None
        )

        if not user:
            return jsonify({
                "error": "Invalid credentials"
            }), 401

        logger.info(
            f"User logged in: {email}"
        )

        return jsonify({
            "token": "user_token_123",
            "role": user.get(
                "role",
                "USER"
            ),
            "name": user["name"],
            "email": user["email"]
        }), 200

    except Exception as e:

        logger.error(
            f"Login error: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# PREDICT
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        text = request.form.get("text")
        if text is None and request.is_json:
            payload = request.get_json(silent=True) or {}
            text = payload.get("text")
        text = text.strip() if isinstance(text, str) else None
        if text and text.casefold() in {"no text", "[no text provided]"}:
            text = None

        language = request.form.get("language", "en").strip() or "en"
        audio_file = request.files.get("audio")
        if audio_file and not audio_file.filename:
            audio_file = None

        if not text and not audio_file:
            return jsonify({
                "error": "Please provide audio or text"
            }), 400

        if audio_file and (audio_model is None or scaler is None):
            return jsonify({
                "error": "Audio prediction model is unavailable",
                "details": MODEL_ERRORS.get("audio"),
            }), 503
        if text and not audio_file and (text_model is None or vectorizer is None):
            return jsonify({
                "error": "Text prediction model is unavailable",
                "details": MODEL_ERRORS.get("text"),
            }), 503

        audio_output = None
        text_output = None
        transcription = None
        transcription_status = "provided_text" if text else "not_requested"
        transcription_message = None

        if audio_file:
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(
                    suffix=Path(audio_file.filename).suffix or ".audio",
                    delete=False
                ) as tmp:
                    tmp_path = tmp.name
                    audio_file.save(tmp_path)

                audio_pred, audio_conf = predict_audio(tmp_path)
                audio_output = {
                    "predicted_stress_level": label_map[audio_pred],
                    "confidence": audio_conf,
                }
                logger.info(
                    "Audio prediction: %s (conf: %s)",
                    audio_output["predicted_stress_level"],
                    audio_conf if audio_conf is not None else "unavailable",
                )

                try:
                    transcription = transcribe_audio(tmp_path, language)
                    if transcription:
                        transcription_status = "transcribed"
                    else:
                        transcription_status = "no_speech"
                        transcription_message = "No speech was detected in the audio."
                except Exception as e:
                    logger.exception("Audio transcription failed")
                    transcription_status = "unavailable"
                    transcription_detail = str(e).strip() or "No error detail was provided."
                    transcription_message = (
                        f"Transcription failed ({type(e).__name__}): "
                        f"{transcription_detail[:500]} "
                        "The audio prediction is still available."
                    )
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.unlink(tmp_path)
                    except OSError:
                        logger.warning("Could not remove temporary audio file %s", tmp_path)

        text_to_classify = transcription or text
        if text_to_classify:
            if text_model is not None and vectorizer is not None:
                try:
                    text_pred, text_conf = predict_text(text_to_classify)
                    text_output = {
                        "predicted_stress_level": label_map[text_pred],
                        "confidence": text_conf,
                        "confidence_note": (
                            "Confidence is withheld for text shorter than three "
                            "words because this model's probabilities are not "
                            "validated for very short inputs."
                            if text_conf is None
                            else None
                        ),
                    }
                    logger.info(
                        "Text prediction: %r -> %s (conf: %s)",
                        text_to_classify,
                        text_output["predicted_stress_level"],
                        text_conf if text_conf is not None else "withheld",
                    )
                except ValueError as e:
                    if audio_output is None:
                        raise
                    text_output = {
                        "error": str(e),
                    }
            elif audio_output is not None:
                text_output = {
                    "error": "Text prediction model is unavailable.",
                }

        primary_output = audio_output or text_output
        if primary_output is None:
            return jsonify({"error": "No prediction could be produced"}), 500

        result = primary_output["predicted_stress_level"]
        confidence = primary_output["confidence"]
        prediction_source = "audio" if audio_output is not None else "text"

        history = load_history()
        history_record = {
            "id": str(uuid.uuid4()),
            "source_type": "Audio" if audio_file else "Text",
            "stress_level": result,
            "confidence": round(confidence, 4) if confidence is not None else None,
            "transcription": transcription or text,
            "audio_prediction": audio_output,
            "text_prediction": text_output,
            "timestamp": datetime.now().isoformat()
        }
        history.append(history_record)
        save_history(history)
        logger.info("Analysis saved to history: %s", history_record["id"])

        return jsonify({
            "predicted_stress_level": result,
            "confidence": round(confidence, 4) if confidence is not None else None,
            "prediction_source": prediction_source,
            "audio_prediction": audio_output,
            "text_prediction": text_output,
            "speech_text": transcription,
            "transcription_status": transcription_status,
            "transcription_message": transcription_message,
            "history_id": history_record["id"],
        }), 200

    except ValueError as e:
        logger.warning(f"Invalid prediction input: {e}")
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        logger.exception("PREDICT ERROR")
        return jsonify({
            "error": f"Analysis failed: {str(e)}"
        }), 500


# =========================
# GET HISTORY
# =========================
@app.route(
    "/api/history",
    methods=["GET"]
)
def get_history():

    try:

        history = load_history()

        # Newest records first
        history = list(
            reversed(history)
        )

        return jsonify(
            history
        ), 200

    except Exception as e:

        logger.error(
            f"GET HISTORY ERROR: {e}"
        )

        return jsonify({
            "error":
            "Failed to load history"
        }), 500


# =========================
# DELETE HISTORY RECORD
# =========================
@app.route(
    "/api/history/<history_id>",
    methods=["DELETE"]
)
def delete_history(history_id):

    try:

        history = load_history()

        updated_history = [
            record
            for record in history
            if record.get("id")
            != history_id
        ]

        if len(updated_history) == len(history):

            return jsonify({
                "error":
                "History record not found"
            }), 404

        save_history(
            updated_history
        )

        logger.info(
            f"History deleted: "
            f"{history_id}"
        )

        return jsonify({
            "message":
            "History record deleted successfully"
        }), 200

    except Exception as e:

        logger.error(
            f"DELETE HISTORY ERROR: {e}"
        )

        return jsonify({
            "error":
            "Failed to delete history"
        }), 500


# =========================
# USER COUNT
# =========================
@app.route("/api/user-count")
def user_count():

    return jsonify({
        "count": len(users)
    }), 200


# =========================
# FORGOT PASSWORD
# =========================
@app.route(
    "/api/forgot-password",
    methods=["POST"]
)
def forgot_password():

    data = (
        request.get_json()
        if request.is_json
        else request.form
    )

    email = (
        data.get("email", "")
        if data
        else ""
    )

    logger.info(
        f"Password reset requested for: "
        f"{email}"
    )

    return jsonify({
        "message":
        "If an account exists for this email, "
        "reset instructions will be sent."
    }), 200


# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(
            os.environ.get(
                "PORT",
                10000
            )
        )
    )