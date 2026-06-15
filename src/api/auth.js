import api from './index'
export const login = (email, senha) => api.post('/auth/login', { email, senha })
export const register = (nome, email, senha) => api.post('/auth/register', { nome, email, senha })
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (token, novaSenha) => api.post('/auth/reset-password', { token, novaSenha })
export const changePassword = (senhaAtual, novaSenha) => api.put('/auth/change-password', { senhaAtual, novaSenha })
