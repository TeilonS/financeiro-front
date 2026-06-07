import { useEffect, useState } from 'react'
import { registrarFatura, getFaturas } from '../api/cartoes'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function FaturaModal({ cartao, onClose, onSaved }) {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [valor, setValor] = useState('')
  const [faturas, setFaturas] = useState([])
  const [loading, setLoading] = useState(false)

  const carregar = () => getFaturas(cartao.id).then(r => setFaturas(r.data))
  useEffect(() => { carregar() }, [cartao.id])

  const salvar = async () => {
    if (valor === '' || isNaN(Number(valor))) return
    setLoading(true)
    try {
      await registrarFatura(cartao.id, { mes, ano, valor: Number(valor) })
      setValor('')
      await carregar()
      onSaved?.()
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-white">Fatura — {cartao.nome}</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Escolha o mês e informe o valor. Cada mês é independente; o mês novo começa zerado.
        </p>

        <div className="flex gap-2 mb-3">
          <select value={mes} onChange={e => setMes(Number(e.target.value))}
                  className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-2 flex-1 dark:bg-zinc-800 dark:text-white text-sm">
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" value={ano} onChange={e => setAno(Number(e.target.value))}
                 className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-2 w-24 dark:bg-zinc-800 dark:text-white text-sm" />
        </div>

        <input type="number" step="0.01" placeholder="Valor da fatura (R$)"
               value={valor} onChange={e => setValor(e.target.value)}
               className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 w-full mb-3 dark:bg-zinc-800 dark:text-white text-sm" />

        <button onClick={salvar} disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-zinc-900 dark:text-white rounded-xl py-2.5 mb-5 text-sm font-medium disabled:opacity-50 transition-colors">
          {loading ? 'Salvando...' : 'Salvar fatura do mês'}
        </button>

        <div className="max-h-48 overflow-y-auto border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1">
          {faturas.length === 0 && <p className="text-sm text-zinc-400">Nenhuma fatura registrada.</p>}
          {faturas.map(f => (
            <button key={f.id}
                    onClick={() => { setMes(f.mes); setAno(f.ano); setValor(String(f.valor)) }}
                    className="w-full flex justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
              <span>{MESES[f.mes - 1]}/{f.ano}</span>
              <span className="font-medium">R$ {Number(f.valor).toFixed(2)}</span>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-full mt-4 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          Fechar
        </button>
      </div>
    </div>
  )
}
