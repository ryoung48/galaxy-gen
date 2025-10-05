import { StarSurfaceTidesParams, MoonSurfaceTidesParams, MoonsSurfaceTidesParams } from './types'
import { CONSTANTS } from '../../../constants'
import { Orbit } from '../types'

const maxTide = (orbit: Orbit) => orbit.diameter * CONSTANTS.ED * 0.00001 * 1e3

export const SURFACE_TIDES = {
  star: ({ star, orbit }: StarSurfaceTidesParams) => {
    if (orbit.lock?.type === 'star') return 0
    const effect = (star.mass * orbit.size) / (32 * orbit.au ** 3)
    return effect
  },
  moon: ({ moon, planet }: MoonSurfaceTidesParams) => {
    if (planet.lock?.type === 'moon') return 0
    const distance = ((moon.moon?.pd ?? 0) * planet.diameter * CONSTANTS.ED) / 1e6
    const effect = (moon.mass * planet.size) / (3.2 * distance ** 3)
    return effect
  },
  planet: ({ planet, moon }: MoonSurfaceTidesParams) => {
    if (moon.lock?.type === 'planet') return 0
    const distance = ((moon.moon?.pd ?? 0) * planet.diameter * CONSTANTS.ED) / 1e6
    const effect = (planet.mass * moon.size) / (3.2 * distance ** 3)
    return effect
  },
  moons: ({ moon, other, planet }: MoonsSurfaceTidesParams) => {
    const diff = Math.abs((moon.moon?.pd ?? 0) - (other.moon?.pd ?? 0))
    if (diff === 0) return 0
    const distance = (diff * planet.diameter * CONSTANTS.ED) / 1e6
    const effect = (other.mass * moon.size) / (3.2 * distance ** 3)
    return effect
  },
  effects: ({ star, orbit }: StarSurfaceTidesParams) => {
    const belt = orbit.group === 'asteroid belt'
    if (!belt) {
      orbit.tides.push({
        effect: SURFACE_TIDES.star({ star, orbit }),
        type: 'star',
        idx: star.idx
      })
      orbit.orbits.forEach(moon => {
        orbit.tides.push({
          effect: SURFACE_TIDES.moon({ moon, planet: orbit }),
          type: 'moon',
          idx: moon.idx
        })
      })
      const max = maxTide(orbit)
      orbit.tides
        .filter(tide => tide.effect > max)
        .forEach(tide => {
          tide.effect = window.dice.uniform(0.5, 0.8) * max
        })
    }
    orbit.orbits.forEach(moon => {
      if (!belt) {
        moon.tides.push({
          effect: SURFACE_TIDES.planet({ moon, planet: orbit }),
          type: 'planet',
          idx: orbit.idx
        })
      }
      moon.tides.push({
        effect: SURFACE_TIDES.star({ star, orbit: moon }),
        type: 'star',
        idx: star.idx
      })
      orbit.orbits
        .filter(other => other.idx !== moon.idx && other.type !== 'asteroid')
        .forEach(other => {
          moon.tides.push({
            effect: SURFACE_TIDES.moons({ moon, other, planet: orbit }),
            type: 'moon',
            idx: other.idx
          })
        })
      const max = maxTide(moon)
      moon.tides
        .filter(tide => tide.effect > max)
        .forEach(tide => {
          tide.effect = window.dice.uniform(0.5, 1) * max
        })
    })
  }
}
