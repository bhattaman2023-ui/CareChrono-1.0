"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, LogOut, User, Activity, ShieldAlert, CheckCircle, ArrowRight, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
    const timer = window.setTimeout(() => {
      void fetchPatients()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchPatients])

  const handleLogout = () => {
    // Return back to main entry landing page
    router.push("/")
  }

  const getRiskBadgeStyles = (risk: string) => {
    switch(risk) {
      case "High":
        return "bg-red-50 border-red-200 text-red-700 font-extrabold"
      case "Medium":
        return "bg-amber-50 border-amber-200 text-amber-700 font-extrabold"
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold"
    }
  }

  const getTrendBadgeStyles = (trend: string) => {
    switch(trend) {
      case "Worsening":
        return "bg-rose-50 border-rose-100 text-rose-600"
      case "Improving":
        return "bg-emerald-50 border-emerald-100 text-emerald-600"
      default:
        return "bg-slate-50 border-slate-100 text-slate-500"
    }
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.medical_record_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Quick stats calculations
  const highRiskCount = patients.filter(p => p.risk_score === "High").length
  const totalPatients = patients.length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Header NavBar */}
      <header className="border-b border-slate-100 bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <Activity className="h-6 w-6 text-sky-600" />
            <span className="text-xl font-bold tracking-tight text-slate-800">CareChrono</span>
            <span className="text-xs bg-sky-50 border border-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold">Clinical Board</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-150 rounded-full px-3 py-1 font-bold">
              <User className="h-3.5 w-3.5 text-sky-600" />
              <span>Dr. Sarah Jenkins</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-slate-400 hover:text-red-500 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Title Intro */}
        <div className="text-left space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Diagnostic Review</h2>
          <p className="text-sm text-slate-500 font-medium">Verify patient symptom progression timelines before consultation.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Clinical Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-white border-slate-100">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Active Patients</span>
                <span className="text-3xl font-black text-slate-800 mt-1 block">{totalPatients}</span>
              </div>
              <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <ClipboardList className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Critical Alerts</span>
                <span className="text-3xl font-black text-red-600 mt-1 block">{highRiskCount}</span>
              </div>
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${highRiskCount > 0 ? "bg-red-50 text-red-500 animate-pulse" : "bg-slate-100 text-slate-400"}`}>
                <ShieldAlert className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Timelines Built</span>
                <span className="text-3xl font-black text-teal-600 mt-1 block">{totalPatients}</span>
              </div>
              <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Directory Listing */}
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <Input 
              placeholder="Search patients by name or medical record number (MRN)..." 
              className="pl-11 h-11 rounded-xl border-slate-200 text-sm placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Directory Cards */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold bg-white border border-slate-100 rounded-3xl">
              Loading patients...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-semibold bg-white border border-slate-100 rounded-3xl">
              No patients found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => {
                const isCritical = patient.risk_score === "High"
                return (
                  <Card 
                    key={patient.id}
                    onClick={() => router.push(`/doctor-portal/patient/${patient.id}`)}
                    className={`group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-6 border-slate-100 hover:-translate-y-0.5 ${
                      isCritical ? "hover:border-red-400/50 bg-gradient-to-br from-white to-red-50/5" : "hover:border-sky-400/50 bg-white"
                    }`}
                  >
                    {/* Glow indicators */}
                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${
                      isCritical ? "from-red-500/20 via-red-500/80 to-red-500/20" : "from-sky-500/20 via-sky-500/80 to-sky-500/20"
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                    <div className="space-y-4 text-left">
                      {/* Name & MRN */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-sky-600 transition-colors">
                            {patient.name}
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            MRN: {patient.medical_record_number}
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getRiskBadgeStyles(patient.risk_score)}`}>
                            {patient.risk_score} Risk
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getTrendBadgeStyles(patient.progression_trend)}`}>
                            {patient.progression_trend}
                          </span>
                        </div>
                      </div>

                      {/* Clinical preview */}
                      {patient.summary && (
                        <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 italic border-l-2 border-slate-200 pl-2">
                          &quot;{patient.summary}&quot;
                        </p>
                      )}
                    </div>

                    {/* Metadata details footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-left">
                      <div>
                        <span className="text-slate-300 block">DOB</span>
                        <span className="text-slate-600 font-bold block mt-0.5">{patient.date_of_birth}</span>
                      </div>
                      <div>
                        <span className="text-slate-300 block">Gender</span>
                        <span className="text-slate-600 font-bold block mt-0.5">{patient.gender}</span>
                      </div>
                      <div className="flex items-end justify-end group-hover:translate-x-1 transition-transform">
                        <span className="text-sky-600 font-bold flex items-center gap-0.5 text-xs normal-case tracking-normal">
                          Review
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                  </Card>
                )
              })}
            </div>
          )}
        </div>

      </main>

    </div>
  )
}
