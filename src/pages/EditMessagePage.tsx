import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Edit, Check, Trash2, X } from 'lucide-react'

interface SavedMessage {
  message_id: string
  channel_id: string
  channel_name: string
  content: string
  embed_title: string
  embed_description: string
  embed_color: string
  embed_image_url: string
  embed_thumbnail_url: string
  components: any
  created_at: string
}

const COLORS = ['#FFB5B5', '#84C1FF', '#02DF82', '#FFDC35', '#FF6060', '#B15BFF', '#FF9224', '#ffffff']

export function EditMessagePage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [selected, setSelected] = useState<SavedMessage | null>(null)
  const [content, setContent] = useState('')
  const [embedTitle, setEmbedTitle] = useState('')
  const [embedDesc, setEmbedDesc] = useState('')
  const [embedColor, setEmbedColor] = useState('#FFB5B5')
  const [embedImageUrl, setEmbedImageUrl] = useState('')
  const [embedThumbUrl, setEmbedThumbUrl] = useState('')
  const [hasEmbed, setHasEmbed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploadingImage, setUploadingImage] = useState<'image' | 'thumbnail' | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = () => {
    fetch(`${apiBase}/api/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(() => {})
  }

  const handleSelect = (m: SavedMessage) => {
    setSelected(m)
    console.log('selected message:', JSON.stringify(m))
    setContent(m.content || '')
    setEmbedTitle(m.embed_title || '')
    setEmbedDesc(m.embed_description || '')
    setEmbedColor(m.embed_color ? '#' + parseInt(m.embed_color).toString(16).padStart(6, '0') : '#FFB5B5')
    setEmbedImageUrl(m.embed_image_url || '')
    setEmbedThumbUrl(m.embed_thumbnail_url || '')
    setHasEmbed(!!(m.embed_title || m.embed_description || m.embed_image_url || m.embed_thumbnail_url))
    setMsg('')
  }

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
      if (type === 'image') setEmbedImageUrl(data.url)
      else setEmbedThumbUrl(data.url)
    }
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const body: any = {
      channel_id: selected.channel_id,
      message_id: selected.message_id,
      content,
    }
    if (hasEmbed) {
      const embedPayload: any = {
        title: embedTitle,
        description: embedDesc,
        color: parseInt(embedColor.replace('#', ''), 16),
      }
      if (embedImageUrl) embedPayload.image = { url: embedImageUrl }
      if (embedThumbUrl) embedPayload.thumbnail = { url: embedThumbUrl }
      body.embed = embedPayload
    }
    const res = await fetch(`${apiBase}/api/edit-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.success) {
      // 更新 Supabase 記錄
      await fetch(`${apiBase}/api/update-message-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message_id: selected.message_id,
          content,
          embed_title: embedTitle,
          embed_description: embedDesc,
          embed_color: String(parseInt(embedColor.replace('#', ''), 16)),
          embed_image_url: embedImageUrl,
          embed_thumbnail_url: embedThumbUrl,
        }),
      })
      setMsg('✅ 已更新')
      fetchMessages()
    } else {
      setMsg(`❌ ${data.error}`)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!confirm('確定要刪除這則訊息嗎？')) return
    const res = await fetch(`${apiBase}/api/delete-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ channel_id: selected.channel_id, message_id: selected.message_id })
    })
    const data = await res.json()
    if (data.success) {
      setMessages(prev => prev.filter(m => m.message_id !== selected.message_id))
      setSelected(null)
    } else {
      setMsg(`❌ ${data.error}`)
    }
  }

  const ImageBox = ({ type, url, onClear }: { type: 'image' | 'thumbnail', url: string, onClear: () => void }) => (
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
        <div onClick={() => type === 'image' ? imageRef.current?.click() : thumbRef.current?.click()}
          className="flex items-center justify-center rounded-lg cursor-pointer text-xs"
          style={{ height: '60px', border: '1.5px dashed rgba(255,255,255,0.12)', color: '#4b5563' }}>
          {uploadingImage === type ? '上傳中...' : '點擊上傳'}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-8 max-w-3xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">編輯訊息</h1>
        <p className="text-sm" style={{ color: '#8b92a8' }}>僅限透過管理介面發送的訊息</p>
      </div>

      {selected && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: '#151922', border: '0.5px solid rgba(255,181,181,0.3)' }}>
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'image')} />
          <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'thumbnail')} />

          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: '#FFB5B5' }}>正在編輯 · #{selected.channel_name}</p>
            <button onClick={() => setSelected(null)} className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#8b92a8' }}>取消</button>
          </div>

          {msg && <p className="text-sm" style={{ color: msg.startsWith('✅') ? '#02DF82' : '#FF6060' }}>{msg}</p>}

          <div>
            <label className="text-xs block mb-1" style={{ color: '#8b92a8' }}>純文字訊息</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
              style={{ background: '#0b0e14', border: '0.5px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: '#0b0e14', borderBottom: hasEmbed ? '0.5px solid rgba(255,255,255,0.08)' : 'none' }}>
              <span className="text-sm font-medium text-white">Embed 設定</span>
              <button onClick={() => setHasEmbed(!hasEmbed)}
                className="w-9 h-5 rounded-full relative transition-all"
                style={{ background: hasEmbed ? '#FFB5B5' : '#2a2d36' }}>
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: hasEmbed ? '19px' : '2px' }} />
              </button>
            </div>
            {hasEmbed && (
              <div className="p-4 space-y-3" style={{ background: '#0b0e14' }}>
                <div>
                  <label className="text-xs block mb-1" style={{ color: '#4b5563' }}>顏色</label>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <div key={c} onClick={() => setEmbedColor(c)}
                        className="w-5 h-5 rounded-full cursor-pointer flex-shrink-0"
                        style={{ background: c, border: embedColor === c ? '2px solid white' : '2px solid transparent' }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: '#4b5563' }}>標題</label>
                  <input value={embedTitle} onChange={e => setEmbedTitle(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: '#151922', border: '0.5px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: '#4b5563' }}>內容</label>
                  <textarea value={embedDesc} onChange={e => setEmbedDesc(e.target.value)} rows={3}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                    style={{ background: '#151922', border: '0.5px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ImageBox type="thumbnail" url={embedThumbUrl} onClear={() => setEmbedThumbUrl('')} />
                  <ImageBox type="image" url={embedImageUrl} onClear={() => setEmbedImageUrl('')} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background: '#FFB5B5', color: '#0b0e14' }}>
              <Check size={14} />
              {saving ? '儲存中...' : '儲存更新'}
            </button>
            <button onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: 'rgba(255,96,96,0.1)', color: '#FF6060', border: '0.5px solid rgba(255,96,96,0.2)' }}>
              <Trash2 size={14} />
              刪除訊息
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: '#151922', border: '0.5px solid rgba(255,255,255,0.06)' }}>
        {messages.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: '#8b92a8' }}>尚無已發送的訊息記錄</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {messages.map(m => (
              <div key={m.message_id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: '#FFB5B5' }}>#{m.channel_name}</span>
                    <span className="text-xs" style={{ color: '#4b5563' }}>{m.created_at}</span>
                    {(m.embed_title || m.embed_image_url) && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,181,181,0.1)', color: '#FFB5B5' }}>Embed</span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: '#8b92a8' }}>{m.content || m.embed_title || '（無文字內容）'}</p>
                </div>
                <button onClick={() => handleSelect(m)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#8b92a8', border: '0.5px solid rgba(255,255,255,0.1)' }}>
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
