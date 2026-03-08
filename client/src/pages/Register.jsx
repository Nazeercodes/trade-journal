import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirm) { setError('Passwords do not match'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return }
        setError('')
        setLoading(true)
        try {
            await register(email, password)
            navigate('/login?registered=true')
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">📈 TradeLog AI</div>
                <p className="auth-tagline">Create your account and start tracking</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" className="form-input" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}
