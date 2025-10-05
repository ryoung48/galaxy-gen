import { range, scaleLinear } from 'd3'
import { Orbit, OrbitGroupDetails } from './types'

// Looks up density from the table
function getDensityFromTable(densityRoll: number, composition: string): number {
  const densityTable: { [composition: string]: number[] } = {
    'Exotic Ice': [0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24, 0.27, 0.3, 0.33],
    'Mostly Ice': [0.18, 0.21, 0.24, 0.27, 0.3, 0.33, 0.36, 0.39, 0.41, 0.44, 0.47],
    'Mostly Rock': [0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71, 0.74, 0.77, 0.8],
    'Rock and Metal': [0.82, 0.85, 0.88, 0.91, 0.94, 0.97, 1.0, 1.03, 1.06, 1.09, 1.12],
    'Mostly Metal': [1.15, 1.18, 1.21, 1.24, 1.27, 1.3, 1.33, 1.36, 1.39, 1.42, 1.45],
    'Compressed Metal': [1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2.0]
  }

  const densityValues = densityTable[composition]
  return densityValues[densityRoll]
}

function calculateDensity(composition: Orbit['composition']['type']) {
  // Determine composition from modified roll
  const description = window.dice.weightedChoice([
    { v: 'Exotic Ice', w: composition === 'ice' ? 1 : 0 },
    { v: 'Mostly Ice', w: composition === 'ice' ? 5 : 0 },
    { v: 'Mostly Rock', w: composition === 'rocky' ? 3 : 0 },
    {
      v: 'Rock and Metal',
      w: composition === 'metallic' || composition === 'rocky' ? 4 : 0
    },
    { v: 'Mostly Metal', w: composition === 'metallic' ? 5 : 0 },
    { v: 'Compressed Metal', w: composition === 'metallic' ? 1 : 0 }
  ])
  // Get the density using the second roll
  const densityRoll = window.dice.roll(2, 6) - 2
  return {
    density: getDensityFromTable(densityRoll, description),
    description
  }
}

// function calculateDensityV2(au: number, size: number, star: Star) {
//   let roll = window.dice.roll(2, 6)
//   if (size <= 4) roll -= 1
//   else if (size <= 5) roll -= 0
//   else if (size <= 9) roll += 1
//   else if (size <= 15) roll += 3

//   const orbit = MATH.orbits.fromAU(au)
//   if (orbit <= star.hzco) roll += 1
//   else roll -= Math.floor(orbit - star.hzco)

//   if (star.age > 10) roll -= 1

//   let description = 'Exotic Ice'
//   if (roll >= 15) description = 'Compressed Metal'
//   if (roll >= 12) description = 'Mostly Metal'
//   else if (roll >= 7) description = 'Rock and Metal'
//   else if (roll >= 3) description = 'Mostly Rock'
//   else if (roll >= -3) description = 'Mostly Ice'
//   // Get the density using the second roll
//   const densityRoll = window.dice.roll(2, 6) - 2 // Roll 2D6 for density
//   return {
//     density: getDensityFromTable(densityRoll, description),
//     description
//   }
// }

const diameterEstimate = (size: number) => {
  const earth = 12800
  let estimate = 0
  if (size === -1) return 1
  else if (size === 0) estimate = window.dice.uniform(400, 800)
  else if (size === 1) estimate = window.dice.uniform(1000, 2000)
  else if (size === 2) estimate = window.dice.uniform(2800, 3600)
  else if (size === 3) estimate = window.dice.uniform(4000, 5600)
  else if (size === 4) estimate = window.dice.uniform(5600, 7200)
  else if (size === 5) estimate = window.dice.uniform(7200, 8800)
  else if (size === 6) estimate = window.dice.uniform(8800, 10400)
  else if (size === 7) estimate = window.dice.uniform(10400, 12000)
  else if (size === 8) estimate = window.dice.uniform(12000, 13600)
  else if (size === 9) estimate = window.dice.uniform(13600, 15200)
  else if (size === 10) estimate = window.dice.uniform(15200, 16800)
  else if (size === 11) estimate = window.dice.uniform(16800, 18400)
  else if (size === 12) estimate = window.dice.uniform(18400, 20000)
  else if (size === 13) estimate = window.dice.uniform(20000, 21600)
  else if (size === 14) estimate = window.dice.uniform(21600, 23199)
  else if (size === 15) estimate = window.dice.uniform(23200, 24800)
  return estimate / earth
}

