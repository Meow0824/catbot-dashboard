import { useState, useEffect } from 'react'
import { Send, Shield } from 'lucide-react'

export function DashboardPage() {
  const [botStatus, setBotStatus] = useState<string>('確認中...')
  const apiBase = import.meta.env.VITE_API_BASE

  useEffect(() => {
    fetch(`${apiBase}/health`)
      .then(res => res.json())
      .then(data => setBotStatus(data.status === 'running' ? '運作中' : '離線'))
      .catch(() => setBotStatus('無法連線'))
  }, [])

  const isOnline = botStatus === '運作中'

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">控制台</h1>
        <p style={{ color: "#8b92a8" }} className="text-sm">貓哥 Discord Bot 管理介面</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs mb-2" style={{ color: "#4b5563" }}>Bot 狀態</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: isOnline ? "#02DF82" : "#FF6060" }}></div>
            <span className="text-sm font-bold" style={{ color: isOnline ? "#02DF82" : "#FF6060" }}>{botStatus}</span>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs mb-2" style={{ color: "#4b5563" }}>今日發送訊息</p>
          <p className="text-2xl font-black font-mono" style={{ color: "#FFB5B5" }}>-</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs mb-2" style={{ color: "#4b5563" }}>進行中投票</p>
          <p className="text-2xl font-black font-mono" style={{ color: "#FFDC35" }}>-</p>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
        <p className="text-sm font-bold text-white mb-4">快速入口</p>
        <div className="grid grid-cols-2 gap-3">
          <a href="#/send" className="flex items-center gap-3 p-3 rounded-lg transition-all hover:opacity-80" style={{ background: "rgba(255,181,181,0.08)", border: "0.5px solid rgba(255,181,181,0.2)" }}>
            <Send size={16} style={{ color: "#FFB5B5" }} />
            <span className="text-sm font-medium" style={{ color: "#FFB5B5" }}>發送訊息</span>
          </a>
          <a href="#/league-vote" className="flex items-center gap-3 p-3 rounded-lg transition-all hover:opacity-80" style={{ background: "rgba(77,127,255,0.08)", border: "0.5px solid rgba(77,127,255,0.2)" }}>
            <Shield size={16} style={{ color: "#4D7FFF" }} />
            <span className="text-sm font-medium" style={{ color: "#4D7FFF" }}>聯賽投票</span>
          </a>
        </div>
      </div>
    </div>
  )
}
