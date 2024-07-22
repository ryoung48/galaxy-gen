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
  type: 'asteroid belt' | DwarfType | TerrestrialType | HelianType | JovianType
  subtype?: string
  size: number // 0-9; A=10; B-E=11-14; G=15
  atmosphere: number // 0-9; A-D=10-13; G=14
  hydrosphere: number // 0-9; A=10; B=11; F=12; G=13
  biosphere: number // 0-9; A=10; B=11; C=12; D=13
  chemistry?: 'water' | 'ammonia' | 'methane' | 'sulfur' | 'chlorine'
  desirability: number
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
}

export type OrbitGroupDetails = {
  type: (_params: { zone: Orbit['zone']; impactZone: boolean; parent?: Orbit }) => Orbit['type']
  orbits: () => Orbit['group'][]
}

export type OrbitTypeDetails = {
  description: string
  color: string
  roll: (_params: { star: Star; zone: Orbit['zone'] }) => {
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
  group: Orbit['group']
  hydrosphere: number
  atmosphere: number
  size: number
}
