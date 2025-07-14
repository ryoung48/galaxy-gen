import { Orbit } from '../orbits/types'
import { ResourceUnit } from '../resources/types'

export interface Star {
  idx: number
  tag: 'star'
  name: string
  system: number
  parent?: number
  zone?: Orbit['zone'] | 'distant'
  type:
    | 'a star'
    | 'b star'
    | 'f star'
    | 'g star'
    | 'k star'
    | 'm star'
    | 'm red giant'
    | 't star'
    | 'neutron star'
    | 'black hole'
    | 'pulsar'
  angle: number
  distance: number
  orbits: (Orbit | Star)[]
  resources: ResourceUnit[]
  // display
  r: number
  fullR?: number
}

export type StarSpawnParams = {
  system: number
  parent?: Star
  distance?: number
  angle?: number
  zone?: Star['zone']
  spectral?: Star['type']
  homeworld?: boolean
}

export type StarCompanionTemplate = {
  type: 'star'
  deviation: number
  zone: Star['zone']
  spectral: Star['type']
}
