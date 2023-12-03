import { CONSTANTS } from '../../constants'
import { LANGUAGE } from '../../languages'
import { ORBITAL_DEPOSITS } from '../resources'
import { DICE } from '../../utilities/dice'
import { WeightedDistribution } from '../../utilities/dice/types'
import { MATH } from '../../utilities/math'
import { SolarSystemTemplate } from '../types'
import { StarTemplates, Star, StarSpawnParams } from './types'

const standardSize = { min: 20, max: 30 }

const templates: StarTemplates = {
  'o star': {
    mass: [16, 90],
    radius: [6.6, 20],
    luminosity: [30_000, 1_000_000],
    temperature: [30_000, 60_000],
    color: 'blue',
    weight: 0,
    habitability: 0,
    size: standardSize
  },
  'b star': {
    mass: [2.1, 16],
    radius: [1.8, 6.5],
    luminosity: [25, 30_000],
    temperature: [10_000, 30_000],
    color: '#aabfff',
    weight: 10,
    habitability: 0.6,
    size: standardSize
  },
  'a star': {
    mass: [1.4, 2.1],
    radius: [1.4, 1.8],
    luminosity: [5, 25],
    temperature: [7_500, 10_000],
    color: '#cad7ff',
    weight: 10,
    habitability: 0.6,
    size: standardSize
  },
  'f star': {
    mass: [1.04, 1.4],
    radius: [1.15, 1.4],
    luminosity: [1.5, 5],
    temperature: [6_000, 7_500],
    color: '#f8f7ff',
    weight: 15,
    habitability: 1,
    size: standardSize
  },
  'g star': {
    mass: [0.8, 1.04],
    radius: [0.96, 1.15],
    luminosity: [0.6, 1.5],
    temperature: [5_200, 6_000],
    color: '#fff4ea',
    weight: 30,
    habitability: 1,
    size: standardSize
  },
  'k star': {
    mass: [0.45, 0.8],
    radius: [0.7, 0.96],
    luminosity: [0.08, 0.6],
    temperature: [3_700, 5_200],
    color: '#ffd2a1',
    weight: 20,
    habitability: 1,
    size: standardSize
  },
  'm star': {
    mass: [0.08, 0.45],
    radius: [0.1, 0.7],
    luminosity: [0.00001, 0.08],
    temperature: [2_400, 3_700],
    color: '#ffcc6f',
    weight: 10,
    habitability: 0.4,
    size: standardSize
  },
  'l star': {
    mass: [0.06, 0.08],
    radius: [0.09, 0.1],
    luminosity: [0.000001, 0.00001],
    temperature: [1_300, 2_500],
    color: '#ffcc6f',
    weight: 5,
    habitability: 0.4,
    size: standardSize
  },
  't star': {
    mass: [0.005, 0.06],
    radius: [0.08, 0.09],
    luminosity: [0.0000001, 0.000001],
    temperature: [500, 1_300],
    color: '#d2a679',
    weight: 5,
    habitability: 0.4,
    size: standardSize
  },
  'm red giant': {
    mass: [0.3, 8],
    radius: [100, 800],
    luminosity: [1_000, 10_000],
    temperature: [2_500, 3_500],
    color: '#ff8770',
    weight: 10,
    habitability: 0.1,
    size: { min: 30, max: 35 }
  },
  'black hole': {
    mass: [5, 20],
    radius: [0, 0],
    luminosity: [0, 0],
    temperature: [0, 0],
    color: 'black',
    weight: 0,
    habitability: 0,
    size: standardSize
  },
  'neutron star': {
    mass: [1.4, 3],
    radius: [10, 20],
    luminosity: [0.001, 10000],
    temperature: [600_000, 1_000_000],
    color: 'white',
    weight: 0,
    habitability: 0,
    size: standardSize
  },
  pulsar: {
    mass: [1.4, 3],
    radius: [10, 20],
    luminosity: [10, 10_000],
    temperature: [600_000, 1_000_000],
    color: 'white',
    weight: 0,
    habitability: 0,
    size: standardSize
  }
}

const unary = Object.entries(templates).map(([k, v]) => ({
  v: k as Star['type'],
  w: v.weight
}))

const binary: WeightedDistribution<Star['type'][]> = [
  { w: 5, v: ['a star', 'pulsar'] },
  { w: 5, v: ['b star', 'neutron star'] },
  { w: 5, v: ['m red giant', 'b star'] },
  { w: 5, v: ['m red giant', 'f star'] },
  { w: 5, v: ['b star', 'b star'] },
  { w: 5, v: ['m star', 'g star'] },
  { w: 5, v: ['k star', 'f star'] },
  { w: 5, v: ['g star', 'f star'] },
  { w: 5, v: ['a star', 'f star'] },
  { w: 5, v: ['a star', 't star'] }
]

const trinary: WeightedDistribution<Star['type'][]> = [
  { w: 30, v: ['g star', 'm star', 'k star'] },
  { w: 30, v: ['b star', 'a star', 'f star'] },
  { w: 30, v: ['k star', 'f star', 'g star'] },
  { w: 30, v: ['b star', 'k star', 't star'] }
]

export const STAR = {
  classes: (type: SolarSystemTemplate['type']) => {
    if (type === 'binary') return [...window.dice.weightedChoice(binary)]
    if (type === 'trinary') return [...window.dice.weightedChoice(trinary)]
    return [window.dice.weightedChoice(unary)]
  },
  name: (star: Star) => {
    if (!star._name) {
      const system = STAR.system(star)
      const nation = window.galaxy.nations[system.nation]
      star._name = DICE.swap(star.seed, () =>
        LANGUAGE.word.unique({ key: 'star', lang: nation.language })
      )
    }
    return star._name
  },
  spawn: ({ system, type, orbit }: StarSpawnParams) => {
    const { mass, radius, luminosity, temperature, size } = templates[type]
    const selectedMass = window.dice.uniform(...mass)
    const selectedLumens = window.dice.uniform(...luminosity)
    const selectedTemperature = MATH.scale({
      domain: luminosity,
      range: temperature,
      v: selectedLumens
    })
    const selectedRadius = MATH.scale({ domain: mass, range: radius, v: selectedMass })
    const { x, y } = window.galaxy.systems[system]
    const star: Star = {
      idx: window.galaxy.stars.length,
      tag: 'star',
      seed: window.dice.generateId(),
      system,
      mass: selectedMass,
      radius: selectedRadius,
      luminosity: selectedLumens,
      temperature: selectedTemperature,
      type,
      orbit: { ...orbit },
      size: window.dice.randint(size.min, size.max),
      resources: [],
      ...MATH.angles.cartesian({
        radius: orbit.distance * CONSTANTS.SOLAR_SYSTEM_MOD,
        deg: orbit.angle,
        center: { x, y }
      })
    }
    ORBITAL_DEPOSITS.spawn({ object: star, primary: STAR.system(star).objects.length === 0 })
    window.galaxy.stars.push(star)
    return star.idx
  },
  system: ({ system }: Star) => window.galaxy.systems[system],
  templates
}
