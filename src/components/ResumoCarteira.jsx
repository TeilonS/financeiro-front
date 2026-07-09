import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const TIPO_META = {
  RENDA_FIXA: { label: "Renda Fixa", color: "#F87171" },
  ACOES:      { label: "Ações",      color: "#FBBF24" },
  FII:        { label: "FIIs",       color: "#34D399" },
  CRYPTO:     { label: "Cripto",     color: "#60A5FA" },
  OUTROS:     { label: "Outros",     color: "#A78BFA" },
};
const FALLBACK = { label: "Outros", color: "#9CA3AF" };

const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);
const pct = (v) => `${(Number(v) || 0).toFixed(1).replace(".", ",")}%`;

export default function ResumoCarteira({ investimentos = [] }) {
  const itens = investimentos.map((i) => ({
    nome: i.nome, tipo: i.tipo, valor: Number(i.saldoAtual) || 0,
  }));
  const total = itens.reduce((s, i) => s + i.valor, 0);

  const porTipo = {};
  for (const i of itens) porTipo[i.tipo] = (porTipo[i.tipo] || 0) + i.valor;

  const alocacao = Object.entries(porTipo)
    .map(([tipo, valor]) => {
      const meta = TIPO_META[tipo] || FALLBACK;
      return { tipo, ...meta, valor, peso: total ? (valor / total) * 100 : 0 };
    })
    .sort((a, b) => b.valor - a.valor);

  const ativos = [...itens]
    .sort((a, b) => b.valor - a.valor)
    .map((i) => ({ ...i, peso: total ? (i.valor / total) * 100 : 0, color: (TIPO_META[i.tipo] || FALLBACK).color }));

  if (total <= 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-5 text-zinc-400 text-sm">
        Adicione investimentos e atualize os saldos para ver a alocação da carteira.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 space-y-6">
      <div>
        <h3 className="text-xs font-semibold tracking-widest text-zinc-400 mb-3">ALOCAÇÃO POR TIPO</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={alocacao} dataKey="valor" nameKey="label"
                     innerRadius={52} outerRadius={72} paddingAngle={2} stroke="none">
                  {alocacao.map((a) => <Cell key={a.tipo} fill={a.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [brl(v), n]}
                         contentStyle={{ background: "#18181b", border: "none", borderRadius: 8, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-zinc-500">Total</span>
              <span className="text-sm font-semibold text-white">{brl(total)}</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-2">
            {alocacao.map((a) => (
              <div key={a.tipo} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-200">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                  {a.label}
                </span>
                <span className="text-zinc-400">{pct(a.peso)} · {brl(a.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold tracking-widest text-zinc-400 mb-3">PESO POR ATIVO</h3>
        <div className="space-y-3">
          {ativos.map((a, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-200 truncate pr-2">{a.nome}</span>
                <span className="text-zinc-400 shrink-0">{pct(a.peso)}</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${a.peso}%`, background: a.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
