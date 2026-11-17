import type { PeriodoGrafico, Tema } from './types'

// Override opcional (não é segredo): NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mfa-api-4u7m.onrender.com').replace(/\/+$/, '')
export const ANALYZE_TIMEOUT_MS = 90_000
export const WAKING_DELAY_MS = 4_000
export const SIMULATION_LIMITS = {
  ipca: { min: -5, max: 20, step: 0.01 },
  crescimentoIbcbr: { min: -10, max: 10, step: 0.01 },
} as const
export const SIMULATION_DEBOUNCE_MS = 300
export const CHART_AXIS_PADDING_RATIO = 0.12
export const CHART_AXIS_ZERO_PADDING = 0.02
export const CHART_PERIOD_OPTIONS: { value: PeriodoGrafico; label: string; months: number | null }[] = [
  { value: '3', label: '3 meses', months: 3 },
  { value: '6', label: '6 meses', months: 6 },
  { value: '12', label: '12 meses', months: 12 },
  { value: 'max', label: 'Máximo', months: null },
]
export const THEME_OPTIONS: { value: Tema; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
]
export const MACRO_CHARTS = [
  { id: 'ibcbr_mensal', title: 'IBC-Br mensal', unit: 'índice' },
  { id: 'ipca_12m_mensal', title: 'IPCA · 12 meses', unit: '%' },
  { id: 'selic_efetiva_diaria', title: 'Selic efetiva diária', unit: '%' },
  { id: 'dolar_diario', title: 'Dólar · venda', unit: 'R$' },
] as const
