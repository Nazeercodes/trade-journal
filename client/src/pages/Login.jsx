import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { loginUser } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await login(email, password)
            loginUser(res.data.access_token, email)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">📈 TradeLog AI</div>
                <p className="auth-tagline">Welcome back — sign in to your journal</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    )
}
