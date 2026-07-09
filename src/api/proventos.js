import api from './index'

export const listarProventos = () => api.get('/proventos')
export const criarProvento = (data) => api.post('/proventos', data)
export const deletarProvento = (id) => api.delete(`/proventos/${id}`)
