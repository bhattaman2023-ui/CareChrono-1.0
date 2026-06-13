"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react"
import { chatMessage, chatSlideUp } from "./motion-presets"

interface Message {
  role: "ai" | "user"
  text: string
  ts: string
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const INITIAL_MSG: Message = {
  role: "ai",
  text: "Hello! I'm your CareChrono AI health assistant. I can help you understand symptoms, explain your medical timeline, or answer general health questions. How can I help you today?",
  ts: getTime(),
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: "user", text, ts: getTime() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "ai", text: data.response, ts: getTime() }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I'm having trouble connecting to the backend. Please ensure the server is running.", ts: getTime() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-sky-500/30"
        style={{
          background: open
            ? "linear-gradient(135deg, #475569, #334155)"
            : "linear-gradient(135deg, #0284c7, #0ea5e9)",
        }}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22 }}
            >
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22 }}
            >
              <MessageCircle size={22} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {!open && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={chatSlideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[520px] rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(10, 15, 30, 0.92)",
              border: "1px solid rgba(99,102,241,0.25)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.40), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(24px)",
            }}
          >
            <div
              className="px-5 py-4 flex items-center gap-3 border-b"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.20), rgba(14,165,233,0.15))",
                borderColor: "rgba(99,102,241,0.20)",
              }}
            >
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">CareChrono AI</span>
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Health Intelligence Assistant</p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    variants={chatMessage}
                    initial="hidden"
                    animate="visible"
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "ai" && (
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "ai"
                            ? "chat-bubble-ai text-slate-200"
                            : "chat-bubble-user text-white"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-600 px-1">{msg.ts}</span>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    key="typing"
                    variants={chatMessage}
                    initial="hidden"
                    animate="visible"
                    className="flex gap-2.5 items-end"
                  >
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="chat-bubble-ai px-4 py-3.5">
                      <div className="flex gap-1.5 items-center">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            <div
              className="px-4 py-3.5 border-t flex items-center gap-2.5"
              style={{
                background: "rgba(15,23,42,0.60)",
                borderColor: "rgba(99,102,241,0.18)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your symptoms..."
                disabled={loading}
                className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:bg-slate-800/80 transition-all"
              />

              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={input.trim() ? { scale: 1.08 } : {}}
                whileTap={input.trim() ? { scale: 0.92 } : {}}
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-md"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg, #0284c7, #6366f1)"
                    : "rgba(51,65,85,0.8)",
                  boxShadow: input.trim() ? "0 4px 16px rgba(99,102,241,0.35)" : "none",
                }}
                aria-label="Send message"
              >
                <Send size={16} className="text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
