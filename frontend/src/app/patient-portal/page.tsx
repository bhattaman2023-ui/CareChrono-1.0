"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Activity, Calendar, ShieldAlert, Sparkles, Heart, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import {
  pageFade, sectionReveal, staggerChildren, cardReveal,
  staggerFast, listItemUp
} from "@/components/motion-presets"
import { translations, Language } from "@/components/translations"

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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong"

const EMOJI_SYMPTOMS = [
  { label: "Fever",          emoji: "🤒", color: "from-red-50 to-orange-50    border-red-200    hover:border-red-400    hover:shadow-red-100" },
  { label: "Cough",          emoji: "🤧", color: "from-sky-50 to-cyan-50      border-sky-200    hover:border-sky-400    hover:shadow-sky-100" },
  { label: "Fatigue",        emoji: "😴", color: "from-violet-50 to-purple-50 border-violet-200 hover:border-violet-400 hover:shadow-violet-100" },
  { label: "Headache",       emoji: "🤕", color: "from-amber-50 to-yellow-50  border-amber-200  hover:border-amber-400  hover:shadow-amber-100" },
  { label: "Breathlessness", emoji: "😮‍💨", color: "from-teal-50 to-emerald-50  border-teal-200   hover:border-teal-400   hover:shadow-teal-100" },
  { label: "Joint Pain",     emoji: "🦵", color: "from-rose-50 to-pink-50     border-rose-200   hover:border-rose-400   hover:shadow-rose-100" },
]

/* ─── Skeleton Loader ─── */
function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* header skeleton */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="h-8 w-36 rounded-xl skeleton-shimmer" />
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-xl skeleton-shimmer" />
            <div className="h-8 w-20 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
        <div className="h-12 w-64 rounded-xl skeleton-shimmer" />
        <div className="h-5 w-48 rounded-lg skeleton-shimmer" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />)}
        </div>
        <div className="h-36 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  )
}

