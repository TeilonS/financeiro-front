import api from './index'
export const listar = () => api.get('/cartoes')
export const criar = (data) => api.post('/cartoes', data)
export const atualizar = (id, data) => api.put(`/cartoes/${id}`, data)
export const deletar = (id) => api.delete(`/cartoes/${id}`)
export const registrarFatura = (id, { mes, ano, valor }) => api.put(`/cartoes/${id}/fatura`, { mes, ano, valor })
export const getFaturas = (id) => api.get(`/cartoes/${id}/faturas`)
