# MFA — AI Macro Fund Allocator (Web)

> **Simulação educacional. Não é recomendação de investimento.**

Painel de leitura macro do Brasil (Next 16, React 19, Tailwind 4, Recharts, pnpm). Consome a API do MFA:
`GET /api/v1/macro/analyze` (análise) e `GET /api/v1/macro/simulate` (simulador "E se").

## Como rodar

```bash
corepack pnpm install        # packageManager: pnpm@12.3.4
corepack pnpm dev            # http://localhost:3000
corepack pnpm exec tsc --noEmit
corepack pnpm build
```

Por padrão usa a API em `https://mfa-api-4u7m.onrender.com` (Render free: a primeira chamada pode levar ~50 s para
"acordar"; a tela mostra "Conectando à análise").

## API_BASE_URL

Definida em `lib/config.ts`. Override opcional (não é segredo) para testar contra a API local:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 corepack pnpm dev
```

A API precisa liberar a origem do front em `CORS_ORIGINS`. Se o navegador bloquear, a mensagem aparece no console.

## Parâmetros de URL

| Parâmetro | Efeito |
|---|---|
| `?fonte=exemplo` | Usa `lib/sample-data.ts` (fixture local) em vez da API e mostra o selo "Dados de exemplo". Nunca é o padrão. |
| `?estado=carregando\|acordando\|erro503\|erro500\|rede\|timeout` | Simula o estado de tela **apenas na primeira carga**. "Tentar de novo" chama a API real. |

## Estados e erros

- Mais de ~4 s sem resposta → "acordando". Timeout de 90 s → `timeout`.
- 503 → `erro503` (mostra o `detail` se vier); outros 5xx → `erro500`; falha de rede → `rede`.
- "Tentar de novo" só refaz a requisição quando o usuário clica (sem repetição automática).
- Simulador: debounce de 300 ms, cancela a requisição anterior; 422 mostra as mensagens do `detail` abaixo dos sliders.

## Limitações

- `criterios.crescimento_ibcbr_pct` vem arredondado a 2 casas e o back classifica o valor bruto: um slider em 0,00 pode
  classificar diferente do `/analyze`.
- Cold start do Render (~25–50 s).
- `next.config.mjs` tem `typescript.ignoreBuildErrors: true`: o `build` não barra erro de tipo; use `tsc --noEmit`.
- O botão "Tentar de novo" mantém o visual aprovado do v0 (altura ~38 px, abaixo dos 40 px de toque pedidos).
