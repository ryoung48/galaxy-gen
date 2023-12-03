import { quadtree } from 'd3'
import { CONSTANTS } from '../constants'
import { SolarSystem } from '../system/types'
import { LANGUAGE } from '../languages'
import { Nation } from './types'
import { SOLAR_SYSTEM } from '../system'
import { GALAXY } from '../galaxy'
import { MATH } from '../utilities/math'

const spawn = (origin: number) => {
  const language = LANGUAGE.spawn()
  const color = window.dice.color()
  const hue = MATH.extractHue(color) ?? 0
  const nation: Nation = {
    idx: window.galaxy.nations.length,
    tag: 'nation',
    name: LANGUAGE.word.unique({ lang: language, key: 'nation' }),
    language,
    flag: {
      color,
      hue,
      style: window.dice.weightedChoice([
        {
          v: 'standard',
          w: 0.5
        },
        {
          v: 'monochrome',
          w: 0.1
        },
        {
          v: 'contrast',
          w: 0.4
        }
      ])
    },
    origin,
    systems: [origin]
  }
  window.galaxy.nations.push(nation)
  return nation
}

const floodFill = <T>(params: {
  start: T[]
  neighbors: (cell: T) => T[]
  visit: (src: T, dst: T) => void
  uid: (cell: T) => string | number
}) => {
  const queue = [...params.start]
  const visited = new Set(queue.map(params.uid))
  while (queue.length > 0) {
    const cell = queue.shift()
    if (!cell) continue
    params.neighbors(cell).forEach(neighbor => {
      if (!visited.has(params.uid(neighbor))) {
        params.visit(cell, neighbor)
        visited.add(params.uid(neighbor))
        queue.push(neighbor)
      }
    })
  }
}

const placement = (params: {
  count: number
  spacing: number
  whitelist: SolarSystem[]
  blacklist?: SolarSystem[]
}) => {
  const spacing = (CONSTANTS.W + CONSTANTS.H) * params.spacing
  const placed: SolarSystem[] = []
  // create a quad tree to quickly find the nearest city
  const tree = quadtree().extent([
    [0, 0],
    [CONSTANTS.W, CONSTANTS.H]
  ])
  const { blacklist = [], whitelist, count } = params
  // everything in the blacklist starts in the quad tree
  blacklist.forEach(({ x, y }) => {
    tree.add([x, y])
  })
  // place cities by iterating through the (pre-sorted) whitelist
  for (let i = 0; i < whitelist.length && placed.length < count; i++) {
    const cell = whitelist[i]
    const { x, y } = cell
    const closest = tree.find(x, y)
    const dist = closest ? Math.hypot(x - closest[0], y - closest[1]) : Infinity
    if (dist > spacing) {
      placed.push(cell)
      tree.add([x, y])
    }
  }
  if (placed.length < count) console.log(`placement failure: ${placed.length} / ${count}`)
  return placed
}

export const NATION = {
  spawn: () => {
    const count = window.galaxy.systems.length / 20
    const placed = placement({
      count: window.galaxy.systems.length / 20,
      spacing: (50 * 0.03) / count,
      whitelist: GALAXY.worlds()
    })
    placed.forEach(system => {
      const nation = spawn(system.idx)
      system.nation = nation.idx
      system.homeworld = true
    })
    floodFill({
      start: placed,
      neighbors: SOLAR_SYSTEM.neighbors,
      visit: (src, dst) => {
        dst.nation = src.nation
        window.galaxy.nations[dst.nation].systems.push(dst.idx)
      },
      uid: ({ idx: i }) => i
    })
    GALAXY.worlds().forEach(system => {
      const nation = SOLAR_SYSTEM.nation(system)
      system.name = LANGUAGE.word.unique({
        lang: nation.language,
        key: 'solar system'
      })
      SOLAR_SYSTEM.populate(system)
    })
  },
  systems: (nation: Nation) => nation.systems.map(idx => window.galaxy.systems[idx])
}
