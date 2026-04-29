import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { ChevronLeft, ChevronRight, Loader2, TrendingUp, TrendingDown, Wallet, FileDown } from 'lucide-react'
import * as relApi from '../api/relatorios'
import { fmt, MESES, yAxisFmt } from '../utils/formatters'

const COLORS = ['#EF4444', '#F87171', '#FC8181', '#10b981', '#059669', '#34d399', '#f59e0b', '#8b5cf6']

function CustomTooltipBar({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-700 p-4 text-sm">
      <p className="font-bold text-zinc-900 dark:text-white mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

function TabEvolucao() {
  const [ano, setAno] = useState(new Date().getFullYear())
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await relApi.evolucao(ano)
        setDados((res.data?.meses || []).map(item => ({ ...item, nomeMes: item.nomeMes?.substring(0, 3) })))
      } catch { alert('Erro ao carregar evolução.') }
      finally { setLoading(false) }
    }
    load()
  }, [ano])

  const totalReceitas = dados.reduce((s, d) => s + (d.totalReceitas || 0), 0)
  const totalDespesas = dados.reduce((s, d) => s + (d.totalDespesas || 0), 0)
  const saldo = totalReceitas - totalDespesas

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => setAno(a => a - 1)} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"><ChevronLeft size={16} /></button>
        <span className="text-lg font-bold text-zinc-900 dark:text-white min-w-[80px] text-center">{ano}</span>
        <button onClick={() => setAno(a => a + 1)} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"><ChevronRight size={16} /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Receitas</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalReceitas)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Despesas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{fmt(totalDespesas)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Saldo no Ano</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-zinc-900 dark:text-white' : 'text-red-600'}`}>{fmt(saldo)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis dataKey="nomeMes" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={yAxisFmt} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />
              <Bar dataKey="totalReceitas" name="Receita" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="totalDespesas" name="Despesa" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function TabCategorias() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [tipo, setTipo] = useState('DESPESA')
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await relApi.topCategorias({ mes, ano, tipo })
        setDados(res.data || [])
      } catch { setDados([]) }
      finally { setLoading(false) }
    }
    load()
  }, [mes, ano, tipo])

  const total = dados.reduce((s, d) => s + (d.total || 0), 0)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <button onClick={() => { if (mes === 1) { setMes(12); setAno(a => a - 1) } else setMes(m => m - 1) }}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700"><ChevronLeft size={16} /></button>
          <span className="text-base font-bold text-zinc-900 dark:text-white min-w-[120px] text-center">
            {MESES[mes - 1]} {ano}
          </span>
          <button onClick={() => { if (mes === 12) { setMes(1); setAno(a => a + 1) } else setMes(m => m + 1) }}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700"><ChevronRight size={16} /></button>
        </div>
        <div className="flex gap-2">
          {['DESPESA', 'RECEITA'].map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${tipo === t ? 'bg-primary-500 text-white' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}>
              {t === 'DESPESA' ? 'Despesas' : 'Receitas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : dados.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-16 text-center text-zinc-400">
          Nenhum dado para o período selecionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={dados} dataKey="total" nameKey="categoriaNome" cx="50%" cy="50%" outerRadius={110} label={({ categoriaNome, percent }) => `${categoriaNome} ${(percent * 100).toFixed(0)}%`}>
                  {dados.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm space-y-3">
            {dados.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{d.categoriaNome}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{fmt(d.total)}</p>
                  <p className="text-xs text-zinc-400">{total > 0 ? ((d.total / total) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TabComparativo() {
  const now = new Date()
  const [mesAtual, setMesAtual] = useState(now.getMonth() + 1)
  const [anoAtual, setAnoAtual] = useState(now.getFullYear())
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1
  const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await relApi.comparativo({ mesAtual, anoAtual, mesAnterior, anoAnterior })
        setDados(res.data)
      } catch { setDados(null) }
      finally { setLoading(false) }
    }
    load()
  }, [mesAtual, anoAtual])

  const barData = dados ? [
    { nome: 'Receitas', atual: dados.receitasAtual || 0, anterior: dados.receitasAnterior || 0 },
    { nome: 'Despesas', atual: dados.despesasAtual || 0, anterior: dados.despesasAnterior || 0 },
    { nome: 'Saldo', atual: dados.saldoAtual || 0, anterior: dados.saldoAnterior || 0 },
  ] : []

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => { if (mesAtual === 1) { setMesAtual(12); setAnoAtual(a => a - 1) } else setMesAtual(m => m - 1) }}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700"><ChevronLeft size={16} /></button>
        <span className="text-base font-bold text-zinc-900 dark:text-white min-w-[160px] text-center">
          {MESES[mesAnterior - 1]} vs {MESES[mesAtual - 1]} {anoAtual}
        </span>
        <button onClick={() => { if (mesAtual === 12) { setMesAtual(1); setAnoAtual(a => a + 1) } else setMesAtual(m => m + 1) }}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700"><ChevronRight size={16} /></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : !dados ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-16 text-center text-zinc-400">
          Nenhum dado para comparar.
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={barData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={yAxisFmt} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />
              <Bar dataKey="anterior" name={`${MESES[mesAnterior - 1]}`} fill="#94a3b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="atual" name={`${MESES[mesAtual - 1]}`} fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default function Relatorios() {
  const [tab, setTab] = useState('evolucao')
  async function handleExportar() {
    try {
      const now = new Date()
      const res = await relApi.exportar(now.getMonth() + 1, now.getFullYear())
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio_${now.getFullYear()}_${now.getMonth() + 1}.csv`)
      document.body.appendChild(link); link.click(); link.remove()
    } catch { alert('Erro ao exportar.') }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Relatórios</h1>
          <p className="text-zinc-500 text-sm mt-2">Análise detalhada das suas finanças</p>
        </div>
        <button onClick={handleExportar} className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <FileDown size={18} className="text-primary-500" /> Exportar CSV
        </button>
      </div>

      <div className="flex flex-wrap bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 gap-1 mb-6 md:mb-10 w-fit shadow-sm">
        {['evolucao', 'top', 'comparativo'].map(id => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}>
            {id === 'evolucao' ? 'Evolução' : id === 'top' ? 'Categorias' : 'Comparativo'}
          </button>
        ))}
      </div>

      {tab === 'evolucao' && <TabEvolucao />}
      {tab === 'top' && <TabCategorias />}
      {tab === 'comparativo' && <TabComparativo />}
    </div>
  )
}
