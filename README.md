# AI Stress Detection System

Experimental stress estimation from text (TF-IDF + SVM) and speech (MFCC +
Random Forest). Audio uploads are transcribed with faster-whisper, then the
existing text model and audio model report separate results; their scores are
not blended. This system is not a medical assessment or diagnosis. The Flask
backend stores account and analysis-history data in local JSON files.

## Run locally on Windows

Install the backend dependencies once:

```powershell
cd backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Start the backend from the `backend` directory:

```powershell
.\venv\Scripts\python.exe final_model.py
```

Install the frontend dependencies once, then start it in a second terminal:

```powershell
cd frontend
npm install
npm start
```

Open http://localhost:3000. The backend health endpoint is
http://127.0.0.1:10000/health. It returns an error status if the required model
artifacts cannot be loaded; prediction endpoints do not substitute a default
stress level when a model is unavailable.

Required model files in `backend`: `stress_model.pkl`, `scaler.pkl`,
`text_model.pkl`, and `vectorizer.pkl`.

The first audio upload downloads the configured faster-whisper model (default:
`base`) and requires network access. Set `WHISPER_MODEL`, `WHISPER_DEVICE`, or
`WHISPER_COMPUTE_TYPE` before starting Flask to choose another model/runtime.
If transcription cannot run, the audio estimate is still returned and the UI
reports that transcription was unavailable. The text classifier was trained on
English text; very short inputs still receive the model's class prediction,
but its probability is withheld because the model's probabilities have not
been validated for short phrases.
