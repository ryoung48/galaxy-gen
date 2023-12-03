import { Resource } from '../resources/types'

export type Satellite = {
  idx: number
  tag: 'satellite'
  seed: string
  system: number
  parent?: { type: 'star' | 'satellite'; idx: number }
  orbit: { angle: number; distance: number }
  type: 'gas giant' | 'asteroid' | 'molten' | 'barren' | 'toxic' | 'frozen' | 'habitable'
  resources: { type: Resource; amount: number }[]
  size: number
  climate?:
    | 'desert'
    | 'arid'
    | 'savannah'
    | 'tropical'
    | 'continental'
    | 'ocean'
    | 'tundra'
    | 'arctic'
    | 'alpine'
  moons: number[]
  moon?: boolean
  x: number
  y: number
  _name?: string
}

export type SatelliteTemplate = {
  weight: number
  space?: number
  sizes: { moon?: [number, number]; planet: [number, number] }
  zone: { min: number; max: number }
  color: string
}

export type SatelliteSpawnParams = {
  parent?: Satellite['parent']
  type?: Satellite['type']
  orbit: Satellite['orbit']
  habitability: number
  moon?: boolean
  system: number
}
