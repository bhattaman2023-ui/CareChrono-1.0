import React, { useState, useEffect, useRef } from "react"
import { Mic, Square, Loader2, AlertCircle } from "lucide-react"

interface VoiceRecorderProps {
  onTranscriptionResult: (text: string) => void
  token: string
}

type SpeechRecognitionResultItem = {
  transcript: string
}

type SpeechRecognitionAlternativeList = {
  isFinal: boolean
  0: SpeechRecognitionResultItem
}

type SpeechRecognitionResultList = {
  length: number
  [index: number]: SpeechRecognitionAlternativeList
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: SpeechRecognitionResultList
}

type SpeechRecognitionErrorEventLike = {
  error: string
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong"

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionResult, token }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Check for browser Web Speech API
    const SpeechRecognition =
      (window as SpeechRecognitionWindow).SpeechRecognition ||
      (window as SpeechRecognitionWindow).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = "en-US"

      rec.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " "
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          onTranscriptionResult(finalTranscript)
        }
        setInterimText(interimTranscript)
      }

      rec.onerror = (event) => {
        // Next.js dev server intercepts console.error and displays a full-screen overlay.
        // We log Web Speech errors as warnings/info so they don't crash the development UX,
        // while displaying user-friendly messages in the component UI.
        console.warn("Speech recognition warning:", event.error)
        
        if (event.error === "not-allowed") {
          setError("Microphone permission denied. Using backend upload fallback.")
        } else if (event.error === "aborted") {
          // "aborted" is a normal event when the recognition stop() is called.
          console.log("Speech recognition stopped/aborted (expected).")
        } else if (event.error === "no-speech") {
          // "no-speech" is fired when the user hasn't spoken for a while.
          // We don't need to treat this as a blocking error.
          console.log("No speech detected by browser engine.")
        } else {
          setError(`Speech engine issue (${event.error}). Using fallback backend transcription.`)
        }
      }

      rec.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = rec
    } else {
      console.log("Web Speech API is not supported in this browser. Falling back to audio upload.")
    }
  }, [onTranscriptionResult])

  const startRecording = async () => {
    setError(null)
    setInterimText("")
    setIsRecording(true)

    // 1. Try real-time browser speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.warn("Failed to start speech recognition engine", err)
      }
    }

    // 2. Also record raw audio as fallback for backend transcription
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        stream.getTracks().forEach(track => track.stop()) // Stop mic stream

        // If Web Speech API wasn't available or failed to extract text, upload to backend
        if (!recognitionRef.current || error) {
          await uploadAudioFile(audioBlob)
        }
      }

      mediaRecorder.start()
    } catch (err) {
      console.warn("Failed to access microphone stream", err)
      setError("Unable to access microphone. Please check permissions.")
      setIsRecording(false)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    setIsRecording(false)
  }

  const uploadAudioFile = async (blob: Blob) => {
    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", blob, "recording.wav")

    try {
      const response = await fetch("http://localhost:8000/api/transcribe", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("Backend transcription failed")
      }

      const data = await response.json()
      if (data.transcript) {
        onTranscriptionResult(data.transcript)
      }
    } catch (err: unknown) {
      setError("Transcription failed: " + getErrorMessage(err))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isRecording && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRecording ? "bg-red-500" : "bg-slate-400"}`}></span>
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {isRecording ? "Recording Dictation..." : isProcessing ? "Processing Audio..." : "Voice Dictation"}
          </span>
        </div>

        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <Square className="h-3 w-3" />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
            Record Note
          </button>
        )}
      </div>

      {interimText && (
        <div className="text-xs text-slate-600 italic bg-sky-50/60 p-2.5 rounded-xl border border-sky-100/50">
          &quot;{interimText}&quot;
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/50">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
