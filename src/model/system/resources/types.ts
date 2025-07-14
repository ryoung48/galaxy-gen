import { Orbit } from '../orbits/types'
import { Star } from '../stars/types'

export type Resource =
  | 'minerals'
  | 'energy'
  | 'trade'
  | 'society'
  | 'physics'
  | 'engineering'
  | 'exotic gas'
  | 'volatile motes'
  | 'rare crystals'
  | 'zro'
  | 'alloys'
  | 'consumer goods'
  | 'food'

export type OrbitalDeposit = Partial<
  Record<
    Resource,
    {
      weight: number
      tag: string
      color: string
      max: number
      weights: Partial<Record<Orbit['type'] | Star['type'], number>>
    }
  >
>

export type OrbitalDepositSpawnParams = {
  object: Orbit | Star
  primary?: boolean
}

export type ResourceUnit = { type: Resource; amount: number }
