import { range } from 'd3'
import { CONSTANTS } from '../../constants'
import { MATH } from '../../utilities/math'
import { CELESTIAL } from '../common'
import { PlanetSpawnParams, Planet, PlanetClasses } from './types'
import { MOON } from '../moons'

const classes: PlanetClasses = {
  terrestrial: { mass: [0.1, 1, 10], radius: [0.4, 1, 1.7] },
  'gas giant': { mass: [30, 300, 1000], radius: [4, 11, 15] },
  'ice giant': { mass: [10, 20], radius: [3.5, 4.5] }
}

const rotation = {
  period: [60, 24, 10, 8],
  mass: [0.1, 1, 300, 3000]
}

export const PLANET = {
  spawn: ({ n, star }: PlanetSpawnParams): Planet => {
    // base dimensions
    const gasLine = 4 * Math.sqrt(star.luminosity)
    const frostLine = 30 * Math.sqrt(star.luminosity)
    const distanceFromStar = 0.4 + 0.3 * 2 ** n
    const planetClass =
      distanceFromStar > frostLine
        ? 'ice giant'
        : distanceFromStar > gasLine
        ? 'gas giant'
        : 'terrestrial'
    const mass = window.dice.uniform(...classes[planetClass].mass)
    const radius = MATH.scale({
      domain: classes[planetClass].mass,
      range: classes[planetClass].radius,
      v: mass
    })
    // temperature
    const albedo = window.dice.uniform(0.1, 0.8)
    const greenhouse = window.dice.uniform(0.1, 0.8)
    // goldilocks
    const innerHab = (star.luminosity / 1.1) ** 0.5
    const outerHab = (star.luminosity / 0.53) ** 0.5
    const goldilocks = distanceFromStar > innerHab && distanceFromStar < outerHab
    // moons
    const totalMoons = Math.max(
      0,
      window.dice.randint(0, 8) - (planetClass === 'terrestrial' ? 2 : 0)
    )
    return {
      id: '',
      name: '',
      mass,
      radius,
      angle: CELESTIAL.angle(),
      rotationPeriod: MATH.scale({ domain: rotation.mass, range: rotation.period, v: mass }),
      orbitPeriod: CELESTIAL.orbitPeriod({
        parentDistance: distanceFromStar * CONSTANTS.AU,
        parentMass: star.mass * CONSTANTS.M
      }),
      albedo,
      greenhouse,
      temperature: CELESTIAL.temperature({
        star: {
          radius: star.radius * CONSTANTS.R,
          temperature: star.temperature,
          distance: distanceFromStar * CONSTANTS.AU
        },
        albedo,
        greenhouse
      }),
      axialTilt: window.dice.uniform(0, 90),
      type: planetClass,
      distanceFromParent: distanceFromStar,
      goldilocks,
      moons: range(totalMoons).map(n =>
        MOON.spawn({
          n,
          planet: {
            distanceFromStar,
            mass,
            radius,
            type: planetClass
          },
          star,
          totalMoons
        })
      )
    }
  }
}
