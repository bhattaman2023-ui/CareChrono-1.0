"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, LogOut, User, Activity, ShieldAlert, CheckCircle, 
  ArrowRight, ClipboardList, TrendingUp, TrendingDown, Minus
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  pageFade, sectionReveal, staggerChildren, cardReveal,
  staggerFast, counterReveal
} from "@/components/motion-presets"

interface Patient {
  id: number
  name: string
  date_of_birth: string
  gender: string
  medical_record_number: string
  summary: string | null
  risk_score: string
  progression_trend: string
  created_at: string
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong"

function AnimatedNum({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return
    const step = Math.max(1, Math.floor(end / 20))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 40)
    return () => clearInterval(timer)
  }, [value])
  return <span className={className}>{display}</span>
}

export default function DoctorPortal() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/api/patients")
      if (!response.ok) throw new Error("Failed to fetch patients")
      const data = await response.json()
      setPatients(data)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchPatients() }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchPatients])

  const handleLogout = () => router.push("/")

  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case "High":   return { cls: "bg-red-50 border-red-200 text-red-700",     glow: "shadow-red-100", dot: "bg-red-500" }
      case "Medium": return { cls: "bg-amber-50 border-amber-200 text-amber-700", glow: "shadow-amber-100", dot: "bg-amber-500" }
      default:       return { cls: "bg-emerald-50 border-emerald-200 text-emerald-700", glow: "shadow-emerald-100", dot: "bg-emerald-500" }
    }
  }

  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case "Worsening":  return { cls: "bg-rose-50 border-rose-100 text-rose-600",       icon: <TrendingDown className="h-3.5 w-3.5" /> }
      case "Improving":  return { cls: "bg-emerald-50 border-emerald-100 text-emerald-600", icon: <TrendingUp className="h-3.5 w-3.5" /> }
      default:           return { cls: "bg-slate-50 border-slate-100 text-slate-500",     icon: <Minus className="h-3.5 w-3.5" /> }
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.medical_record_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const highRiskCount = patients.filter(p => p.risk_score === "High").length
  const totalPatients = patients.length

  const STATS = [
    {
      label: "Active Patients",
      value: totalPatients,
      icon: <ClipboardList className="h-6 w-6" />,
      color: "from-sky-500 to-cyan-500",
      shadow: "shadow-sky-200",
      textColor: "text-slate-800",
    },
    {
      label: "Critical Alerts",
      value: highRiskCount,
      icon: <ShieldAlert className="h-6 w-6" />,
      color: highRiskCount > 0 ? "from-red-500 to-rose-600" : "from-slate-400 to-slate-500",
      shadow: highRiskCount > 0 ? "shadow-red-200" : "shadow-slate-100",
      textColor: highRiskCount > 0 ? "text-red-600" : "text-slate-600",
      urgent: highRiskCount > 0,
    },
    {
      label: "Timelines Built",
      value: totalPatients,
      icon: <CheckCircle className="h-6 w-6" />,
      color: "from-teal-500 to-emerald-500",
      shadow: "shadow-teal-100",
      textColor: "text-teal-700",
    },
  ]

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
      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/60 bg-white/80 shadow-sm sticky top-0 z-40 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/25">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">CareChrono</span>
            <span className="text-[10px] bg-sky-50 border border-sky-200 text-sky-700 px-2 py-0.5 rounded-full font-bold">Clinical Board</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5 font-bold shadow-sm">
              <User className="h-3.5 w-3.5 text-sky-500" />
              <span>Dr. Sarah Jenkins</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-7">

        {/* Title */}
        <motion.div variants={sectionReveal} initial="hidden" animate="visible" className="text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Diagnostic Review</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Verify patient symptom progression timelines before consultation.</p>
        </motion.div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</div>
        )}

        {/* ── Stats Cards ── */}
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardReveal}
              whileHover={{ y: -4, boxShadow: `0 20px 48px rgba(15,23,42,0.10)` }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`bg-white border-slate-100 overflow-hidden relative shadow-sm ${stat.shadow}`}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <motion.span
                      variants={counterReveal}
                      className={`text-4xl font-black mt-1 block ${stat.textColor}`}
                    >
                      {loading ? (
                        <span className="inline-block w-10 h-9 skeleton-shimmer rounded-lg" />
                      ) : (
                        <AnimatedNum value={stat.value} />
                      )}
                    </motion.span>
                  </div>
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.urgent ? "animate-glow-red" : ""}`}>
                    {stat.icon}
                  </div>
                </CardContent>
                {/* Bottom gradient accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} opacity-50`} />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Directory ── */}
        <div className="space-y-4">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search patients by name or medical record number (MRN)..."
              className="pl-10 h-11 rounded-xl border-slate-200 text-sm placeholder:text-slate-400 bg-white shadow-sm focus:border-sky-400 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-48 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-14 text-center text-slate-400 font-semibold bg-white border border-slate-100 rounded-3xl"
            >
              <div className="text-4xl mb-3">🔍</div>
              No patients found.
            </motion.div>
          ) : (
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <AnimatePresence>
                {filteredPatients.map((patient) => {
                  const isCritical = patient.risk_score === "High"
                  const riskCfg = getRiskConfig(patient.risk_score)
                  const trendCfg = getTrendConfig(patient.progression_trend)

                  return (
                    <motion.div
                      key={patient.id}
                      variants={cardReveal}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => router.push(`/doctor-portal/patient/${patient.id}`)}
                      className={`group relative overflow-hidden cursor-pointer rounded-2xl border-2 bg-white p-6 flex flex-col justify-between transition-all duration-300 ${
                        isCritical 
                          ? "border-red-200 hover:border-red-400 hover:shadow-xl hover:shadow-red-100/60" 
                          : "border-slate-200 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/60"
                      }`}
                    >
                      {/* Top accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${
                        isCritical ? "from-red-400 via-rose-500 to-red-400" : "from-sky-400 via-cyan-400 to-sky-400"
                      } opacity-80 group-hover:opacity-100 transition-opacity`} />

                      {/* Critical glow bg */}
                      {isCritical && (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50/40 to-transparent pointer-events-none" />
                      )}

                      <div className="space-y-4 relative">
                        {/* Name & MRN */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            {isCritical && (
                              <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.8, repeat: Infinity }}
                                className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest mb-1"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                Critical Alert
                              </motion.div>
                            )}
                            <h3 className={`font-extrabold text-lg transition-colors ${
                              isCritical ? "text-slate-900 group-hover:text-red-600" : "text-slate-900 group-hover:text-sky-600"
                            }`}>
                              {patient.name}
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                              MRN: {patient.medical_record_number}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${riskCfg.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${riskCfg.dot} ${isCritical ? "animate-pulse" : ""}`} />
                              {patient.risk_score} Risk
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${trendCfg.cls}`}>
                              {trendCfg.icon}
                              {patient.progression_trend}
                            </span>
                          </div>
                        </div>

                        {patient.summary && (
                          <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 italic border-l-2 border-slate-200 pl-2.5">
                            &quot;{patient.summary}&quot;
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 relative">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">DOB</span>
                          <span className="text-xs text-slate-700 font-bold block mt-0.5">{patient.date_of_birth}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Gender</span>
                          <span className="text-xs text-slate-700 font-bold block mt-0.5">{patient.gender}</span>
                        </div>
                        <div className="flex items-end justify-end">
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className={`flex items-center gap-1 text-xs font-bold ${isCritical ? "text-red-500" : "text-sky-600"}`}
                          >
                            Review
                            <ArrowRight className="h-3.5 w-3.5" />
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  )
}
