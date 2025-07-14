import { STAR } from './stars'
import { SolarSystem, SolarSystemSpawnParams } from './types'
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
  spawn: (params: SolarSystemSpawnParams): SolarSystem => {
    return {
      ...params,
      tag: 'system',
      star: {
        idx: -1,
        tag: 'star',
        name: '',
        system: -1,
        distance: 0,
        angle: 0,
        type: 'a star',
        orbits: [],
        resources: [],
        r: 40
      },
      seed: window.dice.generateId(),
      lanes: [] as number[],
      name: '',
      nation: -1
    }
  }
}

export const SIZE = {
  colors: (size: number): string => {
    if (size === -1) return '#8b4513' // saddle brown - asteroid belt
    if (size === 0) return '#a0522d' // sienna - small bodies
    if (size === 1) return '#cd853f' // peru - small planets
    if (size === 2) return '#daa520' // goldenrod - Luna-class
    if (size === 3) return '#b8860b' // dark goldenrod - Mercury-class
    if (size === 4) return '#ff8c00' // dark orange - Mars-class
    if (size === 5) return '#ffa500' // orange - size 5
    if (size === 6) return '#ffd700' // gold - size 6
    if (size === 7) return '#9acd32' // yellow-green - size 7
    if (size === 8) return '#228b22' // forest green - Terra-class
    if (size === 9) return '#32cd32' // lime green - Super-Earth
    if (size === 10) return '#00ced1' // dark turquoise - size A
    if (size === 11) return '#4169e1' // royal blue - size B
    if (size === 12) return '#0000ff' // blue - size C
    if (size === 13) return '#4b0082' // indigo - size D
    if (size === 14) return '#8a2be2' // blue violet - size E
    if (size === 15) return '#9370db' // medium purple - size F
    if (size === 16) return '#ba55d3' // medium orchid - small gas giant
    if (size === 17) return '#da70d6' // orchid - medium gas giant
    if (size === 18) return '#ff69b4' // hot pink - large gas giant
    return '#808080' // fallback gray
  }
}
