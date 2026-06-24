import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Send, Edit, Shield, Briefcase,
  ListChecks, FileText, LogOut
} from 'lucide-react'

const navItems = [
  { group: '總覽', items: [{ path: '/', label: '控制台', icon: LayoutDashboard }] },
  { group: '訊息管理', items: [
    { path: '/send', label: '發送訊息', icon: Send },
    { path: '/edit', label: '編輯訊息', icon: Edit },
  ]},
  { group: '功能管理', items: [
    { path: '/league-vote', label: '聯賽投票', icon: Shield },
    { path: '/class-select', label: '職業選擇', icon: Briefcase },
    { path: '/general-vote', label: '通用投票', icon: ListChecks },
  ]},
  { group: '系統', items: [
    { path: '/activity', label: '活動紀錄', icon: FileText },
  ]},
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0b0e14' }}>
      <div className="w-48 flex flex-col flex-shrink-0" style={{ background: '#080b10', borderRight: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div className="p-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#FFB5B5' }}>🐱</div>
            <span className="text-sm font-semibold text-white">貓窩</span>
          </div>
          {user && (
            <div className="flex items-center gap-2 mt-2 px-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#5865F2' }}>
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-xs truncate" style={{ color: '#8b92a8' }}>{user.username}</span>
              <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#02DF82' }}></div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map(group => (
            <div key={group.group}>
              <p className="text-xs font-bold px-2 py-2 mt-1" style={{ color: '#4b5563', letterSpacing: '0.8px' }}>{group.group}</p>
              {group.items.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-all"
                    style={{
                      background: isActive ? 'rgba(255,181,181,0.1)' : 'transparent',
                      color: isActive ? '#FFB5B5' : '#8b92a8',
                    }}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ color: '#8b92a8' }}
          >
            <LogOut size={14} />
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
