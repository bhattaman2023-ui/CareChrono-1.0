"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Plus, 
  Loader2, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  ClipboardList
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Timeline, TimelineEvent } from "@/components/Timeline"
import { VoiceRecorder } from "@/components/VoiceRecorder"

interface Patient {
  id: number
  name: string
  date_of_birth: string
  gender: string
  medical_record_number: string
  summary: string | null
  created_at: string
}

interface Note {
  id: number
  patient_id: number
  doctor_id: number
  date: string
  content: string
  audio_path: string | null
  created_at: string
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong"

export default function PatientDetail() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  
  // Note Form State
  const [noteContent, setNoteContent] = useState("")
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("token") || ""
  )
  
  // Toggle states for viewing notes
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({})

  const fetchPatientData = useCallback(async (authToken: string) => {
    try {
      // 1. Fetch Patient details (includes notes in nested structure)
      const patientRes = await fetch(`http://localhost:8000/api/patients/${patientId}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      if (!patientRes.ok) throw new Error("Failed to fetch patient details")
      const patientData = await patientRes.json()
      
      setPatient(patientData)
      if (patientData.notes) {
        setNotes(
          [...patientData.notes].sort((a: Note, b: Note) => new Date(b.date).getTime() - new Date(a.date).getTime())
        )
      }

      // 2. Fetch Patient timeline events
      const timelineRes = await fetch(`http://localhost:8000/api/patients/${patientId}/timeline`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      if (!timelineRes.ok) throw new Error("Failed to fetch patient timeline")
      const eventsData = await timelineRes.json()
      setTimelineEvents(eventsData)

    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    const localToken = token || localStorage.getItem("token")
    if (!localToken) {
      router.push("/")
      return
    }
    const timer = window.setTimeout(() => {
      void fetchPatientData(localToken)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchPatientData, router, token])

  const handleTranscribeResult = (text: string) => {
    setNoteContent(prev => prev ? `${prev} ${text}` : text)
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return

    setNoteSubmitLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8000/api/patients/${patientId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: noteContent
        })
      })

      if (!response.ok) {
        throw new Error("Failed to save clinical note and trigger timeline generation")
      }

      // Note saved successfully. Trigger refetch to update timeline events and patient summaries.
      setNoteContent("")
      await fetchPatientData(token)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setNoteSubmitLoading(false)
    }
  }

  const downloadPDFReport = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/patients/${patientId}/pdf`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!response.ok) throw new Error("Failed to generate PDF")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `CareChrono_${patient?.name.replace(" ", "_")}_Summary.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      alert("Error generating PDF: " + getErrorMessage(err))
    }
  }

  const toggleNoteExpand = (id: number) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading patient chart...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 border-slate-800">
          <p className="text-slate-400 text-sm mb-4">Patient record not found.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{patient.name}</span>
              <span className="text-xs font-mono text-slate-400 border border-slate-800 bg-slate-950 rounded px-2 py-0.5">{patient.medical_record_number}</span>
            </div>
          </div>

          <Button 
            onClick={downloadPDFReport}
            className="flex items-center gap-1.5"
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </header>

      {/* Grid Content Split */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Note Recorder & Metadata (5/12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-900/30 bg-red-950/40 p-3 text-xs text-red-400">
              {error}
            </div>
          )}
          
          {/* Patient Card */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-left">Patient Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm text-left">
              <div>
                <span className="block text-xs text-slate-400 uppercase tracking-wider mb-0.5">Date of Birth</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  {patient.date_of_birth}
                </span>
              </div>
              
              <div>
                <span className="block text-xs text-slate-400 uppercase tracking-wider mb-0.5">Gender</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <User className="h-4 w-4 text-teal-400" />
                  {patient.gender}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Generated Clinical Summary */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-indigo-950/20 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <CardTitle className="text-base text-white text-left">Clinical Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed text-left">
              {patient.summary || "No active summary generated yet. Type or record a clinical note below to trigger AI timeline events and clinical summaries."}
            </CardContent>
          </Card>

          {/* Clinical Note Creator */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-left">Add Clinical Consultation Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Mounted Voice recorder component */}
              <VoiceRecorder 
                token={token} 
                onTranscriptionResult={handleTranscribeResult} 
              />
              
              <form onSubmit={handleAddNote} className="space-y-3 text-left">
                <div>
                  <textarea
                    rows={6}
                    required
                    placeholder="Type consultation details here, or use the mic above to speak..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end">
                  <Button 
                    type="submit" 
                    variant="teal" 
                    className="flex items-center gap-1.5"
                    disabled={noteSubmitLoading || !noteContent.trim()}
                  >
                    {noteSubmitLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Extracting Timeline...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Save Consultation</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Consultation Notes History */}
          <Card className="bg-slate-900/20 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <ClipboardList className="h-4 w-4" />
                <CardTitle className="text-base text-white text-left">Consultation Log ({notes.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-left">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No previous logs saved.</p>
              ) : (
                <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto pr-1">
                  {notes.map((note) => {
                    const isExpanded = expandedNotes[note.id]
                    return (
                      <div key={note.id} className="py-2.5 first:pt-0 last:pb-0">
                        <button
                          onClick={() => toggleNoteExpand(note.id)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-indigo-400" />
                            {new Date(note.date).toLocaleString()}
                          </span>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        {isExpanded && (
                          <p className="mt-2 text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2 border border-slate-900 rounded-lg">
                            {note.content}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Interactive Visual Timeline (7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="h-full bg-slate-900/40 border-slate-800 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-left">Interactive Clinical Timeline</CardTitle>
              <CardDescription className="text-left">
                Visualizing clinical events extracted from notes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-1">
              <Timeline 
                events={timelineEvents} 
                onSelectNote={(noteId) => {
                  // Auto expand the source note in logs
                  setExpandedNotes(prev => ({
                    ...prev,
                    [noteId]: true
                  }))
                  
                  // Scroll the notes container down if possible, or trigger scroll
                  const element = document.getElementById("notes-container")
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  )
}
