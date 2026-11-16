import { sampleData } from './sample-data'
import type { Analise } from './types'

export async function carregarAnalise(): Promise<Analise> {
  await new Promise((resolve) => setTimeout(resolve, 650))
  return sampleData
}
