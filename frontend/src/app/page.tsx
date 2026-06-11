"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import { 
  Activity, ArrowRight, Mic, Cpu, ShieldCheck, Heart, 
  User, Clipboard, Sparkles, Brain, Clock, Star
} from "lucide-react"
import ChatBot from "@/components/chatbot"
import {
  pageFade, sectionReveal, staggerChildren, cardReveal,
  sectionRevealLeft, sectionRevealRight, staggerFast, badgeReveal
} from "@/components/motion-presets"

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (inView) motionVal.set(target)
  }, [inView, motionVal, target])

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v).toLocaleString()))
  }, [spring])

  return <span ref={ref}>{display}{suffix}</span>
}

const STATS = [
  { value: 2400, suffix: "+", label: "Consultations Tracked" },
  { value: 98,   suffix: "%", label: "AI Accuracy Rate" },
  { value: 0,    suffix: "ms", label: "Cloud Latency" },
]

const FEATURES = [
  {
    icon: <Mic className="h-6 w-6" />,
    color: "from-sky-500 to-cyan-500",
    shadow: "shadow-sky-500/25",
    title: "Voice & Emoji Logging",
    desc: "Speak naturally or tap a symptom — our AI captures everything with zero friction.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    color: "from-violet-500 to-indigo-500",
    shadow: "shadow-violet-500/25",
    title: "AI Timeline Generation",
    desc: "Local Gemini/Ollama intelligence structures raw notes into clinical-grade timelines.",
  },
  {
    icon: <Clipboard className="h-6 w-6" />,
    color: "from-teal-500 to-emerald-500",
    shadow: "shadow-teal-500/25",
    title: "Instant Doctor Briefing",
    desc: "Clinicians get the full patient story in under 30 seconds before the consult begins.",
  },
]

const STEPS = [
  {
    num: "01",
    icon: <Mic className="h-5 w-5" />,
    color: "bg-sky-50 border-sky-200 text-sky-600",
    dot: "bg-sky-500",
    title: "Patient Logs Symptoms",
    desc: "Log via large elderly-friendly buttons or by speaking naturally in any language.",
  },
  {
    num: "02",
    icon: <Cpu className="h-5 w-5" />,
    color: "bg-violet-50 border-violet-200 text-violet-600",
    dot: "bg-violet-500",
    title: "AI Structures Timeline",
    desc: "Local intelligence aggregates records and extracts clinical progression pathways.",
  },
  {
    num: "03",
    icon: <Clipboard className="h-5 w-5" />,
    color: "bg-teal-50 border-teal-200 text-teal-600",
    dot: "bg-teal-500",
    title: "Doctor Gets Prepared",
    desc: "Clinicians read the diagnostic summary and AI timeline in under 30 seconds.",
  },
]

