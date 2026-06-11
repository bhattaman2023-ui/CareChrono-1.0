"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Activity, ArrowRight, Mic, Cpu, ShieldCheck, Heart, User, Clipboard } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ChatBot from "@/components/chatbot"

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background soft glowing elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header NavBar */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-sky-600" />
          <span className="text-xl font-bold tracking-tight text-slate-800">CareChrono</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-sky-100 bg-sky-50 text-sky-700 text-xs font-semibold">
          <Heart className="h-3 w-3 text-sky-600 animate-pulse" />
          Symptom Timeline Assistant
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 z-10">
        
        {/* Left Side: Copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            AI-Powered Symptom <br/>
            <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Timeline Tracker
            </span> <br/>
            for Faster Diagnosis
          </h1>
          
          <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
            Transform scattered symptom memories into clear, structured clinical timelines before your consultation even begins. Designed primarily for elderly patients and healthcare professionals.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button 
              onClick={() => router.push("/patient-portal")} 
              className="px-8 py-6 rounded-2xl bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/10 text-base"
            >
              <span>Start Tracking Symptoms</span>
              <ArrowRight className="h-5 w-5 ml-1.5" />
            </Button>
            
            <Button 
              onClick={() => router.push("/doctor-portal")} 
              variant="outline"
              className="px-8 py-6 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 text-base"
            >
              <span>Doctor Review Portal</span>
              <User className="h-5 w-5 ml-1.5 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Right Side: Product Journey Visual Card */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <Card className="w-full bg-white border-slate-100 shadow-xl p-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-6 text-left">Clinical Workflow</h3>
            
            <div className="space-y-6 text-left">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">1. Patient Logs Symptoms</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Log daily conditions via large, elderly-friendly buttons or by speaking naturally.</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="pl-4.5 -my-2">
                <div className="h-4 w-[1px] bg-slate-200 border-dashed border-l ml-4" />
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">2. AI Structures Timeline</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Our local intelligence aggregates records and extracts progression pathways.</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="pl-4.5 -my-2">
                <div className="h-4 w-[1px] bg-slate-200 border-dashed border-l ml-4" />
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <Clipboard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">3. Doctor Gets Prepared</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Clinicians read the diagnostic analysis summary and timeline in under 30 seconds.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </section>

      {/* Footer Info */}
      <footer className="border-t border-slate-100 bg-white py-6 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>CareChrono is 100% free, runs locally, and is HIPAA-compatible out-of-the-box.</span>
          </div>
          <div>
            &copy; 2026 CareChrono, Inc.
          </div>
        </div>
      </footer>
      <ChatBot />
    </main>
  )
}
