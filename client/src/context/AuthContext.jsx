import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const email = localStorage.getItem('email')
        if (token && email) {
            setUser({ token, email })
        }
        setLoading(false)
    }, [])

    const loginUser = (token, email) => {
        localStorage.setItem('token', token)
        localStorage.setItem('email', email)
        setUser({ token, email })
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
