import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trades from './pages/Trades'
import Insights from './pages/Insights'

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="layout">
      <Sidebar />
      {children}
    </div>
  )
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/trades" element={<ProtectedLayout><Trades /></ProtectedLayout>} />
          <Route path="/insights" element={<ProtectedLayout><Insights /></ProtectedLayout>} />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
