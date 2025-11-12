import { Star } from '../stars/types'
import { AsteroidBelt } from './asteroids/types'
import { Atmosphere } from './atmosphere/types'
import { MoonOrbit } from './moons/types'
import { OrbitTag } from './tags/types'

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

type Trace = {
  value: number
  description: string
}[]

export interface Orbit {
  idx: number
  tag: 'orbit'
  name: string
  system: number
  parent: { type: 'star' | 'orbit'; idx: number }
  angle: number
  distance: number
  deviation: number
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
  biosphere: {
    code: number
    label?: 'remnants' | 'engineered' | 'miscible' | 'immiscible' | 'hybrid'
    trace: Trace
    mass?: { code: number; trace: Trace }
    complexity?: { code: number; trace: Trace }
    diversity?: number
  }
  chemistry?: 'water' | 'ammonia' | 'methane' | 'sulfur' | 'chlorine'
  temperature: {
    mean: number
    high: number
    low: number
    trace: { greenhouse: number; albedo: number; au: number; luminosity: number }
    delta: {
      eccentricity: number
      tilt: number
      rotation: number
      geography: number
      atmospheric: number
      value: number
    }
  }
  rotation: { value: number; trace: Trace; roll: number }
  lock?: { type: 'moon' | 'planet' | 'star'; idx: number }
  direction: 'prograde' | 'retrograde' | '3:2 tidal lock' | '1:1 tidal lock'
  eccentricity: number
  tilt: number
  period: number
  hillSphere: number
  mor: number
  calendar: { day: number; year: number }
  tides: { effect: number; type: 'star' | 'planet' | 'moon'; idx: number }[]
  seismology: { residual: number; total: number; tides: { stress: number; heating: number } }
  habitability: { score: number; trace: Trace }
  resources: { score: number; trace: Trace }
  ru?: { score: number; trace: Trace }
  population?: { code: number; size: number }
  pcr?: { code: number; trace: Trace }
  urbanization?: { band: number; pct: number; trace: Trace }
  cities?: {
    count: number
    total: number
    pops: { count: number; unusual?: string; name?: string }[]
  }
  government?: number
  law?: number
  starport?: 'X' | 'E' | 'D' | 'C' | 'B' | 'A'
  technology: { score: number; trace: Trace }
  importance?: { score: number; trace: Trace }
  labor?: number
  infrastructure?: { score: number; trace: Trace }
  efficiency?: { score: number; trace: Trace }
  gwp?: { total: number; perCapita: number; trace: Trace }
  wtn?: { score: number; trace: Trace }
  inequality?: { score: number; trace: Trace }
  orbits: Orbit[]
  rings?: 'none' | 'minor' | 'complex'
  mainworld?: boolean
  tags: { tag: OrbitTag; value: number }[]
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
  companions: number
  deviation: number
  moon?: Omit<MoonOrbit, 'period'>
  size?: number
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
    star: Star
    au: number
  }) => Pick<Orbit, 'diameter' | 'mass' | 'gravity' | 'density'> & { description?: string }
}

export type OrbitTypeDetails = {
  description: string
  color: string
  tidalLock?: boolean
  tidalFlex?: boolean
  biosphere?: boolean
  subtypes?: Record<string, { description?: string; composition?: Orbit['composition'] }>
  roll: (_params: {
    star: Star
    zone: Orbit['zone']
    primary?: boolean
    parent?: Orbit
    deviation: number
    sizeOverride?: number
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