export default function PatientPortal() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [lang, setLang] = useState<Language>("en")

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language
    if (savedLang === "en" || savedLang === "hi") {
      setLang(savedLang)
    }
  }, [])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem("lang", newLang)
  }

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[lang][key] || translations.en[key] || key
  }, [lang])

  const fetchPatientDetails = useCallback(async (id: number) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/patients/${id}`)
      if (!response.ok) throw new Error("Failed to load patient chart")
      const data = await response.json()
      setPatient(data)
      if (data.symptom_logs) {
        setSymptomLogs(
          [...data.symptom_logs].sort((a: SymptomLog, b: SymptomLog) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        )
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/api/patients")
      if (!response.ok) throw new Error("Failed to fetch patient records")
      const data = await response.json()
      setPatients(data)
      if (data.length > 0) {
        setSelectedPatientId(data[0].id)
        void fetchPatientDetails(data[0].id)
      } else {
        setLoading(false)
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }, [fetchPatientDetails])

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchPatients() }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchPatients])

  const handlePatientChange = (id: number) => {
    setSelectedPatientId(id)
    void fetchPatientDetails(id)
  }

  const handleSymptomClick = (symptomLabel: string) => {
    if (!patient) return
    router.push(`/patient-portal/log?patient_id=${patient.id}&symptom=${encodeURIComponent(symptomLabel)}`)
  }

  const handleVoiceTranscription = (text: string) => {
    if (!patient) return
    router.push(`/patient-portal/log?patient_id=${patient.id}&dictation=${encodeURIComponent(text)}`)
  }

  if (loading && patients.length === 0) return <PortalSkeleton />

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="min-h-screen text-slate-800 flex flex-col font-sans"
      style={{
        background: "linear-gradient(160deg, #f0f9ff 0%, #f8fafc 40%, #f0fdf4 100%)",
      }}
    >
      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 border-b border-slate-100 py-3.5 shadow-sm sticky top-0 z-30 backdrop-blur-lg"
      >
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/25">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-800">CareChrono</span>
            <span className="text-[10px] bg-sky-50 border border-sky-200 text-sky-700 px-2 py-0.5 rounded-full font-bold">{t("patientApp")}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Demo patient switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/60 rounded-xl p-1">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">{t("demo")}</span>
              {patients.map(p => (
                <motion.button
                  key={p.id}
                  onClick={() => handlePatientChange(p.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    selectedPatientId === p.id
                      ? "bg-sky-600 text-white shadow-sm shadow-sky-500/30"
                      : "text-slate-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  {p.name}
                </motion.button>
              ))}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100/80 border border-slate-200/60 rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleLanguageChange("en")}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  lang === "en"
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-500/30"
                    : "text-slate-600 hover:bg-white hover:shadow-sm"
                }`}
              >
                EN
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleLanguageChange("hi")}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  lang === "hi"
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-500/30"
                    : "text-slate-600 hover:bg-white hover:shadow-sm"
                }`}
              >
                हिन्दी
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Main Body ── */}
      {patient && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-8">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* ── Greeting ── */}
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="text-left space-y-2"
          >
            <motion.div variants={sectionReveal} className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-rose-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("goodToSeeYou")}</span>
            </motion.div>
            <motion.h2 variants={sectionReveal} className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {t("hello")},{" "}
              <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                {patient.name}
              </span>
            </motion.h2>
            <motion.p variants={sectionReveal} className="text-lg text-slate-500 font-medium">
              {t("greetingQuestion")}
            </motion.p>
          </motion.div>

          {/* ── Emoji Symptom Quick Log ── */}
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={sectionReveal} className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t("quickLog")}</span>
              <div className="h-px flex-1 bg-slate-200" />
            </motion.div>

            <motion.div
              variants={staggerFast}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {EMOJI_SYMPTOMS.map((item, index) => (
                <motion.button
                  key={item.label}
                  variants={cardReveal}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSymptomClick(item.label)}
                  className={`flex flex-col items-center justify-center p-5 bg-gradient-to-br rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg group ${item.color}`}
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                    className="text-4xl mb-2"
                  >
                    {item.emoji}
                  </motion.span>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{t(item.label as any)}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Voice Assistant ── */}
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden relative border-0 shadow-lg" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,249,255,0.90))",
              boxShadow: "0 8px 40px rgba(2,132,199,0.10), 0 0 0 1px rgba(186,230,253,0.6)",
            }}>
              {/* Decorative blobs */}
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-sky-300/15 blur-2xl pointer-events-none" />
              <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-300/15 blur-2xl pointer-events-none" />

              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/30 shrink-0">
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-800">{t("voiceTitle")}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mt-0.5">
                      {t("voiceDesc")} <span className="font-medium text-slate-600">{t("voiceExample")}</span>
                    </p>
                  </div>
                </div>
                <VoiceRecorder token="" onTranscriptionResult={handleVoiceTranscription} />
              </CardContent>
            </Card>
          </motion.div>

          {/* ── AI Health Insights ── */}
          <AnimatePresence>
            {patient.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="relative rounded-3xl overflow-hidden p-6 space-y-4"
                  style={{
                    background: "linear-gradient(135deg, #0369a1 0%, #0284c7 40%, #4f46e5 100%)",
                    boxShadow: "0 20px 60px rgba(2,132,199,0.30), 0 0 0 1px rgba(99,102,241,0.20)",
                  }}
                >
                  {/* Decorative orb */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/8 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-2 text-sky-200 font-bold text-xs uppercase tracking-widest relative z-10">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    {t("aiInsights")}
                  </div>

                  <h4 className="text-xl font-extrabold text-white leading-snug relative z-10">
                    {t("personalizedAnalysis")}
                  </h4>

                  <p className="text-sm text-sky-100/90 leading-relaxed relative z-10">
                    {patient.summary}
                  </p>

                  {patient.risk_score === "High" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 bg-red-500/20 border border-red-400/30 rounded-2xl p-3.5 relative z-10"
                    >
                      <div className="h-9 w-9 rounded-xl bg-red-500/25 flex items-center justify-center shrink-0 animate-glow-red">
                        <ShieldAlert className="h-5 w-5 text-red-300" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-200">{t("criticalAlert")}</p>
                        <p className="text-xs text-red-300/80 mt-0.5">{t("criticalDesc")}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Recent Logs ── */}
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="space-y-4"
          >
            <motion.div variants={sectionReveal} className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t("recentLogs")}</span>
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">{symptomLogs.length} {t("entries")}</span>
            </motion.div>

            {symptomLogs.length === 0 ? (
              <motion.div
                variants={sectionReveal}
                className="p-10 text-center bg-white/80 border border-slate-200 rounded-3xl text-slate-400 text-sm"
              >
                <div className="text-3xl mb-3">📋</div>
                {t("noLogs")}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {symptomLogs.slice(0, 4).map((log, logIdx) => {
                  let parsedSymptoms: string[] = []
                  let parsedSeverities: Record<string, string> = {}
                  try {
                    parsedSymptoms = JSON.parse(log.symptoms_json)
                    parsedSeverities = JSON.parse(log.severities_json)
                  } catch {
                    parsedSymptoms = []
                    parsedSeverities = {}
                  }

                  return (
                    <motion.div
                      key={log.id}
                      variants={listItemUp}
                      transition={{ delay: logIdx * 0.07 }}
                      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}
                    >
                      <Card className="bg-white border-slate-100 border shadow-sm p-5 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2.5 flex-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{log.date}</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {parsedSymptoms.map(sym => {
                                const s = parsedSeverities[sym] || "Low"
                                let badgeColor = "bg-sky-50 border-sky-200 text-sky-700"
                                if (s === "High" || s === "Severe") badgeColor = "bg-red-50 border-red-200 text-red-700"
                                if (s === "Medium" || s === "Moderate") badgeColor = "bg-amber-50 border-amber-200 text-amber-700"
                                return (
                                  <span key={sym} className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                                    {t(sym as any)} · {t(s as any)}
                                  </span>
                                )
                              })}
                            </div>

                            {log.notes && (
                              <p className="text-sm text-slate-600 leading-relaxed font-medium border-l-2 border-sky-300 pl-2.5 italic">
                                &quot;{log.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </main>
      )}
    </motion.div>
  )
}
