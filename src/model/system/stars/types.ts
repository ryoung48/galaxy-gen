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
  age: number
  base: BaseClassKey
  class:
    | 'O'
    | 'B'
    | 'M-Ib'
    | 'A-V'
    | 'F-IV'
    | 'K-III'
    | 'F-V'
    | 'G-IV'
    | 'M-III'
    | 'G-V'
    | 'K-IV'
    | 'K-V'
    | 'M-V'
    | 'M-Ve'
    | 'L'
    | 'D'
  mass: number
  radius: number
  temperature: number
  luminosity: number
  orbits: (Orbit | Star)[]
  // display
  r: number
  fullR?: number
}

export type BaseClassKey = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M' | 'L' | 'D'

export type BaseClass = {
  type: (params: { age: number; companions: number }) => Star['class']
}

export type SpectralClass = {
  mass: number[]
  radius: number[]
  temperature: number[]
  luminosity: number[]
  color: string
}

export type StarSpawnParams = {
  system: number
  parent?: Star
  distance?: number
  angle?: number
  zone?: Star['zone']
}
