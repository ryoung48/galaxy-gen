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
      star: STAR.spawn({ system: params.idx }),
      seed: window.dice.generateId(),
      lanes: [] as number[],
      name: '',
      nation: -1
    }
  }
}
