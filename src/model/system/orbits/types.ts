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
  au: number
  size: number // 0-9; A=10; B-E=11-14; G=15
  diameter: number
  mass: number
  gravity: number
  density: number
  composition: 'rocky' | 'ice' | 'gas'
  atmosphere: {
    code: number
    type: 'breathable' | 'exotic' | 'corrosive' | 'insidious' | 'trace' | 'vacuum' | 'gaseous'
    subtype?:
      | 'very thin'
      | 'thin'
      | 'standard'
      | 'dense'
      | 'very dense'
      | 'extremely dense'
      | 'low'
      | 'unusual'
      | 'hydrogen'
      | 'helium'
    tainted?: boolean
    hazard?:
      | 'biologic'
      | 'radioactive'
      | 'gas mix'
      | 'low oxygen'
      | 'high oxygen'
      | 'particulates'
      | 'sulphur compounds'
    unusual?: 'ellipsoid' | 'layered' | 'steam' | 'storms' | 'tides' | 'seasonal' | 'biologic'
  }
  hydrosphere: { code: number; distribution: number }
  biosphere: number
  chemistry?: 'water' | 'ammonia' | 'methane' | 'sulfur' | 'chlorine'
  temperature: {
    kelvin: number
    base: number
    desc: 'burning' | 'hot' | 'temperate' | 'cold' | 'frozen'
  }
  rotation: number
  eccentricity: number
  axialTilt: number
  period: number
  habitability: number
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
  government: number
  law: number
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
}

export type OrbitGroupDetails = {
  type: (_params: {
    zone: Orbit['zone']
    impactZone: boolean
    parent?: Orbit
    star: Star
  }) => Orbit['type']
  orbits: () => Orbit['group'][]
  size: (_params: {
    star: Star
    deviation: number
    size: number
  }) => Pick<Orbit, 'diameter' | 'mass' | 'gravity' | 'density' | 'composition'>
}

export type OrbitTypeDetails = {
  description: string
  color: string
  tidalLock?: boolean
  tidalFlex?: boolean
  biosphere?: boolean
  roll: (_params: { star: Star; zone: Orbit['zone']; primary?: boolean }) => {
    size: number
    atmosphere: number
    hydrosphere: number
    chemistry?: Orbit['chemistry']
    subtype?: string
  }
  classify?: (_params: { orbit: Orbit; deviation: number }) => void
}

export type HabitabilityParams = {
  type: Orbit['type']
  hydrosphere: number
  atmosphere: Orbit['atmosphere']
  temperature: Orbit['temperature']
  size: number
  gravity: number
  axialTilt: number
  eccentricity: number
}

export type AxialTiltParams = {
  tidalLocked?: boolean
  homeworld?: boolean
}

export type OrbitFinalizeParams = {
  orbit: Orbit
  capital?: boolean
  orbits: Orbit[]
}

export interface EccentricityParams {
  star?: boolean
  asteroidMember?: boolean
  tidalLocked?: boolean
  homeworld?: boolean
}

export interface BiosphereParams {
  atmosphere: Orbit['atmosphere']
  hydrosphere: number
  temperature: Orbit['temperature']['desc']
  star: Star
  type: Orbit['type']
  chemistry?: Orbit['chemistry']
  size: number
}
