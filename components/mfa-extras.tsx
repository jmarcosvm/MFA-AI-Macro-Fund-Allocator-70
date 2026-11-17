'use client'

import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { CHART_AXIS_PADDING_RATIO, CHART_AXIS_ZERO_PADDING, CHART_PERIOD_OPTIONS, MACRO_CHARTS, SIMULATION_DEBOUNCE_MS, SIMULATION_LIMITS } from '@/lib/config'
import { simularCenario } from '@/lib/api'
import { scenarioTone } from '@/lib/scenario'
import type { Analise, Classificacao, EntradasSimulacao, PeriodoGrafico, ResultadoSimulacao, SeriePonto } from '@/lib/types'

const empty = '—'
const priceFormatter = (digits = 2) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits })
const formatValue = (value?: number | null, digits = 2) => value == null || !Number.isFinite(value) ? empty : priceFormatter(digits).format(value)
const formatDate = (value?: string | number | null, withYear = false) => {
  if (value == null) return empty
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return new Intl.DateTimeFormat('pt-BR', withYear ? { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' } : { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(parsed)
}
const labels: Record<string, string> = {
  valor: 'Valor', anterior: 'Janela anterior', recente: 'Janela recente',
}
const chartConfig = (seriesColor: string) => ({
  valor: { label: 'Valor', color: seriesColor },
  anterior: { label: 'Janela anterior', color: 'var(--chart-2)' },
  recente: { label: 'Janela recente', color: 'var(--chart-3)' },
}) satisfies ChartConfig

type ChartDataPoint = { data: string; valor: number; anterior?: number | null; recente?: number | null }
function filterByPeriod(points: SeriePonto[] | null | undefined, period: PeriodoGrafico): ChartDataPoint[] {
  if (!points?.length) return []
  const sorted = points.filter((point): point is SeriePonto & { data: string; valor: number } => typeof point?.data === 'string' && typeof point.valor === 'number' && Number.isFinite(point.valor)).sort((a, b) => a.data.localeCompare(b.data))
  const months = CHART_PERIOD_OPTIONS.find((option) => option.value === period)?.months
  if (months == null || !sorted.length) return sorted
  const latest = new Date(`${sorted[sorted.length - 1].data}T00:00:00Z`)
  const cutoff = new Date(latest)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months)
  return sorted.filter((point) => new Date(`${point.data}T00:00:00Z`) >= cutoff)
}

function ChartCard({ title, points, threshold, referenceLabel, previousWindow, recentWindow, ibcbr = false, seriesColor = 'var(--chart-1)' }: { title: string; points?: SeriePonto[] | null; threshold?: number | null; referenceLabel?: string; previousWindow?: SeriePonto[] | null; recentWindow?: SeriePonto[] | null; ibcbr?: boolean; seriesColor?: string }) {
  const rows = useMemo(() => filterByPeriod(points, 'max'), [points])
  const previousDates = new Set(previousWindow?.map((point) => point.data).filter((point): point is string => Boolean(point)))
  const recentDates = new Set(recentWindow?.map((point) => point.data).filter((point): point is string => Boolean(point)))
  const data = rows.map((point) => {
    const inPrevious = previousDates.has(point.data ?? '')
    const inRecent = recentDates.has(point.data ?? '')
    return { ...point, anterior: inPrevious ? point.valor : null, recente: inRecent ? point.valor : null }
  })
  const chartValues = data.map((point) => point.valor)
  const valueRange = chartValues.length ? Math.max(...chartValues) - Math.min(...chartValues) : 0
  const axisPadding = valueRange * CHART_AXIS_PADDING_RATIO || CHART_AXIS_ZERO_PADDING
  const isSelic = title === 'Selic efetiva diária'
  const yDomain: [number, number] = isSelic
    ? [Math.round((Math.min(...chartValues) - 0.005) * 1000) / 1000, Math.round((Math.max(...chartValues) + 0.005) * 1000) / 1000]
    : [Math.min(...chartValues) - axisPadding, Math.max(...chartValues) + axisPadding]
  const hasThreshold = threshold != null && Number.isFinite(threshold)
  return <article className="macro-chart-card"><div className="macro-chart-title"><h3>{title}</h3>{ibcbr && <div className="window-legend"><span><i className="window-dot previous" />Janela anterior</span><span><i className="window-dot recent" />Janela recente</span></div>}</div>
    {!data.length ? <div className="chart-empty">Sem dados</div> : <ChartContainer config={chartConfig(seriesColor)} className="macro-chart">
      <LineChart data={data} accessibilityLayer margin={{ left: 2, right: 8, top: 10 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
        <XAxis dataKey="data" tickLine={false} axisLine={false} minTickGap={24} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(value) => formatDate(value)} />
        <YAxis width={56} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} domain={yDomain} tickCount={isSelic ? 4 : undefined} tickFormatter={(value) => formatValue(value, isSelic ? 3 : 2)} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => formatDate(value, true)} formatter={(value, name) => <div className="chart-tooltip-value"><span>{labels[String(name)] ?? name}</span><strong>{formatValue(Number(value), 4)}</strong></div>} />} />
        {hasThreshold && <ReferenceLine y={threshold} stroke="var(--chart-4)" strokeDasharray="4 4" label={{ value: `${referenceLabel ?? 'Referência'} ${formatValue(threshold)}%`, position: 'insideTopRight', fill: 'var(--chart-4)', fontSize: 12 }} />}
        <Line dataKey="valor" name="valor" type="linear" stroke="var(--color-valor)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
        {ibcbr && <><Line dataKey="anterior" name="anterior" type="linear" stroke="var(--color-anterior)" strokeWidth={3} dot={{ r: 3 }} connectNulls /><Line dataKey="recente" name="recente" type="linear" stroke="var(--color-recente)" strokeWidth={3} dot={{ r: 3 }} connectNulls /></>}
      </LineChart>
    </ChartContainer>}
  </article>
}

