import { ORBIT } from './orbits'
import { STAR } from './stars'
import { SolarSystem, SolarSystemSpawnParams } from './types'
import { DESIRABILITY } from './orbits/desirability'
import { VORONOI } from '../utilities/voronoi'
import { MATH } from '../utilities/math'

const letters = [
  'α',
  'β',
  'γ',
  'δ',
  'ε',
  'ζ',
  'η',
  'θ',
  'ι',
  'κ',
  'λ',
  'μ',
  'ν',
  'ξ',
  'ο',
  'π',
  'ρ',
  'σ',
  'τ',
  'υ',
  'φ',
  'χ',
  'ψ',
  'ω'
]

export const SOLAR_SYSTEM = {
  name: (system: SolarSystem) => STAR.name(system.star),
  nation: (system: SolarSystem) => window.galaxy.nations[system.nation],
  neighbors: (system: SolarSystem) => system.lanes.map(i => window.galaxy.systems[i]),
  commonEdge: (i: number, j: number) => {
    const iData = window.galaxy.diagram.cellPolygon(i)
    const jData = window.galaxy.diagram.cellPolygon(j)
    return VORONOI.commonEdge(iData, jData)
  },
  orbits: (system: SolarSystem) => {
    return [system.star, ...STAR.orbits(system.star)]
  },
  populate: (system: SolarSystem) => {
    const nation = window.galaxy.nations[system.nation]
    const capital = window.galaxy.systems[nation.capital]
    const isCapital = system === capital
    const [main, ...orbits] = STAR.orbits(system.star)
      .filter(orbit => orbit.tag === 'orbit' && orbit.type !== 'asteroid belt')
      .filter(orbit => orbit.tag === 'orbit')
      .sort((a, b) => DESIRABILITY.get(b) - DESIRABILITY.get(a))
    if (!main) return
    const capitalPop = Math.max(
      ...SOLAR_SYSTEM.orbits(capital).map(o =>
        o.tag === 'orbit' && o.population ? o.population.code : 0
      )
    )
    const capitalTech = Math.max(
      ...SOLAR_SYSTEM.orbits(capital).map(o =>
        o.tag === 'orbit' && o.technology ? o.technology.score : 0
      )
    )
    ORBIT.populate({
      orbit: main,
      capital: isCapital,
      mainworld: true,
      maxPop: isCapital
        ? nation.systems.length > 30
          ? 10
          : nation.systems.length > 5
          ? 9
          : 8
        : Math.max(1, capitalPop - 1),
      maxTech: isCapital
        ? nation.systems.length > 20
          ? 15
          : nation.systems.length > 10
          ? 14
          : nation.systems.length > 5
          ? 13
          : 12
        : capitalTech
    })
    const maxTech = main.technology.score ?? 0
    const maxPop = (main.population?.code ?? 0) - window.dice.roll(1, 6)
    const settlements = maxPop > 0 && maxTech > 8 ? window.dice.randint(0, 6) : 0
    orbits.slice(0, settlements).forEach(orbit => ORBIT.populate({ orbit, maxPop, maxTech }))
    orbits
      .filter(orbit => !orbit.population && orbit.biosphere.code === 10)
      .forEach(orbit => ORBIT.populate({ orbit, maxPop, maxTech }))
  },
  spawn: (params: SolarSystemSpawnParams): SolarSystem => {
    const { diagram, radius } = window.galaxy
    const centerX = (diagram.xmax + diagram.xmin) / 2
    const centerY = (diagram.ymax + diagram.ymin) / 2
    const dx = params.x - centerX
    const dy = params.y - centerY
    const distance = Math.hypot(dx, dy)
    const ringSpan = Math.max(radius.max - radius.min, 1)
    const normalizedDistance = (distance - radius.min) / ringSpan
    const clamped = MATH.clamp(normalizedDistance, 0, 0.999999999)
    const ringIndex = Math.floor(clamped * letters.length)
    const letter = letters[ringIndex] ?? letters[letters.length - 1]
    const angle = (MATH.angles.degrees(Math.atan2(dy, dx)) + 360) % 360
    const degree = Math.round(angle) % 360
    const coordinate = `${letter}-${degree.toString().padStart(3, '0')}`
    return {
      ...params,
      tag: 'system',
      coordinate,
      star: {
        idx: -1,
        tag: 'star',
        name: '',
        system: -1,
        age: 0,
        distance: 0,
        angle: 0,
        spectralClass: 'O',
        luminosityClass: 'V',
        subtype: 0,
        eccentricity: 0,
        period: 0,
        au: 0,
        mass: 0,
        temperature: 0,
        diameter: 0,
        luminosity: 0,
        mao: 0,
        hzco: 0,
        orbits: [],
        r: 40
      },
      seed: window.dice.generateId(),
      lanes: [] as number[],
      nation: -1
    }
  }
}
