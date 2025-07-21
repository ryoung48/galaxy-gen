import { BiologicalTraits } from './traits/biological/types'
import { MechanicalTraits } from './traits/mechanical/types'

export type Species = {
  idx: number
  archetype: 'biological' | 'mechanical' | 'lithic'
  preferences: {
    climate: 'dry' | 'wet' | 'cold'
    world?:
      | 'desert'
      | 'arid'
      | 'savanna'
      | 'oceanic'
      | 'continental'
      | 'tropical'
      | 'tundra'
      | 'alpine'
      | 'arctic'
  }
  class:
    | 'humanoid'
    | 'mammalian'
    | 'reptilian'
    | 'avian'
    | 'arthropod'
    | 'molluscoid'
    | 'fungoid'
    | 'plantoid'
    | 'lithoid'
    | 'necroid'
    | 'aquatic'
    | 'toxoid'
    | 'machine'
    | 'mechanical'
  preSapient: boolean
  traits: (BiologicalTraits | MechanicalTraits)[]
}
