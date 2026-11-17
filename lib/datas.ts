// Datas "YYYY-MM-DD" (ou ISO com hora/offset): parse manual, sem new Date(string),
// para não deslocar 1 dia no fuso do Brasil. Só a parte da data é usada.
export interface DataISO { ano: number; mes: number; dia: number }

export function parseDataISO(value?: string | null): DataISO | null {
  if (typeof value !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!m) return null
  const ano = Number(m[1]), mes = Number(m[2]), dia = Number(m[3])
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null
  return { ano, mes, dia }
}

/** dd/mm/aaaa, ou null se inválida. */
export function formatarDataBR(value?: string | null): string | null {
  const d = parseDataISO(value)
  if (!d) return null
  return `${String(d.dia).padStart(2, '0')}/${String(d.mes).padStart(2, '0')}/${d.ano}`
}

const fmtDiaMes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })
const fmtMesAno = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' })
// Date.UTC com números já extraídos (não é parse de string).
const utc = (d: DataISO) => new Date(Date.UTC(d.ano, d.mes - 1, d.dia))

/** "13 de nov.", ou null. */
export function formatarDiaMesBR(value?: string | null): string | null {
  const d = parseDataISO(value)
  return d ? fmtDiaMes.format(utc(d)) : null
}

/** "nov. de 2026", ou null. */
export function formatarMesAnoBR(value?: string | null): string | null {
  const d = parseDataISO(value)
  return d ? fmtMesAno.format(utc(d)) : null
}

/** Número comparável (aaaammdd) para ordenar/filtrar sem Date. */
export function chaveData(value?: string | null): number | null {
  const d = parseDataISO(value)
  return d ? d.ano * 10000 + d.mes * 100 + d.dia : null
}

/** Chave da data 'meses' meses antes de 'value' (dia limitado ao tamanho do mês). */
export function chaveMesesAntes(value: string, meses: number): number | null {
  const d = parseDataISO(value)
  if (!d) return null
  const total = d.ano * 12 + (d.mes - 1) - meses
  const ano = Math.floor(total / 12), mes = (total % 12) + 1
  const diasNoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  return ano * 10000 + mes * 100 + Math.min(d.dia, diasNoMes)
}
