export type Classificacao = 'ESTAGFLACAO' | 'CONTRACAO' | 'EXPANSAO'
export type Origem = 'llm' | 'fallback'

export interface Indicador { valor?: number | null; data?: string | null; fonte?: string | null }
export interface JanelaIBC { media?: number | null; meses?: string[] | null }
export interface Analise {
  gerado_em?: string | null
  aviso?: string | null
  cenario?: { classificacao?: Classificacao | null; criterios?: { crescimento_ibcbr_pct?: number | null; ipca_12m_pct?: number | null; limiar_crescimento_pct?: number | null; limiar_ipca_pct?: number | null } | null; o_que_mudaria?: { ipca_precisa_cair_pp?: number | null; ibcbr_proximo_mes_precisa_superar?: number | null } | null } | null
  indicadores?: { selic_efetiva_aa?: Indicador | null; meta_selic_aa?: Indicador | null; ipca_12m?: Indicador | null; dolar_venda?: Indicador | null; volatilidade_dolar_63d_anualizada_pct?: Indicador | null; ibcbr?: { fonte?: string | null; janela_recente?: JanelaIBC | null; janela_anterior?: JanelaIBC | null } | null } | null
  juro_real?: { ex_post_pct?: number | null; projetado_12m_pct?: number | null; entradas_projetado?: { selic_esperada_pct?: number | null; reuniao?: string | null; ipca_esperado_12m_pct?: number | null; data_focus?: string | null } | null } | null
  carteira?: { base?: Record<string, number | null | undefined> | null; sugerida?: Record<string, number | null | undefined> | null; limite_desvio_pp?: number | null; renda_fixa_preferencia?: string | null } | null
  justificativa?: { texto?: string | null; resumo?: string | null; narracao_o_que_mudaria?: string | null; origem?: Origem | null; provedor?: string | null } | null
  avisos_de_qualidade?: string[] | null
}
