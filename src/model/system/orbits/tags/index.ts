import { SOLAR_SYSTEM } from '../..'
import { MATH } from '../../../utilities/math'
import { TECHNOLOGY } from '../technology'
import { TEMPERATURE } from '../temperature'
import { Orbit } from '../types'

const value = () => window.dice.randint(1, 5)

export const ORBIT_CODE_DETAILS = {
  agricultural: { label: 'Agricultural World', color: '#6CCB5F' },
  asteroid: { label: 'Asteroid Colony', color: '#7E7E7E' },
  desert: { label: 'Desert World', color: '#D98E04' },
  'fluid oceans': { label: 'Fluid Oceans', color: '#1E88E5' },
  garden: { label: 'Garden World', color: '#2E7D32' },
  'high population': { label: 'High Population', color: '#C62828' },
  'high tech': { label: 'High Tech', color: '#3949AB' },
  industrial: { label: 'Industrial World', color: '#5D4037' },
  'low population': { label: 'Low Population', color: '#90A4AE' },
  'low tech': { label: 'Low Tech', color: '#B0BEC5' },
  'non-agricultural': { label: 'Non-Agricultural', color: '#8D6E63' },
  'non-industrial': { label: 'Non-Industrial', color: '#FBC02D' },
  poor: { label: 'Poor World', color: '#A1887F' },
  rich: { label: 'Rich World', color: '#FFD54F' },
  'water-world': { label: 'Water World', color: '#0288D1' },
  unclassified: { label: '???', color: '#8604ffff' }
} as const

export type OrbitCode = keyof typeof ORBIT_CODE_DETAILS

const codes = (orbit: Orbit) => {
  if (!orbit.population || (orbit.population.code ?? 0) < 1) return
  orbit.codes = []
  const { atmosphere, hydrosphere, population, size, technology, government = 0 } = orbit
  if (
    atmosphere.code >= 4 &&
    atmosphere.code <= 9 &&
    hydrosphere.code >= 4 &&
    hydrosphere.code <= 8 &&
    population.code >= 5 &&
    population.code <= 7
  )
    orbit.codes.push('agricultural')
  if (orbit.type === 'asteroid') orbit.codes.push('asteroid')
  if (atmosphere.code >= 2 && atmosphere.code <= 9 && hydrosphere.code === 0)
    orbit.codes.push('desert')
  if (atmosphere.type === 'exotic' && hydrosphere.code > 0) orbit.codes.push('fluid oceans')
  if (
    size >= 6 &&
    size <= 8 &&
    [5, 6, 8].includes(atmosphere.code) &&
    hydrosphere.code >= 5 &&
    hydrosphere.code <= 7
  )
    orbit.codes.push('garden')
  if (population.code >= 9) orbit.codes.push('high population')
  if (technology.score >= 12) orbit.codes.push('high tech')
  if ([0, 1, 2, 4, 7, 9, 10, 11, 12].includes(atmosphere.code) && population.code >= 9)
    orbit.codes.push('industrial')
  if (population.code <= 3) orbit.codes.push('low population')
  if (technology.score <= 5) orbit.codes.push('low tech')
  if (atmosphere.code <= 3 && hydrosphere.code <= 3 && population.code >= 6)
    orbit.codes.push('non-agricultural')
  if (population.code >= 4 && population.code <= 6) orbit.codes.push('non-industrial')
  if (atmosphere.code >= 2 && atmosphere.code <= 5 && hydrosphere.code <= 3)
    orbit.codes.push('poor')
  if (
    [6, 8].includes(atmosphere.code) &&
    government >= 4 &&
    government <= 9 &&
    population.code >= 6 &&
    population.code <= 8
  )
    orbit.codes.push('rich')
  if (
    ((atmosphere.code >= 3 && atmosphere.code <= 9) || atmosphere.code >= 13) &&
    hydrosphere.code >= 10 &&
    hydrosphere.code <= 11
  )
    orbit.codes.push('water-world')
  if (orbit.codes.length === 0) {
    orbit.codes.push('unclassified')
  }
}

