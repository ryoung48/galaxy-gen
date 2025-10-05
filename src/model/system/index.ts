import { ORBIT } from './orbits'
import { STAR } from './stars'
import { SolarSystem, SolarSystemSpawnParams } from './types'
import { DESIRABILITY } from './orbits/desirability'
import { VORONOI } from '../utilities/voronoi'

export const SOLAR_SYSTEM = {
  name: (system: SolarSystem) => `${system.name} #${system.idx + 1}`,
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
    ORBIT.populate({ orbit: main, capital: isCapital, mainworld: true })
    const maxTech = main.technology.score ?? 0
    const maxPop = (main.population?.code ?? 0) - window.dice.roll(1, 6)
    const settlements = maxPop > 0 && maxTech > 8 ? window.dice.randint(0, 6) : 0
    orbits.slice(0, settlements).forEach(orbit => ORBIT.populate({ orbit, maxPop, maxTech }))
    orbits
      .filter(orbit => !orbit.population && orbit.biosphere.code === 10)
      .forEach(orbit => ORBIT.populate({ orbit, maxPop, maxTech }))
  },
  spawn: (params: SolarSystemSpawnParams): SolarSystem => {
    return {
      ...params,
      tag: 'system',
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
      name: '',
      nation: -1
    }
  }
}
