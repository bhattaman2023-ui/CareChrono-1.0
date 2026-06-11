"use client"

import { useState } from "react"
import { MessageCircle, X, Send } from "lucide-react"

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
          message: message,
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
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-sky-600 text-white shadow-lg flex items-center justify-center hover:bg-sky-500 z-50"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col">
          <div className="p-4 border-b font-bold text-sky-600">
            🤖 CareChrono AI Assistant
          </div>

          <div className="flex-1 p-4 text-sm text-slate-700 overflow-y-auto">
            {loading ? "Thinking..." : reply}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-3 py-2 outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-sky-600 text-white px-3 rounded-lg hover:bg-sky-500"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
