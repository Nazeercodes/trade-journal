import { useState } from 'react'

const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'FOMO', 'Greedy', 'Fearful', 'Neutral', 'Excited']

export default function TradeModal({ trade, onSave, onClose }) {
    const [form, setForm] = useState({
        symbol: trade?.symbol || '',
        direction: trade?.direction || 'LONG',
        entry_price: trade?.entry_price || '',
        exit_price: trade?.exit_price || '',
        quantity: trade?.quantity || '',
        notes: trade?.notes || '',
        emotion: trade?.emotion || 'Neutral',
        trade_date: trade?.trade_date || new Date().toISOString().split('T')[0],
    })
    const [loading, setLoading] = useState(false)

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

    // Preview P&L
    const previewPnL = () => {
        const entry = parseFloat(form.entry_price)
        const exit = parseFloat(form.exit_price)
        const qty = parseFloat(form.quantity)
        if (!entry || !exit || !qty) return null
        const pnl = form.direction === 'LONG' ? (exit - entry) * qty : (entry - exit) * qty
        return pnl.toFixed(2)
    }

    const preview = previewPnL()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        await onSave({
            ...form,
            entry_price: parseFloat(form.entry_price),
            exit_price: parseFloat(form.exit_price),
            quantity: parseFloat(form.quantity),
        })
        setLoading(false)
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{trade ? '✏️ Edit Trade' : '📋 Log New Trade'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Symbol</label>
                            <input className="form-input" placeholder="AAPL, BTC, EUR/USD..." value={form.symbol} onChange={e => set('symbol', e.target.value.toUpperCase())} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Direction</label>
                            <select className="form-select" value={form.direction} onChange={e => set('direction', e.target.value)}>
                                <option value="LONG">LONG 📈</option>
                                <option value="SHORT">SHORT 📉</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Entry Price</label>
                            <input className="form-input" type="number" step="0.0001" placeholder="0.00" value={form.entry_price} onChange={e => set('entry_price', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Exit Price</label>
                            <input className="form-input" type="number" step="0.0001" placeholder="0.00" value={form.exit_price} onChange={e => set('exit_price', e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Quantity</label>
                            <input className="form-input" type="number" step="0.001" placeholder="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Trade Date</label>
                            <input className="form-input" type="date" value={form.trade_date} onChange={e => set('trade_date', e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Emotion</label>
                        <select className="form-select" value={form.emotion} onChange={e => set('emotion', e.target.value)}>
                            {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes / Reasoning</label>
                        <textarea className="form-textarea" placeholder="Why did you take this trade? What was your thesis?" value={form.notes} onChange={e => set('notes', e.target.value)} />
                    </div>

                    {preview !== null && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: parseFloat(preview) >= 0 ? 'rgba(34, 211, 160, 0.1)' : 'rgba(247, 97, 79, 0.1)',
                            border: `1px solid ${parseFloat(preview) >= 0 ? 'rgba(34, 211, 160, 0.3)' : 'rgba(247, 97, 79, 0.3)'}`,
                            color: parseFloat(preview) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '16px'
                        }}>
                            Estimated P&L: {parseFloat(preview) >= 0 ? '+' : ''}${preview}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : (trade ? 'Update Trade' : 'Log Trade')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
