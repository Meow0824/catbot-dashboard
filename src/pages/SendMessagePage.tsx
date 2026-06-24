import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Send, Trash2 } from 'lucide-react'

interface Channel {
  id: string
  name: string
}

interface EmbedData {
  title: string
  description: string
  color: string
}

const COLORS = ['#FFB5B5', '#84C1FF', '#02DF82', '#FFDC35', '#FF6060', '#B15BFF', '#FF9224']

export function SendMessagePage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [channels, setChannels] = useState<Channel[]>([])
  const [channelId, setChannelId] = useState('')
  const [content, setContent] = useState('')
  const [embedEnabled, setEmbedEnabled] = useState(false)
  const [embed, setEmbed] = useState<EmbedData>({ title: '', description: '', color: '#FFB5B5' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch(`${apiBase}/api/channels`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setChannels(data.channels || [])
        if (data.channels?.length > 0) setChannelId(data.channels[0].id)
      })
      .catch(() => {})
  }, [])

  const handleSend = async () => {
    if (!content && !embedEnabled) return
    setSending(true)
    const body: any = { channel_id: channelId, content }
    if (embedEnabled) {
      body.embed = {
        title: embed.title,
        description: embed.description,
        color: parseInt(embed.color.replace('#', ''), 16),
      }
    }
    const res = await fetch(`${apiBase}/api/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    setSending(false)
    if (res.ok) {
      setSent(true)
      setTimeout(() => setSent(false), 3000)
      setContent('')
      setEmbed({ title: '', description: '', color: '#FFB5B5' })
    }
  }

  return (
    <div className="p-8 max-w-2xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">發送訊息</h1>
        <p className="text-sm" style={{ color: "#8b92a8" }}>選擇頻道並編輯訊息內容</p>
      </div>

      <div className="rounded-xl p-5 space-y-4" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#8b92a8" }}>目標頻道</label>
          <select
            value={channelId}
            onChange={e => setChannelId(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "#0b0e14", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#8b92a8" }}>純文字訊息</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            placeholder="輸入訊息內容..."
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
            style={{ background: "#0b0e14", border: "0.5px solid rgba(255,255,255,0.1)" }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: "#8b92a8" }}>Embed 設定（選填）</span>
            <button
              onClick={() => setEmbedEnabled(!embedEnabled)}
              className="w-8 h-4 rounded-full relative transition-all"
              style={{ background: embedEnabled ? "#FFB5B5" : "#2a2d36" }}
            >
              <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: embedEnabled ? "17px" : "2px" }} />
            </button>
          </div>

          {embedEnabled && (
            <div className="space-y-3 p-3 rounded-lg" style={{ background: "#0b0e14", border: "0.5px solid rgba(255,255,255,0.08)" }}>
              <div>
                <label className="text-xs block mb-1" style={{ color: "#4b5563" }}>顏色</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setEmbed({ ...embed, color: c })}
                      className="w-5 h-5 rounded-full cursor-pointer"
                      style={{ background: c, border: embed.color === c ? "2px solid white" : "2px solid transparent" }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "#4b5563" }}>標題</label>
                <input
                  value={embed.title}
                  onChange={e => setEmbed({ ...embed, title: e.target.value })}
                  placeholder="Embed 標題"
                  className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "#4b5563" }}>內容</label>
                <textarea
                  value={embed.description}
                  onChange={e => setEmbed({ ...embed, description: e.target.value })}
                  rows={3}
                  placeholder="Embed 內容"
                  className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                  style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Discord 預覽 */}
              <div>
                <label className="text-xs block mb-2" style={{ color: "#4b5563" }}>預覽</label>
                <div className="rounded-lg p-3" style={{ background: "#313338" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: "#FFB5B5" }}>🐱</div>
                    <span className="text-xs font-bold" style={{ color: "#FFB5B5" }}>貓哥</span>
                    <span className="text-xs text-white px-1 rounded" style={{ background: "#5865F2", fontSize: "9px" }}>BOT</span>
                  </div>
                  {content && <p className="text-xs mb-2" style={{ color: "#dcddde" }}>{content}</p>}
                  <div className="rounded-r-lg pl-2 py-2 pr-3" style={{ borderLeft: `3px solid ${embed.color}`, background: "rgba(255,255,255,0.03)" }}>
                    {embed.title && <p className="text-xs font-bold text-white mb-1">{embed.title}</p>}
                    {embed.description && <p className="text-xs" style={{ color: "#b9bbbe" }}>{embed.description}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={sending || (!content && !embedEnabled)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: sent ? "#02DF82" : "#FFB5B5", color: "#0b0e14" }}
          >
            <Send size={14} />
            {sending ? "發送中..." : sent ? "已發送！" : "發送訊息"}
          </button>
          <button
            onClick={() => { setContent(''); setEmbed({ title: '', description: '', color: '#FFB5B5' }) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "#8b92a8", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <Trash2 size={14} />
            清除
          </button>
        </div>
      </div>
    </div>
  )
}
