import { Satellite } from './satellites/types'

export type SolarSystem = {
  idx: number
  tag: 'system'
  seed: string
  name: string
  x: number
  y: number
  objects: { type: 'star' | 'satellite'; idx: number }[]
  asteroidBelts?: { distance: number }[]
  edge: boolean
  n: number[]
  lanes: number[]
  nation: number
  homeworld?: boolean
}

export type SolarSystemSpawnParams = {
  x: number
  y: number
  idx: number
  edge: boolean
  n: number[]
}

type Orbit = {
  angle: { min: number; max: number }
  distance: number
  offset?: number
}

type CelestialBody = {
  type?: Satellite['type'] | 'star'
  count: { min: number; max: number }
  moons?: {
    min: number
    max: number
    orbit: Orbit
    uninhabitable?: boolean
    type?: Satellite['type']
  }
  orbit: Orbit
  objects?: CelestialBody[]
  uninhabitable?: boolean
}

export type SolarSystemTemplate = {
  type: 'unary' | 'binary' | 'trinary'
  asteroidBelts?: SolarSystem['asteroidBelts']
  objects?: CelestialBody[]
}
