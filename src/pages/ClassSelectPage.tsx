import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { RefreshCw } from 'lucide-react'

export function ClassSelectPage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [classData, setClassData] = useState<any>({})
  const [sending, setSending] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch(`${apiBase}/api/class-select/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setClassData(data.data || {}))
      .catch(() => {})
  }, [])

  const handleStart = async (type: "primary" | "secondary") => {
    setSending(type)
    setMsg("")
    const res = await fetch(`${apiBase}/api/class-select/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type })
    })
    const data = await res.json()
    setMsg(data.message || (data.success ? "✅ 成功" : `❌ ${data.error}`))
    setSending(null)
  }

  const primaryActive = !!classData.primary
  const secondaryActive = !!classData.secondary

  return (
    <div className="p-8 max-w-2xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">職業選擇</h1>
        <p className="text-sm" style={{ color: "#8b92a8" }}>管理主職業與副職業的選擇訊息</p>
      </div>

      {msg && <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: msg.includes("❌") ? "#FF6060" : "#02DF82" }}>{msg}</p>}

      <div className="grid grid-cols-2 gap-4">
        {(["primary", "secondary"] as const).map(type => {
          const isActive = type === "primary" ? primaryActive : secondaryActive
          return (
            <div key={type} className="rounded-xl p-5 space-y-3" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{type === "primary" ? "主職業" : "副職業"}</p>
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  background: isActive ? "rgba(2,223,130,0.12)" : "rgba(139,146,168,0.12)",
                  color: isActive ? "#02DF82" : "#8b92a8"
                }}>{isActive ? "已發布" : "未發布"}</span>
              </div>
              <button onClick={() => handleStart(type)} disabled={sending === type}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
                style={{ background: "#FFB5B5", color: "#0b0e14" }}>
                <RefreshCw size={14} />
                {sending === type ? "處理中..." : "重新發起"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