export const ORBIT_TAGS = {
  codes,
  spawn: (orbit: Orbit) => {
    if (!orbit.population) return
    const system = window.galaxy.systems[orbit.system]
    const nation = SOLAR_SYSTEM.nation(system)
    const capital = nation.capital === system.idx && orbit.mainworld
    const natives = orbit.biosphere.code === 12 && !capital
    const failedOutpost = orbit.population.code === 0
    if (failedOutpost) orbit.tags.push({ tag: 'failed outpost', value: value() })
    if (orbit.population.code === 0) return
    if (natives) {
      orbit.tags = [
        { tag: 'primitives', value: value() },
        { tag: 'research', value: value() }
      ]
      return
    }
    const lowPop = orbit.population.code < 6
    const habitable = orbit.habitability.score >= 6
    const paradise = lowPop && habitable && window.dice.random < 0.2
    if (paradise) {
      orbit.tags.push({ tag: 'paradise', value: value() })
      return
    }
    const tech = orbit.technology.score ?? 0
    const highTech = tech >= 8
    const doomed = tech < TECHNOLOGY.minimum(orbit)
    const industrial = !lowPop && highTech
    const tradeRoute = window.galaxy.systems[orbit.system].tradeRoute
    const asteroid = orbit.type === 'asteroid'
    const climate = TEMPERATURE.describe(orbit.temperature.mean)
    const border = SOLAR_SYSTEM.neighbors(system).some(n => n.nation !== nation.idx)
    const tilt = MATH.tilt.absolute(orbit.tilt)
    const parent =
      orbit.parent.type === 'orbit' ? window.galaxy.orbits[orbit.parent.idx] : undefined
    const eccentricity = parent?.eccentricity ?? orbit.eccentricity
    const storms = tilt > 35 || eccentricity > 0.2
    orbit.tags = window.dice
      .weightedSample<Orbit['tags'][number]['tag']>(
        [
          { w: habitable ? 20 : 0, v: 'farming' },
          { w: asteroid ? 30 : 10, v: 'mining' },
          { w: industrial ? 10 : 0, v: 'industrial' },
          { w: tradeRoute && industrial ? 10 : 0, v: 'trade' },
          { w: orbit.atmosphere.code >= 10 ? 1 : 0, v: 'exotic gas' },
          { w: climate === 'frozen' ? 1 : 0, v: 'rare crystals' },
          { w: climate === 'burning' ? 1 : 0, v: 'volatile motes' },
          { w: orbit.atmosphere.code >= 10 && orbit.atmosphere.code < 15 ? 0.5 : 0, v: 'zro' },
          { w: highTech ? 3 : 0, v: 'research' },
          { w: !lowPop && tradeRoute ? 1 : 0, v: 'cultural' },
          { w: industrial ? 5 : 0, v: 'shipyards' },
          { w: border || tradeRoute ? 1 : 0, v: 'fortress' },
          { w: orbit.population.code > 1 && !tradeRoute ? 1 : 0, v: 'prison' },
          { w: !capital ? 1 : 0, v: 'ancient ruins' },
          { w: 1, v: 'pilgrimage' },
          { w: storms ? 5 : 0, v: 'storms' },
          { w: !tradeRoute ? 1 : 0, v: 'meteors' },
          { w: border && !tradeRoute ? 5 : 0, v: 'raiders' },
          { w: orbit.population.code > 1 && habitable ? 1 : 0, v: 'plague' },
          { w: orbit.population.code > 2 && habitable ? 1 : 0, v: 'rebellion' },
          { w: orbit.population.code > 2 && habitable ? 1 : 0, v: 'corruption' },
          { w: orbit.population.code > 2 && habitable ? 1 : 0, v: 'criminals' },
          { w: orbit.biosphere.code > 5 && !capital ? 5 : 0, v: 'wildlife' },
          { w: doomed ? 50 : 0, v: 'doomed' }
        ],
        capital ? 3 : window.dice.randint(1, 3)
      )
      .map(tag => ({ tag, value: value() }))
  }
}
