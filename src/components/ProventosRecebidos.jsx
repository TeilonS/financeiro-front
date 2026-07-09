import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { listarProventos, criarProvento, deletarProvento } from "../api/proventos";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const brl = (v) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v)||0);
const selectCls = "border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-2 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100";

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111111] rounded-xl shadow-2xl border border-zinc-100 dark:border-white/5 px-3 py-2 text-sm backdrop-blur-md">
      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">{label}</p>
      <p className="text-zinc-900 dark:text-white font-semibold">{brl(payload[0].value)}</p>
    </div>
  );
}

export default function ProventosRecebidos({ investimentos = [] }) {
  const hoje = new Date();
  const [proventos, setProventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invId, setInvId] = useState("");
  const [mes, setMes] = useState(hoje.getMonth()+1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try { const r = await listarProventos(); setProventos(r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!invId || valor === "" || isNaN(Number(valor))) return;
    setSalvando(true);
    try {
      await criarProvento({ investimentoId: Number(invId), mes: Number(mes), ano: Number(ano), valor: Number(valor) });
      setValor("");
      await carregar();
    } finally { setSalvando(false); }
  };

  const remover = async (id) => { await deletarProvento(id); await carregar(); };

  const porMes = {};
  for (const p of proventos) {
    const key = `${p.ano}-${String(p.mes).padStart(2,"0")}`;
    porMes[key] = (porMes[key]||0) + Number(p.valor);
  }
  const chartData = Object.entries(porMes).sort(([a],[b]) => a.localeCompare(b)).slice(-12)
    .map(([k,total]) => { const [a,m] = k.split("-"); return { label:`${MESES[+m-1]}/${a.slice(2)}`, total:Number(total.toFixed(2)) }; });

  const total = proventos.reduce((s,p) => s + Number(p.valor), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest text-zinc-500 dark:text-zinc-400">PROVENTOS RECEBIDOS</h3>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">Total: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{brl(total)}</span></span>
      </div>

      {chartData.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top:8, right:8, left:-12, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis dataKey="label" tick={{ fill:"#888", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#888", fontSize:11 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<BarTooltip />} cursor={{ fill:"#88888815" }} />
              <Bar dataKey="total" fill="#34D399" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <select value={invId} onChange={e=>setInvId(e.target.value)} className={`col-span-2 ${selectCls}`}>
          <option value="">Selecione o ativo</option>
          {investimentos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </select>
        <select value={mes} onChange={e=>setMes(e.target.value)} className={selectCls}>
          {MESES.map((m,idx)=><option key={idx} value={idx+1}>{m}</option>)}
        </select>
        <input type="number" value={ano} onChange={e=>setAno(e.target.value)} className={`${selectCls} w-full`} />
        <input type="number" step="0.01" placeholder="R$" value={valor} onChange={e=>setValor(e.target.value)} className={`${selectCls} w-full`} />
      </div>
      <button onClick={salvar} disabled={salvando} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-sm disabled:opacity-50">
        {salvando ? "Salvando..." : "Lançar provento"}
      </button>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {loading && <p className="text-sm text-zinc-500">Carregando...</p>}
        {!loading && proventos.length === 0 && <p className="text-sm text-zinc-500">Nenhum provento lançado ainda.</p>}
        {proventos.map(p => (
          <div key={p.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <span className="text-zinc-700 dark:text-zinc-200 truncate pr-2">{p.investimentoNome}</span>
            <span className="flex items-center gap-3 shrink-0">
              <span className="text-zinc-500">{MESES[p.mes-1]}/{p.ano}</span>
              <span className="text-emerald-600 dark:text-emerald-400">{brl(p.valor)}</span>
              <button onClick={()=>remover(p.id)} className="text-zinc-500 hover:text-red-400">✕</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
