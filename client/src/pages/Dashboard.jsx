import { useState, useEffect } from 'react'
import { getTrades, getInsights } from '../api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'

export default function Dashboard() {
    const { user } = useAuth()
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTrades().then(res => {
            setTrades(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-screen"><span className="spinner" /></div>

    // Stats
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
    const wins = trades.filter(t => t.pnl > 0)
    const losses = trades.filter(t => t.pnl <= 0)
    const winRate = trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : 0
    const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0

    // P&L over time for chart
    const chartData = [...trades].reverse().map((t, i) => ({
        date: t.trade_date,
        pnl: t.pnl,
        cumulative: trades.slice(trades.length - 1 - i).reduce((s, x) => s + x.pnl, 0)
    }))

    // Pie chart data
    const pieData = [
        { name: 'Wins', value: wins.length },
        { name: 'Losses', value: losses.length }
    ]
    const PIE_COLORS = ['#22d3a0', '#f7614f']

    return (
        <div className="main-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.email?.split('@')[0]} 👋</p>
                </div>
                <Link to="/trades" className="btn btn-primary">+ Log Trade</Link>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Total P&amp;L</div>
                    <div className={`stat-value ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
                        {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                    </div>
                    <span className="stat-icon">💰</span>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Win Rate</div>
                    <div className={`stat-value ${parseFloat(winRate) >= 50 ? 'positive' : 'negative'}`}>{winRate}%</div>
                    <span className="stat-icon">🎯</span>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Trades</div>
                    <div className="stat-value neutral">{trades.length}</div>
                    <span className="stat-icon">📋</span>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Best Trade</div>
                    <div className={`stat-value ${bestTrade >= 0 ? 'positive' : 'negative'}`}>
                        {bestTrade >= 0 ? '+' : ''}${bestTrade.toFixed(2)}
                    </div>
                    <span className="stat-icon">🏆</span>
                </div>
            </div>

            {trades.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📉</div>
                        <h3>No trades logged yet</h3>
                        <p>Start tracking your trades to see charts and analytics here.</p>
                        <Link to="/trades" className="btn btn-primary">Log Your First Trade</Link>
                    </div>
                </div>
            ) : (
                <div className="charts-grid">
                    {/* P&L Over Time */}
                    <div className="card">
                        <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '600' }}>Cumulative P&amp;L Over Time</h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }}
                                    labelStyle={{ color: 'var(--text-secondary)' }}
                                    formatter={(val) => [`$${val.toFixed(2)}`, 'P&L']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pnl"
                                    stroke="var(--accent-blue)"
                                    strokeWidth={2.5}
                                    dot={{ fill: 'var(--accent-blue)', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Win/Loss Pie */}
                    <div className="card">
                        <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '600' }}>Win / Loss Ratio</h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i]} />
                                    ))}
                                </Pie>
                                <Legend
                                    formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{val}</span>}
                                />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
