import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auth
export const register = (email, password) =>
    api.post('/auth/register', { email, password })

export const login = (email, password) =>
    api.post('/auth/login', { email, password })

// Trades
export const getTrades = () => api.get('/trades/')
export const createTrade = (data) => api.post('/trades/', data)
export const updateTrade = (id, data) => api.put(`/trades/${id}`, data)
export const deleteTrade = (id) => api.delete(`/trades/${id}`)

// AI
export const analyzeTrade = (id) => api.post(`/ai/analyze/${id}`)
export const getInsights = () => api.get('/ai/insights')

export default api
