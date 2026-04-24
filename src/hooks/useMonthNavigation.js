import { useState } from 'react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function useMonthNavigation(initialDate = new Date()) {
  const [mes, setMes] = useState(initialDate.getMonth() + 1)
  const [ano, setAno] = useState(initialDate.getFullYear())

  function prevMes() {
    if (mes === 1) { setMes(12); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }

  function nextMes() {
    if (mes === 12) { setMes(1); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }

  const mesLabel = `${MESES[mes - 1]} ${ano}`

  return { mes, ano, mesLabel, prevMes, nextMes }
}
