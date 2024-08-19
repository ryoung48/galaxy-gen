import { Star } from '../stars/types'

type DwarfType =
  | 'rockball'
  | 'meltball'
  | 'hebean'
  | 'geo-tidal'
  | 'geo-cyclic'
  | 'snowball'
  | 'stygian'

type TerrestrialType =
  | 'jani-lithic'
  | 'vesperian'
  | 'telluric'
  | 'arid'
  | 'oceanic'
  | 'tectonic'
  | 'acheronian'

type HelianType = 'helian' | 'panthalassic' | 'asphodelian'

type JovianType = 'jovian' | 'chthonian'

export interface Orbit {
  idx: number
  tag: 'orbit'
  name: string
  system: number
  parent: { type: 'star' | 'orbit'; idx: number }
  angle: number
  distance: number
  zone: 'epistellar' | 'inner' | 'outer'
  group: 'asteroid belt' | 'dwarf' | 'terrestrial' | 'helian' | 'jovian'
  type: 'asteroid belt' | 'asteroid' | DwarfType | TerrestrialType | HelianType | JovianType
  subtype?: string
  size: number // 0-9; A=10; B-E=11-14; G=15
  atmosphere: number
  hydrosphere: number
  biosphere: {
    type:
      | 'sterile'
      | 'microbial'
      | 'human-miscible'
      | 'immiscible'
      | 'hybrid'
      | 'engineered'
      | 'remnant'
    score: number
  }
  chemistry?: 'water' | 'ammonia' | 'methane' | 'sulfur' | 'chlorine'
  temperature: 'burning' | 'hot' | 'temperate' | 'cold' | 'frozen' | `variable (${'hot' | 'cold'})`
  habitation: 'none' | 'abandoned' | 'outpost' | 'colony' | 'homeworld'
  population: number
  government: number
  law: number
  industry: number
  habitability: {
    score: number
    class: 'inhospitable' | 'harsh' | 'marginal' | 'comfortable' | 'paradise'
  }
  orbits: Orbit[]
  rings?: 'minor' | 'complex'
  // display
  r: number
  fullR?: number
}
export type OrbitSpawnParams = {
  star: Star
  zone: Orbit['zone']
  impactZone: boolean
  parent?: Orbit
  group?: Orbit['group']
  angle: number
  distance: number
  deviation: number
  homeworld?: boolean
}

export type OrbitGroupDetails = {
  type: (_params: { zone: Orbit['zone']; impactZone: boolean; parent?: Orbit }) => Orbit['type']
  orbits: () => Orbit['group'][]
}

export type OrbitTypeDetails = {
  description: string
  color: string
  roll: (_params: { star: Star; zone: Orbit['zone']; temperature: Orbit['temperature'] }) => {
    size: number
    atmosphere: number
    hydrosphere: number
    biosphere: number
    chemistry?: Orbit['chemistry']
    subtype?: string
  }
}

export type OrbitDesirabilityParams = {
  star: Star
  zone: Orbit['zone']
  type: Orbit['type']
  asteroid: boolean
  hydrosphere: number
  atmosphere: number
  temperature: Orbit['temperature']
  size: number
}
