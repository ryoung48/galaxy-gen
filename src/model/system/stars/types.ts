import { Orbit } from '../orbits/types'

export interface Star {
  idx: number
  tag: 'star'
  name: string
  system: number
  parent?: number
  zone?: Orbit['zone'] | 'distant'
  angle: number
  distance: number
  class: {
    spectral: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
    luminosity: 'Ia' | 'Ib' | 'II' | 'III' | 'IV' | 'V' | 'VI'
    subtype: number
  }
  age: number
  mass: number
  diameter: number
  temperature: number
  luminosity: number
  orbits: (Orbit | Star)[]
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
  homeworld?: boolean
}
