'use client'

import { useCallback, useEffect, useState } from 'react'
import { carregarAnalise } from '@/lib/api'
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

function ErrorScreen({ kind, retry }: { kind: string; retry: () => void }) {
  const message = errorMessages[kind] ?? errorMessages.erro500
  return <main className="state-shell"><header className="state-header"><span className="brand-mark">M</span><span>MFA · Macro Brasil</span></header><section className="error-content"><span className="error-mark">!</span><span className="eyebrow">ANÁLISE INDISPONÍVEL</span><h1>{message.title}</h1><p>{message.detail}</p><button type="button" className="retry-button" onClick={retry}>Tentar de novo</button></section></main>
}

export default function Page() {
  const [data, setData] = useState<Analise | null>(null)
  const [state, setState] = useState('carregando')
  const [attempt, setAttempt] = useState(0)
  const load = useCallback(async () => {
    setData(null)
    setState('carregando')
    const forced = new URLSearchParams(window.location.search).get('estado')
    if (forced === 'acordando') { setTimeout(() => setState('acordando'), 4000); return }
    if (forced && errorMessages[forced]) { setTimeout(() => setState(forced), 500); return }
    if (forced === 'carregando') return
    const wakingTimer = window.setTimeout(() => setState('acordando'), 4000)
    try {
      const result = await carregarAnalise()
      window.clearTimeout(wakingTimer)
      setData(result)
    } catch {
      window.clearTimeout(wakingTimer)
      setState('erro500')
    }
  }, [attempt])
  useEffect(() => { void load() }, [load])
  if (data) return <MfaDashboard data={data} />
  if (state === 'erro503' || state === 'erro500' || state === 'rede' || state === 'timeout') return <ErrorScreen kind={state} retry={() => setAttempt((value) => value + 1)} />
  return <LoadingScreen waking={state === 'acordando'} />
}
