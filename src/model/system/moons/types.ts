import { Planet } from '../planets/types'
import type { CelestialBody } from '../common/types'

export interface Moon extends CelestialBody {}

export type MoonSpawnParams = {
  totalMoons: number // Total number of moons
  n: number // nth moon from the planet
  planet: { distanceFromStar: number; mass: number; radius: number; type: Planet['type'] }
  star: { mass: number; radius: number; temperature: number }
}
