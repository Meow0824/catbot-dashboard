import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Send, Edit, LogOut } from 'lucide-react'

const navItems = [
  { path: '/send', label: '發送訊息', icon: Send },
  { path: '/edit', label: '編輯訊息', icon: Edit },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [botStatus, setBotStatus] = useState<'online' | 'offline' | 'loading'>('loading')
  const apiBase = import.meta.env.VITE_API_BASE

  useEffect(() => {
    fetch(`${apiBase}/health`)
      .then(res => res.json())
      .then(data => setBotStatus(data.status === 'running' ? 'online' : 'offline'))
      .catch(() => setBotStatus('offline'))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const statusColor = botStatus === 'online' ? '#02DF82' : botStatus === 'offline' ? '#FF6060' : '#FFDC35'
  const statusLabel = botStatus === 'online' ? '運作中' : botStatus === 'offline' ? '離線' : '確認中'

  return (
    <div className="flex min-h-screen" style={{ background: '#0b0e14' }}>
      <div className="w-52 flex flex-col flex-shrink-0" style={{ background: '#080b10', borderRight: '0.5px solid rgba(255,255,255,0.06)' }}>
        {/* Header */}
        <div className="p-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 p-2 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: '#FFB5B5' }}>🐱</div>
            <span className="text-sm font-bold text-white">貓哥管理介面</span>
          </div>
          {/* Bot 狀態 */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor }}></div>
            <span className="text-xs" style={{ color: statusColor }}>貓哥 · {statusLabel}</span>
          </div>
        </div>

        {/* 使用者 */}
        {user && (
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#5865F2' }}>
              {user.username[0].toUpperCase()}
            </div>
            <span className="text-sm truncate" style={{ color: '#c9cfe0' }}>{user.username}</span>
          </div>
        )}

        {/* 導航 */}
        <nav className="flex-1 p-3">
          <p className="text-xs font-bold px-2 py-2" style={{ color: '#4b5563', letterSpacing: '0.8px' }}>訊息管理</p>
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all"
                style={{
                  background: isActive ? 'rgba(255,181,181,0.12)' : 'transparent',
                  color: isActive ? '#FFB5B5' : '#8b92a8',
                }}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* 登出 */}
        <div className="p-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ color: '#8b92a8' }}
          >
            <LogOut size={15} />
            登出
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
