import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Plus, X } from 'lucide-react'

const TIME_OPTIONS = [
  { label: '1 分鐘', value: '60' },
  { label: '3 分鐘', value: '180' },
  { label: '5 分鐘', value: '300' },
  { label: '10 分鐘', value: '600' },
  { label: '30 分鐘', value: '1800' },
  { label: '1 小時', value: '3600' },
  { label: '3 小時', value: '10800' },
  { label: '12 小時', value: '43200' },
]

export function GeneralVotePage() {
  const { token } = useAuth()
  const apiBase = import.meta.env.VITE_API_BASE
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [isMulti, setIsMulti] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [duration, setDuration] = useState('3600')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  const addOption = () => setOptions([...options, ''])
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i))
  const updateOption = (i: number, v: string) => setOptions(options.map((o, idx) => idx === i ? v : o))

  const handleSend = async () => {
    if (!title || options.filter(o => o.trim()).length < 2) return
    setSending(true)
    setMsg('')
    const res = await fetch(`${apiBase}/api/general-vote/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, options: options.filter(o => o.trim()), is_multi: isMulti, is_anonymous: isAnonymous, duration })
    })
    const data = await res.json()
    setMsg(data.success ? '✅ 投票已發起' : `❌ ${data.error}`)
    setSending(false)
  }

  const Toggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="w-8 h-4 rounded-full relative transition-all flex-shrink-0" style={{ background: value ? '#FFB5B5' : '#2a2d36' }}>
      <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: value ? '17px' : '2px' }} />
    </button>
  )

  return (
    <div className="p-8 max-w-2xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">通用投票</h1>
        <p className="text-sm" style={{ color: "#8b92a8" }}>建立自訂投票</p>
      </div>

      <div className="rounded-xl p-5 space-y-4" style={{ background: "#151922", border: "0.5px solid rgba(255,255,255,0.06)" }}>
        {msg && <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: msg.startsWith('✅') ? '#02DF82' : '#FF6060' }}>{msg}</p>}

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#8b92a8" }}>投票標題 *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="輸入投票問題..."
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "#0b0e14", border: "0.5px solid rgba(255,255,255,0.1)" }} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: "#8b92a8" }}>投票選項</label>
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input value={o} onChange={e => updateOption(i, e.target.value)} placeholder={`選項 ${i + 1}`}
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: "#0b0e14", border: "0.5px solid rgba(255,255,255,0.1)" }} />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,96,96,0.1)", color: "#FF6060" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addOption} className="mt-2 flex items-center gap-1 text-sm" style={{ color: "#FFB5B5" }}>
            <Plus size={14} /> 新增選項
          </button>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#8b92a8" }}>投票時間</label>
          <select value={duration} onChange={e => setDuration(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "#0b0e14", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#c9cfe0" }}>允許複選</span>
            <Toggle value={isMulti} onChange={setIsMulti} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#c9cfe0" }}>匿名投票</span>
            <Toggle value={isAnonymous} onChange={setIsAnonymous} />
          </div>
        </div>

        <button onClick={handleSend} disabled={sending || !title || options.filter(o => o.trim()).length < 2}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
          style={{ background: "#FFB5B5", color: "#0b0e14" }}>
          {sending ? '發起中...' : '發起投票'}
        </button>
      </div>
    </div>
  )
}
