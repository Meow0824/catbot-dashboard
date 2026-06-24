import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { CallbackPage } from './pages/CallbackPage'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { SendMessagePage } from './pages/SendMessagePage'
import { EditMessagePage } from './pages/EditMessagePage'
import { LeagueVotePage } from './pages/LeagueVotePage'
import { ClassSelectPage } from './pages/ClassSelectPage'
import { GeneralVotePage } from './pages/GeneralVotePage'
import { ActivityLogPage } from './pages/ActivityLogPage'

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
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="send" element={<SendMessagePage />} />
        <Route path="edit" element={<EditMessagePage />} />
        <Route path="league-vote" element={<LeagueVotePage />} />
        <Route path="class-select" element={<ClassSelectPage />} />
        <Route path="general-vote" element={<GeneralVotePage />} />
        <Route path="activity" element={<ActivityLogPage />} />
      </Route>
    </Routes>
  )
}
