import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('user')
      window.location.replace('/login')
      return new Promise(() => {}) // silencia erros downstream ao redirecionar
    }
    return Promise.reject(err)
  }
)

export default api
