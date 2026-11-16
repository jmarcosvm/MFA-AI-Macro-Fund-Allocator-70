import { mockSimularCenario } from './mock-simulacao'
import { sampleData } from './sample-data'
import type { Analise, EntradasSimulacao, ResultadoSimulacao } from './types'

export async function carregarAnalise(): Promise<Analise> {
  await new Promise((resolve) => setTimeout(resolve, 650))
  return sampleData
}

export async function simularCenario(params: EntradasSimulacao): Promise<ResultadoSimulacao> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  // TODO: trocar por GET /api/v1/macro/simulate
  return mockSimularCenario(params)
}
