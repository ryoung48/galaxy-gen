import { Orbit } from './types'

export const TECHNOLOGY = {
  calculate: (orbit: Orbit) => {
    const trace: Orbit['technology']['trace'] = []
    if (!orbit.population) return { score: 0, trace }

    const baseRoll = window.dice.roll(1, 6)
    let techRoll = baseRoll
    trace.push({ value: baseRoll, description: 'base roll (1d6)' })

    // starport
    if (orbit.starport === 'A') {
      techRoll += 6
      trace.push({ value: 6, description: 'class A starport' })
    } else if (orbit.starport === 'B') {
      techRoll += 4
      trace.push({ value: 4, description: 'class B starport' })
    } else if (orbit.starport === 'C') {
      techRoll += 2
      trace.push({ value: 2, description: 'class C starport' })
    } else if (orbit.starport === 'X') {
      techRoll -= 4
      trace.push({ value: -4, description: 'class X starport' })
    }

    // size
    if (orbit.size <= 1) {
      techRoll += 2
      trace.push({ value: 2, description: 'small world' })
    } else if (orbit.size <= 4) {
      techRoll += 1
      trace.push({ value: 1, description: 'tiny world' })
    }

    // atmosphere
    if (orbit.atmosphere.code <= 3 || orbit.atmosphere.code >= 10) {
      techRoll += 1
      trace.push({ value: 1, description: 'hostile atmosphere' })
    }

    // hydrosphere
    if (orbit.hydrosphere.code === 0 || orbit.hydrosphere.code === 9) {
      techRoll += 1
      trace.push({
        value: 1,
        description: orbit.hydrosphere.code === 0 ? 'limited water' : 'ocean-dominated'
      })
    } else if (orbit.hydrosphere.code === 10 || orbit.hydrosphere.code === 11) {
      techRoll += 2
      trace.push({ value: 2, description: 'ocean-dominated' })
    } else if (orbit.hydrosphere.code >= 12) {
      techRoll += 3
      trace.push({
        value: 3,
        description: orbit.hydrosphere.code === 12 ? 'molten surface' : 'gas giant core'
      })
    }

    // population
    if (orbit.population.code >= 10) {
      techRoll += 4
      trace.push({ value: 4, description: 'high population (+5B)' })
    } else if (orbit.population.code >= 9) {
      techRoll += 3
      trace.push({ value: 3, description: 'high population (+1B)' })
    } else if (orbit.population.code >= 8) {
      techRoll += 2
      trace.push({ value: 2, description: 'high population (+100M)' })
    } else if (orbit.population.code <= 5) {
      techRoll += 1
      trace.push({ value: 1, description: 'low population' })
    }

    // government
    if (orbit.government === 0 || orbit.government === 5) {
      techRoll += 1
      trace.push({
        value: 1,
        description: orbit.government === 0 ? 'family/clan/tribal' : 'feudal technocracy'
      })
    } else if (orbit.government === 7) {
      techRoll += 2
      trace.push({ value: 2, description: 'balkanisation' })
    } else if (orbit.government === 13 || orbit.government === 14) {
      techRoll -= 2
      trace.push({ value: -2, description: 'theocratic authority' })
    }

    const clamped = Math.min(Math.max(techRoll, 1), 15)
    if (clamped !== techRoll) {
      trace.push({
        value: clamped - techRoll,
        description: clamped > techRoll ? 'minimum tech floor' : 'maximum tech ceiling'
      })
    }
    return { score: clamped, trace }
  },
  minimum: ({ atmosphere, habitability, hydrosphere }: Orbit) => {
    let min = 0
    // atmosphere
    if (atmosphere.code <= 1 || atmosphere.code === 10) min = Math.max(min, 8)
    else if (atmosphere.code <= 3 || atmosphere.code === 13 || atmosphere.code === 14)
      min = Math.max(min, 5)
    else if (atmosphere.code === 4 || atmosphere.code === 7 || atmosphere.code === 9)
      min = Math.max(min, 3)
    else if (atmosphere.code === 15) min = Math.max(min, 8)
    else if (atmosphere.code === 11) min = Math.max(min, 9)
    else if (atmosphere.code === 12) min = Math.max(min, 10)
    else if (atmosphere.code >= 16) min = Math.max(min, 14)

    if (hydrosphere.code === 12) min = Math.max(min, 14)

    // habitability
    if (habitability.score <= 0) min = Math.max(min, 10)
    else if (habitability.score <= 2) min = Math.max(min, 6)
    else if (habitability.score <= 7) min = Math.max(min, 2)
    return min
  }
}
