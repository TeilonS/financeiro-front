import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, TrendingUp, History, Landmark, ShieldCheck, Pencil, Check, X, RefreshCw, BarChart2 } from 'lucide-react'
import Modal from '../components/Modal'
import * as investimentosApi from '../api/investimentos'
import * as usuarioApi from '../api/usuario'
import { fmt } from '../utils/formatters'
import toast from 'react-hot-toast'

const TIPOS = [
  { value: 'RENDA_FIXA', label: 'Renda Fixa' },
  { value: 'ACOES', label: 'Ações' },
  { value: 'FII', label: 'FIIs' },
  { value: 'CRYPTO', label: 'Cripto' },
  { value: 'OUTROS', label: 'Outros' }
]

const COM_TICKER = ['ACOES', 'FII']
const EMPTY = { nome: '', instituicao: '', tipo: 'RENDA_FIXA', ticker: '', cotas: '' }
const EMPTY_SNAPSHOT = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), valor: '' }
const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500'

function fmtPreco(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtCotas(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 6 }).format(v)
}

function fmtDataHora(dt) {
  if (!dt) return null
  const d = new Date(dt)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function Investimentos() {
  const [investimentos, setInvestimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [atualizandoCotacoes, setAtualizandoCotacoes] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editandoInv, setEditandoInv] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLoading, setFormLoading] = useState(false)
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false)
  const [selectedInv, setSelectedInv] = useState(null)
  const [snapshotForm, setSnapshotForm] = useState(EMPTY_SNAPSHOT)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historico, setHistorico] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [reserva, setReserva] = useState(0)
  const [editingReserva, setEditingReserva] = useState(false)
  const [reservaInput, setReservaInput] = useState('')
  const [reservaLoading, setReservaLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [resInv, resReserva] = await Promise.allSettled([
        investimentosApi.listar(),
        usuarioApi.getReserva()
      ])
      if (resInv.status === 'fulfilled') setInvestimentos(resInv.value.data || [])
      if (resReserva.status === 'fulfilled') setReserva(resReserva.value.data?.valor || 0)
    } catch { toast.error('Erro ao carregar investimentos.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleAtualizarCotacoes() {
    setAtualizandoCotacoes(true)
    try {
      await investimentosApi.atualizarCotacoes()
      await load()
      toast.success('Cotações atualizadas!')
    } catch {
      toast.error('Erro ao atualizar cotações.')
    } finally {
      setAtualizandoCotacoes(false)
    }
  }

  async function handleSalvarReserva() {
    const valor = parseFloat(reservaInput)
    if (isNaN(valor) || valor < 0) return
    setReservaLoading(true)
    try {
      const res = await usuarioApi.atualizarReserva(valor)
      setReserva(res.data?.valor || valor)
      setEditingReserva(false)
    } catch { toast.error('Erro ao salvar reserva.') }
    finally { setReservaLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setFormLoading(true)
    try {
      const payload = {
        nome: form.nome,
        instituicao: form.instituicao,
        tipo: form.tipo,
        ticker: COM_TICKER.includes(form.tipo) && form.ticker ? form.ticker.toUpperCase().trim() : null,
        cotas: COM_TICKER.includes(form.tipo) && form.cotas ? parseFloat(form.cotas) : null,
      }
      if (editandoInv) await investimentosApi.atualizar(editandoInv.id, payload)
      else await investimentosApi.criar(payload)
      setModalOpen(false); setEditandoInv(null); load()
    } catch { toast.error(editandoInv ? 'Erro ao atualizar investimento.' : 'Erro ao criar investimento.') }
    finally { setFormLoading(false) }
  }

  function openEdit(inv) {
    setEditandoInv(inv)
    setForm({
      nome: inv.nome,
      instituicao: inv.instituicao,
      tipo: inv.tipo,
      ticker: inv.ticker || '',
      cotas: inv.cotas != null ? String(inv.cotas) : ''
    })
    setModalOpen(true)
  }

  async function handleSnapshotSubmit(e) {
    e.preventDefault(); setFormLoading(true)
    try {
      await investimentosApi.registrarSnapshot(selectedInv.id, {
        ...snapshotForm, valor: parseFloat(snapshotForm.valor)
      })
      setSnapshotModalOpen(false); load()
    } catch { toast.error('Erro ao registrar saldo.') }
    finally { setFormLoading(false) }
  }

  async function openHistory(inv) {
    setSelectedInv(inv); setHistoryModalOpen(true); setHistoryLoading(true)
    try {
      const res = await investimentosApi.listarHistorico(inv.id)
      setHistorico(res.data || [])
    } catch { toast.error('Erro ao carregar histórico.') }
    finally { setHistoryLoading(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja realmente excluir este investimento?')) return
    try { await investimentosApi.deletar(id); load() }
    catch { toast.error('Erro ao excluir investimento.') }
  }

  const totalInvestido = investimentos.reduce((s, i) => s + (i.saldoAtual || 0), 0)
  const temAtivosComTicker = investimentos.some(i => i.ticker)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="font-sans text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Investimentos</h1>
          <p className="text-zinc-500 text-sm mt-2">Gestão de patrimônio e evolução mensal</p>
        </div>
        <div className="flex gap-3">
          {temAtivosComTicker && (
            <button
              onClick={handleAtualizarCotacoes}
              disabled={atualizandoCotacoes}
              className="border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={atualizandoCotacoes ? 'animate-spin' : ''} />
              {atualizandoCotacoes ? 'Atualizando...' : 'Atualizar Cotações'}
            </button>
          )}
          <button
            onClick={() => { setEditandoInv(null); setForm(EMPTY); setModalOpen(true) }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-500/10 flex items-center gap-2"
          >
            <Plus size={18} /> Novo Investimento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {investimentos.length > 0 && (
          <div className="bg-primary-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
            <div className="absolute top-0 right-0 p-8 opacity-20"><TrendingUp size={80} /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Patrimônio Total Investido</p>
            <h2 className="text-4xl font-bold tabular-nums">{fmt(totalInvestido)}</h2>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><ShieldCheck size={80} /></div>
          <div className="relative z-10 flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Reserva de Emergência</p>
            {!editingReserva && (
              <button onClick={() => { setReservaInput(String(reserva)); setEditingReserva(true) }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                <Pencil size={14} />
              </button>
            )}
          </div>
          {editingReserva ? (
            <div className="relative z-10 flex items-center gap-3 mt-4">
              <input type="number" step="0.01" min="0" autoFocus value={reservaInput}
                onChange={e => setReservaInput(e.target.value)} className={inputCls + ' flex-1'} placeholder="0,00" />
              <button onClick={handleSalvarReserva} disabled={reservaLoading}
                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50">
                {reservaLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button onClick={() => setEditingReserva(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <h2 className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-white mt-2">{fmt(reserva)}</h2>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : investimentos.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 text-center py-20">
          <Landmark size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="font-bold text-zinc-900 dark:text-white mb-1">Nenhum investimento registrado</p>
          <p className="text-sm text-zinc-500">Comece adicionando seus ativos de renda fixa, ações ou FIIs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investimentos.map(inv => (
            <AtivoCard
              key={inv.id}
              inv={inv}
              onEdit={() => openEdit(inv)}
              onHistory={() => openHistory(inv)}
              onDelete={() => handleDelete(inv.id)}
              onSnapshot={() => { setSelectedInv(inv); setSnapshotForm(EMPTY_SNAPSHOT); setSnapshotModalOpen(true) }}
            />
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditandoInv(null) }}
        title={editandoInv ? 'Editar Investimento' : 'Novo Investimento'}>
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Nome do Ativo</label>
            <input type="text" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
              placeholder="Ex: Tesouro Selic 2029" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Instituição / Corretora</label>
            <input type="text" required value={form.instituicao} onChange={e => setForm({...form, instituicao: e.target.value})}
              placeholder="Ex: NuInvest, XP, Binance" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Tipo</label>
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value, ticker: '', cotas: ''})} className={inputCls}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {COM_TICKER.includes(form.tipo) && (
            <>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-4 border border-zinc-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Dados do Ativo (B3)</p>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                    Ticker <span className="text-zinc-400 normal-case font-normal">(ex: PETR4, HGLG11)</span>
                  </label>
                  <input type="text" value={form.ticker}
                    onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
                    placeholder="PETR4" className={inputCls}
                    style={{ textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                    Quantidade de Cotas
                  </label>
                  <input type="number" step="0.000001" min="0" value={form.cotas}
                    onChange={e => setForm({...form, cotas: e.target.value})}
                    placeholder="10" className={inputCls} />
                </div>
                {form.ticker && (
                  <p className="text-[10px] text-zinc-400">
                    O preço atual será buscado automaticamente via B3 ao salvar.
                  </p>
                )}
              </div>
            </>
          )}

          <button type="submit" disabled={formLoading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {formLoading && <Loader2 size={16} className="animate-spin" />}
            {formLoading ? 'Salvando...' : (editandoInv ? 'Atualizar Investimento' : 'Salvar Investimento')}
          </button>
        </form>
      </Modal>

      {/* Modal snapshot */}
      <Modal open={snapshotModalOpen} onClose={() => setSnapshotModalOpen(false)}
        title={`Atualizar Saldo: ${selectedInv?.nome}`}>
        <form onSubmit={handleSnapshotSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Mês</label>
              <input type="number" required min="1" max="12" value={snapshotForm.mes}
                onChange={e => setSnapshotForm({...snapshotForm, mes: parseInt(e.target.value)})} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Ano</label>
              <input type="number" required min="2000" value={snapshotForm.ano}
                onChange={e => setSnapshotForm({...snapshotForm, ano: parseInt(e.target.value)})} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Saldo no Período (R$)</label>
            <input type="number" required step="0.01" value={snapshotForm.valor}
              onChange={e => setSnapshotForm({...snapshotForm, valor: e.target.value})}
              placeholder="0.00" className={inputCls} />
          </div>
          <button type="submit" disabled={formLoading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl font-bold text-sm transition-all">
            Confirmar Saldo
          </button>
        </form>
      </Modal>

      {/* Modal histórico */}
      <Modal open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Histórico de Evolução">
        <div className="p-2 space-y-4 max-h-[400px] overflow-y-auto">
          {historyLoading ? (
            <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : historico.length === 0 ? (
            <p className="text-center py-10 text-zinc-500 text-sm italic">Nenhum histórico registrado.</p>
          ) : (
            historico.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {s.mes < 10 ? '0'+s.mes : s.mes}/{s.ano}
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{fmt(s.valor)}</p>
                </div>
                <TrendingUp size={16} className="text-emerald-500 opacity-50" />
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}

function AtivoCard({ inv, onEdit, onHistory, onDelete, onSnapshot }) {
  const temTicker = !!inv.ticker
  const saldo = inv.saldoAtual || 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-6 hover:shadow-xl transition-all group shadow-sm shadow-zinc-200/50 dark:shadow-none">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-primary-500 border border-zinc-100 dark:border-white/5 shrink-0">
            {temTicker ? <BarChart2 size={20} /> : <Landmark size={20} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">{inv.nome}</h3>
              {temTicker && (
                <span className="px-2 py-0.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg text-[10px] font-bold tracking-widest">
                  {inv.ticker}
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{inv.instituicao}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onEdit} className="p-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <Pencil size={14} />
          </button>
          {!temTicker && (
            <button onClick={onHistory} className="p-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <History size={14} />
            </button>
          )}
          <button onClick={onDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {temTicker ? (
        /* Ativo com cotação automática */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Cotas</p>
              <p className="text-base font-bold text-zinc-900 dark:text-white tabular-nums">{fmtCotas(inv.cotas)}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Preço/cota</p>
              <p className="text-base font-bold text-zinc-900 dark:text-white tabular-nums">
                {inv.precoUnitario ? fmtPreco(inv.precoUnitario) : <span className="text-zinc-400 font-normal text-xs">não disponível</span>}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{fmt(saldo)}</p>
            {inv.ultimaAtualizacaoPreco && (
              <p className="text-[10px] text-zinc-400 mt-1">
                Cotação em {fmtDataHora(inv.ultimaAtualizacaoPreco)}
              </p>
            )}
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
            <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border border-zinc-100 dark:border-white/5">
              {TIPOS.find(t => t.value === inv.tipo)?.label}
            </span>
          </div>
        </div>
      ) : (
        /* Ativo com saldo manual */
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Saldo Atual</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{fmt(saldo)}</p>
              <button onClick={onSnapshot}
                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline">
                Atualizar Saldo
              </button>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
            <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border border-zinc-100 dark:border-white/5">
              {TIPOS.find(t => t.value === inv.tipo)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
