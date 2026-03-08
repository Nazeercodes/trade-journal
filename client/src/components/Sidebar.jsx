import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/trades', icon: '📋', label: 'Trade Log' },
    { to: '/insights', icon: '🤖', label: 'AI Insights' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span>📈</span> TradeLog AI
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
                    🚪 Sign Out
                </button>
            </div>
        </aside>
    )
}
