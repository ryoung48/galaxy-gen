import { ResourceUnit } from '../resources/types'
import { Star } from '../stars/types'

export interface Orbit {
  idx: number
  tag: 'orbit'
  name: string
  system: number
  parent: { type: 'star' | 'orbit'; idx: number }
  angle: number
  distance: number
  zone: 'epistellar' | 'inner' | 'outer'
  type:
    | 'asteroid belt'
    | 'ice asteroid belt'
    | 'asteroid'
    | 'ice asteroid'
    | 'barren'
    | 'desert'
    | 'arid'
    | 'savanna'
    | 'oceanic'
    | 'continental'
    | 'tropical'
    | 'tundra'
    | 'alpine'
    | 'arctic'
    | 'frozen'
    | 'molten'
    | 'toxic'
    | 'gas giant'
  size: number
  orbits: Orbit[]
  resources: ResourceUnit[]
  // display
  r: number
  fullR?: number
}
export type OrbitSpawnParams = {
  star: Star
  zone: Orbit['zone']
  parent?: Orbit
  moon?: { type: Orbit['type']; size: number }
  angle: number
  distance: number
  habitable: number
  homeworld: boolean
}

export type OrbitClassDetails = {
  color: string
  size: () => number
  orbits: (p: { habitable: number; zone: Orbit['zone']; giant: boolean }) => Orbit['type'][]
  habitable?: boolean
  climate?: 'dry' | 'wet' | 'cold'
  asteroid?: boolean
  asteroidBelt?: boolean
}
