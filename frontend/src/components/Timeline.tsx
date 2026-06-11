import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  HeartPulse, Pill, Activity, FlaskConical, Calendar,
  ChevronDown, ChevronUp, AlertTriangle, FileText, Sparkles, TrendingUp
} from "lucide-react"
import { staggerChildren, timelineNodeReveal, cardReveal, listItemUp } from "./motion-presets"

export interface TimelineEvent {
  id: number
  patient_id: number
  symptom_log_id: number | null
  date: string
  event_type: string
  title: string
  description: string | null
  severity: string | null
  created_at: string
}

interface TimelineProps {
  events: TimelineEvent[]
  onSelectNote?: (noteId: number) => void
}

const EVENT_CONFIG: Record<string, {
  icon: React.ReactNode
  iconSmall: React.ReactNode
  gradient: string
  dotColor: string
  dotRing: string
  cardBorder: string
  cardBg: string
  badgeColor: string
  label: string
}> = {
  Diagnosis: {
    icon: <HeartPulse className="h-4 w-4" />,
    iconSmall: <HeartPulse className="h-3.5 w-3.5" />,
    gradient: "from-red-500 to-rose-600",
    dotColor: "bg-red-500",
    dotRing: "ring-red-500/30",
    cardBorder: "border-red-500/20 hover:border-red-500/40",
    cardBg: "bg-gradient-to-r from-red-950/30 to-transparent",
    badgeColor: "bg-red-500/15 text-red-300 border-red-500/25",
    label: "Diagnosis",
  },
  Medication: {
    icon: <Pill className="h-4 w-4" />,
    iconSmall: <Pill className="h-3.5 w-3.5" />,
    gradient: "from-emerald-500 to-green-600",
    dotColor: "bg-emerald-500",
    dotRing: "ring-emerald-500/30",
    cardBorder: "border-emerald-500/20 hover:border-emerald-500/40",
    cardBg: "bg-gradient-to-r from-emerald-950/30 to-transparent",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    label: "Medication",
  },
  Procedure: {
    icon: <Activity className="h-4 w-4" />,
    iconSmall: <Activity className="h-3.5 w-3.5" />,
    gradient: "from-blue-500 to-cyan-600",
    dotColor: "bg-blue-500",
    dotRing: "ring-blue-500/30",
    cardBorder: "border-blue-500/20 hover:border-blue-500/40",
    cardBg: "bg-gradient-to-r from-blue-950/30 to-transparent",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    label: "Procedure",
  },
  Lab: {
    icon: <FlaskConical className="h-4 w-4" />,
    iconSmall: <FlaskConical className="h-3.5 w-3.5" />,
    gradient: "from-purple-500 to-violet-600",
    dotColor: "bg-purple-500",
    dotRing: "ring-purple-500/30",
    cardBorder: "border-purple-500/20 hover:border-purple-500/40",
    cardBg: "bg-gradient-to-r from-purple-950/30 to-transparent",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    label: "Lab",
  },
  Visit: {
    icon: <Calendar className="h-4 w-4" />,
    iconSmall: <Calendar className="h-3.5 w-3.5" />,
    gradient: "from-amber-500 to-orange-500",
    dotColor: "bg-amber-500",
    dotRing: "ring-amber-500/30",
    cardBorder: "border-amber-500/20 hover:border-amber-500/40",
    cardBg: "bg-gradient-to-r from-amber-950/25 to-transparent",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    label: "Visit",
  },
}

const getSeverityConfig = (severity: string | null) => {
  if (!severity) return null
  switch (severity) {
    case "High":   return { cls: "bg-red-500/15 text-red-300 border-red-500/30",    icon: "🔴", glow: "animate-glow-red" }
    case "Medium": return { cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: "🟡", glow: "" }
    case "Low":    return { cls: "bg-sky-500/15 text-sky-300 border-sky-500/30",    icon: "🟢", glow: "" }
    default:       return { cls: "bg-slate-500/15 text-slate-400 border-slate-500/30", icon: "⚪", glow: "" }
  }
}

