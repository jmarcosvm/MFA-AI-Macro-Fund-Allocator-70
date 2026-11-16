import type { Analise, SeriePonto } from './types'

function dailySeries(endDate: string, length: number, baseline: number, amplitude: number, phase: number): SeriePonto[] {
  const points: SeriePonto[] = []
  const cursor = new Date(`${endDate}T00:00:00Z`)
  while (points.length < length) {
    const weekday = cursor.getUTCDay()
    if (weekday !== 0 && weekday !== 6) {
      const index = length - points.length - 1
      const wave = Math.sin((index + phase) / 5) * amplitude
      const finalWave = Math.sin((length - 1 + phase) / 5) * amplitude
      points.push({ data: cursor.toISOString().slice(0, 10), valor: Number((baseline + wave - finalWave).toFixed(4)) })
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return points.reverse()
}

const sampleData: Analise = {
  gerado_em: '2026-11-13T09:00:00-03:00',
  aviso: 'Simulação educacional. Não é recomendação de investimento.',
  cenario: {
    classificacao: 'ESTAGFLACAO',
    criterios: { crescimento_ibcbr_pct: -0.64, ipca_12m_pct: 4.63, limiar_crescimento_pct: 0, limiar_ipca_pct: 4.5 },
    o_que_mudaria: { ipca_precisa_cair_pp: 0.13, ibcbr_proximo_mes_precisa_superar: 112.23 },
  },
  indicadores: {
    selic_efetiva_aa: { valor: 13.65, data: '2026-11-13', fonte: 'BCB SGS 1178' },
    meta_selic_aa: { valor: 13.75, data: '2026-11-14', fonte: 'BCB SGS 432' },
    ipca_12m: { valor: 4.63, data: '2026-10-01', fonte: 'BCB SGS 13522' },
    dolar_venda: { valor: 5.6518, data: '2026-11-13', fonte: 'BCB SGS 1' },
    volatilidade_dolar_63d_anualizada_pct: { valor: 23.18, data: '2026-11-13', fonte: 'calculado sobre BCB SGS 1' },
    ibcbr: {
      fonte: 'BCB SGS 24364',
      janela_anterior: {
        media: 110.9836,
        meses: ['mar', 'abr', 'mai'],
        pontos: [
          { data: '2026-03-01', valor: 111 },
          { data: '2026-04-01', valor: 111.1 },
          { data: '2026-05-01', valor: 110.8508 },
        ],
      },
      janela_recente: {
        media: 110.2705,
        meses: ['jun', 'jul', 'ago'],
        pontos: [
          { data: '2026-06-01', valor: 110.1 },
          { data: '2026-07-01', valor: 110.3 },
          { data: '2026-08-01', valor: 110.4115 },
        ],
      },
    },
  },
  series: {
    ibcbr_mensal: [
      { data: '2025-09-01', valor: 110.7 }, { data: '2025-10-01', valor: 110.9 },
      { data: '2025-11-01', valor: 111 }, { data: '2025-12-01', valor: 110.8 },
      { data: '2026-01-01', valor: 110.9 }, { data: '2026-02-01', valor: 111.2 },
      { data: '2026-03-01', valor: 111 }, { data: '2026-04-01', valor: 111.1 },
      { data: '2026-05-01', valor: 110.8508 }, { data: '2026-06-01', valor: 110.1 },
      { data: '2026-07-01', valor: 110.3 }, { data: '2026-08-01', valor: 110.4115 },
    ],
    ipca_12m_mensal: [
      { data: '2025-11-01', valor: 4.46 }, { data: '2025-12-01', valor: 4.83 },
      { data: '2026-01-01', valor: 4.56 }, { data: '2026-02-01', valor: 4.4 },
      { data: '2026-03-01', valor: 4.26 }, { data: '2026-04-01', valor: 4.26 },
      { data: '2026-05-01', valor: 4.5 }, { data: '2026-06-01', valor: 4.68 },
      { data: '2026-07-01', valor: 4.71 }, { data: '2026-08-01', valor: 4.61 },
      { data: '2026-09-01', valor: 4.58 }, { data: '2026-10-01', valor: 4.63 },
    ],
  },
  juro_real: {
    ex_post_pct: 8.62,
    projetado_12m_pct: 7.37,
    entradas_projetado: { selic_esperada_pct: 12.75, reuniao: 'R7/2027', ipca_esperado_12m_pct: 5.0117, data_focus: '2026-11-06' },
  },
  carteira: {
    base: { renda_fixa: 0.6, fundos_cambiais: 0.25, renda_variavel: 0.15 },
    sugerida: { renda_fixa: 0.55, fundos_cambiais: 0.2, renda_variavel: 0.25 },
    limite_desvio_pp: 15,
    renda_fixa_preferencia: 'POSFIXADA',
  },
  justificativa: {
    texto: 'Texto de exemplo com a justificativa completa, em dois ou três parágrafos curtos.',
    resumo: 'Linha 1 de exemplo do resumo.\nLinha 2 de exemplo do resumo.',
    narracao_o_que_mudaria: 'Texto de exemplo: o IPCA precisaria cair cerca de 0,13 ponto percentual e o IBC-Br superar 112,23 no próximo mês.',
    origem: 'llm',
    provedor: 'gemini',
  },
  avisos_de_qualidade: [
    'IBC-Br com defasagem de ~2,5 meses (último ponto: agosto/2026).',
    'Focus: mediana semanal; baseCalculo não documentado (usado 0).',
  ],
}

sampleData.series = {
  ...sampleData.series,
  selic_efetiva_diaria: dailySeries('2026-11-13', 60, 13.65, 0.11, 2),
  dolar_diario: dailySeries('2026-11-13', 120, 5.6518, 0.07, 1),
}

export { sampleData }
