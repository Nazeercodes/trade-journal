import { useState } from 'react'
import { getInsights } from '../api'

export default function Insights() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchInsights = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getInsights()
            setData(res.data)
        } catch (e) {
            setError(e.response?.data?.detail || 'Could not load insights. Make sure your Gemini API key is configured.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="main-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Insights</h1>
                    <p className="page-subtitle">Behavioral and performance analysis powered by Gemini AI</p>
                </div>
                <button className="btn btn-ai" onClick={fetchInsights} disabled={loading} style={{ padding: '10px 20px', fontSize: '14px' }}>
                    {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</> : '🤖 Generate Insights'}
                </button>
            </div>

            {error && (
                <div className="card" style={{ borderColor: 'rgba(247, 97, 79, 0.3)', marginBottom: '20px' }}>
                    <p style={{ color: 'var(--accent-red)', fontSize: '14px' }}>⚠️ {error}</p>
                </div>
            )}

            {!data && !loading && !error && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🤖</div>
                        <h3>Get AI-powered portfolio feedback</h3>
                        <p>Click "Generate Insights" and Gemini AI will analyze your last 20 trades — identifying patterns, psychological tendencies, and actionable improvements.</p>
                        <button className="btn btn-ai" onClick={fetchInsights} style={{ padding: '12px 24px', fontSize: '15px' }}>
                            Generate Insights Now
                        </button>
                    </div>
                </div>
            )}

            {data && (
                <>
                    {/* Stats */}
                    <div className="stat-grid" style={{ marginBottom: '20px' }}>
                        <div className="stat-card">
                            <div className="stat-label">Trades Analyzed</div>
                            <div className="stat-value neutral">{data.stats.total_trades}</div>
                            <span className="stat-icon">📊</span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total P&L</div>
                            <div className={`stat-value ${data.stats.total_pnl >= 0 ? 'positive' : 'negative'}`}>
                                {data.stats.total_pnl >= 0 ? '+' : ''}${data.stats.total_pnl.toFixed(2)}
                            </div>
                            <span className="stat-icon">💰</span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Win Rate</div>
                            <div className={`stat-value ${data.stats.win_rate >= 50 ? 'positive' : 'negative'}`}>{data.stats.win_rate}%</div>
                            <span className="stat-icon">🎯</span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">W / L</div>
                            <div className="stat-value neutral">{data.stats.wins} / {data.stats.losses}</div>
                            <span className="stat-icon">📈</span>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="insights-card">
                        <div className="insights-title">
                            🤖 Gemini AI Analysis
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                            {data.insights}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <button className="btn btn-ai" onClick={fetchInsights} disabled={loading}>
                            🔄 Refresh Analysis
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
