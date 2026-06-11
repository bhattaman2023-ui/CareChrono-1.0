import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  HeartPulse, 
  Pill, 
  Activity, 
  FlaskConical, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  FileText
} from "lucide-react"

export interface TimelineEvent {
  id: number
  patient_id: number
  symptom_log_id: number | null
  date: string
  event_type: string // "Diagnosis" | "Medication" | "Procedure" | "Lab" | "Visit"
  title: string
  description: string | null
  severity: string | null
  created_at: string
}

interface TimelineProps {
  events: TimelineEvent[]
  onSelectNote?: (noteId: number) => void
}

export const Timeline: React.FC<TimelineProps> = ({ events, onSelectNote }) => {
  const [filterType, setFilterType] = useState<string>("All")
  const [filterSeverity, setFilterSeverity] = useState<string>("All")
  const [sortAsc, setSortAsc] = useState<boolean>(false) // Default descending (newest first)
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({})

  // Event Helper Styles & Icons
  const getEventStyles = (type: string) => {
    switch(type) {
      case "Diagnosis":
        return {
          icon: <HeartPulse className="h-5 w-5 text-red-400" />,
          colorClass: "bg-red-950/40 text-red-300 border-red-800/80",
          dotClass: "bg-red-500 ring-red-900/50"
        }
      case "Medication":
        return {
          icon: <Pill className="h-5 w-5 text-emerald-400" />,
          colorClass: "bg-emerald-950/40 text-emerald-300 border-emerald-800/80",
          dotClass: "bg-emerald-500 ring-emerald-900/50"
        }
      case "Procedure":
        return {
          icon: <Activity className="h-5 w-5 text-blue-400" />,
          colorClass: "bg-blue-950/40 text-blue-300 border-blue-800/80",
          dotClass: "bg-blue-500 ring-blue-900/50"
        }
      case "Lab":
        return {
          icon: <FlaskConical className="h-5 w-5 text-purple-400" />,
          colorClass: "bg-purple-950/40 text-purple-300 border-purple-800/80",
          dotClass: "bg-purple-500 ring-purple-900/50"
        }
      default: // Visit
        return {
          icon: <Calendar className="h-5 w-5 text-amber-400" />,
          colorClass: "bg-amber-950/40 text-amber-300 border-amber-800/80",
          dotClass: "bg-amber-500 ring-amber-900/50"
        }
    }
  }

  const getSeverityStyles = (severity: string | null) => {
    if (!severity) return null
    switch(severity) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Low":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedEvents(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Filter & Sort Logic
  const filteredEvents = events
    .filter(e => filterType === "All" || e.event_type === filterType)
    .filter(e => filterSeverity === "All" || e.severity === filterSeverity)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortAsc ? dateA - dateB : dateB - dateA
    })

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Filter Type</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
            <label className="block text-xs text-slate-400 font-medium mb-1">Filter Severity</label>
            <select 
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Sort Trigger */}
        <div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-sm px-4 py-2 border border-slate-700 transition-colors"
          >
            Sort: {sortAsc ? "Oldest First" : "Newest First"}
            {sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="relative pl-6 sm:pl-8 py-2">
        {/* Vertical Line */}
        <div className="absolute left-[17px] sm:left-[21px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/40 via-purple-500/40 to-teal-500/10" />

        {/* Event List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-slate-800 bg-slate-900/10">
            <AlertTriangle className="mx-auto h-8 w-8 text-slate-500 mb-2" />
            <p className="text-slate-400 text-sm">No timeline events match the filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {filteredEvents.map((event, idx) => {
                const styles = getEventStyles(event.event_type)
                const isExpanded = expandedEvents[event.id]
                const severityStyle = getSeverityStyles(event.severity)
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.4) }}
                    className="relative flex flex-col gap-2"
                  >
                    {/* Node Dot */}
                    <div className={`absolute -left-[23px] sm:-left-[27px] top-1.5 h-6 w-6 rounded-full border-4 border-slate-950 ring-4 ${styles.dotClass} flex items-center justify-center`} />

                    {/* Content Box */}
                    <div 
                      onClick={() => toggleExpand(event.id)}
                      className={`group border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-slate-900/60 bg-slate-900/30 ${styles.colorClass}`}
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-slate-950/60 border border-slate-800">
                            {styles.icon}
                          </span>
                          <div>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{event.event_type}</span>
                            <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {event.title}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {event.severity && (
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${severityStyle}`}>
                              {event.severity}
                            </span>
                          )}
                          <span className="text-xs font-medium text-slate-400 border border-slate-800 bg-slate-950/50 rounded-full px-3 py-1">
                            {event.date}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && event.description && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-slate-800/80 text-sm text-slate-300 overflow-hidden"
                          onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking details
                        >
                          <p className="leading-relaxed">{event.description}</p>
                          
                          {event.symptom_log_id && onSelectNote && (
                            <button
                              onClick={() => {
                                if (event.symptom_log_id) {
                                  onSelectNote(event.symptom_log_id)
                                }
                              }}
                              className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View original medical note
                            </button>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
