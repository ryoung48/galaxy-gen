import { CONSTANTS } from '../../constants'
import { LANGUAGE } from '../../languages'
import { ORBITAL_DEPOSITS } from '../resources'
import { DICE } from '../../utilities/dice'
import { MATH } from '../../utilities/math'
import { TEXT } from '../../utilities/text'
import { SolarSystem } from '../types'
import { Satellite, SatelliteSpawnParams, SatelliteTemplate } from './types'

const standardSize: SatelliteTemplate['sizes'] = { planet: [4, 6], moon: [1, 2] }

const templatesMisc: Record<Satellite['type'], SatelliteTemplate> = {
  habitable: {
    weight: 9,
    sizes: standardSize,
    zone: { min: 60, max: 100 },
    color: 'blue'
  },
  'gas giant': {
    weight: 6,
    sizes: { planet: [7, 10] },
    space: 1,
    zone: { min: 40, max: 1000 },
    color: 'white'
  },
  asteroid: {
    weight: 5,
    sizes: { planet: [1, 2] },
    zone: { min: 0, max: Infinity },
    color: 'gray'
  },
  molten: {
    weight: 15,
    sizes: standardSize,
    zone: { min: 0, max: 60 },
    color: 'red'
  },
  barren: {
    weight: 25,
    sizes: standardSize,
    zone: { min: 40, max: 200 },
    color: 'gray'
  },
  toxic: {
    weight: 15,
    sizes: standardSize,
    zone: { min: 60, max: 110 },
    color: 'green'
  },
  frozen: {
    weight: 15,
    sizes: standardSize,
    zone: { min: 120, max: 1000 },
    color: 'purple'
  }
}

const dist = Object.entries(templatesMisc).map(([k, v]) => ({
  v: k as Satellite['type'],
  w: v.weight
}))

export const SATELLITE = {
  classification: (satellite: Satellite) =>
    `${TEXT.title(satellite.type)}${
      satellite.type !== 'asteroid' && satellite.type !== 'gas giant'
        ? ` ${satellite.moon ? 'Moon' : 'Planet'}`
        : ''
    }`,
  moons: (satellite: Satellite) => satellite.moons.map(i => window.galaxy.satellites[i]),
  name: (satellite: Satellite) => {
    if (!satellite._name) {
      const system = SATELLITE.system(satellite)
      const nation = window.galaxy.nations[system.nation]
      satellite._name = DICE.swap(satellite.seed, () =>
        LANGUAGE.word.unique({ key: 'satellite', lang: nation.language })
      )
    }
    return satellite._name
  },
  parent: (satellite: Satellite) => {
    return satellite.parent
      ? satellite.parent.type === 'star'
        ? window.galaxy.stars[satellite.parent.idx]
        : window.galaxy.satellites[satellite.parent.idx]
      : undefined
  },
  spawn: ({ parent: p, moon, habitability, type, orbit, system }: SatelliteSpawnParams) => {
    const { x, y } = window.galaxy.systems[system]
    const parent =
      p?.type === 'star' ? window.galaxy.stars[p.idx] : window.galaxy.satellites[p?.idx ?? -1]
    const px = parent?.x ?? x
    const py = parent?.y ?? y
    const distance = (moon ? parent?.orbit?.distance ?? 0 : 0) + orbit.distance
    const selected =
      type ??
      window.dice.weightedChoice(
        dist.map(({ v, w }) => {
          const { zone } = templatesMisc[v]
          const invalidMoon = moon && !templatesMisc[v].sizes.moon
          const invalidZone = distance < zone.min || distance > zone.max
          return {
            v,
            w: invalidMoon || invalidZone ? 0 : v === 'habitable' ? w * habitability : w
          }
        })
      )
    const { sizes } = templatesMisc[selected]
    const satellite: Satellite = {
      idx: window.galaxy.satellites.length,
      tag: 'satellite',
      seed: window.dice.generateId(),
      system,
      parent: p,
      moon,
      type: selected,
      orbit: { ...orbit },
      size: window.dice.randint(...(moon ? sizes.moon ?? sizes.planet : sizes.planet)),
      resources: [],
      moons: [],
      ...MATH.angles.cartesian({
        radius: orbit.distance * CONSTANTS.SOLAR_SYSTEM_MOD,
        deg: orbit.angle,
        center: { x: px, y: py }
      }),
      climate:
        type === 'habitable'
          ? window.dice.choice<Satellite['climate']>([
              'desert',
              'arid',
              'savannah',
              'tropical',
              'continental',
              'ocean',
              'tundra',
              'arctic',
              'alpine'
            ])
          : undefined
    }
    ORBITAL_DEPOSITS.spawn({ object: satellite })
    window.galaxy.satellites.push(satellite)
    return satellite.idx
  },
  system: ({ system }: Satellite): SolarSystem => window.galaxy.systems[system],
  templates: templatesMisc
}
