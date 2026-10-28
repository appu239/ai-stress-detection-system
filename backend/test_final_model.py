import io
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

import final_model


class PredictionEndpointTests(unittest.TestCase):
    def setUp(self):
        final_model.app.config["TESTING"] = True
        self.client = final_model.app.test_client()

    def test_short_text_keeps_model_class_but_withholds_probability(self):
        features = final_model.vectorizer.transform(["tired"])
        model_class = str(final_model.text_model.predict(features)[0]).strip()

        with (
            patch.object(final_model, "load_history", return_value=[]),
            patch.object(final_model, "save_history"),
        ):
            response = self.client.post("/predict", data={"text": "tired"})

        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(
            result["predicted_stress_level"],
            final_model.label_map[final_model.reverse_map[model_class]],
        )
        self.assertIsNone(result["confidence"])
        self.assertIsNone(result["text_prediction"]["confidence"])
        self.assertIn("withheld", result["text_prediction"]["confidence_note"])

    def test_transcription_joins_whisper_segments_and_passes_language(self):
        whisper_model = Mock()
        whisper_model.transcribe.return_value = (
            [SimpleNamespace(text=" I feel "), SimpleNamespace(text="tired.")],
            None,
        )

        with patch.object(final_model, "_transcription_model", whisper_model):
            transcript = final_model.transcribe_audio("sample.wav", "en")

        self.assertEqual(transcript, "I feel tired.")
        whisper_model.transcribe.assert_called_once_with(
            "sample.wav",
            language="en",
            beam_size=5,
            vad_filter=True,
        )

    def test_audio_transcript_and_text_prediction_are_returned_separately(self):
        transcript = "I feel tired and overwhelmed"
        text_prediction, text_confidence = final_model.predict_text(transcript)

        with (
            patch.object(final_model, "load_history", return_value=[]),
            patch.object(final_model, "save_history"),
            patch.object(final_model, "predict_audio", return_value=(2, 0.82)),
            patch.object(final_model, "transcribe_audio", return_value=transcript),
        ):
            response = self.client.post(
                "/predict",
                data={
                    "audio": (io.BytesIO(b"audio"), "sample.wav"),
                    "language": "en",
                },
                content_type="multipart/form-data",
            )

        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result["speech_text"], transcript)
        self.assertEqual(result["transcription_status"], "transcribed")
        self.assertEqual(result["audio_prediction"]["predicted_stress_level"], "High Stress")
        self.assertEqual(
            result["text_prediction"]["predicted_stress_level"],
            final_model.label_map[text_prediction],
        )
        self.assertEqual(result["text_prediction"]["confidence"], text_confidence)
        self.assertEqual(result["prediction_source"], "audio")
        self.assertEqual(result["predicted_stress_level"], "High Stress")
        self.assertNotIn("combined_prediction", result)

    def test_transcription_failure_does_not_discard_audio_prediction(self):
        with (
            patch.object(final_model, "load_history", return_value=[]),
            patch.object(final_model, "save_history"),
            patch.object(final_model, "predict_audio", return_value=(0, 0.75)),
            patch.object(
                final_model,
                "transcribe_audio",
                side_effect=RuntimeError(
                    "Speech transcription requires faster-whisper; "
                    "install backend requirements."
                ),
            ),
        ):
            response = self.client.post(
                "/predict",
                data={"audio": (io.BytesIO(b"audio"), "sample.wav")},
                content_type="multipart/form-data",
            )

        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result["transcription_status"], "unavailable")
        self.assertIsNone(result["speech_text"])
        self.assertEqual(result["audio_prediction"]["predicted_stress_level"], "Low Stress")
        self.assertIsNone(result["text_prediction"])
        self.assertIn("Transcription failed (RuntimeError)", result["transcription_message"])
        self.assertIn("requires faster-whisper", result["transcription_message"])
        self.assertIn("audio prediction is still available", result["transcription_message"])


if __name__ == "__main__":
    unittest.main()
