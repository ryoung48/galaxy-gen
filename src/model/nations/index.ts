import { quadtree, range } from 'd3'
import { CONSTANTS } from '../constants'
import { SolarSystem } from '../system/types'
import { LANGUAGE } from '../languages'
import { Nation } from './types'
import { SOLAR_SYSTEM } from '../system'
import { GALAXY } from '../galaxy'
import { MATH } from '../utilities/math'
import { STAR } from '../system/stars'
import { getTradeRoutes } from '../galaxy/trade'

const distribute = <Item>(params: {
  items: Item[]
  percentages: number[]
  buckets: [number, number][]
  neighbors: (_item: Item) => Item[]
  sorted?: (_items: Item[]) => Item[]
}) => {
  const { items, percentages, buckets, neighbors, sorted } = params
  const N = items.length // total number of items

  // Average sizes for each category
  const averageSizes = buckets.map(b => (b[0] + b[1]) / 2)

  // Compute D
  const D = percentages.reduce((sum, p, i) => sum + p * averageSizes[i], 0)

  // Total number of nations
  const M = N / D

  // Initial number of nations in each category
  const categories = percentages.map(p => Math.floor(M * p))

  // Adjust to ensure total groups sum to M
  const totalGroups = categories.reduce((sum, n) => sum + n, 0)
  const remainingGroups = Math.round(M) - totalGroups
  categories[0] += remainingGroups

  // Generate group sizes
  const groupSizes: number[] = categories
    .map((n, i) => range(n).map(() => window.dice.randint(...buckets[i])))
    .flat()
    .reverse()

  // Create a set of unassigned provinces
  const unassignedItems = new Set(items)

  // create assignments for later
  const assignments = new Map<Item, number>()

  // create the final result
  const groups: Item[][] = []

  // For each group size, create a group
  for (const groupSize of groupSizes) {
    const sortedItems = sorted ? sorted([...unassignedItems]) : [...unassignedItems]
    for (let attempt = 0; attempt < 20; attempt++) {
      // Pick a random starting province
      const startingItem = attempt > 10 ? window.dice.choice(sortedItems) : sortedItems[attempt]
      if (!startingItem) break
      const groupItems = [startingItem]

      const itemQueue = [startingItem]
      const visited = new Set([startingItem])

      while (groupItems.length < groupSize && itemQueue.length > 0) {
        const currentItem = itemQueue.shift()!
        const nextItems = neighbors(currentItem)

        for (const nextItem of nextItems) {
          const unassigned = unassignedItems.has(nextItem)
          if (unassigned && !visited.has(nextItem!)) {
            groupItems.push(nextItem!)
            itemQueue.push(nextItem!)
            visited.add(nextItem!)
            if (groupItems.length >= groupSize) break
          }
        }
      }

      if (groupItems.length >= groupSize) {
        groups.push(groupItems)
        // Remove assigned provinces from unassignedProvinces
        for (const item of groupItems) {
          unassignedItems.delete(item)
          assignments.set(item, groups.length - 1)
        }
        break
      }
    }
  }

  Array.from(unassignedItems).forEach(item => {
    if (unassignedItems.has(item)) {
      const candidates = neighbors(item).filter(p => assignments.has(p))
      if (candidates.length > 0) {
        const neighbor = window.dice.choice(candidates)
        assignments.set(item, assignments.get(neighbor)!)
        groups[assignments.get(neighbor)!].push(item)
        unassignedItems.delete(item)
      }
    }
  })

  return { groups, unassigned: Array.from(unassignedItems) }
}

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
    systems: [origin],
    government: window.dice.weightedChoice([
      { v: 'fragmented', w: 0.1 },
      { v: 'confederation', w: 0.2 },
      { v: 'oligarchy', w: 0.2 },
      { v: 'republic', w: 0.2 },
      { v: 'autocracy', w: 0.2 },
      { v: 'theocracy', w: 0.1 }
    ])
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
  spawn: () => {
    // Build a list of candidate systems (excluding the galactic edge)
    const systems = GALAXY.worlds()

    // Use the generic distribute helper to partition the galaxy
    const { groups, unassigned } = distribute({
      items: systems,
      percentages: [0.4, 0.3, 0.2, 0.08, 0.02, 0.01],
      buckets: [
        [1, 1],
        [2, 4],
        [5, 14],
        [15, 29],
        [30, 60],
        [61, 200]
      ],
      neighbors: SOLAR_SYSTEM.neighbors
    })

    // Spawn a nation for each group
    groups.forEach(group => {
      // Choose the system closest to the group's centroid as the capital
      const centroid = group.reduce(
        (acc, s) => {
          acc.x += s.x
          acc.y += s.y
          return acc
        },
        { x: 0, y: 0 }
      )
      centroid.x /= group.length
      centroid.y /= group.length

      const capital = group.reduce(
        (closest, s) => {
          const d = Math.hypot(s.x - centroid.x, s.y - centroid.y)
          return d < closest.dist ? { sys: s, dist: d } : closest
        },
        { sys: group[0], dist: Infinity }
      ).sys
      capital.homeworld = true
      const nation = spawn(capital.idx)
      // Assign every system in the group to this nation
      group.forEach(sys => {
        sys.nation = nation.idx
        if (!nation.systems.includes(sys.idx)) nation.systems.push(sys.idx)
      })
    })

    // Any leftover isolated systems are attached to the nearest neighbour nation
    unassigned.forEach(sys => {
      const candidates = SOLAR_SYSTEM.neighbors(sys).filter(n => n.nation !== -1)
      if (candidates.length) {
        const neighbor = window.dice.choice(candidates)
        const nation = window.galaxy.nations[neighbor.nation]
        sys.nation = nation.idx
        nation.systems.push(sys.idx)
      }
    })

    // Generate stars, names and populate all systems now that borders are finalised
    systems.forEach(system => {
      system.star = STAR.spawn({ system: system.idx, homeworld: system.homeworld })
    })

    // Populate every system with settlements/resources
    NATION.setWars()
    window.galaxy.nations.forEach(nation => {
      nation.systems
        .map(idx => window.galaxy.systems[idx])
        .forEach(system => SOLAR_SYSTEM.populate(system))
    })
    window.galaxy.routes = getTradeRoutes()
  },
  systems: (nation: Nation) => nation.systems.map(idx => window.galaxy.systems[idx]),
  isSystemUnderAttack: (systemIdx: number) => {
    const system = window.galaxy.systems[systemIdx]
    const nation = window.galaxy.nations[system.nation]

    if (!nation?.wars) return false

    // Check if this system borders any attacking nation
    return nation.wars.some(war => {
      const attackerNation = window.galaxy.nations[war.attacker]
      return SOLAR_SYSTEM.neighbors(system).some(neighbor => neighbor.nation === attackerNation.idx)
    })
  },
  setWars: () => {
    // Calculate border lengths between nations
    const borderCounts = new Map<string, number>()

    window.galaxy.systems.forEach(system => {
      if (system.nation === -1) return

      const systemNation = system.nation
      const neighbors = SOLAR_SYSTEM.neighbors(system)

      neighbors.forEach(neighbor => {
        if (neighbor.nation !== -1 && neighbor.nation !== systemNation) {
          const key = [systemNation, neighbor.nation].sort().join('-')
          borderCounts.set(key, (borderCounts.get(key) || 0) + 1)
        }
      })
    })

    // Sort nation pairs by border length (descending)
    const sortedBorders = Array.from(borderCounts.entries())
      .map(([key, count]) => {
        const [nation1, nation2] = key.split('-').map(Number)
        return { nation1, nation2, borderLength: count }
      })
      .sort((a, b) => b.borderLength - a.borderLength)

    // Set wars for top border pairs with some randomness
    const numWars = Math.min(
      Math.floor(window.galaxy.nations.length * 0.1), // ~10% of nations
      Math.floor(sortedBorders.length * 0.15) // ~15% of border pairs
    )

    const usedNations = new Set<number>()
    let warsCreated = 0

    for (const { nation1, nation2, borderLength } of sortedBorders) {
      if (warsCreated >= numWars) break
      if (usedNations.has(nation1) || usedNations.has(nation2)) continue

      // Higher chance for larger borders, but some randomness
      const warChance = Math.min(0.8, borderLength / 10)
      if (window.dice.random > warChance) continue

      // Randomly assign attacker and defender
      const [attacker, defender] = window.dice.flip ? [nation1, nation2] : [nation2, nation1]

      // Add war to defender's wars array
      const defenderNation = window.galaxy.nations[defender]
      if (!defenderNation.wars) defenderNation.wars = []
      defenderNation.wars.push({ attacker, defender })

      usedNations.add(nation1)
      usedNations.add(nation2)
      warsCreated++
    }
  }
}
