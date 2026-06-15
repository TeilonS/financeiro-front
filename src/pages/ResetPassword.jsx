import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as authApi from '../api/auth'

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (novaSenha !== confirmar) {
      setError('As senhas não coincidem.')
      return
    }
    if (!token) {
      setError('Link inválido. Solicite um novo link de recuperação.')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, novaSenha)
      toast.success('Senha redefinida com sucesso!')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.response?.data?.mensagem || err.response?.data?.message || 'Link inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-primary-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
            <span className="font-sans font-bold text-white text-xl">F</span>
          </div>
          <h1 className="font-sans font-bold text-zinc-900 dark:text-white text-2xl tracking-tight">Nova senha</h1>
          <p className="text-zinc-500 text-sm mt-2">Escolha uma senha com ao menos 6 caracteres</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Nova Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Confirmar Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-primary-400 text-xs bg-primary-500/10 border border-primary-500/20 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <p className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs transition-colors"
          >
            Voltar para o login
          </button>
        </p>
      </div>
    </div>
  )
}
