import { Star } from '../stars/types'
import { AsteroidBelt } from './asteroids/types'
import { Atmosphere } from './atmosphere/types'
import { MoonOrbit } from './moons/types'

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
  belt?: AsteroidBelt
  moon?: MoonOrbit
  au: number
  size: number // 0-9; A=10; B-E=11-14; G=15
  diameter: number
  mass: number
  gravity: number
  density: number
  composition: { type: 'rocky' | 'ice' | 'metallic' | 'gas'; description?: string }
  atmosphere: Atmosphere
  hydrosphere: { code: number; distribution: number }
  biosphere: number
  chemistry?: 'water' | 'ammonia' | 'methane' | 'sulfur' | 'chlorine'
  temperature: { mean: number; high: number; low: number }
  rotation: number
  eccentricity: number
  axialTilt: number
  period: number
  habitability: number
  habitabilityTrace?: HabitabilityTrace
  resources: number
  population?: { code: number; size: number }
  settlement?:
    | 'refueling station'
    | 'research base'
    | 'freeport'
    | 'mining station'
    | 'corporate outpost'
    | 'colonial outpost'
    | 'frontier world'
    | 'prison world'
    | 'paradise world'
    | 'industrial world'
    | 'agricultural world'
    | 'capital world'
  government?: number
  law?: number
  starport?: 'X' | 'E' | 'D' | 'C' | 'B' | 'A'
  technology?: number
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
  designation?: 'homeworld' | 'primary'
  unary: boolean
  deviation: number
  moon?: Omit<MoonOrbit, 'period'>
}

export type OrbitGroupDetails = {
  type: (_params: {
    zone: Orbit['zone']
    impactZone: boolean
    parent?: Orbit
    star: Star
    deviation: number
  }) => Orbit['type']
  orbits: ({ size }: { size: number }) => Orbit['group'][]
  size: (_params: {
    size: number
    composition: Orbit['composition']['type']
  }) => Pick<Orbit, 'diameter' | 'mass' | 'gravity' | 'density'> & { description?: string }
}

export type OrbitTypeDetails = {
  description: string
  color: string
  tidalLock?: boolean
  tidalFlex?: boolean
  biosphere?: boolean
  subtypes?: Record<string, { description?: string; composition?: Orbit['composition'] }>
  resources?: {
    type:
      | 'food'
      | 'minerals'
      | 'energy'
      | 'alloys'
      | 'consumer goods'
      | 'research'
      | 'trade'
      | 'exotic gas'
      | 'rare crystals'
      | 'volatile motes'
      | 'zro'
      | 'dark matter'
    weight: number
  }[]
  roll: (_params: {
    star: Star
    zone: Orbit['zone']
    primary?: boolean
    parent?: Orbit
    deviation: number
  }) => {
    size: number
    atmosphere: number
    hydrosphere: number
    composition: Orbit['composition']['type']
    chemistry?: Orbit['chemistry']
    subtype?: string
    eccentric?: boolean
  }
}

export type AxialTiltParams = {
  tidalLocked?: boolean
  homeworld?: boolean
}

export interface EccentricityParams {
  star?: boolean
  asteroidMember?: boolean
  tidalLocked?: boolean
  homeworld?: boolean
  moon?: Omit<MoonOrbit, 'period'>
  proto?: boolean
  primordial?: boolean
}

export type PopulateOrbitParams = {
  orbit: Orbit
  maxPop?: number
  maxTech?: number
  capital?: boolean
  mainworld?: boolean
}

export interface HabitabilityTrace {
  adjustments: {
    value: number
    description: string
  }[]
}
