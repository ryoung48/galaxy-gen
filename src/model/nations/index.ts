import { quadtree } from 'd3'
import { CONSTANTS } from '../constants'
import { SolarSystem } from '../system/types'
import { LANGUAGE } from '../languages'
import { Nation } from './types'
import { SOLAR_SYSTEM } from '../system'
import { GALAXY } from '../galaxy'
import { MATH } from '../utilities/math'
import { STAR } from '../system/stars'
import { SPECIES } from '../species'
import { ARRAY } from '../utilities/arrays'
import { HISTORY } from '../history'

const spawn = (origin: number) => {
  const language = LANGUAGE.spawn()
  const color = window.dice.color()
  const hue = MATH.extractHue(color) ?? 0
  const nation: Nation = {
    idx: window.galaxy.nations.length,
    tag: 'nation',
    name: LANGUAGE.word.unique({ lang: language, key: 'nation' }),
    language,
    species: SPECIES.spawn(),
    flag: {
      color,
      hue,
      style: window.dice.weightedChoice([
        {
          v: 'dawn',
          w: 0.5
        },
        {
          v: 'dark chromatic',
          w: 0.2
        },
        {
          v: 'light chromatic',
          w: 0.2
        },
        {
          v: 'dusk',
          w: 0.1
        }
      ])
    },
    capital: origin,
    systems: [origin]
  }
  window.galaxy.nations.push(nation)
  return nation
}

export const placement = (params: {
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
  borders: (nation: Nation) => {
    const systems = NATION.systems(nation)
      .map(system => SOLAR_SYSTEM.neighbors(system).filter(system => system.nation === -1))
      .flat()
      .map(system => system.idx)
    return ARRAY.unique(systems).map(idx => window.galaxy.systems[idx])
  },
  spawn: () => {
    // Build a list of candidate systems (excluding the galactic edge)
    const systems = GALAXY.worlds()

    // Place 60 empires equally distant from each other
    const placedSystems = placement({
      count: 60,
      spacing: 0.01, // Adjust this value to control minimum distance between empires
      whitelist: systems
    })

    // Spawn a nation for each placed system
    placedSystems.forEach(system => {
      system.homeworld = true
      const nation = spawn(system.idx)
      // Only assign the starting system to this nation
      system.nation = nation.idx
    })

    // Generate stars, names and populate all systems
    systems.forEach(system => {
      const nation = system.nation !== -1 ? window.galaxy.nations[system.nation] : null
      system.star = STAR.spawn({ system: system.idx, homeworld: system.homeworld })
      system.name = nation
        ? LANGUAGE.word.unique({ lang: nation.language, key: 'solar system' })
        : '???'
      const resources = SOLAR_SYSTEM.orbits(system).flatMap(orbit => orbit.resources).length
      if (resources === 0) system.star.resources.push({ type: 'energy', amount: 1 })
    })

    window.galaxy.nations.forEach(nation => {
      HISTORY.events.travel.spawn(nation)
    })
  },
  systems: (nation: Nation) => nation.systems.map(idx => window.galaxy.systems[idx])
}
