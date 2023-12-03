import type { Moon } from '../moons/types'
import type { CelestialBody } from '../common/types'

export interface Planet extends CelestialBody {
  type: 'terrestrial' | 'gas giant' | 'ice giant'
  goldilocks: boolean
  moons: Moon[]
}

export interface PlanetSpawnParams {
  n: number // nth planet from the star
  star: { luminosity: number; mass: number; radius: number; temperature: number }
}

export type PlanetClasses = Record<Planet['type'], { mass: number[]; radius: number[] }>
