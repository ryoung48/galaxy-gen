import { CONSTANTS } from '../../constants'
import { CelestialTemperatureParams, CelestialOrbitalPeriodParams } from './types'

export const CELESTIAL = {
  orbitPeriod: ({ parentDistance, parentMass }: CelestialOrbitalPeriodParams): number => {
    return (
      (2 * Math.PI * (parentDistance ** 3 / (parentMass * CONSTANTS.G)) ** 0.5) / (60 * 60 * 24)
    )
  },
  temperature: ({ star, albedo, greenhouse }: CelestialTemperatureParams) => {
    return (
      star.temperature *
      Math.sqrt(star.radius / (2 * star.distance)) *
      Math.sqrt(1 - albedo + greenhouse)
    )
  },
  angle: () => 2 * Math.PI * window.dice.random
}
