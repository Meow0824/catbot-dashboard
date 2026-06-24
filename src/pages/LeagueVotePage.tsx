import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Bell, RefreshCw } from 'lucide-react'

interface VoteStatus {
  active: boolean
  attend?: number
  absent?: number
  unsure?: number
  not_voted?: number
}

export function LeagueVotePage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [tab, setTab] = useState<'guild' | 'club'>('guild')
  const [status, setStatus] = useState<{ guild: VoteStatus, club: VoteStatus }>({ guild: { active: false }, club: { active: false } })
  const [sending, setSending] = useState(false)
  const [reminding, setReminding] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchStatus = () => {
    fetch(`${apiBase}/api/league-vote/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => {})
  }

  useEffect(() => { fetchStatus() }, [])

  const current = status[tab]

  const handleStart = async () => {
    setSending(true)
    setMsg('')
    const endpoint = tab === 'guild' ? '/api/league-vote/start' : '/api/club-vote/start'
    const res = await fetch(`${apiBase}${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setMsg(data.message || (data.success ? '✅ 成功' : `❌ ${data.error}`))
    setSending(false)
  }

  const handleRemind = async () => {
    setReminding(true)
    setMsg('')
    const endpoint = tab === 'guild' ? '/api/league-vote/remind' : '/api/club-vote/remind'
    const res = await fetch(`${apiBase}${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setMsg(data.message || (data.success ? '✅ 提醒已發送' : `❌ ${data.error}`))
    setReminding(false)
  }

  return (
    <div className="p-8 max-w-2xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">聯賽投票</h1>
        <p className="text-sm" style={{ color: "#8b92a8" }}>管理幫會與俱樂部的出席投票</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
        {(["guild", "club"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg('') }}
            className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: tab === t ? "#FFB5B5" : "transparent", color: tab === t ? "#0b0e14" : "#8b92a8" }}>
            {t === "guild" ? "幫會聯賽" : "俱樂部龍虎決戰"}
          </button>
        ))}
      </div>

      {current.active && (
        <div className="rounded-xl p-5" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">目前投票狀態</p>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(2,223,130,0.12)", color: "#02DF82" }}>進行中</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "出席", value: current.attend, color: "#02DF82" },
              { label: "不確定", value: current.unsure, color: "#FFDC35" },
              { label: "缺席", value: current.absent, color: "#FF6060" },
              { label: "未回應", value: current.not_voted, color: "#8b92a8" },
            ].map(s => (
              <div key={s.label} className="rounded-lg p-3" style={{ background: "#0b0e14" }}>
                <p className="text-xs mb-1" style={{ color: "#4b5563" }}>{s.label}</p>
                <p className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl p-5 space-y-4" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
        <p className="text-sm font-bold text-white">操作</p>
        {msg && <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: msg.includes("❌") ? "#FF6060" : "#02DF82" }}>{msg}</p>}
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleStart} disabled={sending}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
            style={{ background: "#FFB5B5", color: "#0b0e14" }}>
            <RefreshCw size={14} />
            {sending ? "發起中..." : "發起投票"}
          </button>
          <button onClick={handleRemind} disabled={reminding || !current.active}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
            style={{ background: "rgba(255,220,53,0.12)", color: "#FFDC35", border: "0.5px solid rgba(255,220,53,0.2)" }}>
            <Bell size={14} />
            {reminding ? "提醒中..." : "提醒未回應"}
          </button>
          <button onClick={fetchStatus} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.05)", color: "#8b92a8", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <RefreshCw size={14} />
            重新整理
          </button>
        </div>
      </div>
    </div>
  )
}
