import { Orbit } from '../orbits/types'

interface StarAttributes {
  spectralClass: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
  luminosityClass: 'Ia' | 'Ib' | 'II' | 'III' | 'IV' | 'V' | 'VI'
  subtype: number
  mass: number
  temperature: number
  diameter: number
  luminosity: number
  age: number
  eccentricity: number
}

export interface Star extends StarAttributes {
  idx: number
  tag: 'star'
  name: string
  system: number
  parent?: number
  zone?: Orbit['zone'] | 'distant'
  angle: number
  distance: number
  period: number
  au: number
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
  attributes?: StarAttributes
  deviation?: number
  homeworld?: boolean
}

export type StarCompanionTemplate = {
  type: 'star'
  deviation: number
  zone: Star['zone']
  attributes: StarAttributes
}
