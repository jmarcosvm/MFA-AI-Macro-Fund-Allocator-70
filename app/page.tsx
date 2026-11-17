'use client'

import { useCallback, useEffect, useState } from 'react'
import { ApiError, carregarAnalise, isAbortError } from '@/lib/api'
import { WAKING_DELAY_MS } from '@/lib/config'
import type { Analise } from '@/lib/types'
import { MfaDashboard } from '@/components/mfa-dashboard'

const errorMessages: Record<string, { title: string; detail: string }> = {
  erro503: { title: 'Serviço temporariamente indisponível', detail: 'O serviço não conseguiu processar a solicitação.' },
  erro500: { title: 'Não foi possível carregar a análise', detail: 'Ocorreu um erro interno ao preparar os dados.' },
  rede: { title: 'Falha de conexão', detail: 'Não foi possível estabelecer conexão com o serviço.' },
  timeout: { title: 'Tempo de resposta excedido', detail: 'A solicitação demorou mais do que o esperado.' },
}

function LoadingScreen({ waking }: { waking: boolean }) {
  return <main className="state-shell"><header className="state-header"><span className="brand-mark">M</span><span>MFA · Macro Brasil</span></header><section className="state-content" aria-live="polite"><span className="eyebrow">PAINEL DE LEITURA</span><h1>{waking ? 'Conectando à análise' : 'Preparando leitura macro'}</h1><p>{waking ? 'Acordando o servidor. Pode levar até ~1 minuto.' : 'Carregando indicadores e cenário.'}</p><div className="skeleton-grid" aria-hidden="true"><div className="skeleton hero-skeleton" /><div className="skeleton" /><div className="skeleton" /><div className="skeleton wide-skeleton" /></div></section></main>
}

function ErrorScreen({ kind, retry, detail }: { kind: string; retry: () => void; detail?: string }) {
  const base = errorMessages[kind] ?? errorMessages.erro500
  const message = detail ? { ...base, detail } : base
  return <main className="state-shell"><header className="state-header"><span className="brand-mark">M</span><span>MFA · Macro Brasil</span></header><section className="error-content"><span className="error-mark">!</span><span className="eyebrow">ANÁLISE INDISPONÍVEL</span><h1>{message.title}</h1><p>{message.detail}</p><button type="button" className="retry-button" onClick={retry}>Tentar de novo</button></section></main>
}

export default function Page() {
  const [data, setData] = useState<Analise | null>(null)
  const [state, setState] = useState('carregando')
  const [errorDetail, setErrorDetail] = useState<string | undefined>()
  const [attempt, setAttempt] = useState(0)
  // ?estado= (simulação de estados) só vale na primeira carga; "Tentar de novo" chama a API real.
  const load = useCallback((signal: AbortSignal, isFirst: boolean) => {
    setData(null)
    setErrorDetail(undefined)
    setState('carregando')
    const forced = isFirst ? new URLSearchParams(window.location.search).get('estado') : null
    const later = (ms: number, next: string) => { const t = window.setTimeout(() => setState(next), ms); signal.addEventListener('abort', () => window.clearTimeout(t)) }
    if (forced === 'acordando') { later(WAKING_DELAY_MS, 'acordando'); return }
    if (forced && errorMessages[forced]) { later(500, forced); return }
    if (forced === 'carregando') return
    const wakingTimer = window.setTimeout(() => setState('acordando'), WAKING_DELAY_MS)
    carregarAnalise(signal).then((result) => {
      window.clearTimeout(wakingTimer)
      if (!signal.aborted) setData(result)
    }).catch((error) => {
      window.clearTimeout(wakingTimer)
      if (signal.aborted || isAbortError(error)) return
      if (error instanceof ApiError) {
        setErrorDetail(error.kind === 'erro503' && error.message !== error.kind ? error.message : undefined)
        setState(error.kind)
      } else setState('erro500')
    })
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal, attempt === 0)
    return () => controller.abort()
  }, [load, attempt])
  if (data) return <MfaDashboard data={data} />
  if (state === 'erro503' || state === 'erro500' || state === 'rede' || state === 'timeout') return <ErrorScreen kind={state} detail={errorDetail} retry={() => setAttempt((value) => value + 1)} />
  return <LoadingScreen waking={state === 'acordando'} />
}
