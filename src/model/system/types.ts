import { Star } from './stars/types'

export type SolarSystem = {
  idx: number
  tag: 'system'
  seed: string
  x: number
  y: number
  coordinate: string
  star: Star
  edge: boolean
  n: number[]
  lanes: number[]
  nation: number
  homeworld?: boolean
  tradeRoute?: boolean
}

export type SolarSystemSpawnParams = {
  x: number
  y: number
  idx: number
  edge: boolean
  n: number[]
}
