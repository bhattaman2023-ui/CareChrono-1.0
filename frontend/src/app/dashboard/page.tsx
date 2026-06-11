"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Plus, Users, Clock, LogOut, User, 
  TrendingUp, Activity, UserCheck, Loader2, X, Sparkles
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts"
import {
  pageFade, sectionReveal, staggerChildren, cardReveal,
  staggerFast, counterReveal, modalReveal
} from "@/components/motion-presets"

interface Patient {
  id: number
  name: string
  date_of_birth: string
  gender: string
  medical_record_number: string
  summary: string | null
  created_at: string
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong"

function AnimatedNum({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let n = 0
    const end = value
    if (n === end) { setDisplay(end); return }
    const step = Math.max(1, Math.floor(end / 20))
    const timer = setInterval(() => {
      n = Math.min(n + step, end)
      setDisplay(n)
      if (n >= end) clearInterval(timer)
    }, 40)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

export default function Dashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDob, setNewDob] = useState("")
  const [newGender, setNewGender] = useState("Male")
  const [newMrn, setNewMrn] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token] = useState<string>(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("token") || ""
  )
  const [doctorEmail] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("doctor_email") || "doctor@carechrono.com"
  )

  const fetchPatients = useCallback(async (authToken: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/patients", {
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("doctor_email")
          router.push("/")
          return
        }
        throw new Error("Failed to fetch patients")
      }
      const data = await response.json()
      setPatients(data)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const localToken = token || localStorage.getItem("token")
    if (!localToken) { router.push("/"); return }
    const timer = window.setTimeout(() => { void fetchPatients(localToken) }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchPatients, router, token])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("doctor_email")
    router.push("/")
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: newName, date_of_birth: newDob, gender: newGender, medical_record_number: newMrn })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to add patient")
      }
      const addedPatient = await response.json()
      setPatients(prev => [...prev, addedPatient])
      setNewName(""); setNewDob(""); setNewGender("Male"); setNewMrn("")
      setIsNewPatientOpen(false)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitLoading(false)
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.medical_record_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const genderDistribution = [
    { name: "Male",   count: patients.filter(p => p.gender === "Male").length },
    { name: "Female", count: patients.filter(p => p.gender === "Female").length },
    { name: "Other",  count: patients.filter(p => p.gender !== "Male" && p.gender !== "Female").length },
  ].filter(g => g.count > 0)

  const CHART_COLORS = ["#6366f1", "#0f766e", "#a855f7"]

  const STATS = [
    { label: "Total Patients", value: patients.length, icon: <Users className="h-5 w-5" />, color: "from-indigo-500 to-violet-600", sub: "Active files in local DB" },
    { label: "System Status", valueStr: "Online", icon: <UserCheck className="h-5 w-5" />, color: "from-teal-500 to-emerald-500", sub: "AI timeline processor connected" },
    { label: "Data Source", valueStr: "Local", icon: <Clock className="h-5 w-5" />, color: "from-purple-500 to-indigo-500", sub: "Zero cloud latency" },
  ]

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
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">CareChrono</span>
            <span className="text-[10px] bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 font-medium">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>{doctorEmail}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-7">

        {/* Title row */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Clinical Dashboard</h2>
            <p className="text-sm text-slate-400 mt-1">Manage patient files and review AI-generated timelines.</p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => setIsNewPatientOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white border-0 shadow-lg shadow-teal-500/25 font-bold rounded-xl px-5 py-2.5"
            >
              <Plus className="h-4 w-4" />
              New Patient
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Stats Grid ── */}
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
              whileHover={{ y: -3 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/60 overflow-hidden relative">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </CardTitle>
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div variants={counterReveal} className="text-3xl font-extrabold text-white">
                    {stat.valueStr ?? <AnimatedNum value={stat.value ?? 0} />}
                  </motion.div>
                  <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                </CardContent>
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} opacity-40`} />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Analytics + Patient List ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

          {/* Patient List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search patient record by name or MRN..."
                className="pl-10 bg-slate-900/50 border-slate-800/60 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-indigo-500/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="py-14 text-center text-slate-400 text-sm rounded-2xl border border-slate-800 bg-slate-900/20">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-500 mb-3" />
                Loading patients directory...
              </div>
            ) : filteredPatients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-14 text-center text-slate-400 text-sm rounded-2xl border border-dashed border-slate-700 bg-slate-900/10"
              >
                <div className="text-4xl mb-3">📋</div>
                No patients found. Click &quot;New Patient&quot; to register one.
              </motion.div>
            ) : (
              <motion.div
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filteredPatients.map((patient) => {
                  const initials = patient.name
                    .split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                  return (
                    <motion.div
                      key={patient.id}
                      variants={cardReveal}
                      whileHover={{ y: -4, boxShadow: "0 20px 50px rgba(99,102,241,0.12)" }}
                      transition={{ duration: 0.25 }}
                      onClick={() => router.push(`/patients/${patient.id}`)}
                      className="group relative overflow-hidden bg-slate-900/40 border border-slate-800/70 hover:border-indigo-500/40 rounded-2xl cursor-pointer p-5 flex flex-col justify-between transition-all duration-300"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                            {initials}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors duration-200">
                              {patient.name}
                            </h3>
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                              {patient.medical_record_number}
                            </span>
                          </div>
                        </div>

                        {patient.summary && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 italic border-l-2 border-indigo-500/25 pl-2.5">
                            &quot;{patient.summary}&quot;
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/50 grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">DOB</span>
                          <span className="font-medium text-slate-200 mt-0.5 block">{patient.date_of_birth}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Gender</span>
                          <span className="font-medium text-slate-200 mt-0.5 block">{patient.gender}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>

          {/* Right panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Chart Card */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/60">
                <CardHeader>
                  <CardTitle className="text-base text-left text-white">Demographic Distribution</CardTitle>
                  <CardDescription className="text-left text-slate-500">Gender split of clinical database</CardDescription>
                </CardHeader>
                <CardContent className="h-56">
                  {patients.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No data to display
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={genderDistribution}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "12px" }}
                          cursor={{ fill: "rgba(99,102,241,0.06)" }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {genderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Info Card */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-indigo-950/40 to-purple-950/25 border-indigo-500/15">
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-400">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base text-white text-left">Clinical Timelines</CardTitle>
                    <Sparkles className="h-3.5 w-3.5 text-violet-400 ml-auto" />
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-400 space-y-2.5 leading-relaxed text-left">
                  <p>CareChrono parses typed or recorded physician consultation details and highlights critical clinical landmarks dynamically.</p>
                  <p className="text-xs text-slate-500 bg-slate-900/40 border border-slate-800/50 rounded-xl p-3">
                    Default Ollama parses timeline events locally without sharing patient data. Select Gemini Free Tier in backend configs for cloud alternatives.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── New Patient Modal ── */}
      <AnimatePresence>
        {isNewPatientOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewPatientOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              variants={modalReveal}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="w-full max-w-md rounded-2xl border border-slate-700/60 p-7 relative"
                style={{
                  background: "rgba(15, 23, 42, 0.96)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(99,102,241,0.15)",
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setIsNewPatientOpen(false)}
                  className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2.5 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white">Add New Patient Record</h3>
                </div>

                <form onSubmit={handleAddPatient} className="space-y-4">
                  {error && (
                    <div className="p-3 text-xs rounded-xl bg-red-950/40 border border-red-900/30 text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Patient Full Name</label>
                    <Input
                      placeholder="E.g., Michael Johnson"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-slate-800/60 border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/60 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Date of Birth</label>
                      <Input
                        type="date"
                        required
                        value={newDob}
                        onChange={(e) => setNewDob(e.target.value)}
                        className="bg-slate-800/60 border-slate-700/60 text-slate-100 focus:border-teal-500/60 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Gender</label>
                      <Select
                        value={newGender}
                        onChange={(e) => setNewGender(e.target.value)}
                        className="bg-slate-800/60 border-slate-700/60 text-slate-100 focus:border-teal-500/60 rounded-xl"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Medical Record Number (MRN)</label>
                    <Input
                      placeholder="E.g., MRN-55821"
                      required
                      value={newMrn}
                      onChange={(e) => setNewMrn(e.target.value)}
                      className="bg-slate-800/60 border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/60 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/50">
                    <Button
                      type="button"
                      onClick={() => setIsNewPatientOpen(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl px-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitLoading}
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white border-0 shadow-lg shadow-teal-500/25 font-bold rounded-xl px-5"
                    >
                      {submitLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </span>
                      ) : "Add Patient"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
