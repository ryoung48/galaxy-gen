import type { Species } from '../types'
import type { BiologicalTraits } from './biological/types'
import type { MechanicalTraits } from './mechanical/types'

type TraitEffect = {
  type: string
  value: number
  description: string
}

type TraitRestriction = {
  speciesClass?: Species['class'][]
  requires?: string[]
}

export type Trait = {
  name: string
  effects: TraitEffect[]
  conflicts: (BiologicalTraits | MechanicalTraits)[]
  restrictions: TraitRestriction
  traitPoints: number
  slavePrice: number
  description: string
  canBeRemovedWith?: string[]
}
