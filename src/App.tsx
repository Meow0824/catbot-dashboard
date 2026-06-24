import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { Layout } from './components/Layout'
import { SendMessagePage } from './pages/SendMessagePage'
import { EditMessagePage } from './pages/EditMessagePage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ background: '#0b0e14', minHeight: '100vh' }} />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/send" replace />} />
        <Route path="send" element={<SendMessagePage />} />
        <Route path="edit" element={<EditMessagePage />} />
      </Route>
    </Routes>
  )
}
