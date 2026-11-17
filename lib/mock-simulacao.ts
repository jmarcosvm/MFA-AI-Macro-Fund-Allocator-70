import { sampleData } from './sample-data'
import type { EntradasSimulacao, ResultadoSimulacao } from './types'

export function mockSimularCenario(params: EntradasSimulacao): ResultadoSimulacao {
  const criterios = sampleData.cenario?.criterios
  const limiarInflacao = criterios?.limiar_ipca_pct
  const limiarAtividade = criterios?.limiar_crescimento_pct
  if (limiarInflacao == null || limiarAtividade == null) {
    return { entradas: params, avisos: ['Limiares indisponíveis para simulação.'] }
  }

  const inflacaoAcima = params.ipca_12m_pct > limiarInflacao
  const atividadeFraca = params.crescimento_ibcbr_pct <= limiarAtividade
  const classificacao = atividadeFraca && inflacaoAcima ? 'ESTAGFLACAO' : atividadeFraca ? 'CONTRACAO' : 'EXPANSAO'
  const carteiras = {
    ESTAGFLACAO: { renda_fixa: 0.60, fundos_cambiais: 0.25, renda_variavel: 0.15 },
    CONTRACAO: { renda_fixa: 0.55, fundos_cambiais: 0.20, renda_variavel: 0.25 },
    EXPANSAO: { renda_fixa: 0.35, fundos_cambiais: 0.10, renda_variavel: 0.55 },
  }
  const preferencia = classificacao === 'EXPANSAO' ? 'PREFIXADA' : 'POSFIXADA'
  const ipcaExPost = ((1 + params.selic_efetiva_aa_pct / 100) / (1 + params.ipca_12m_pct / 100) - 1) * 100

  return {
    entradas: params,
    cenario: { classificacao },
    carteira_base: carteiras[classificacao],
    renda_fixa_preferencia: preferencia,
    juro_real_ex_post_pct: ipcaExPost,
    avisos: [],
  }
}
