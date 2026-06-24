import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Send, Trash2, X, Link } from 'lucide-react'

interface Channel {
  id: string
  name: string
}

interface EmbedData {
  title: string
  description: string
  color: string
  imageUrl: string
  thumbnailUrl: string
}

interface LinkButton {
  label: string
  url: string
}

const COLORS = ['#FFB5B5', '#84C1FF', '#02DF82', '#FFDC35', '#FF6060', '#B15BFF', '#FF9224', '#ffffff']

export function SendMessagePage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [channels, setChannels] = useState<Channel[]>([])
  const [channelId, setChannelId] = useState('')
  const [content, setContent] = useState('')
  const [embedEnabled, setEmbedEnabled] = useState(false)
  const [embed, setEmbed] = useState<EmbedData>({ title: '', description: '', color: '#FFB5B5', imageUrl: '', thumbnailUrl: '' })
  const [linkButtons, setLinkButtons] = useState<LinkButton[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<'image' | 'thumbnail' | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`${apiBase}/api/channels`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setChannels(data.channels || [])
        if (data.channels?.length > 0) setChannelId(data.channels[0].id)
      })
      .catch(() => {})
  }, [])

  const uploadImage = async (file: File, type: 'image' | 'thumbnail') => {
    setUploadingImage(type)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${apiBase}/api/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const data = await res.json()
    setUploadingImage(null)
    if (data.success) {
      if (type === 'image') setEmbed(prev => ({ ...prev, imageUrl: data.url }))
      else setEmbed(prev => ({ ...prev, thumbnailUrl: data.url }))
    }
  }

  const handleSend = async () => {
    if (!content && !embedEnabled) return
    setSending(true)
    const body: any = { channel_id: channelId, content }
    if (embedEnabled) {
      const embedPayload: any = {
        title: embed.title,
        description: embed.description,
        color: parseInt(embed.color.replace('#', ''), 16),
      }
      if (embed.imageUrl) embedPayload.image = { url: embed.imageUrl }
      if (embed.thumbnailUrl) embedPayload.thumbnail = { url: embed.thumbnailUrl }
      body.embed = embedPayload
    }
    if (linkButtons.length > 0) {
      body.components = [{
        type: 1,
        components: linkButtons.filter(b => b.label && b.url).map(b => ({
          type: 2, style: 5, label: b.label, url: b.url
        }))
      }]
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
      setEmbed({ title: '', description: '', color: '#FFB5B5', imageUrl: '', thumbnailUrl: '' })
      setLinkButtons([])
    }
  }

  const ImageUploadBox = ({ type, url, onClear }: { type: 'image' | 'thumbnail', url: string, onClear: () => void }) => (
    <div>
      <label className="text-xs block mb-1" style={{ color: '#4b5563' }}>{type === 'image' ? '大圖（內容下方）' : '縮圖（右上角）'}</label>
      {url ? (
        <div className="relative inline-block">
          <img src={url} alt="" className="rounded-lg object-cover" style={{ height: type === 'image' ? '80px' : '60px', maxWidth: '100%' }} />
          <button onClick={onClear} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#FF6060' }}>
            <X size={10} color="white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => type === 'image' ? imageRef.current?.click() : thumbRef.current?.click()}
          className="flex items-center justify-center rounded-lg cursor-pointer text-xs gap-2"
          style={{ height: '60px', border: '1.5px dashed rgba(255,255,255,0.12)', color: '#4b5563' }}
        >
          {uploadingImage === type ? '上傳中...' : '點擊上傳或拖曳圖片'}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1">發送訊息</h1>
        <p className="text-sm" style={{ color: '#8b92a8' }}>選擇頻道並編輯訊息內容</p>
      </div>

      <div className="flex gap-6">
        {/* 左側編輯區 */}
        <div className="flex-1 space-y-4">
          <div className="rounded-xl p-5" style={{ background: '#151922', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <label className="text-xs font-medium block mb-1" style={{ color: '#8b92a8' }}>目標頻道</label>
            <select value={channelId} onChange={e => setChannelId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: '#0b0e14', border: '0.5px solid rgba(255,255,255,0.1)' }}>
              {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
            </select>
          </div>

          {/* 純文字 */}
          <div className="rounded-xl p-5" style={{ background: '#151922', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <label className="text-xs font-medium block mb-1" style={{ color: '#8b92a8' }}>純文字訊息</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={3}
              placeholder="輸入訊息內容... 支援 **粗體** *斜體* > 引用"
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
              style={{ background: '#0b0e14', border: '0.5px solid rgba(255,255,255,0.1)' }} />
          </div>

          {/* Embed */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#151922', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: embedEnabled ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span className="text-sm font-medium text-white">Embed 設定</span>
              <button onClick={() => setEmbedEnabled(!embedEnabled)}
                className="w-9 h-5 rounded-full relative transition-all"
                style={{ background: embedEnabled ? '#FFB5B5' : '#2a2d36' }}>
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: embedEnabled ? '19px' : '2px' }} />
              </button>
            </div>
            {embedEnabled && (
              <div className="p-5 space-y-3">
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'image')} />
                <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'thumbnail')} />

                <div>
                  <label className="text-xs block mb-1" style={{ color: '#4b5563' }}>顏色</label>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <div key={c} onClick={() => setEmbed({ ...embed, color: c })}
                        className="w-5 h-5 rounded-full cursor-pointer flex-shrink-0"
                        style={{ background: c, border: embed.color === c ? '2px solid white' : '2px solid transparent' }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs block mb-1" style={{ color: '#4b5563' }}>標題</label>
                  <input value={embed.title} onChange={e => setEmbed({ ...embed, title: e.target.value })} placeholder="Embed 標題"
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: '#0b0e14', border: '0.5px solid rgba(255,255,255,0.1)' }} />
                </div>

                <div>
                  <label className="text-xs block mb-1" style={{ color: '#4b5563' }}>內容</label>
                  <textarea value={embed.description} onChange={e => setEmbed({ ...embed, description: e.target.value })} rows={3}
                    placeholder="Embed 內容" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                    style={{ background: '#0b0e14', border: '0.5px solid rgba(255,255,255,0.1)' }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ImageUploadBox type="thumbnail" url={embed.thumbnailUrl} onClear={() => setEmbed({ ...embed, thumbnailUrl: '' })} />
                  <ImageUploadBox type="image" url={embed.imageUrl} onClear={() => setEmbed({ ...embed, imageUrl: '' })} />
                </div>
              </div>
            )}
          </div>

          {/* 連結按鈕 */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#151922', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: linkButtons.length > 0 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span className="text-sm font-medium text-white">連結按鈕</span>
              <button onClick={() => setLinkButtons([...linkButtons, { label: '', url: '' }])}
                className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(255,181,181,0.1)', color: '#FFB5B5' }}>
                + 新增
              </button>
            </div>
            {linkButtons.length > 0 && (
              <div className="p-5 space-y-2">
                {linkButtons.map((btn, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={btn.label} onChange={e => setLinkButtons(prev => prev.map((b, idx) => idx === i ? { ...b, label: e.target.value } : b))}
                      placeholder="按鈕文字" className="w-28 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      style={{ background: '#0b0e14', border: '0.5px solid rgba(255,255,255,0.1)' }} />
                    <input value={btn.url} onChange={e => setLinkButtons(prev => prev.map((b, idx) => idx === i ? { ...b, url: e.target.value } : b))}
                      placeholder="https://..." className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      style={{ background: '#0b0e14', border: '0.5px solid rgba(255,255,255,0.1)' }} />
                    <button onClick={() => setLinkButtons(prev => prev.filter((_, idx) => idx !== i))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,96,96,0.1)', color: '#FF6060' }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSend} disabled={sending || (!content && !embedEnabled)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background: sent ? '#02DF82' : '#FFB5B5', color: '#0b0e14' }}>
              <Send size={14} />
              {sending ? '發送中...' : sent ? '已發送！' : '發送訊息'}
            </button>
            <button onClick={() => { setContent(''); setEmbed({ title: '', description: '', color: '#FFB5B5', imageUrl: '', thumbnailUrl: '' }); setLinkButtons([]) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#8b92a8', border: '0.5px solid rgba(255,255,255,0.1)' }}>
              <Trash2 size={14} />
              清除
            </button>
          </div>
        </div>

        {/* 右側預覽 */}
        <div className="w-64 flex-shrink-0">
          <p className="text-xs font-bold mb-3" style={{ color: '#4b5563', letterSpacing: '0.5px' }}>DISCORD 預覽</p>
          <div className="rounded-xl p-3" style={{ background: '#313338' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#FFB5B5' }}>🐱</div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold" style={{ color: '#FFB5B5' }}>貓哥</span>
                  <span className="text-white px-1 rounded text-xs" style={{ background: '#5865F2', fontSize: '9px' }}>BOT</span>
                </div>
                <span className="text-xs" style={{ color: '#72767d' }}>今天</span>
              </div>
            </div>
            {content && <p className="text-sm mb-2" style={{ color: '#dcddde', whiteSpace: 'pre-wrap' }}>{content}</p>}
            {embedEnabled && (embed.title || embed.description || embed.imageUrl || embed.thumbnailUrl) && (
              <div className="rounded-r-lg pl-3 py-3 pr-3" style={{ borderLeft: `3px solid ${embed.color}`, background: '#2b2d31' }}>
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    {embed.title && <p className="text-sm font-bold text-white mb-1">{embed.title}</p>}
                    {embed.description && <p className="text-xs mb-2" style={{ color: '#b9bbbe', whiteSpace: 'pre-wrap' }}>{embed.description}</p>}
                    {embed.imageUrl && <img src={embed.imageUrl} alt="" className="w-full rounded-lg mt-2" />}
                  </div>
                  {embed.thumbnailUrl && <img src={embed.thumbnailUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                </div>
              </div>
            )}
            {linkButtons.filter(b => b.label && b.url).length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {linkButtons.filter(b => b.label && b.url).map((btn, i) => (
                  <div key={i} className="flex items-center gap-1 px-3 py-1 rounded text-xs" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                    <Link size={10} />
                    {btn.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
