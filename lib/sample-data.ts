import type { Analise } from './types'

export const sampleData: Analise = {
  "gerado_em": "2026-11-13T09:00:00-03:00",
  "aviso": "Simulação educacional. Não é recomendação de investimento.",
  "cenario": {"classificacao": "ESTAGFLACAO",
   "criterios": {"crescimento_ibcbr_pct": -0.64, "ipca_12m_pct": 4.63, "limiar_crescimento_pct": 0.0, "limiar_ipca_pct": 4.5},
   "o_que_mudaria": {"ipca_precisa_cair_pp": 0.13, "ibcbr_proximo_mes_precisa_superar": 112.23}},
  "indicadores": {
   "selic_efetiva_aa": {"valor": 13.65, "data": "2026-11-13", "fonte": "BCB SGS 1178"},
   "meta_selic_aa": {"valor": 13.75, "data": "2026-11-14", "fonte": "BCB SGS 432"},
   "ipca_12m": {"valor": 4.63, "data": "2026-10-01", "fonte": "BCB SGS 13522"},
   "dolar_venda": {"valor": 5.6518, "data": "2026-11-13", "fonte": "BCB SGS 1"},
   "volatilidade_dolar_63d_anualizada_pct": {"valor": 23.18, "data": "2026-11-13", "fonte": "calculado sobre BCB SGS 1"},
   "ibcbr": {"fonte": "BCB SGS 24364",
    "janela_recente": {"media": 110.2705, "meses": ["jun", "jul", "ago"]},
    "janela_anterior": {"media": 110.9836, "meses": ["mar", "abr", "mai"]}},
  },
  "juro_real": {"ex_post_pct": 8.62, "projetado_12m_pct": 7.37,
   "entradas_projetado": {"selic_esperada_pct": 12.75, "reuniao": "R7/2027", "ipca_esperado_12m_pct": 5.0117, "data_focus": "2026-11-06"}},
  "carteira": {
   "base": {"renda_fixa": 0.60, "fundos_cambiais": 0.25, "renda_variavel": 0.15},
   "sugerida": {"renda_fixa": 0.55, "fundos_cambiais": 0.20, "renda_variavel": 0.25},
   "limite_desvio_pp": 15, "renda_fixa_preferencia": "POSFIXADA"},
  "justificativa": {
   "texto": "Texto de exemplo com a justificativa completa, em dois ou três parágrafos curtos.",
   "resumo": "Linha 1 de exemplo do resumo.\nLinha 2 de exemplo do resumo.",
   "narracao_o_que_mudaria": "Texto de exemplo: o IPCA precisaria cair cerca de 0,13 ponto percentual e o IBC-Br superar 112,23 no próximo mês.",
   "origem": "llm", "provedor": "gemini"},
  "avisos_de_qualidade": [
   "IBC-Br com defasagem de ~2,5 meses (último ponto: agosto/2026).",
   "Focus: mediana semanal; baseCalculo não documentado (usado 0)."]
}
