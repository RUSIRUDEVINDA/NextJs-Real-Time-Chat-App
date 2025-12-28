"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { client } from "./api/lib/client"
import { nanoid } from "nanoid"

const ANIMAL = ["Lion", "Tiger", "Bear", "Wolf", "Fox", "Eagle", "Shark", "Dolphin"]
const STORAGE_KEY = "chat_username"

const generateUsername = () => {
  const word = ANIMAL[Math.floor(Math.random() * ANIMAL.length)]
  return `anonymous-${word}-${nanoid(5)}`
}

export default function Home() {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const errorMsg = searchParams.get("error") === "room-full"
    ? "This room is already full (max 2 users)."
    : null

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setTimeout(() => setUsername(stored), 0)
    } else {
      const newName = generateUsername()
      localStorage.setItem(STORAGE_KEY, newName)
      setTimeout(() => setUsername(newName), 0)
    }
  }, [])

  const { mutate } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post()
      if (res.status === 200) {
        if (!res.data?.roomId) return
        router.push(`/room/${res.data.roomId}`)
      }
    },
  })

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black grid-bg font-mono overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-12 relative z-10">
        {errorMsg && (
          <div className="border border-red-500/50 bg-red-500/10 p-3 text-center text-xs text-red-500 animate-pulse">
            [ERROR]: {errorMsg}
          </div>
        )}

        <div className="flex flex-col items-center space-y-6">
          <div className="border border-green-500/30 bg-green-500/5 px-4 py-1.5 text-[10px] tracking-[0.2em] text-green-500 uppercase font-bold">
            Encryption Active
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              PRIVATE<span className="text-green-500">_</span>CHAT
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-medium">
              Secure. Ephemeral. Anonymous.
            </p>
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950/50 p-10 shadow-2xl relative backdrop-blur-sm">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green-500/20" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green-500/20" />

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                Assigned Identity
              </label>
              <div className="bg-black border border-zinc-800 p-4 font-mono text-sm text-green-500 shadow-inner group transition-all hover:border-green-500/30">
                <span className="opacity-50 mr-2 font-bold select-none text-green-500">{">"}</span>
                {username || "INITIALIZING..."}
              </div>
            </div>

            <button
              onClick={() => mutate()}
              disabled={!username}
              className="relative w-full overflow-hidden bg-green-500 py-5 text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-green-400 active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(34,197,94,0.1)] scanline-btn btn-sweep"
            >
              Create Secure Room
            </button>

            <div className="flex justify-center items-center gap-4 text-[8px] text-zinc-700 tracking-widest uppercase font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                <span>Systems Stable</span>
              </div>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <span>SSL Verified</span>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <span>AES-256</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-8 text-[9px] text-zinc-800 tracking-widest font-bold opacity-60">
        NODE_v22.x // NEXT_v16
      </div>
      <div className="absolute bottom-6 right-8 text-[9px] text-zinc-800 tracking-widest font-bold opacity-60">
        © 2025 PRIVACY_CORP
      </div>
    </main>
  )
}