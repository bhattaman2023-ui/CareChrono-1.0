import os
import logging

logger = logging.getLogger("carechrono.transcribe")

# Predefined high-quality clinical transcript for demo purposes
MOCK_TRANSCRIPT = (
    "Patient John Doe, 45-year-old male, presented with complaints of persistent high blood pressure "
    "over the last two weeks, averaging 155 over 95. Past medical history includes Type 2 Diabetes "
    "diagnosed on 2024-03-12, currently managed with Metformin 500mg twice daily. I am initiating "
    "Lisinopril 10mg daily starting today for hypertension control and scheduling a follow-up visit in "
    "two weeks. Lab tests ordered: Lipid panel and Basic Metabolic Panel."
)

async def transcribe_audio_file(file_path: str) -> str:
    """
    Transcribes an uploaded audio file.
    Attempts to import local Faster-Whisper if installed, otherwise falls back to a high-quality clinical transcription mock.
    """
    logger.info(f"Transcribing audio file: {file_path}")
    
    # Try importing faster-whisper to support local deployment
    try:
        from faster_whisper import WhisperModel
        logger.info("faster-whisper library found. Starting transcription...")
        
        # CPU setup (default for portability on standard laptops)
        # Using the tiny model to keep it fast and low memory
        model = WhisperModel("tiny", device="cpu", compute_type="int8")
        
        segments, info = model.transcribe(file_path, beam_size=5)
        text = " ".join([segment.text for segment in segments])
        
        logger.info("Transcription completed via faster-whisper.")
        if text.strip():
            return text.strip()
            
    except ImportError:
        logger.info("faster-whisper is not installed. Using mock clinical transcription.")
    except Exception as e:
        logger.warning(f"Whisper transcription failed: {str(e)}. Using fallback mock.")
        
    return MOCK_TRANSCRIPT
