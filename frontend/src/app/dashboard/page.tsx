"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Plus, 
  Users, 
  Clock, 
  HeartPulse, 
  LogOut, 
  User, 
  FileText, 
  TrendingUp, 
  Activity,
  UserCheck,
  Loader2
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts"

interface Patient {
  id: number
  name: string
  date_of_birth: string
  gender: string
  medical_record_number: string
  summary: string | null
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  
  // New Patient Form fields
  const [newName, setNewName] = useState("")
  const [newDob, setNewDob] = useState("")
  const [newGender, setNewGender] = useState("Male")
  const [newMrn, setNewMrn] = useState("")
  
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>("")
  const [doctorEmail, setDoctorEmail] = useState("")

  useEffect(() => {
    const localToken = localStorage.getItem("token")
    const email = localStorage.getItem("doctor_email")
    if (!localToken) {
      router.push("/")
      return
    }
    setToken(localToken)
    setDoctorEmail(email || "doctor@carechrono.com")
    fetchPatients(localToken)
  }, [router])

  const fetchPatients = async (authToken: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/patients", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          return
        }
        throw new Error("Failed to fetch patients")
      }
      const data = await response.json()
      setPatients(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          date_of_birth: newDob,
          gender: newGender,
          medical_record_number: newMrn
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to add patient")
      }

      // Refresh patients list
      const addedPatient = await response.json()
      setPatients(prev => [...prev, addedPatient])
      
      // Reset form
      setNewName("")
      setNewDob("")
      setNewGender("Male")
      setNewMrn("")
      setIsNewPatientOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.medical_record_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Chart Data Preparation (Group by Gender)
  const genderDistribution = [
    { name: "Male", count: patients.filter(p => p.gender === "Male").length },
    { name: "Female", count: patients.filter(p => p.gender === "Female").length },
    { name: "Other", count: patients.filter(p => p.gender !== "Male" && p.gender !== "Female").length }
  ].filter(g => g.count > 0)

  const COLORS = ["#6366f1", "#0f766e", "#a855f7"]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Header NavBar */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight text-white">CareChrono</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>{doctorEmail}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Title Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Clinical Dashboard</h2>
            <p className="text-sm text-slate-400">Manage patient files and check timelines.</p>
          </div>
          
          <Button 
            onClick={() => setIsNewPatientOpen(true)}
            className="flex items-center gap-1.5 self-start sm:self-center"
            variant="teal"
          >
            <Plus className="h-4 w-4" />
            New Patient
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Patients</CardTitle>
              <Users className="h-5 w-5 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{patients.length}</div>
              <p className="text-xs text-slate-500 mt-1">Active files in local SQLite DB</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">System Status</CardTitle>
              <UserCheck className="h-5 w-5 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">Online</div>
              <p className="text-xs text-slate-500 mt-1">Local AI timeline processor connected</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">Data Source</CardTitle>
              <Clock className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">Local SQLite</div>
              <p className="text-xs text-slate-500 mt-1">Zero cloud latency</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics & Patients Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Patient List Table (8/12 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search patient record by name or MRN..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Patients List Grid */}
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm rounded-xl border border-slate-800 bg-slate-900/10">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-500 mb-2" />
                Loading patients directory...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm rounded-xl border border-dashed border-slate-800 bg-slate-900/10">
                No patients found. Click "New Patient" to register one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.map((patient) => {
                  const initials = patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2);
                  return (
                    <Card
                      key={patient.id}
                      onClick={() => router.push(`/patients/${patient.id}`)}
                      className="group relative overflow-hidden bg-slate-900/30 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer p-5 flex flex-col justify-between"
                    >
                      {/* Interactive Accent Glow Line */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {/* Gradient Initial Badge */}
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                            {initials}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors duration-200">
                              {patient.name}
                            </h3>
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded px-1.5 py-0.5 mt-1 inline-block">
                              {patient.medical_record_number}
                            </span>
                          </div>
                        </div>

                        {/* Summary preview */}
                        {patient.summary && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 italic pt-1">
                            "{patient.summary}"
                          </p>
                        )}
                      </div>

                      {/* Detail Metrics */}
                      <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">DOB</span>
                          <span className="font-medium text-slate-200 mt-0.5 block">{patient.date_of_birth}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Gender</span>
                          <span className="font-medium text-slate-200 mt-0.5 block">{patient.gender}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Charts and Info Feed (4/12 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Recharts Analytics Panel */}
            <Card className="bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-base text-left">Demographic Distribution</CardTitle>
                <CardDescription className="text-left">Gender split of clinical database</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {patients.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No data to display
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genderDistribution}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }}
                        cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Quick Helper Tips */}
            <Card className="bg-gradient-to-br from-indigo-950/20 to-purple-950/15 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                  <CardTitle className="text-base text-white text-left">Clinical Timelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2 leading-relaxed text-left">
                <p>CareChrono parses typed or recorded physician consultation details and highlights critical clinical landmarks dynamically.</p>
                <p className="text-xs text-slate-500">Note: Default Ollama parses timeline events locally without sharing patient data. Select Gemini Free Tier in backend configs for cloud alternatives.</p>
              </CardContent>
            </Card>

          </div>
        </div>

      </main>

      {/* New Patient Modal Dialog */}
      <Dialog 
        isOpen={isNewPatientOpen} 
        onClose={() => setIsNewPatientOpen(false)}
        title="Add New Patient Record"
      >
        <form onSubmit={handleAddPatient} className="space-y-4 text-left">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-950/40 border border-red-900/30 text-red-400">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Patient Full Name</label>
            <Input 
              placeholder="E.g., Michael Johnson" 
              required 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold uppercase">Date of Birth</label>
              <Input 
                type="date" 
                required 
                value={newDob}
                onChange={(e) => setNewDob(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold uppercase">Gender</label>
              <Select 
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Medical Record Number (MRN)</label>
            <Input 
              placeholder="E.g., MRN-55821" 
              required 
              value={newMrn}
              onChange={(e) => setNewMrn(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsNewPatientOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="teal"
              disabled={submitLoading}
            >
              {submitLoading ? "Adding..." : "Add Patient"}
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  )
}