export default function Home() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresInView = useInView(heroRef, { once: true })

  return (
    <motion.main
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="min-h-screen text-slate-900 flex flex-col relative overflow-hidden hero-gradient-bg font-sans"
    >
      {/* ── Animated background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -28, 0], x: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 right-[-8%] w-[520px] h-[520px] rounded-full bg-gradient-to-br from-sky-300/25 to-cyan-300/15 blur-[90px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[-6%] w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-teal-300/20 to-emerald-200/15 blur-[80px]"
        />
        <motion.div
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-violet-200/12 blur-[70px]"
        />
        {/* Grid */}
        <div className="absolute inset-0 care-grid opacity-60" />
      </div>

      {/* ── NAVBAR ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel sticky top-0 z-40 border-b border-white/60"
      >
        <div className="max-w-7xl w-full mx-auto px-6 h-18 flex items-center justify-between py-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="relative">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Activity className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              CareChrono
            </span>
          </motion.div>

          <motion.div
            variants={badgeReveal}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-sky-200/80 bg-sky-50/80 text-sky-700 text-xs font-bold shadow-sm"
          >
            <Heart className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
            AI Symptom Timeline
          </motion.div>
        </div>
      </motion.header>

      {/* ── HERO SECTION ── */}
      <section className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-16 lg:py-24 z-10 relative">
        
        {/* Left: Copy */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-8 text-left"
        >
          {/* Badge */}
          <motion.div
            variants={cardReveal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-200/80 bg-violet-50/80 text-violet-700 text-xs font-bold"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            Powered by Local AI — Zero Cloud Risk
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={sectionReveal}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]"
          >
            AI-Powered
            <br />
            <span className="relative inline-block">
              <span className="gradient-text">Symptom Timeline</span>
              {/* Underline accent */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 rounded-full origin-left"
              />
            </span>
            <br />
            <span className="text-slate-700">for Faster Diagnosis</span>
          </motion.h1>

          <motion.p
            variants={sectionReveal}
            className="text-lg text-slate-500 max-w-xl leading-relaxed"
          >
            Transform scattered symptom memories into clear, structured clinical timelines before your consultation even begins. Designed for elderly patients and healthcare professionals.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={sectionReveal} className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 16px 48px rgba(2,132,199,0.30)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/patient-portal")}
              className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-base font-bold shadow-lg shadow-sky-500/25 transition-all"
            >
              <Mic className="h-5 w-5" />
              Start Tracking Symptoms
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="h-4.5 w-4.5" />
              </motion.span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, borderColor: "rgba(2,132,199,0.5)", backgroundColor: "rgba(240,249,255,0.8)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/doctor-portal")}
              className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-slate-200 bg-white/80 text-slate-700 text-base font-bold transition-all"
            >
              <User className="h-5 w-5 text-slate-500" />
              Doctor Review Portal
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={staggerFast}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {[
              { icon: <ShieldCheck className="h-3.5 w-3.5" />, text: "HIPAA Compatible", color: "text-teal-600 bg-teal-50 border-teal-200" },
              { icon: <Clock className="h-3.5 w-3.5" />, text: "100% Local & Offline", color: "text-sky-600 bg-sky-50 border-sky-200" },
              { icon: <Star className="h-3.5 w-3.5" />, text: "Open Source", color: "text-violet-600 bg-violet-50 border-violet-200" },
            ].map((b) => (
              <motion.span
                key={b.text}
                variants={badgeReveal}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${b.color}`}
              >
                {b.icon}{b.text}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Clinical Workflow Card */}
        <motion.div
          variants={sectionRevealRight}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 w-full"
        >
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 32px 80px rgba(14,165,233,0.16)" }}
            transition={{ duration: 0.4 }}
            className="glass-panel rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Decorative corner orb */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-sky-400/15 to-cyan-400/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-8">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Clinical Workflow</h3>
              <span className="ml-auto text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Live</span>
            </div>

            <motion.div
              variants={staggerSlow}
              initial="hidden"
              animate="visible"
              className="space-y-0"
            >
              {STEPS.map((step, i) => (
                <motion.div key={step.num} variants={cardReveal}>
                  <div className="flex items-start gap-4 relative">
                    {/* Left connector */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.12 }}
                        className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center ${step.color} shrink-0 shadow-sm`}
                      >
                        {step.icon}
                      </motion.div>
                      {i < STEPS.length - 1 && (
                        <div className="w-[2px] h-8 mt-1 bg-gradient-to-b from-slate-200 to-transparent" />
                      )}
                    </div>
                    <div className={`pb-${i < STEPS.length - 1 ? "6" : "0"} pt-1`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{step.num}</span>
                        <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom status bar */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                AI Engine Online
              </div>
              <span className="text-xs text-slate-400 font-mono">SQLite · Local</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10"
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="glass-panel rounded-2xl px-8 py-6 grid grid-cols-3 gap-6 divide-x divide-slate-200/60">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-4">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── FEATURES SECTION ── */}
      <section ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for the clinical frontline
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto text-base">
            Every feature is designed around real patient-doctor workflows, not hypothetical use cases.
          </p>
        </motion.div>

        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={cardReveal}
              whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(15,23,42,0.10)" }}
              transition={{ duration: 0.3 }}
              className="glass-panel rounded-2xl p-7 text-left group cursor-default"
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg ${f.shadow} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-slate-200/60 bg-white/60 backdrop-blur-sm py-6 z-10 mt-auto"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-teal-500" />
            CareChrono is 100% free, runs locally, and is HIPAA-compatible.
          </div>
          <div className="font-medium">© 2026 CareChrono, Inc.</div>
        </div>
      </motion.footer>

      <ChatBot />
    </motion.main>
  )
}

// local staggerSlow ref (used in workflow card)
const staggerSlow = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.3 },
  },
}
