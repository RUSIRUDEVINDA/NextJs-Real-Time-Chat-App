"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Modal } from "@/components/modal"
import { io, Socket } from "socket.io-client"

function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

interface Message {
  id: string
  text: string
  sender: string
  timestamp: number
}

const Page = () => {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const [copyStatus, setCopyStatus] = useState("COPY LINK")
  const [timeRemaining, setTimeRemaining] = useState<number>(600)
  const [isOwner, setIsOwner] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [username, setUsername] = useState("")
  const [showDestroyModal, setShowDestroyModal] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const storedUsername = localStorage.getItem("chat_username") || "anonymous"
    setUsername(storedUsername)
    setIsOwner(document.cookie.includes("is-owner=true"))

    // Using port 5000 as per recent backend config
    socketRef.current = io("http://localhost:5000")

    socketRef.current.on("connect", () => {
      console.log("Connected to server")
      socketRef.current?.emit("join-room", roomId)
    })

    socketRef.current.on("receive-message", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    socketRef.current.on("ttl-update", ({ ttl }: { ttl: number }) => {
      setTimeRemaining(ttl)
    })

    socketRef.current.on("room-destroyed", () => {
      router.push("/")
    })

    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      socketRef.current?.disconnect()
      clearInterval(interval)
    }
  }, [roomId, router])

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopyStatus("COPIED!")
    setTimeout(() => setCopyStatus("COPY LINK"), 2000)
  }

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return
    socketRef.current.emit("send-message", {
      roomId,
      message: input,
      username,
    })
    setInput("")
  }

  const destroySession = () => {
    setShowDestroyModal(true)
  }

  const confirmDestroy = () => {
    socketRef.current?.emit("destroy-room", roomId)
    setShowDestroyModal(false)
  }

  const extendTime = (minutes: number) => {
    socketRef.current?.emit("update-ttl", { roomId, seconds: minutes * 60 })
  }

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden bg-black text-zinc-100 font-mono">
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Secure Room</span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-green-500 text-sm">
                {roomId?.slice(0, 12)}...
              </span>
              <button
                onClick={copyLink}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-all border border-zinc-700"
              >
                {copyStatus}
              </button>
            </div>
          </div>

          <div className="h-10 w-px bg-zinc-800" />

          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Time to Wipe
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2 ${timeRemaining < 60 ? "text-red-500 animate-pulse" : "text-amber-500"
                }`}
            >
              <span className="text-xs">⏱</span>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
          {isOwner && (
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Owner Controls
              </span>
              <div className="flex gap-2 mt-1">
                {[1, 5, 10, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => extendTime(mins)}
                    className="text-[9px] border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 hover:text-green-500 hover:border-green-500/30 transition-all"
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={destroySession}
          className="text-xs bg-zinc-800/50 hover:bg-red-900/40 border border-zinc-700 hover:border-red-500 px-4 py-2 rounded text-zinc-400 hover:text-red-400 font-bold transition-all group flex items-center gap-2"
        >
          <span>💣</span>
          DESTROY SESSION
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2 opacity-50">
            <div className="text-4xl">🔒</div>
            <p className="text-sm">Room encrypted. Start typing to chat.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === username ? "items-end" : "items-start"
              }`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className={`text-[10px] uppercase tracking-tighter ${msg.sender === username ? "text-green-500" : "text-blue-400"
                }`}>
                {msg.sender === username ? "You" : msg.sender}
              </span>
              <span className="text-[9px] text-zinc-600">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div
              className={`max-w-[80%] p-3 text-sm border ${msg.sender === username
                ? "bg-zinc-900 border-green-900/50 text-zinc-200"
                : "bg-zinc-950 border-zinc-800 text-zinc-300"
                } shadow-lg`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 backdrop-blur-sm">
        <div className="flex gap-3 max-w-5xl mx-auto">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500/50 group-focus-within:text-green-500 transition-colors">
              {">"}
            </span>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
              placeholder="Transmit secure message..."
              className="w-full bg-black/50 border border-zinc-800 focus:border-green-900/50 focus:outline-none transition-all text-zinc-100 placeholder:text-zinc-700 py-4 pl-10 pr-4 text-sm font-mono shadow-inner"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="bg-zinc-100 text-black px-8 py-4 text-xs font-black hover:bg-green-500 transition-all disabled:opacity-20 disabled:grayscale uppercase tracking-widest active:scale-95"
          >
            Send
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDestroyModal}
        onClose={() => setShowDestroyModal(false)}
        onConfirm={confirmDestroy}
        title="Critical Action"
        message="You are about to permanently destroy this chat session. All message history will be purged from memory and all connected users will be disconnected. This cannot be undone."
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </main>
  )
}

export default Page
