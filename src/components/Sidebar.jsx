import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, Receipt, Tag, Target,
  FileUp, BarChart2, RefreshCw, LogOut, Wallet, CreditCard, PiggyBank, Moon, Sun, HardDrive, X, KeyRound, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as authApi from '../api/auth'

const links = [
  { to: '/',             label: 'Dashboard',    Icon: LayoutDashboard, exact: true },
  { to: '/lancamentos',  label: 'Lançamentos',  Icon: Receipt },
  { to: '/categorias',   label: 'Categorias',   Icon: Tag },
  { to: '/cartoes',      label: 'Cartões',      Icon: CreditCard },
  { to: '/orcamentos',   label: 'Orçamentos',   Icon: PiggyBank },
  { to: '/metas',        label: 'Metas',        Icon: Target },
  { to: '/extrato',      label: 'Extrato',      Icon: FileUp },
  { to: '/relatorios',   label: 'Relatórios',   Icon: BarChart2 },
  { to: '/recorrencias', label: 'Recorrências', Icon: RefreshCw },
  { to: '/backup',       label: 'Backup',       Icon: HardDrive },
  { to: '/investimentos', label: 'Investimentos', Icon: PiggyBank },
]

const inputCls = 'w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors'

function ModalAlterarSenha({ onClose }) {
  const [form, setForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.novaSenha !== form.confirmar) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    try {
      await authApi.changePassword(form.senhaAtual, form.novaSenha)
      toast.success('Senha alterada com sucesso!')
      onClose()
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-zinc-900 dark:text-white text-base">Alterar Senha</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Senha Atual</label>
            <input type="password" required value={form.senhaAtual} onChange={set('senhaAtual')} placeholder="••••••••" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Nova Senha</label>
            <input type="password" required minLength={6} value={form.novaSenha} onChange={set('novaSenha')} placeholder="••••••••" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Confirmar Nova Senha</label>
            <input type="password" required minLength={6} value={form.confirmar} onChange={set('confirmar')} placeholder="••••••••" className={inputCls} />
          </div>

          {error && (
            <p className="text-primary-400 text-xs bg-primary-500/10 border border-primary-500/20 px-3 py-2.5 rounded-xl">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [showAlterarSenha, setShowAlterarSenha] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNavClick() {
    if (onClose) onClose()
  }

  const initials = user?.nome
    ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64
        md:relative md:translate-x-0
        bg-white dark:bg-zinc-900 flex flex-col shrink-0
        border-r border-zinc-200 dark:border-white/5
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Marca */}
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/20">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <p className="font-sans font-bold text-zinc-900 dark:text-white text-base leading-none tracking-tight">Financeiro</p>
              <p className="text-[10px] text-zinc-500 mt-1 tracking-[0.2em] uppercase font-bold">Inteligente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto border-zinc-100 dark:border-transparent">
          {links.map(({ to, label, Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-white font-bold shadow-sm border border-primary-500/10'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-primary-500' : 'group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors'} />
                  <span>{label}</span>
                  {isActive && (
                     <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 mt-auto border-t border-zinc-100 dark:border-white/5 space-y-1">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 text-sm font-medium transition-all"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{dark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={() => setShowAlterarSenha(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 text-sm font-medium transition-all"
          >
            <KeyRound size={16} />
            <span>Alterar Senha</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-4 mb-2">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-zinc-900 dark:text-white text-xs font-bold truncate">{user?.nome || 'Usuário'}</p>
              <p className="text-[10px] text-zinc-500 font-medium">Membro Premium</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/5 text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {showAlterarSenha && <ModalAlterarSenha onClose={() => setShowAlterarSenha(false)} />}
    </>
  )
}
