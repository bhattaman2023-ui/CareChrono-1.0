"use client"

import React, { useCallback, useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Loader2, Sparkles, AlertCircle, Activity, Brain } from "lucide-react"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { pageFade, sectionReveal, staggerFast, cardReveal } from "@/components/motion-presets"
import { translations, Language } from "@/components/translations"

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong"

const SYMPTOMS_LIST = [
  { label: "Fever",          emoji: "🤒", color: "from-red-50 to-orange-50    border-red-400    text-red-800    shadow-red-100" },
  { label: "Cough",          emoji: "🤧", color: "from-sky-50 to-cyan-50      border-sky-400    text-sky-800    shadow-sky-100" },
  { label: "Fatigue",        emoji: "😴", color: "from-violet-50 to-purple-50 border-violet-400 text-violet-800 shadow-violet-100" },
  { label: "Headache",       emoji: "🤕", color: "from-amber-50 to-yellow-50  border-amber-400  text-amber-800  shadow-amber-100" },
  { label: "Breathlessness", emoji: "😮‍💨", color: "from-teal-50 to-emerald-50  border-teal-400   text-teal-800   shadow-teal-100" },
  { label: "Joint Pain",     emoji: "🦵", color: "from-rose-50 to-pink-50     border-rose-400   text-rose-800   shadow-rose-100" },
]

function SymptomLogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const patientId = searchParams.get("patient_id") || "1"
  const preSelectedSymptom = searchParams.get("symptom") || ""
  const dictationText = searchParams.get("dictation") || ""

  const [lang, setLang] = useState<Language>("en")

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language
    if (savedLang === "en" || savedLang === "hi") {
      setLang(savedLang)
    }
  }, [])

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[lang][key] || translations.en[key] || key
  }, [lang])

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(() =>
    preSelectedSymptom ? [preSelectedSymptom] : []
  )
  const [severities, setSeverities] = useState<Record<string, string>>(() =>
    preSelectedSymptom ? { [preSelectedSymptom]: "Medium" } : {}
  )
  const [notes, setNotes] = useState(dictationText)
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleSymptom = useCallback((label: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(label)) {
        setSeverities(prevSevs => {
          const updatedSevs = { ...prevSevs }
          delete updatedSevs[label]
          return updatedSevs
        })
        return prev.filter(s => s !== label)
      } else {
        setSeverities(prevSevs => ({ ...prevSevs, [label]: "Medium" }))
        return [...prev, label]
      }
    })
  }, [])

  const handleSeverityChange = (symptomLabel: string, severityLevel: string) => {
    setSeverities(prev => ({ ...prev, [symptomLabel]: severityLevel }))
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

      const compileRes = await fetch(`http://localhost:8000/api/patients/${patientId}/compile-timeline`, {
        method: "POST"
      })
      if (!compileRes.ok) throw new Error("Failed to compile timeline diagnostics")

      router.push("/patient-portal")
    } catch (err: unknown) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="min-h-screen text-slate-800 flex flex-col font-sans"
      style={{
        background: "linear-gradient(160deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)",
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 border-b border-slate-100 py-4 shadow-sm sticky top-0 z-30 backdrop-blur-md"
      >
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.04, x: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push("/patient-portal")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs shadow-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/25">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-800">{t("logSymptoms")}</h2>
          </div>

          <div className="w-16" />
        </div>
      </motion.header>

      {/* Main */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 text-sm rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-2"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Date */}
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            className="bg-white/90 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-6 w-6 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center text-xs font-black">1</span>
              <label className="text-sm font-extrabold uppercase tracking-wide text-slate-600">{t("logDate")}</label>
            </div>
            <input
              type="date"
              className="w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-base focus:outline-none focus:border-sky-400 cursor-pointer transition-colors bg-slate-50"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </motion.div>

          {/* Step 2: Symptoms */}
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.05 }}
            className="bg-white/90 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center text-xs font-black">2</span>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">{t("selectSymptoms")}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("symptomQuestion")}</p>
              </div>
              {selectedSymptoms.length > 0 && (
                <span className="ml-auto text-xs font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                  {selectedSymptoms.length} {t("selectedCount")}
                </span>
              )}
            </div>

            <motion.div
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3"
            >
              {SYMPTOMS_LIST.map((item) => {
                const isSelected = selectedSymptoms.includes(item.label)
                return (
                  <motion.button
                    key={item.label}
                    variants={cardReveal}
                    type="button"
                    onClick={() => toggleSymptom(item.label)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-250 ${
                      isSelected
                        ? `bg-gradient-to-br ${item.color} shadow-md`
                        : "border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <motion.span
                      animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-2xl"
                    >
                      {item.emoji}
                    </motion.span>
                    <span className="text-sm font-bold flex-1">{t(item.label as any)}</span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0"
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Step 3: Severity */}
          <AnimatePresence>
            {selectedSymptoms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-white/90 border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center text-xs font-black">3</span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800">{t("severityQuestion")}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{t("severityDesc")}</p>
                    </div>
                  </div>

                  <div className="space-y-5 divide-y divide-slate-100">
                    {selectedSymptoms.map((sym, idx) => {
                      const currentSev = severities[sym] || "Medium"
                      return (
                        <motion.div
                          key={sym}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className={`space-y-2.5 ${idx > 0 ? "pt-4" : ""}`}
                        >
                          <span className="text-sm font-bold text-slate-700 block">{t(sym as any)} {t("severityTitle")}</span>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { key: "Low",    label: "mild",     sel: "bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-transparent shadow-lg shadow-sky-500/25" },
                              { key: "Medium", label: "moderate", sel: "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-lg shadow-amber-500/25" },
                              { key: "High",   label: "severe",   sel: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-transparent shadow-lg shadow-red-500/25" },
                            ].map(({ key, label, sel }) => (
                              <motion.button
                                key={key}
                                type="button"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleSeverityChange(sym, key)}
                                className={`h-11 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
                                  currentSev === key ? sel : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                                }`}
                              >
                                {t(label as any)}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4: Notes + Voice */}
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white/90 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center text-xs font-black">4</span>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">{t("notesVoice")}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("notesDesc")}</p>
              </div>
            </div>

            <VoiceRecorder token="" onTranscriptionResult={handleVoiceTranscription} />

            <textarea
              rows={4}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:bg-white resize-y transition-all"
              placeholder={t("placeholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pb-4"
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: "0 20px 48px rgba(2,132,199,0.28)" } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-base font-extrabold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("compiling")}</span>
                  <Brain className="h-5 w-5 animate-pulse" />
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{t("submit")}</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </main>
    </motion.div>
  )
}

export default function SymptomLog() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Loading...</p>
        </div>
      </div>
    }>
      <SymptomLogContent />
    </Suspense>
  )
}
