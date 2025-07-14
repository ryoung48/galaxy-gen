import { range } from 'd3'
import { WeightedDistribution } from '../../utilities/dice/types'
import { Orbit, OrbitClassDetails } from './types'

const sizes = {
  small: () => window.dice.randint(0, 4),
  medium: () => window.dice.randint(5, 10),
  large: () => window.dice.randint(11, 15),
  giant: () => window.dice.randint(16, 18)
}

const variableSizes = () =>
  window.dice.weightedChoice([
    { v: sizes.small, w: 3 },
    { v: sizes.medium, w: 3 },
    { v: sizes.large, w: 1 }
  ])()

export const MOON = {
  orbits: {
    terrestrial: (({ habitable, zone, giant }) =>
      range(window.dice.choice([0, 1])).map(() =>
        window.dice.weightedChoice(MOON.spawn(habitable, giant)[zone])
      )) as OrbitClassDetails['orbits'],
    jovian: (({ habitable, zone, giant }) =>
      range(window.dice.randint(1, 4)).map(() =>
        window.dice.weightedChoice(MOON.spawn(habitable, giant)[zone])
      )) as OrbitClassDetails['orbits']
  },
  spawn: (
    habitable: number,
    giant: boolean
  ): Record<Orbit['zone'], WeightedDistribution<Orbit['type']>> => ({
    epistellar: [
      { v: 'barren', w: 10 },
      { v: 'molten', w: 2 }
    ],
    inner: [
      { v: 'barren', w: 10 },
      { v: 'desert', w: giant ? habitable / 9 : 0 },
      { v: 'arid', w: giant ? habitable / 9 : 0 },
      { v: 'savanna', w: giant ? habitable / 9 : 0 },
      { v: 'oceanic', w: giant ? habitable / 9 : 0 },
      { v: 'continental', w: giant ? habitable / 9 : 0 },
      { v: 'tropical', w: giant ? habitable / 9 : 0 },
      { v: 'tundra', w: giant ? habitable / 9 : 0 },
      { v: 'alpine', w: giant ? habitable / 9 : 0 },
      { v: 'arctic', w: giant ? habitable / 9 : 0 },
      { v: 'toxic', w: giant ? 2 : 0 },
      { v: 'molten', w: 1 }
    ],
    outer: [
      { v: 'frozen', w: 10 },
      { v: 'molten', w: 1 }
    ]
  }),
  sizes: (orbit: Orbit, moon: Orbit['type']) => {
    const roll = window.dice.roll(1, 6)
    let size: number = 0
    if (roll <= 1 || orbit.type === 'asteroid belt') size = 0
    if (ORBIT_CLASSIFICATION[moon].habitable || moon === 'toxic') return sizes.medium()
    else if (roll <= 5) size = Math.min(window.dice.roll(1, 3) - 1, orbit.size - 1)
    else {
      if (orbit.type === 'gas giant') {
        const roll2 = window.dice.roll(1, 6)
        if (roll2 <= 3) size = window.dice.roll(1, 6)
        else if (roll2 <= 5) size = window.dice.roll(2, 6) - 2
        else size = window.dice.roll(2, 6) + 3
      } else {
        size = orbit.size - 1 - window.dice.roll(1, 6)
        if (size === orbit.size - 2) {
          const roll2 = window.dice.roll(2, 6)
          if (roll2 == 2) size = orbit.size - 1
          else if (roll2 == 12) size = orbit.size
        }
      }
    }
    return Math.max(0, size)
  }
}

export const ORBIT_CLASSIFICATION: Record<Orbit['type'], OrbitClassDetails> = {
  'asteroid belt': {
    color: '#000000',
    size: () => -1,
    orbits: () => range(window.dice.randint(1, 3)).map(() => 'asteroid'),
    asteroidBelt: true
  },
  'ice asteroid belt': {
    color: '#000000',
    size: () => -1,
    orbits: () => range(window.dice.randint(1, 3)).map(() => 'ice asteroid'),
    asteroidBelt: true
  },
  asteroid: {
    color: '#778899',
    size: () => 0,
    orbits: () => [],
    asteroid: true
  },
  'ice asteroid': {
    color: '#ADD8E6',
    size: () => 0,
    orbits: () => [],
    asteroid: true
  },
  barren: {
    color: '#8B7D7B',
    size: variableSizes,
    orbits: MOON.orbits.terrestrial
  },
  desert: {
    color: '#D4A574', // Sandy brown - represents arid desert landscapes
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'dry'
  },
  arid: {
    color: '#C19A6B', // Earthy brown - represents dry, rocky terrain
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'dry'
  },
  savanna: {
    color: '#8FBC8F', // Dark sea green - represents grasslands and savanna
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'dry'
  },
  oceanic: {
    color: '#4682B4', // Steel blue - represents deep ocean worlds
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'wet'
  },
  continental: {
    color: '#22897a', // Forest green - represents Earth-like continents
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'wet'
  },
  tropical: {
    color: '#32CD32', // Lime green - represents lush tropical environments
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'wet'
  },
  tundra: {
    color: '#B0C4DE', // Light steel blue - represents cold tundra plains
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'cold'
  },
  alpine: {
    color: '#F5F5DC', // Beige - represents snow-capped mountain ranges
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'cold'
  },
  arctic: {
    color: '#F0F8FF', // Alice blue - represents frozen arctic worlds
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial,
    habitable: true,
    climate: 'cold'
  },
  frozen: {
    color: '#ADD8E6',
    size: variableSizes,
    orbits: MOON.orbits.terrestrial
  },
  molten: {
    color: '#FF4500',
    size: variableSizes,
    orbits: MOON.orbits.terrestrial
  },
  toxic: {
    color: '#8B0000',
    size: sizes.medium,
    orbits: MOON.orbits.terrestrial
  },
  'gas giant': {
    color: '#FFDAB9',
    size: sizes.giant,
    orbits: MOON.orbits.jovian
  }
}
