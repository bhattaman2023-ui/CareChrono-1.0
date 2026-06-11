"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, Download, FileText, Calendar, User, 
  Plus, Loader2, ChevronRight, ChevronDown, Sparkles, ClipboardList, Brain
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Timeline, TimelineEvent } from "@/components/Timeline"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { pageFade, sectionReveal, staggerChildren, cardReveal, staggerFast } from "@/components/motion-presets"

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
  const [noteContent, setNoteContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("token") || ""
  )
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({})

  const fetchPatientData = useCallback(async (authToken: string) => {
    try {
      const patientRes = await fetch(`http://localhost:8000/api/patients/${patientId}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      if (!patientRes.ok) throw new Error("Failed to fetch patient details")
      const patientData = await patientRes.json()
      setPatient(patientData)
      if (patientData.notes) {
        setNotes(
          [...patientData.notes].sort((a: Note, b: Note) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        )
      }

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
    if (!localToken) { router.push("/"); return }
    const timer = window.setTimeout(() => { void fetchPatientData(localToken) }, 0)
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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: noteContent })
      })
      if (!response.ok) throw new Error("Failed to save clinical note and trigger timeline generation")
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
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <div className="min-h-screen dark-hero-gradient-bg text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Brain className="h-7 w-7 text-white animate-pulse" />
            </div>
            <span className="absolute inset-0 rounded-2xl border-2 border-indigo-400/40 animate-ping" />
          </div>
          <p className="text-sm text-slate-400 font-semibold">Loading patient chart...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen dark-hero-gradient-bg text-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 border-slate-800 bg-slate-900/50">
          <p className="text-slate-400 text-sm mb-4">Patient record not found.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    )
  }

  const initials = patient.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="min-h-screen dark-hero-gradient-bg text-slate-100 flex flex-col"
    >
      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.06, x: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
                {initials}
              </div>
              <div>
                <span className="text-base font-bold text-white">{patient.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/25 bg-indigo-500/10 rounded px-1.5 py-0.5">
                    {patient.medical_record_number}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{patient.gender} · DOB {patient.date_of_birth}</span>
                </div>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={downloadPDFReport}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/20 rounded-xl px-4 text-sm font-bold"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ── Grid Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Note entry + metadata (5 cols) */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 space-y-5"
        >
          {error && (
            <div className="rounded-xl border border-red-900/30 bg-red-950/40 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Patient Profile Card */}
          <motion.div variants={cardReveal}>
            <Card className="bg-slate-900/50 border-slate-800/60 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <CardTitle className="text-sm text-left text-white">Patient Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Date of Birth</span>
                  <span className="text-white font-semibold flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    {patient.date_of_birth}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Gender</span>
                  <span className="text-white font-semibold flex items-center gap-1.5 text-sm">
                    <User className="h-3.5 w-3.5 text-teal-400" />
                    {patient.gender}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Clinical Summary */}
          <motion.div variants={cardReveal}>
            <div
              className="rounded-2xl border border-indigo-500/20 p-5 space-y-3"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2 text-indigo-300">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">AI Clinical Summary</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {patient.summary ||
                  "No summary yet. Type or record a clinical note below to trigger AI timeline extraction and clinical summaries."}
              </p>
            </div>
          </motion.div>

          {/* Note Creator */}
          <motion.div variants={cardReveal}>
            <Card className="bg-slate-900/50 border-slate-800/60">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5 text-white" />
                  </div>
                  <CardTitle className="text-sm text-left text-white">Add Clinical Note</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <VoiceRecorder token={token} onTranscriptionResult={handleTranscribeResult} />
                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={5}
                    required
                    placeholder="Type consultation details or use the mic above..."
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-950/60 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500/60 focus:outline-none focus:bg-slate-950/80 resize-y transition-all"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={noteSubmitLoading || !noteContent.trim()}
                      whileHover={!noteSubmitLoading && noteContent.trim() ? { scale: 1.03 } : {}}
                      whileTap={!noteSubmitLoading ? { scale: 0.97 } : {}}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    </motion.button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Consultation Log */}
          <motion.div variants={cardReveal}>
            <Card className="bg-slate-900/30 border-slate-800/60">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <ClipboardList className="h-4 w-4" />
                  <CardTitle className="text-sm text-white text-left">
                    Consultation Log
                    <span className="ml-2 text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      {notes.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent id="notes-container" className="space-y-1 p-4">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">No previous notes saved.</p>
                ) : (
                  <div className="divide-y divide-slate-800/40 max-h-[280px] overflow-y-auto pr-1 space-y-0">
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
                            <motion.span
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.span>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <p className="mt-2 text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 border border-slate-800/50 rounded-xl">
                                  {note.content}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right: Timeline (7 cols) */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="lg:col-span-7"
        >
          <Card className="h-full bg-slate-900/40 border-slate-800/60 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base text-left text-white">Interactive Clinical Timeline</CardTitle>
                  <CardDescription className="text-left text-slate-500 text-xs mt-0.5">
                    AI-extracted events from consultation notes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-1">
              <Timeline
                events={timelineEvents}
                onSelectNote={(noteId) => {
                  setExpandedNotes(prev => ({ ...prev, [noteId]: true }))
                  const element = document.getElementById("notes-container")
                  if (element) element.scrollIntoView({ behavior: "smooth" })
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  )
}
