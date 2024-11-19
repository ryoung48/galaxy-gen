import { STAR } from './stars'
import { SolarSystem, SolarSystemSpawnParams } from './types'

export const SOLAR_SYSTEM = {
  name: (system: SolarSystem) => `${system.name} #${system.idx + 1}`,
  nation: (system: SolarSystem) => window.galaxy.nations[system.nation],
  neighbors: (system: SolarSystem) => system.lanes.map(i => window.galaxy.systems[i]),
  orbits: (system: SolarSystem) => {
    return [system.star, ...STAR.orbits(system.star)]
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
