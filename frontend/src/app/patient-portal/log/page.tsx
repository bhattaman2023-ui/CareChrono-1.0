"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Mic, Loader2, Sparkles, AlertCircle, Activity } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VoiceRecorder } from "@/components/VoiceRecorder"

function SymptomLogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const patientId = searchParams.get("patient_id") || "1"
  const preSelectedSymptom = searchParams.get("symptom") || ""
  const dictationText = searchParams.get("dictation") || ""

  // Form States
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [severities, setSeverities] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [logDate, setLogDate] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const SYMPTOMS_LIST = [
    { label: "Fever", emoji: "🤒" },
    { label: "Cough", emoji: "🤧" },
    { label: "Fatigue", emoji: "😴" },
    { label: "Headache", emoji: "🤕" },
    { label: "Breathlessness", emoji: "😮‍💨" },
    { label: "Joint Pain", emoji: "🦵" }
  ]

  useEffect(() => {
    // Set default date to today in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0]
    setLogDate(today)

    // Pre-populate if query parameter exists
    if (preSelectedSymptom) {
      toggleSymptom(preSelectedSymptom)
    }
    if (dictationText) {
      setNotes(dictationText)
    }
  }, [preSelectedSymptom, dictationText])

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(label)) {
        // Remove symptom and its severity
        const updatedSevs = { ...severities }
        delete updatedSevs[label]
        setSeverities(updatedSevs)
        return prev.filter(s => s !== label)
      } else {
        // Add symptom and default severity to Medium
        setSeverities(prevSevs => ({ ...prevSevs, [label]: "Medium" }))
        return [...prev, label]
      }
    })
  }

  const handleSeverityChange = (symptomLabel: string, severityLevel: string) => {
    setSeverities(prev => ({
      ...prev,
      [symptomLabel]: severityLevel
    }))
  }

  const handleVoiceTranscription = (text: string) => {
    setNotes(prev => prev ? `${prev} ${text}` : text)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom to log.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Submit Symptom Log
      const logRes = await fetch(`http://localhost:8000/api/patients/${patientId}/symptoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms_json: JSON.stringify(selectedSymptoms),
          severities_json: JSON.stringify(severities),
          notes: notes,
          date: logDate
        })
      })

      if (!logRes.ok) throw new Error("Failed to save symptom log")

      // 2. Trigger AI timeline and summary compilation
      const compileRes = await fetch(`http://localhost:8000/api/patients/${patientId}/compile-timeline`, {
        method: "POST"
      })
      if (!compileRes.ok) throw new Error("Failed to compile timeline diagnostics")

      router.push("/patient-portal")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={() => router.push("/patient-portal")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          
          <h2 className="text-base font-extrabold text-slate-800">Log Symptoms</h2>
          
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Logging Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {error && (
            <div className="p-4 text-sm rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Date Card */}
          <Card className="bg-white border-slate-100 p-5 space-y-3">
            <label className="block text-sm font-extrabold uppercase tracking-wide text-slate-400">Log Date</label>
            <input 
              type="date"
              className="w-full h-12 rounded-xl border border-slate-200 px-4 text-base focus:outline-none focus:border-sky-500 cursor-pointer"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </Card>

          {/* 2. Symptom Selection Grid */}
          <Card className="bg-white border-slate-100 p-5 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Select Symptoms</h3>
              <p className="text-xs text-slate-400 mt-0.5">Which symptoms are you experiencing today? Select all that apply.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {SYMPTOMS_LIST.map((item) => {
                const isSelected = selectedSymptoms.includes(item.label)
                return (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => toggleSymptom(item.label)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-300 ${
                      isSelected 
                        ? "border-sky-500 bg-sky-500/10 text-sky-800 font-extrabold" 
                        : "border-slate-100 bg-slate-50/40 text-slate-600 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-sm flex-1">{item.label}</span>
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* 3. Severity Selectors for Selected Symptoms */}
          {selectedSymptoms.length > 0 && (
            <Card className="bg-white border-slate-100 p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">How bad is each symptom?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Set the severity rating for today.</p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {selectedSymptoms.map((sym, idx) => {
                  const currentSev = severities[sym] || "Medium"
                  return (
                    <div key={sym} className={`space-y-2 ${idx > 0 ? "pt-4" : ""}`}>
                      <span className="text-sm font-extrabold text-slate-700 block">{sym} Severity:</span>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {["Low", "Medium", "High"].map((lvl) => {
                          const isSel = currentSev === lvl
                          let btnColor = "border-slate-100 bg-slate-50/40 text-slate-500"
                          if (isSel) {
                            if (lvl === "Low") btnColor = "bg-indigo-500 text-white border-indigo-600 shadow shadow-indigo-500/20 font-bold"
                            if (lvl === "Medium") btnColor = "bg-amber-500 text-white border-amber-600 shadow shadow-amber-500/20 font-bold"
                            if (lvl === "High") btnColor = "bg-red-500 text-white border-red-600 shadow shadow-red-500/20 font-bold"
                          }
                          return (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => handleSeverityChange(sym, lvl)}
                              className={`h-11 rounded-xl border text-sm font-semibold transition-all ${btnColor}`}
                            >
                              {lvl === "Low" ? "Mild" : lvl === "Medium" ? "Moderate" : "Severe"}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* 4. Notes / Voice Recorder Card */}
          <Card className="bg-white border-slate-100 p-5 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Add Notes or Record Voice</h3>
              <p className="text-xs text-slate-400 mt-0.5">Describe how you feel in detail. Elderly patients can speak by tapping below.</p>
            </div>
            
            {/* Mounted Speech assistant */}
            <VoiceRecorder 
              token="" 
              onTranscriptionResult={handleVoiceTranscription} 
            />

            <div>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y"
                placeholder="Type additional details or transcribe above..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              variant="teal"
              className="px-8 py-6 rounded-2xl w-full sm:w-auto text-base flex items-center justify-center gap-1.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>AI Compiling Timeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Submit Symptom Log</span>
                </>
              )}
            </Button>
          </div>

        </form>
      </main>
    </div>
  )
}

export default function SymptomLog() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Activity className="h-8 w-8 text-sky-600 animate-pulse" />
      </div>
    }>
      <SymptomLogContent />
    </Suspense>
  )
}
