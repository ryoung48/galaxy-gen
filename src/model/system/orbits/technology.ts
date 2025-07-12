import { Orbit } from './types'

export const TECHNOLOGY = {
  calculate: (orbit: Orbit) => {
    if (!orbit.population) return 0
    let techRoll = window.dice.roll(1, 6)
    // starport
    if (orbit.starport === 'A') techRoll += 6
    else if (orbit.starport === 'B') techRoll += 4
    else if (orbit.starport === 'C') techRoll += 2
    else if (orbit.starport === 'X') techRoll -= 4
    // size
    if (orbit.size <= 1) techRoll += 2
    else if (orbit.size <= 4) techRoll += 1
    // atmosphere
    if (orbit.atmosphere.code <= 3 || orbit.atmosphere.code >= 10) techRoll += 1
    // hydrosphere
    if (orbit.hydrosphere.code === 0 || orbit.hydrosphere.code === 9) techRoll += 1
    else if (orbit.hydrosphere.code >= 10) techRoll += 2
    // population
    if (orbit.population.code >= 10) techRoll += 4
    else if (orbit.population.code >= 9) techRoll += 3
    else if (orbit.population.code >= 8) techRoll += 2
    else if (orbit.population.code <= 5) techRoll += 1
    // government
    if (orbit.government === 0 || orbit.government === 5) techRoll += 1
    else if (orbit.government === 7) techRoll += 2
    else if (orbit.government === 13 || orbit.government === 14) techRoll -= 2
    return Math.min(Math.max(techRoll, 0), 15)
  },
  minimum: ({ atmosphere, habitability }: Orbit) => {
    let min = 0
    // atmosphere
    if (atmosphere.code <= 1 || atmosphere.code === 10) min = Math.max(min, 8)
    else if (
      atmosphere.code <= 3 ||
      atmosphere.subtype === 'very dense' ||
      atmosphere.subtype === 'low'
    )
      min = Math.max(min, 5)
    else if (atmosphere.code === 4 || atmosphere.code === 7 || atmosphere.code === 9)
      min = Math.max(min, 3)
    else if (atmosphere.code === 11 || atmosphere.code === 13) min = Math.max(min, 9)
    else if (atmosphere.code === 12) min = Math.max(min, 10)
    else if (atmosphere.code >= 14) min = Math.max(min, 14)
    // habitability
    if (habitability <= 0) min = Math.max(min, 8)
    else if (habitability <= 2) min = Math.max(min, 5)
    else if (habitability <= 7) min = Math.max(min, 2)
    return min
  }
}
