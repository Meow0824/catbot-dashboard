import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Edit, Check, Trash2 } from 'lucide-react'

interface SavedMessage {
  message_id: string
  channel_id: string
  channel_name: string
  content: string
  embed_title: string
  created_at: string
}

export function EditMessagePage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [selected, setSelected] = useState<SavedMessage | null>(null)
  const [content, setContent] = useState('')
  const [embedTitle, setEmbedTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${apiBase}/api/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(() => {})
  }, [])

  const handleSelect = (m: SavedMessage) => {
    setSelected(m)
    setContent(m.content || '')
    setEmbedTitle(m.embed_title || '')
    setMsg('')
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const res = await fetch(`${apiBase}/api/edit-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ channel_id: selected.channel_id, message_id: selected.message_id, content })
    })
    const data = await res.json()
    setMsg(data.success ? '✅ 已更新' : `❌ ${data.error}`)
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-3xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">編輯訊息</h1>
        <p className="text-sm" style={{ color: "#8b92a8" }}>僅限透過管理介面發送的訊息</p>
      </div>

      {selected && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#151922", border: "0.5px solid rgba(255,181,181,0.3)" }}>
          <p className="text-sm font-bold" style={{ color: "#FFB5B5" }}>正在編輯 · #{selected.channel_name}</p>
          {msg && <p className="text-sm" style={{ color: msg.startsWith('✅') ? '#02DF82' : '#FF6060' }}>{msg}</p>}
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
            style={{ background: "#0b0e14", border: "0.5px solid rgba(255,255,255,0.1)" }} />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background: "#FFB5B5", color: "#0b0e14" }}>
              <Check size={14} />
              {saving ? '儲存中...' : '儲存更新'}
            </button>
            <button onClick={() => setSelected(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "#8b92a8", border: "0.5px solid rgba(255,255,255,0.1)" }}>
              取消
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
        {messages.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "#8b92a8" }}>尚無已發送的訊息記錄</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {messages.map(m => (
              <div key={m.message_id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: "#FFB5B5" }}>#{m.channel_name}</span>
                    <span className="text-xs" style={{ color: "#4b5563" }}>{m.created_at}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "#8b92a8" }}>{m.content || m.embed_title || '（無內容）'}</p>
                </div>
                <button onClick={() => handleSelect(m)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#8b92a8", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                  <Edit size={12} />
                  編輯
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
