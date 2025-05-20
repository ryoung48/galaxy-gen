import { range, scaleLinear } from 'd3'
import { Orbit, OrbitGroupDetails } from './types'
import { Star } from '../stars/types'

function getComposition(modifiedRoll: number): string {
  if (modifiedRoll <= -4) return 'Exotic Ice'
  if (modifiedRoll >= -3 && modifiedRoll <= 2) return 'Mostly Ice'
  if (modifiedRoll >= 3 && modifiedRoll <= 6) return 'Mostly Rock'
  if (modifiedRoll >= 7 && modifiedRoll <= 11) return 'Rock and Metal'
  if (modifiedRoll >= 12 && modifiedRoll <= 14) return 'Mostly Metal'
  return 'Compressed Metal'
}

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
  return densityValues[densityRoll - 2] // 2D roll ranges from 2 to 12
}

function calculateDensity(size: number, star: Star, deviation: number) {
  // Roll 2D and apply all DMs
  let roll = window.dice.roll(2, 6)
  if (size <= 4) roll -= 1
  else if (size <= 9) roll += 1
  else roll += 3
  if (deviation <= 0) roll += 1
  else roll -= Math.floor(Math.abs(deviation))
  if (star.age > 10) roll -= 1

  const modifiedRoll = Math.min(Math.max(roll, -4), 15) // Clamp to range -4 to 15
  // Determine composition from modified roll
  const composition = getComposition(modifiedRoll)
  // Get the density using the second roll
  const densityRoll = window.dice.roll(2, 6) // Roll 2D6 for density
  return {
    density: getDensityFromTable(densityRoll, composition),
    composition: (modifiedRoll <= 2 ? 'ice' : 'rocky') as 'ice' | 'rocky'
  }
}

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
  else if (size === 14) estimate = window.dice.uniform(21600, 24800)
  return estimate / earth
}

const calculateGravity = (density: number, diameter: number) => {
  return density * diameter
}

const calculateSize: OrbitGroupDetails['size'] = ({ star, deviation, size }) => {
  const diameter = diameterEstimate(size)
  const { density, composition } = calculateDensity(size, star, deviation)
  const mass = density * diameter ** 3
  const gravity = calculateGravity(density, diameter)
  return { diameter, mass, gravity, density, composition }
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
      const roll = window.dice.roll(1, 6)
      return roll <= 4 ? ['asteroid belt'] : ['dwarf']
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
          if (roll <= 3) return 'rockball'
          if (roll <= 5) return 'meltball'
          return getRareDwarfType()
        }
        case 'inner': {
          if (parent?.group === 'asteroid belt') roll -= 2
          if (parent?.group === 'helian') roll += 1
          if (parent?.group === 'jovian') roll += 2
          if (roll <= 4) return 'rockball'
          if (roll <= 6) return 'geo-cyclic'
          if (roll === 7) return 'meltball'
          return getRareDwarfType()
        }
        case 'outer': {
          if (parent?.group === 'asteroid belt') roll -= 1
          if (parent?.group === 'helian') roll += 1
          if (parent?.group === 'jovian') roll += 2
          if (roll <= 3) return 'snowball'
          if (roll <= 6) return 'rockball'
          if (roll === 7) return 'meltball'
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
    type: ({ zone, impactZone, parent, star }) => {
      const mClass = star.spectralClass === 'M' && star.luminosityClass === 'V'
      if (impactZone) return 'acheronian'
      switch (zone) {
        case 'epistellar': {
          const roll = window.dice.roll(1, 6)
          if (roll <= 4 && !parent) return 'jani-lithic'
          if (roll <= 5 && !parent) return 'vesperian'
          return 'telluric'
        }
        case 'inner': {
          if (mClass && !parent && window.dice.random < 0.5) return 'vesperian'
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
    orbits: () => {
      const satellites = window.dice.roll(1, 6)
      const roll = window.dice.roll(1, 6)
      return roll <= 5
        ? range(satellites).map(() => 'dwarf' as Orbit['group'])
        : range(satellites - 1)
            .map(() => 'dwarf' as Orbit['group'])
            .concat([(window.dice.roll(1, 6) <= 5 ? 'terrestrial' : 'helian') as Orbit['group']])
    },
    size: ({ star }) => {
      let firstRoll = window.dice.roll(1, 6)
      const { luminosityClass, spectralClass } = star
      if (luminosityClass === 'VI' || (luminosityClass === 'V' && spectralClass === 'M'))
        firstRoll -= 1
      let diameter: number
      let mass: number
      if (firstRoll <= 2) {
        // Small Gas Giant
        diameter = window.dice.uniform(2, 6)
        mass = scaleLinear([2, 6], [10, 35])(diameter)
      } else if (firstRoll <= 4) {
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
