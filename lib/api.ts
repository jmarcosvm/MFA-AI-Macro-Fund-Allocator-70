import { ANALYZE_TIMEOUT_MS, API_BASE_URL } from './config'
import type { Analise, EntradasSimulacao, ResultadoSimulacao } from './types'

export type ErroKind = 'erro503' | 'erro500' | 'rede' | 'timeout'

export class ApiError extends Error {
  kind: ErroKind
  constructor(kind: ErroKind, message?: string) {
    super(message ?? kind)
    this.name = 'ApiError'
    this.kind = kind
  }
}

/** 422 do /simulate: mensagens (pt-BR) do campo detail. */
export class SimulacaoInvalida extends Error {
  mensagens: string[]
  constructor(mensagens: string[]) {
    super(mensagens.join(' '))
    this.name = 'SimulacaoInvalida'
    this.mensagens = mensagens
  }
}

export const isAbortError = (e: unknown) => e instanceof DOMException && e.name === 'AbortError'

/** Fixture local: só com ?fonte=exemplo, nunca por padrão. */
export function modoExemplo(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fonte') === 'exemplo'
}

async function detalheTexto(res: Response): Promise<string | undefined> {
  try {
    const body = await res.json()
    return typeof body?.detail === 'string' ? body.detail : undefined
  } catch { return undefined }
}

/** `signal` opcional: cancelamento do chamador (ex.: desmontagem) propaga AbortError, sem virar erro de UI. */
export async function carregarAnalise(signal?: AbortSignal): Promise<Analise> {
  if (modoExemplo()) return (await import('./sample-data')).sampleData
  const controller = new AbortController()
  let esgotou = false
  const timer = setTimeout(() => { esgotou = true; controller.abort() }, ANALYZE_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/macro/analyze`, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (res.status === 503) throw new ApiError('erro503', await detalheTexto(res))
    if (!res.ok) throw new ApiError('erro500')
    try { return (await res.json()) as Analise } catch { throw new ApiError('erro500') }
  } catch (e) {
    if (e instanceof ApiError) throw e
    if (isAbortError(e)) {
      if (esgotou) throw new ApiError('timeout')
      throw e
    }
    throw new ApiError('rede')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

let simController: AbortController | null = null
let simSeq = 0

/** Cancela a requisição anterior e ignora respostas fora de ordem (rejeita com AbortError). */
export async function simularCenario(params: EntradasSimulacao): Promise<ResultadoSimulacao> {
  simController?.abort()
  const controller = new AbortController()
  simController = controller
  const seq = ++simSeq
  const q = new URLSearchParams({
    ipca_12m_pct: String(params.ipca_12m_pct),
    crescimento_ibcbr_pct: String(params.crescimento_ibcbr_pct),
    selic_efetiva_aa_pct: String(params.selic_efetiva_aa_pct),
  })
  if (params.selic_esperada_pct != null) q.set('selic_esperada_pct', String(params.selic_esperada_pct))
  if (params.meta_selic_pct != null) q.set('meta_selic_pct', String(params.meta_selic_pct))
  const res = await fetch(`${API_BASE_URL}/api/v1/macro/simulate?${q}`, { signal: controller.signal, headers: { Accept: 'application/json' } })
  if (res.status === 422) {
    let mensagens: string[] = []
    try {
      const body = await res.json()
      if (Array.isArray(body?.detail)) mensagens = body.detail.map((d: { msg?: unknown }) => d?.msg).filter((m: unknown): m is string => typeof m === 'string')
      else if (typeof body?.detail === 'string') mensagens = [body.detail]
    } catch { /* corpo ilegível */ }
    if (seq !== simSeq) throw new DOMException('obsoleta', 'AbortError')
    throw new SimulacaoInvalida(mensagens.length ? mensagens : ['Valores fora da faixa aceita.'])
  }
  if (!res.ok) throw new ApiError(res.status === 503 ? 'erro503' : 'erro500')
  const body = (await res.json()) as ResultadoSimulacao
  if (seq !== simSeq) throw new DOMException('obsoleta', 'AbortError')
  return body
}
