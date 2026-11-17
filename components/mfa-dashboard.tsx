'use client'

import { useState } from 'react'
import type { Analise, Indicador } from '@/lib/types'
import { scenarioTone } from '@/lib/scenario'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AssetDot } from '@/components/asset-dot'
import { AiQuestionCard, MacroCharts, ScenarioSimulator } from '@/components/mfa-extras'

const dash = '—'
const number = (value?: number | null, digits = 2) => value == null || !Number.isFinite(value) ? dash : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(value)
const ibcTableFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ibcTableNumber = (value?: number | null) => value == null || !Number.isFinite(value) ? dash : ibcTableFormatter.format(value)
const date = (value?: string | null) => {
  if (!value) return dash
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? dash : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(parsed)
}
const safeText = (value?: string | null) => value || dash
const month = (value?: string | null) => {
  if (!value) return dash
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? dash : new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed)
}

function Panel({ title, eyebrow, children, className = '' }: { title: string; eyebrow?: string; children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{children}</section>
}

function IndicatorCard({ title, data, suffix = '%', dateLabel = 'Data' }: { title: string; data?: Indicador | null; suffix?: string; dateLabel?: string }) {
  return <article className="metric-card"><span className="metric-label">{title}</span><strong>{data?.valor == null ? dash : `${number(data.valor, 4)}${suffix}`}</strong><span className="metric-meta">{dateLabel} · {date(data?.data)}</span><span className="metric-source">{safeText(data?.fonte)}</span></article>
}

function Hero({ data }: { data: Analise }) {
  const c = data.cenario?.criterios
  const origem = data.justificativa?.origem === 'llm' ? `IA · ${safeText(data.justificativa?.provedor)}` : 'Texto automático'
  const criteria = [
    { label: 'Crescimento do IBC-Br', value: c?.crescimento_ibcbr_pct, limit: c?.limiar_crescimento_pct },
    { label: 'IPCA em 12 meses', value: c?.ipca_12m_pct, limit: c?.limiar_ipca_pct },
  ]
  return <section className="hero-band"><div className="hero-reading"><span className={`hero-scenario ${scenarioTone(data.cenario?.classificacao)}`}>{safeText(data.cenario?.classificacao)}</span><p className="summary-text">{safeText(data.justificativa?.resumo)}</p><span className="origin-chip">{origem}</span></div><div className="hero-criteria">{criteria.map((item) => { const gap = item.value == null || item.limit == null ? null : item.value - item.limit; const width = gap == null ? 0 : Math.max(4, Math.min(100, Math.abs(gap) * 20)); return <div className="hero-criterion" key={item.label}><span>{item.label} <span className="muted-copy">vs. limiar {number(item.limit)}%</span></span><strong>{item.value == null ? dash : `${number(item.value)}%`}</strong><div className="threshold-track"><i style={{ width: `${width}%` }} /></div><small>Distância ao limiar: {gap == null ? dash : `${number(gap)} p.p.`}</small></div> })}</div></section>
}

function WhatChanges({ data }: { data: Analise }) {
  const changes = data.cenario?.o_que_mudaria
  return <Panel title="O que mudaria" eyebrow="LIMIARES"><div className="change-values"><div><span>Queda necessária do IPCA</span><strong>{changes?.ipca_precisa_cair_pp == null ? dash : `${number(changes.ipca_precisa_cair_pp)} p.p.`}</strong></div><div><span>IBC-Br a superar no próximo mês</span><strong>{number(changes?.ibcbr_proximo_mes_precisa_superar)}</strong></div></div><p className="muted-copy">{safeText(data.justificativa?.narracao_o_que_mudaria)}</p></Panel>
}

const allocationKeys = ['renda_fixa', 'fundos_cambiais', 'renda_variavel'] as const
const allocationLabels: Record<(typeof allocationKeys)[number], string> = { renda_fixa: 'Renda fixa', fundos_cambiais: 'Fundos cambiais', renda_variavel: 'Renda variável' }
const allocationColors: Record<(typeof allocationKeys)[number], string> = { renda_fixa: 'var(--series-blue, #1D4ED8)', fundos_cambiais: 'var(--chart-2)', renda_variavel: 'var(--chart-3)' }
function Portfolio({ data }: { data: Analise }) {
  const portfolio = data.carteira
  return <Panel title="Carteira-modelo" eyebrow="ALOCAÇÃO" className="portfolio-panel"><div className="allocation-legend"><span>Ativo</span><span>Base</span><span>Sugerida</span><span>Diferença</span></div>
    <div className="allocation-list">{allocationKeys.map((key, index) => {
      const base = portfolio?.base?.[key], proposed = portfolio?.sugerida?.[key]
      const tones = ['fixed', 'currency', 'equity']
      const difference = base == null || proposed == null ? null : (proposed - base) * 100
      return <div className="allocation-row" key={key}><span className="allocation-name"><AssetDot color={allocationColors[key]} />{allocationLabels[key]}</span><div className="allocation-value"><div className="bar-track"><div className={`bar-fill ${tones[index]}`} style={{ '--bar-progress': Math.max(0, Math.min(1, base ?? 0)) } as React.CSSProperties} /></div><span>{base == null ? dash : `${number(base * 100, 1)}%`}</span></div><div className="allocation-value"><div className="bar-track"><div className={`bar-fill suggested ${tones[index]}`} style={{ '--bar-progress': Math.max(0, Math.min(1, proposed ?? 0)) } as React.CSSProperties} /></div><span>{proposed == null ? dash : `${number(proposed * 100, 1)}%`}</span></div><span className="allocation-difference">{difference == null ? dash : `${difference > 0 ? '+' : ''}${number(difference, 0)} p.p.`}</span></div>
    })}</div><div className="portfolio-meta"><span>Limite de desvio <strong>{portfolio?.limite_desvio_pp == null ? dash : `${number(portfolio.limite_desvio_pp)} p.p.`}</strong></span><span>Preferência em renda fixa <strong>{safeText(portfolio?.renda_fixa_preferencia)}</strong></span></div><p className="didactic-note">O ajuste da carteira é uma ilustração didática.</p></Panel>
}

function RealInterest({ data }: { data: Analise }) {
  const jr = data.juro_real, projection = jr?.entradas_projetado
  return <Panel title="Juro real" eyebrow="TAXAS"><div className="interest-grid"><article className="interest-card"><div className="interest-top"><span>Ex-post</span><span className="interest-tag">Realizado</span></div><strong>{jr?.ex_post_pct == null ? dash : `${number(jr.ex_post_pct)}%`}</strong><p>Juro real calculado com inflação observada.</p></article><article className="interest-card projected"><div className="interest-top"><span>Projetado · 12 meses</span></div><strong>{jr?.projetado_12m_pct == null ? dash : `${number(jr.projetado_12m_pct)}%`}</strong><p className="projection-label">Projeção do mercado (Focus), não previsão do app</p><div className="projection-details"><span>Reunião<strong>{safeText(projection?.reuniao)}</strong></span><span>Selic esperada<strong>{projection?.selic_esperada_pct == null ? dash : `${number(projection.selic_esperada_pct)}%`}</strong></span><span>IPCA esperado · 12m<strong>{projection?.ipca_esperado_12m_pct == null ? dash : `${number(projection.ipca_esperado_12m_pct, 4)}%`}</strong></span><span>Data Focus<strong>{date(projection?.data_focus)}</strong></span></div></article></div></Panel>
}

function Indicators({ data }: { data: Analise }) {
  const i = data.indicadores
  return <section><div className="section-heading"><span className="eyebrow">DADOS DE MERCADO</span><h2>Indicadores</h2></div><div className="metrics-grid"><IndicatorCard title="Selic efetiva · a.a." data={i?.selic_efetiva_aa} /><IndicatorCard title="Meta da Selic · a.a." data={i?.meta_selic_aa} dateLabel="Vigente em" /><IndicatorCard title="IPCA · 12 meses" data={i?.ipca_12m} /><IndicatorCard title="Dólar · venda" data={i?.dolar_venda} suffix="" /><IndicatorCard title="Volatilidade do dólar · 63 dias, anualizada" data={i?.volatilidade_dolar_63d_anualizada_pct} /></div></section>
}

function IbcbrCard({ data }: { data: Analise }) {
  const [open, setOpen] = useState(false)
  const ibc = data.indicadores?.ibcbr, recent = ibc?.janela_recente, previous = ibc?.janela_anterior
  const change = recent?.media == null || previous?.media == null ? null : recent.media - previous.media
  const points = [...(previous?.pontos ?? []), ...(recent?.pontos ?? [])].filter((point) => typeof point?.data === 'string' && typeof point.valor === 'number' && Number.isFinite(point.valor)).sort((left, right) => (left.data ?? '').localeCompare(right.data ?? ''))
  return <section className="panel ibc-panel"><button className="ibc-trigger" type="button" aria-expanded={open} onClick={() => setOpen(!open)}><span><span className="eyebrow">ATIVIDADE ECONÔMICA</span><strong>IBC-Br</strong><small>{safeText(ibc?.fonte)}</small></span><span className="ibc-expand">{open ? 'Recolher −' : 'Ver meses +'}</span></button>{open && <div className="ibc-content ibc-table-wrap"><table className="ibc-table"><thead><tr><th>Mês</th><th>Valor</th><th>Janela</th></tr></thead><tbody>{points.length ? points.map((point) => { const isRecent = recent?.pontos?.some((item) => item.data === point.data); return <tr key={point.data}><td>{month(point.data)}</td><td>{ibcTableNumber(point.valor)}</td><td>{isRecent ? 'Recente' : 'Anterior'}</td></tr> }) : <tr><td colSpan={3}>{dash}</td></tr>}</tbody></table><div className="ibc-summary"><div><span>Média da janela anterior</span><strong>{number(previous?.media, 4)}</strong></div><div><span>Média da janela recente</span><strong>{number(recent?.media, 4)}</strong></div><div className="ibc-change"><span>Variação entre médias</span><strong>{change == null ? dash : number(change, 4)}</strong></div></div></div>}</section>
}

function QualityWarnings({ data }: { data: Analise }) {
  const warnings = data.avisos_de_qualidade
  return <Panel title="Avisos de qualidade" eyebrow="LEIA COM ATENÇÃO"><ul className="warning-list">{warnings?.length ? warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>) : <li>{dash}</li>}</ul></Panel>
}

export function MfaDashboard({ data }: { data: Analise }) {
  return <main className="dashboard-shell"><div className="topline"><div className="brand-mark" aria-hidden="true">M</div><span>MACRO · BRASIL</span><span className="topline-rule" /></div>
    <header className="page-header"><div><p className="eyebrow">PAINEL DE LEITURA</p><h1>MFA <span>—</span> AI Macro Fund Allocator</h1><p className="generated">Gerado em {date(data.gerado_em)}</p></div><div className="header-actions"><span className="sample-pill">Dados de exemplo</span><ThemeSwitcher /></div></header>
    <Hero data={data} />
    <MacroCharts data={data} />
    <WhatChanges data={data} />
    <ScenarioSimulator data={data} />
    <div className="two-column lower-grid"><Portfolio data={data} /><RealInterest data={data} /></div>
    <Indicators data={data} /><IbcbrCard data={data} /><QualityWarnings data={data} /><AiQuestionCard />
    <footer className="page-footer"><span>{safeText(data.aviso)}</span><span>Fontes: BCB SGS · BCB Olinda/Focus</span><span>Dados do Banco Central do Brasil (licença ODbL)</span><span>MFA · protótipo educacional</span></footer>
  </main>
}
