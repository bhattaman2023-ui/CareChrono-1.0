"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mic, ArrowRight, Activity, Calendar, Heart, ShieldAlert, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VoiceRecorder } from "@/components/VoiceRecorder"

interface Patient {
  id: number
  name: string
  date_of_birth: string
  gender: string
  medical_record_number: string
  summary: string | null
  risk_score: string
  progression_trend: string
}

interface SymptomLog {
  id: number
  date: string
  symptoms_json: string
  severities_json: string
  notes: string | null
}

export default function PatientPortal() {
  const router = useRouter()
  
  // Available demo patients
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  
  // Loaded patient details
  const [patient, setPatient] = useState<Patient | null>(null)
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fast emoji symbols mapping
  const EMOJI_SYMPTOMS = [
    { label: "Fever", emoji: "🤒" },
    { label: "Cough", emoji: "🤧" },
    { label: "Fatigue", emoji: "😴" },
    { label: "Headache", emoji: "🤕" },
    { label: "Breathlessness", emoji: "😮‍💨" },
    { label: "Joint Pain", emoji: "🦵" }
  ]

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/patients")
      if (!response.ok) throw new Error("Failed to fetch patient records")
      const data = await response.json()
      setPatients(data)
      
      // Default to the first patient (John Doe)
      if (data.length > 0) {
        setSelectedPatientId(data[0].id)
        fetchPatientDetails(data[0].id)
      } else {
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fetchPatientDetails = async (id: number) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/patients/${id}`)
      if (!response.ok) throw new Error("Failed to load patient chart")
      const data = await response.json()
      
      setPatient(data)
      if (data.symptom_logs) {
        // Sort logs descending (newest first)
        setSymptomLogs(
          data.symptom_logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientChange = (id: number) => {
    setSelectedPatientId(id)
    fetchPatientDetails(id)
  }

  const handleSymptomClick = (symptomLabel: string) => {
    if (!patient) return
    router.push(`/patient-portal/log?patient_id=${patient.id}&symptom=${encodeURIComponent(symptomLabel)}`)
  }

  const handleVoiceTranscription = (text: string) => {
    if (!patient) return
    // Route to logging page with notes populated via voice
    router.push(`/patient-portal/log?patient_id=${patient.id}&dictation=${encodeURIComponent(text)}`)
  }

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 text-sky-600 animate-pulse" />
          <p className="text-slate-500 font-semibold text-lg">Setting up CareChrono Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Banner with Patient Switcher */}
      <header className="bg-white border-b border-slate-100 py-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div onClick={() => router.push("/")} className="flex items-center gap-2 cursor-pointer">
            <Activity className="h-6 w-6 text-sky-600" />
            <span className="text-lg font-extrabold tracking-tight text-slate-800">CareChrono</span>
            <span className="text-xs bg-sky-50 border border-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold">Patient App</span>
          </div>

          {/* Demo Mode Toggle for Judges */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1.5">
            <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wide">Demo:</span>
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => handlePatientChange(p.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  selectedPatientId === p.id 
                    ? "bg-sky-600 text-white shadow" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Body */}
      {patient && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-8">
          
          {/* Warm Welcoming Greeting */}
          <div className="text-left space-y-2">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Hello, {patient.name}
            </h2>
            <p className="text-xl text-slate-500 font-medium">
              How are you feeling today?
            </p>
          </div>

          {/* EMOJI SYMPTOM QUICK LOGGING BUTTONS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Quick Log Symptom</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {EMOJI_SYMPTOMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSymptomClick(item.label)}
                  className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 hover:border-sky-300 hover:bg-sky-50/20 rounded-3xl transition-all duration-300 shadow-sm hover:shadow active:scale-95 group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300 mb-2">{item.emoji}</span>
                  <span className="text-base font-bold text-slate-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* VOICE ASSISTANT WIDGET */}
          <Card className="bg-gradient-to-br from-white to-sky-50/40 border-sky-100 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-sky-200/20 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3 text-left">
                <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 mt-0.5">
                  <Mic className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="font-extrabold text-lg text-slate-800">Voice Assistant Logging</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mt-0.5">
                    Don't want to type? Tap the button below and speak naturally. For example: "I have had a mild fever and a sore throat since yesterday."
                  </p>
                </div>
              </div>

              {/* Speech recognition trigger */}
              <VoiceRecorder 
                token="" 
                onTranscriptionResult={handleVoiceTranscription} 
              />
            </CardContent>
          </Card>

          {/* AI HEALTH COACH INSIGHTS */}
          {patient.summary && (
            <Card className="bg-gradient-to-br from-sky-600 via-sky-600 to-indigo-600 text-white border-0 shadow-lg shadow-sky-600/10">
              <CardContent className="p-6 space-y-3 text-left">
                <div className="flex items-center gap-1.5 text-sky-200 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse text-sky-200" />
                  AI Health Insights
                </div>
                <h4 className="text-lg font-bold leading-snug">Personalized Symptom Analysis</h4>
                <p className="text-sm text-sky-50/90 leading-relaxed">
                  {patient.summary}
                </p>
                
                {patient.risk_score === "High" && (
                  <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-2xl p-3 text-xs mt-4">
                    <ShieldAlert className="h-5 w-5 text-red-300 shrink-0 animate-bounce" />
                    <span className="font-semibold text-red-200">Alert: Escalating symptoms detected. We have prepared an urgent diagnostic summary for Dr. Jenkins.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* RECENT SYMPTOM LOG HISTORY (Timeline Overview) */}
          <div className="space-y-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Recent Logs</h3>
            
            {symptomLogs.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm">
                No logs recorded yet. Tap an emoji button above to start your symptom log!
              </div>
            ) : (
              <div className="space-y-3">
                {symptomLogs.slice(0, 4).map((log) => {
                  let parsedSymptoms: string[] = []
                  let parsedSeverities: Record<string, string> = {}
                  try {
                    parsedSymptoms = JSON.parse(log.symptoms_json)
                    parsedSeverities = JSON.parse(log.severities_json)
                  } catch (e) {}

                  return (
                    <Card key={log.id} className="bg-white border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          {/* Date */}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{log.date}</span>
                          </div>

                          {/* Symptom chips */}
                          <div className="flex flex-wrap gap-1.5">
                            {parsedSymptoms.map(sym => {
                              const s = parsedSeverities[sym] || "Low"
                              let badgeColor = "bg-indigo-50 border-indigo-100 text-indigo-700"
                              if (s === "High" || s === "Severe") badgeColor = "bg-red-50 border-red-100 text-red-700"
                              if (s === "Medium" || s === "Moderate") badgeColor = "bg-amber-50 border-amber-100 text-amber-700"
                              
                              return (
                                <span key={sym} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                                  {sym} ({s})
                                </span>
                              )
                            })}
                          </div>

                          {/* Notes */}
                          {log.notes && (
                            <p className="text-sm text-slate-600 leading-relaxed font-medium pt-1">
                              "{log.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

        </main>
      )}

    </div>
  )
}
