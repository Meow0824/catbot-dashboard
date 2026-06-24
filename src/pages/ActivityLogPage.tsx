import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { RefreshCw } from 'lucide-react'

export function ActivityLogPage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = () => {
    setLoading(true)
    fetch(`${apiBase}/api/logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLogs(data.logs || []); setLoading(false) })
      .catch(() => { setLogs([]); setLoading(false) })
  }

  useEffect(() => { fetchLogs() }, [])

  return (
    <div className="p-8 max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">活動紀錄</h1>
          <p className="text-sm" style={{ color: "#8b92a8" }}>貓哥所有操作的完整記錄</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.05)", color: "#8b92a8", border: "0.5px solid rgba(255,255,255,0.1)" }}>
          <RefreshCw size={14} />
          重新整理
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "#8b92a8" }}>載入中...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "#8b92a8" }}>尚無記錄</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {logs.map((log, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <span className="text-xs font-mono flex-shrink-0 mt-0.5" style={{ color: "#4b5563" }}>{i + 1}</span>
                <span className="text-xs" style={{ color: "#c9cfe0" }}>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
