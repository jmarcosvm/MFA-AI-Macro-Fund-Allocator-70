import type { Classificacao } from './types'

export function scenarioTone(value?: Classificacao | null) {
  if (value === 'ESTAGFLACAO') return 'scenario-stag'
  if (value === 'CONTRACAO') return 'scenario-contract'
  if (value === 'EXPANSAO') return 'scenario-expand'
  return 'scenario-neutral'
}