export const Timeline: React.FC<TimelineProps> = ({ events, onSelectNote }) => {
  const [filterType, setFilterType] = useState<string>("All")
  const [filterSeverity, setFilterSeverity] = useState<string>("All")
  const [sortAsc, setSortAsc] = useState<boolean>(false)
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({})

  const toggleExpand = (id: number) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredEvents = events
    .filter(e => filterType === "All" || e.event_type === filterType)
    .filter(e => filterSeverity === "All" || e.severity === filterSeverity)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortAsc ? dateA - dateB : dateB - dateA
    })

  const highSeverityCount = filteredEvents.filter(e => e.severity === "High").length

  return (
    <div className="space-y-6">

      {/* ── Alert Banner for High Severity ── */}
      <AnimatePresence>
        {highSeverityCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-950/40 to-transparent px-4 py-3"
          >
            <div className="h-8 w-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center animate-glow-red shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-300">
                {highSeverityCount} High-Severity Event{highSeverityCount > 1 ? "s" : ""} Detected
              </p>
              <p className="text-[11px] text-red-400/70">Requires immediate clinical attention. Review expanded details below.</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              URGENT
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Controls Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 backdrop-blur-md"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Event Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500/60 cursor-pointer transition-colors"
            >
              <option value="All">All Types</option>
              <option value="Diagnosis">Diagnoses</option>
              <option value="Medication">Medications</option>
              <option value="Procedure">Procedures</option>
              <option value="Lab">Labs</option>
              <option value="Visit">Visits</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500/60 cursor-pointer transition-colors"
            >
              <option value="All">All Levels</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>
        </div>

        {/* Event count */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
          </span>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white rounded-xl text-xs px-4 py-2 border border-slate-700/60 hover:border-slate-600 transition-all"
          >
            {sortAsc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {sortAsc ? "Oldest First" : "Newest First"}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Timeline Layout ── */}
      <div className="relative pl-8 sm:pl-10 py-2">

        {/* Animated gradient vertical line */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 0 }}
          className="absolute left-[19px] sm:left-[23px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/60 via-purple-500/40 via-teal-500/30 to-transparent"
        />

        {/* Empty state */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-14 rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20"
          >
            <AlertTriangle className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm font-semibold">No timeline events match the filters.</p>
            <p className="text-slate-600 text-xs mt-1">Try adjusting your filter criteria.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <AnimatePresence initial={false}>
              {filteredEvents.map((event, idx) => {
                const cfg = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.Visit
                const isExpanded = expandedEvents[event.id]
                const sevCfg = getSeverityConfig(event.severity)
                const isHigh = event.severity === "High"

                return (
                  <motion.div
                    key={event.id}
                    variants={listItemUp}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.35) }}
                    className="relative flex flex-col gap-0"
                  >
                    {/* Node dot */}
                    <motion.div
                      variants={timelineNodeReveal}
                      className={`absolute -left-[31px] sm:-left-[35px] top-3.5 z-10`}
                    >
                      <div className={`relative h-7 w-7 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg ring-4 ${cfg.dotRing} ring-offset-2 ring-offset-slate-950`}>
                        <span className="text-white">{cfg.iconSmall}</span>

                        {/* Pulse ring for high-severity */}
                        {isHigh && (
                          <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60" />
                        )}
                      </div>
                    </motion.div>

                    {/* Event card */}
                    <motion.div
                      onClick={() => toggleExpand(event.id)}
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`group relative border rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${cfg.cardBorder} ${isHigh ? "shadow-lg shadow-red-500/10" : ""}`}
                      style={{
                        background: "rgba(15,23,42,0.50)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      {/* Gradient left accent */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${cfg.gradient} rounded-l-2xl`} />

                      {/* Top glow line on hover */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="p-4 pl-5">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white shadow-md shrink-0`}>
                              {cfg.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}>
                                  {cfg.label}
                                </span>
                                {isHigh && (
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-red-500/15 text-red-300 border-red-500/30 animate-pulse">
                                    URGENT
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {event.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {sevCfg && (
                              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${sevCfg.cls}`}>
                                {sevCfg.icon} {event.severity}
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-slate-400 border border-slate-700/60 bg-slate-950/60 rounded-full px-3 py-1">
                              {event.date}
                            </span>
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.25 }}
                              className="text-slate-500"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </motion.span>
                          </div>
                        </div>

                        {/* AI Insight callout for High severity */}
                        {isHigh && !isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            <p className="text-[11px] text-red-300/80 font-medium">
                              AI Alert: High-risk clinical event. Click to view full details and linked notes.
                            </p>
                          </motion.div>
                        )}

                        {/* Expandable details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                                {event.description && (
                                  <div className="flex gap-2.5">
                                    <TrendingUp className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>
                                  </div>
                                )}

                                {/* AI Insight box (expanded) */}
                                {isHigh && (
                                  <div className="flex items-start gap-2.5 bg-gradient-to-r from-red-950/40 to-transparent border border-red-500/20 rounded-xl p-3">
                                    <Sparkles className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[11px] font-bold text-red-300 mb-1">AI Clinical Insight</p>
                                      <p className="text-[11px] text-red-300/70 leading-relaxed">
                                        This high-severity event should be prioritized in the consultation. Consider ordering follow-up labs and reviewing the patient&apos;s medication interactions.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {event.symptom_log_id && onSelectNote && (
                                  <motion.button
                                    whileHover={{ x: 3 }}
                                    onClick={() => {
                                      if (event.symptom_log_id) onSelectNote(event.symptom_log_id)
                                    }}
                                    className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    View original medical note
                                    <ChevronDown className="h-3 w-3 -rotate-90" />
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
