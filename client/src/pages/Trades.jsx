import { useState, useEffect } from 'react'
import { getTrades, createTrade, updateTrade, deleteTrade, analyzeTrade } from '../api'
import TradeModal from '../components/TradeModal'

export default function Trades() {
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editTrade, setEditTrade] = useState(null)
    const [expandedAI, setExpandedAI] = useState({})
    const [analyzingId, setAnalyzingId] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchTrades = async () => {
        const res = await getTrades()
        setTrades(res.data)
        setLoading(false)
    }

    useEffect(() => { fetchTrades() }, [])

    const handleSave = async (data) => {
        try {
            if (editTrade) {
                await updateTrade(editTrade.id, data)
                showToast('Trade updated ✓')
            } else {
                await createTrade(data)
                showToast('Trade logged ✓')
            }
            await fetchTrades()
            setShowModal(false)
            setEditTrade(null)
        } catch (e) {
            showToast(e.response?.data?.detail || 'Something went wrong', 'error')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this trade?')) return
        await deleteTrade(id)
        showToast('Trade deleted')
        fetchTrades()
    }

    const handleAnalyze = async (trade) => {
        setAnalyzingId(trade.id)
        try {
            const res = await analyzeTrade(trade.id)
            setExpandedAI(prev => ({ ...prev, [trade.id]: res.data.analysis }))
            await fetchTrades()
            showToast('AI analysis complete 🤖')
        } catch (e) {
            showToast(e.response?.data?.detail || 'AI analysis failed', 'error')
        } finally {
            setAnalyzingId(null)
        }
    }

    const openEdit = (trade) => {
        setEditTrade(trade)
        setShowModal(true)
    }

    if (loading) return <div className="loading-screen"><span className="spinner" /></div>

    return (
        <div className="main-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Trade Log</h1>
                    <p className="page-subtitle">{trades.length} trades recorded</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditTrade(null); setShowModal(true) }}>
                    + Log Trade
                </button>
            </div>

            {trades.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No trades yet</h3>
                        <p>Log your first trade to start tracking your performance.</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Log First Trade</button>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Symbol</th>
                                    <th>Direction</th>
                                    <th>Entry</th>
                                    <th>Exit</th>
                                    <th>Qty</th>
                                    <th>P&amp;L</th>
                                    <th>Emotion</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.map(trade => (
                                    <>
                                        <tr key={trade.id}>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{trade.trade_date}</td>
                                            <td><strong>{trade.symbol}</strong></td>
                                            <td>
                                                <span className={`badge ${trade.direction === 'LONG' ? 'badge-long' : 'badge-short'}`}>
                                                    {trade.direction}
                                                </span>
                                            </td>
                                            <td>${trade.entry_price}</td>
                                            <td>${trade.exit_price}</td>
                                            <td>{trade.quantity}</td>
                                            <td className={trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{trade.emotion}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="btn btn-ai btn-sm"
                                                        onClick={() => handleAnalyze(trade)}
                                                        disabled={analyzingId === trade.id}
                                                    >
                                                        {analyzingId === trade.id ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Analyzing...</> : '🤖 Analyze'}
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(trade)}>✏️</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(trade.id)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* AI Analysis row */}
                                        {(expandedAI[trade.id] || trade.ai_analysis) && (
                                            <tr key={`ai-${trade.id}`}>
                                                <td colSpan="9" style={{ background: 'rgba(168, 85, 247, 0.04)', padding: '0 16px 16px' }}>
                                                    <div className="ai-panel">
                                                        <div className="ai-panel-header">🤖 AI Coach Analysis</div>
                                                        {expandedAI[trade.id] || trade.ai_analysis}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <TradeModal
                    trade={editTrade}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditTrade(null) }}
                />
            )}

            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
                </div>
            )}
        </div>
    )
}