export function MacroCharts({ data }: { data: Analise }) {
  const [period, setPeriod] = useState<PeriodoGrafico>('max')
  const series = data.series
  const filteredById = (id: (typeof MACRO_CHARTS)[number]['id']) => {
    const source = series?.[id]
    if (!source?.length) return []
    const ordered = source.filter((point): point is SeriePonto & { data: string; valor: number } => typeof point?.data === 'string' && typeof point.valor === 'number' && Number.isFinite(point.valor)).sort((left, right) => left.data.localeCompare(right.data))
    const monthCount = CHART_PERIOD_OPTIONS.find((option) => option.value === period)?.months
    if (monthCount == null || !ordered.length) return ordered
    const newest = new Date(`${ordered[ordered.length - 1].data}T00:00:00Z`)
    const start = new Date(newest)
    start.setUTCMonth(start.getUTCMonth() - monthCount)
    return ordered.filter((point) => new Date(`${point.data}T00:00:00Z`) >= start)
  }
  return <section className="charts-section"><div className="section-heading chart-section-heading"><div><span className="eyebrow">SÉRIES HISTÓRICAS</span><h2>Dashboard interativo</h2></div><label className="period-control">Período<select aria-label="Período dos gráficos" value={period} onChange={(event) => setPeriod(event.target.value as PeriodoGrafico)}>{CHART_PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
    <div className="macro-chart-grid">{MACRO_CHARTS.map((chart) => <ChartCard key={chart.id} title={chart.title} points={filteredById(chart.id)} ibcbr={chart.id === 'ibcbr_mensal'} previousWindow={chart.id === 'ibcbr_mensal' ? data.indicadores?.ibcbr?.janela_anterior?.pontos : null} recentWindow={chart.id === 'ibcbr_mensal' ? data.indicadores?.ibcbr?.janela_recente?.pontos : null} threshold={chart.id === 'ipca_12m_mensal' ? data.cenario?.criterios?.limiar_ipca_pct : chart.id === 'selic_efetiva_diaria' ? data.indicadores?.meta_selic_aa?.valor : null} referenceLabel={chart.id === 'selic_efetiva_diaria' ? 'Meta' : 'Limiar'} seriesColor={chart.id === 'ipca_12m_mensal' ? 'var(--chart-5)' : chart.id === 'selic_efetiva_diaria' ? 'var(--chart-2)' : chart.id === 'dolar_diario' ? 'var(--chart-3)' : 'var(--chart-1)'} />)}</div>
  </section>
}

const allocationKeys = ['renda_fixa', 'fundos_cambiais', 'renda_variavel'] as const
const allocationNames: Record<(typeof allocationKeys)[number], string> = { renda_fixa: 'Renda fixa', fundos_cambiais: 'Fundos cambiais', renda_variavel: 'Renda variável' }
const allocationTone = ['fixed', 'currency', 'equity']
function AllocationBars({ values }: { values?: Record<string, number | null | undefined> | null }) {
  return <div className="simulation-allocations">{allocationKeys.map((key, index) => {
    const fraction = values?.[key]
    const percent = fraction == null || !Number.isFinite(fraction) ? null : Math.max(0, Math.min(100, fraction * 100))
    return <div className="simulation-allocation" key={key}><span>{allocationNames[key]}</span><div className="bar-track"><div className={`bar-fill ${allocationTone[index]}`} style={{ '--bar-progress': (percent ?? 0) / 100 } as React.CSSProperties} /></div><strong>{fraction == null ? empty : `${formatValue(fraction * 100, 1)}%`}</strong></div>
  })}</div>
}

function ComparisonCard({ title, classification, portfolio, preference, realRate, changed }: { title: string; classification?: string | null; portfolio?: Record<string, number | null | undefined> | null; preference?: string | null; realRate?: number | null; changed?: boolean }) {
  return <article className={`simulation-card ${changed ? 'simulation-different' : ''}`}><div className="simulation-card-title"><span>{title}</span>{changed && <span className="changed-tag">Cenário diferente</span>}</div><div className={`scenario-badge ${scenarioTone(classification as Classificacao | null | undefined)}`}>{classification || empty}</div><AllocationBars values={portfolio} /><div className="simulation-facts"><span>Indexador<strong>{preference || empty}</strong></span><span>Juro real ex-post<strong>{realRate == null ? empty : `${formatValue(realRate)}%`}</strong></span></div></article>
}

function simulationInputValues(data: Analise, ipca: number, growth: number): EntradasSimulacao | null {
  const selic = data.indicadores?.selic_efetiva_aa?.valor
  if (selic == null) return null
  return {
    ipca_12m_pct: ipca,
    crescimento_ibcbr_pct: growth,
    selic_efetiva_aa_pct: selic,
    selic_esperada_pct: data.juro_real?.entradas_projetado?.selic_esperada_pct ?? undefined,
    meta_selic_pct: data.indicadores?.meta_selic_aa?.valor ?? undefined,
  }
}

export function ScenarioSimulator({ data }: { data: Analise }) {
  const current = data.cenario?.criterios
  const [ipca, setIpca] = useState(current?.ipca_12m_pct ?? SIMULATION_LIMITS.ipca.min)
  const [growth, setGrowth] = useState(current?.crescimento_ibcbr_pct ?? SIMULATION_LIMITS.crescimentoIbcbr.min)
  const [result, setResult] = useState<ResultadoSimulacao | null>(null)
  const [pending, setPending] = useState(false)
  useEffect(() => {
    let active = true
    const params = simulationInputValues(data, ipca, growth)
    if (!params) { setResult(null); setPending(false); return }
    setPending(true)
    const timeout = window.setTimeout(() => {
      void simularCenario(params).then((value) => {
        if (active) { setResult(value); setPending(false) }
      }).catch(() => { if (active) setPending(false) })
    }, SIMULATION_DEBOUNCE_MS)
    return () => { active = false; window.clearTimeout(timeout) }
  }, [data, growth, ipca])
  const restore = () => { setIpca(current?.ipca_12m_pct ?? SIMULATION_LIMITS.ipca.min); setGrowth(current?.crescimento_ibcbr_pct ?? SIMULATION_LIMITS.crescimentoIbcbr.min) }
  const changed = Boolean(result?.cenario?.classificacao && data.cenario?.classificacao && result.cenario.classificacao !== data.cenario.classificacao)
  const sliders = [
    { id: 'sim-ipca', label: 'IPCA · 12 meses', value: ipca, set: setIpca, config: SIMULATION_LIMITS.ipca, suffix: '%' },
    { id: 'sim-ibcbr', label: 'Crescimento do IBC-Br', value: growth, set: setGrowth, config: SIMULATION_LIMITS.crescimentoIbcbr, suffix: '%' },
  ]
  return <section className="panel simulator-panel"><div className="section-heading simulator-heading"><div><span className="eyebrow">EXPERIMENTO LOCAL</span><h2>Simulador “E se”</h2></div><button type="button" className="restore-button" onClick={restore}>Voltar ao atual</button></div>
    <div className="simulator-controls">{sliders.map((slider) => <label className="slider-field" htmlFor={slider.id} key={slider.id}><span className="slider-label"><span>{slider.label}</span><strong>{formatValue(slider.value)}{slider.suffix}</strong></span><input id={slider.id} type="range" min={slider.config.min} max={slider.config.max} step={slider.config.step} value={slider.value} onChange={(event) => slider.set(Number(event.target.value))} aria-valuetext={`${formatValue(slider.value)}${slider.suffix}`} /><span className="slider-bounds"><span>{formatValue(slider.config.min)}{slider.suffix}</span><span>{formatValue(slider.config.max)}{slider.suffix}</span></span></label>)}</div>
    <div className="simulation-comparison"><ComparisonCard title="Atual" classification={data.cenario?.classificacao} portfolio={data.carteira?.base} preference={data.carteira?.renda_fixa_preferencia} realRate={data.juro_real?.ex_post_pct} /><ComparisonCard title="Simulado" classification={result?.cenario?.classificacao} portfolio={result?.carteira_base} preference={result?.renda_fixa_preferencia} realRate={result?.juro_real_ex_post_pct} changed={changed} /></div>
    {pending && <p className="simulation-status" role="status">Atualizando simulação…</p>}{result?.avisos?.map((warning) => <p className="simulation-status" key={warning}>{warning}</p>)}
    <p className="simulation-note">A simulação aplica a mesma regra do app aos valores que você escolher; não é previsão.</p>
  </section>
}

const questionExamples = ['Como o IPCA influencia a classificação?', 'O que significa o juro real projetado?', 'Quais limites orientam a carteira-modelo?']
export function AiQuestionCard() {
  return <section className="panel ai-question-panel"><div className="section-heading ai-heading"><div><span className="eyebrow">ASSISTENTE</span><h2>Pergunte à IA sobre estes dados</h2></div><span className="coming-soon">Em breve</span></div><div className="disabled-chat"><input aria-label="Pergunta para a IA" disabled placeholder="Escreva uma pergunta sobre os dados…" /><button type="button" disabled>Enviar</button></div><div className="question-chips">{questionExamples.map((question) => <button type="button" disabled key={question}>{question}</button>)}</div></section>
}