const calculateGravity = (density: number, diameter: number) => {
  return density * diameter
}

const calculateSize: OrbitGroupDetails['size'] = ({ size, composition }) => {
  const diameter = diameterEstimate(size)
  const { density, description } = calculateDensity(composition)
  const mass = density * diameter ** 3
  const gravity = calculateGravity(density, diameter)
  return { diameter, mass, gravity, density, description }
}
function getRareDwarfType() {
  const randomRoll = window.dice.roll(1, 6)
  if (randomRoll <= 4) return 'hebean'
  return 'geo-tidal'
}

function getOuterRareDwarfType() {
  const randomRoll = window.dice.roll(1, 6)
  if (randomRoll <= 3) return 'hebean'
  if (randomRoll <= 5) return 'geo-cyclic'
  return 'geo-tidal'
}

export const ORBIT_GROUPS: Record<Orbit['group'], OrbitGroupDetails> = {
  'asteroid belt': {
    type: ({ parent }) => (parent ? 'asteroid' : 'asteroid belt'),
    orbits: () => {
      return range(window.dice.roll(1, 3)).map(() =>
        window.dice.weightedChoice([
          { v: 'asteroid belt', w: 5 },
          { v: 'dwarf', w: 0 }
        ])
      )
    },
    size: calculateSize
  },
  dwarf: {
    type: ({ zone, impactZone, parent }) => {
      if (impactZone) return 'stygian'
      let roll = window.dice.roll(1, 6)
      switch (zone) {
        case 'epistellar': {
          if (parent?.group === 'asteroid belt') roll -= 2
          if (roll <= 5) return 'rockball'
          return getRareDwarfType()
        }
        case 'inner': {
          if (parent?.group === 'asteroid belt') roll -= 2
          if (parent?.group === 'helian') roll += 1
          if (parent?.group === 'jovian') roll += 2
          if (roll <= 6) return 'rockball'
          if (roll <= 7) return 'geo-cyclic'
          return getRareDwarfType()
        }
        case 'outer': {
          if (parent?.group === 'asteroid belt') roll -= 1
          if (parent?.group === 'helian') roll += 1
          if (parent?.group === 'jovian') roll += 2
          if (roll <= 5) return 'snowball'
          if (roll <= 7) return 'rockball'
          return getOuterRareDwarfType()
        }
      }
    },
    orbits: () => {
      const roll = window.dice.roll(1, 6)
      return roll <= 5 ? [] : ['dwarf']
    },
    size: calculateSize
  },
  terrestrial: {
    type: ({ zone, impactZone, parent }) => {
      if (impactZone) return 'acheronian'
      switch (zone) {
        case 'epistellar': {
          const roll = window.dice.roll(1, 6)
          if (roll <= 5) return 'arid'
          return 'telluric'
        }
        case 'inner': {
          const roll = window.dice.roll(2, 6)
          if (roll <= 4) return 'telluric'
          if (roll <= 6) return 'arid'
          if (roll <= 8) return 'oceanic'
          if (roll <= 10) return 'tectonic'
          return 'telluric'
        }
        case 'outer': {
          let roll = window.dice.roll(1, 6)
          if (parent && parent?.group !== 'asteroid belt') roll += 2
          if (roll <= 4) return 'arid'
          if (roll <= 6) return 'tectonic'
          return 'oceanic'
        }
      }
    },
    orbits: () => {
      const roll = window.dice.roll(1, 6)
      return roll <= 4
        ? []
        : roll === 5
        ? ['dwarf']
        : range(window.dice.roll(1, 3)).map(() => 'dwarf')
    },
    size: calculateSize
  },
  helian: {
    type: ({ zone, impactZone }) => {
      if (impactZone) return 'asphodelian'
      const roll = window.dice.roll(1, 6)
      switch (zone) {
        case 'epistellar':
          if (roll <= 5) return 'helian'
          return 'asphodelian'
        case 'inner':
          if (roll <= 4) return 'helian'
          return 'panthalassic'
        case 'outer':
          return 'helian'
      }
    },
    orbits: () => {
      const satellites = Math.max(0, window.dice.roll(1, 6) - 3)
      const roll = satellites > 0 ? window.dice.roll(1, 6) : 0
      return roll <= 5
        ? range(satellites).map(() => 'dwarf' as Orbit['group'])
        : range(satellites - 1)
            .map(() => 'dwarf' as Orbit['group'])
            .concat(['terrestrial'])
    },
    size: calculateSize
  },
  jovian: {
    type: ({ zone, impactZone }) => {
      if (impactZone) return 'chthonian'
      const roll = window.dice.roll(1, 6)
      switch (zone) {
        case 'epistellar':
          if (roll <= 5) return 'jovian'
          return 'chthonian'
        case 'inner':
          return 'jovian'
        case 'outer':
          return 'jovian'
      }
    },
    orbits: ({ size }) => {
      const satellites = window.dice.roll(1, 6)
      const roll = window.dice.roll(1, 6)
      return roll <= 5
        ? range(satellites).map(() => 'dwarf' as Orbit['group'])
        : range(satellites - 1)
            .map(() => 'dwarf' as Orbit['group'])
            .concat([
              window.dice.weightedChoice([
                { v: 'terrestrial', w: 0.7 },
                { v: 'helian', w: 0.2 },
                { v: 'jovian', w: size > 16 ? 0.1 : 0 }
              ])
            ])
    },
    size: ({ size }) => {
      let diameter: number
      let mass: number
      if (size === 16) {
        // Small Gas Giant
        diameter = window.dice.uniform(2, 6)
        mass = scaleLinear([2, 6], [10, 35])(diameter)
      } else if (size === 17) {
        // Medium Gas Giant
        diameter = window.dice.uniform(6, 12)
        mass = scaleLinear([6, 12], [40, 340])(diameter)
      } else {
        // Large Gas Giant
        diameter = window.dice.uniform(8, 18)
        mass = scaleLinear([8, 18], [350, 2000])(diameter)
      }
      const density = mass / diameter ** 3
      const gravity = calculateGravity(density, diameter)
      return { diameter, mass, gravity, density, composition: 'gas' }
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
  },
  label: (size: number): string => {
    if (size === -1) return 'Asteroid Belt'
    if (size === 0) return 'Small Bodies 0 (600km)'
    if (size === 1) return 'Small Planets 1 (1,600km)'
    if (size === 2) return 'Luna-class 2 (3,200km)'
    if (size === 3) return 'Mercury-class 3 (4,800km)'
    if (size === 4) return 'Mars-class 4 (6,400km)'
    if (size === 5) return 'Size 5 (8,000km)'
    if (size === 6) return 'Size 6 (9,600km)'
    if (size === 7) return 'Size 7 (11,200km)'
    if (size === 8) return 'Terra-class 8 (12,800km)'
    if (size === 9) return 'Super-Earth 9 (14,400km)'
    if (size === 10) return 'Size 10 (16,000km)'
    if (size === 11) return 'Size 11 (17,600km)'
    if (size === 12) return 'Size 12 (19,200km)'
    if (size === 13) return 'Size 13 (20,800km)'
    if (size === 14) return 'Size 14 (22,400km)'
    if (size === 15) return 'Size 15 (24,000km)'
    if (size === 16) return 'Gas Giant 16 (Small)'
    if (size === 17) return 'Gas Giant 17 (Medium)'
    if (size === 18) return 'Gas Giant 18 (Large)'
    return `Size ${size}`
  }
}
