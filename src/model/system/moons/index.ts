import { CONSTANTS } from '../../constants'
import { MATH } from '../../utilities/math'
import { CELESTIAL } from '../common'
import { Moon, MoonSpawnParams } from './types'

export const MOON = {
  spawn: ({ n, planet, star, totalMoons }: MoonSpawnParams): Moon => {
    const hillSphere =
      planet.distanceFromStar *
      CONSTANTS.AU *
      ((planet.mass * CONSTANTS.EM) / (3 * star.mass * CONSTANTS.M)) ** (1 / 3)
    const rocheLimit = 5 * planet.radius * CONSTANTS.ER * 2 ** (1 / 3)
    const distanceFromPlanet = MATH.scalePow({
      domain: [0, totalMoons],
      range: [rocheLimit, hillSphere],
      exponent: 1.5,
      v: n
    })
    if (distanceFromPlanet / CONSTANTS.AU > 2) {
      console.log()
    }
    const albedo = window.dice.uniform(0.1, 0.8)
    const greenhouse = window.dice.uniform(0.1, 0.8)
    const giant = planet.type !== 'terrestrial'
    const radius =
      planet.radius * (giant ? window.dice.uniform(0.01, 0.08) : window.dice.uniform(0.05, 0.25))
    const mass = ((radius * CONSTANTS.ER) ** 3 * Math.PI * 3e3 * 4) / 3 / CONSTANTS.EM
    return {
      id: '',
      name: '',
      mass,
      radius,
      angle: CELESTIAL.angle(),
      rotationPeriod: -1,
      orbitPeriod: CELESTIAL.orbitPeriod({
        parentDistance: distanceFromPlanet,
        parentMass: planet.mass * CONSTANTS.EM
      }),
      albedo,
      greenhouse,
      temperature: CELESTIAL.temperature({
        star: {
          radius: star.radius,
          temperature: star.temperature,
          distance: planet.distanceFromStar
        },
        albedo,
        greenhouse
      }),
      axialTilt: window.dice.uniform(0, 90),
      distanceFromParent: distanceFromPlanet / CONSTANTS.AU
    }
  }
}
