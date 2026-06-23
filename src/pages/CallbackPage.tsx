import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function CallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) {
      setError('找不到授權碼')
      return
    }

    fetch(`${import.meta.env.VITE_API_BASE}/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          login(data.user, data.access_token)
          navigate('/', { replace: true })
        } else {
          setError(data.error || '登入失敗，請確認你有管理員身分組')
        }
      })
      .catch(() => setError('連線失敗，請稍後再試'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0e14' }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl" style={{ background: '#FFB5B5' }}>
          🐱
        </div>
        {error ? (
          <>
            <p className="text-xl font-black text-white mb-2">登入失敗</p>
            <p style={{ color: '#FF6060' }}>{error}</p>
            <a href="/catbot-dashboard/login" className="mt-4 inline-block" style={{ color: '#FFB5B5' }}>返回登入</a>
          </>
        ) : (
          <p className="text-white font-black text-xl">登入中...</p>
        )}
      </div>
    </div>
  )
}
