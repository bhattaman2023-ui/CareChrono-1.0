"use client"

import { useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [reply, setReply] = useState(
    "Hello! I am your AI health assistant. How can I help you today?"
  )
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      })

      const data = await res.json()
      setReply(data.response)
    } catch {
      setReply("Error connecting to AI backend.")
    }

    setMessage("")
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg shadow-teal-700/20 hover:bg-teal-600"
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-96 w-80 flex-col rounded-lg border border-teal-100 bg-white shadow-2xl">
          <div className="border-b border-teal-100 p-4 font-bold text-teal-800">
            CareChrono AI Assistant
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-sm text-slate-700">
            {loading ? "Thinking..." : reply}
          </div>

          <div className="flex gap-2 border-t border-teal-100 p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-teal-200 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />

            <button
              onClick={sendMessage}
              className="rounded-lg bg-teal-700 px-3 text-white hover:bg-teal-600"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
