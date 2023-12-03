import { Satellite } from '../satellites/types'
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

export type OrbitalDeposit = Record<
  Resource,
  {
    weight: number
    tag: string
    color: string
    max: number
    weights: Partial<Record<Satellite['type'] | Star['type'], number>>
  }
>

export type OrbitalDepositSpawnParams = {
  object: Satellite | Star
  primary?: boolean
}
