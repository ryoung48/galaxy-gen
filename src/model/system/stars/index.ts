import { range } from 'd3'
import { MATH } from '../../utilities/math'
import { ORBIT } from '../orbits'
import { BaseClass, BaseClassKey, SpectralClass, Star, StarSpawnParams } from './types'
import { LANGUAGE } from '../../languages'

const base: Record<BaseClassKey, BaseClass> = {
  O: {
    type: ({ age }) => (age < 2 ? 'O' : age < 3 ? 'B' : 'M-Ib')
  },
  B: {
    type: ({ age }) => (age < 2 ? 'O' : age < 3 ? 'B' : 'M-Ib')
  },
  A: {
    type: ({ age }) =>
      age <= 2
        ? 'A-V'
        : age === 3
        ? window.dice.weightedChoice([
            {
              v: 'F-IV',
              w: 2
            },
            {
              v: 'K-III',
              w: 1
            },
            {
              v: 'D',
              w: 2
            }
          ])
        : 'D'
  },
  F: {
    type: ({ age }) =>
      age <= 5
        ? 'F-V'
        : age === 6
        ? window.dice.weightedChoice([
            {
              v: 'G-IV',
              w: 4
            },
            {
              v: 'M-III',
              w: 2
            }
          ])
        : 'D'
  },
  G: {
    type: ({ age }) =>
      age <= 11
        ? 'G-V'
        : age <= 13
        ? window.dice.weightedChoice([
            {
              v: 'K-IV',
              w: 3
            },
            {
              v: 'M-III',
              w: 3
            }
          ])
        : 'D'
  },
  K: {
    type: () => 'K-V'
  },
  M: {
    type: ({ companions }) => {
      const roll = window.dice.roll(2, 6) + companions ? 2 : 0
      return roll <= 9 ? 'M-V' : roll <= 12 ? 'M-Ve' : 'L'
    }
  },
  L: {
    type: () => 'L'
  },
  D: {
    type: () => 'D'
  }
}

const classes: Record<Star['class'], SpectralClass> = {
  O: {
    mass: [16, 90],
    radius: [6.6, 20],
    luminosity: [30_000, 1_000_000],
    temperature: [30_000, 60_000],
    color: 'blue'
  },
  B: {
    mass: [2.1, 16],
    radius: [1.8, 6.5],
    luminosity: [25, 30_000],
    temperature: [10_000, 30_000],
    color: '#aabfff'
  },
  'M-Ib': {
    mass: [8, 25],
    radius: [200, 500],
    luminosity: [25, 30_000],
    temperature: [3_000, 4_000],
    color: 'red'
  },
  'A-V': {
    mass: [1.4, 2.1],
    radius: [1.4, 1.8],
    luminosity: [5, 25],
    temperature: [3_000, 4_000],
    color: '#cad7ff'
  },
  'F-IV': {
    mass: [1.2, 1.6],
    radius: [1.5, 3],
    luminosity: [4, 25],
    temperature: [6_000, 7_500],
    color: '#F8F7FF'
  },
  'K-III': {
    mass: [0.8, 4],
    radius: [10, 30],
    luminosity: [50, 300],
    temperature: [3_500, 5_000],
    color: '#FFCC99'
  },
  'F-V': {
    mass: [1.04, 1.4],
    radius: [1.15, 1.4],
    luminosity: [1.5, 5],
    temperature: [6_000, 7_500],
    color: '#f8f7ff'
  },
  'G-IV': {
    mass: [1, 2],
    radius: [2, 6],
    luminosity: [10, 50],
    temperature: [5_000, 6_000],
    color: '#FFFFCC'
  },
  'M-III': {
    mass: [0.8, 3],
    radius: [20, 100],
    luminosity: [100, 1000],
    temperature: [3_000, 4_000],
    color: '#FF6347'
  },
  'G-V': {
    mass: [0.8, 1.04],
    radius: [0.96, 1.15],
    luminosity: [0.6, 1.5],
    temperature: [5_200, 6_000],
    color: '#fff4ea'
  },
  'K-IV': {
    mass: [0.8, 1.5],
    radius: [2, 5],
    luminosity: [6, 20],
    temperature: [4_000, 5_300],
    color: '#FFA500'
  },
  'K-V': {
    mass: [0.45, 0.8],
    radius: [0.7, 0.96],
    luminosity: [0.08, 0.6],
    temperature: [3_700, 5_200],
    color: '#ffd2a1'
  },
  'M-V': {
    mass: [0.08, 0.45],
    radius: [0.1, 0.7],
    luminosity: [0.00001, 0.08],
    temperature: [2_400, 3_700],
    color: '#ffcc6f'
  },
  'M-Ve': {
    mass: [0.08, 0.6],
    radius: [0.1, 0.7],
    luminosity: [0.00001, 0.1],
    temperature: [2_400, 3_700],
    color: '#FF4500'
  },
  L: {
    mass: [0.06, 0.08],
    radius: [0.09, 0.1],
    luminosity: [0.000001, 0.00001],
    temperature: [1_300, 2_500],
    color: '#ffcc6f'
  },
  D: {
    mass: [0.5, 1.4],
    radius: [0.008, 0.02],
    luminosity: [0.0001, 0.01],
    temperature: [5_000, 30_000],
    color: 'white'
  }
}

const incrementAngle = () => window.dice.randint(90, 270)

export const STAR = {
  classes,
  color: (star: Star): string => classes[star.class].color,
  name: (star: Star) => {
    if (!star.name) {
      const system = window.galaxy.systems[star.system]
      const nation = window.galaxy.nations[system.nation]
      star.name = LANGUAGE.word.unique({ key: 'star', lang: nation.language })
    }
    return star.name
  },
  orbits: (star: Star): Star['orbits'] =>
    star.orbits
      .map(orbit => [orbit, ...(orbit.tag === 'star' ? STAR.orbits(orbit) : ORBIT.orbits(orbit))])
      .flat(),
  parent: (star: Star) => window.galaxy.stars[star.parent ?? -1],
  spawn: ({ system, parent, distance, angle, zone }: StarSpawnParams): Star => {
    let companionsCount = parent
      ? 0
      : window.dice.weightedChoice([
          { w: 10, v: 0 },
          { w: 2, v: 1 },
          { w: 1, v: 2 }
        ])
    const supergiants: BaseClassKey[] = ['O', 'B', 'A']
    const bParent = parent?.base === 'B'
    const aParent = parent?.base === 'A'
    const fParent = parent?.base === 'F'
    const gParent = parent?.base === 'G'
    const kParent = parent?.base === 'K'
    const mParent = parent?.base === 'M'

    const spectralClass = window.dice.weightedChoice<BaseClassKey>([
      { w: bParent || aParent || fParent || gParent || kParent || mParent ? 0 : 0.3, v: 'O' },
      { w: aParent || fParent || gParent || kParent || mParent ? 0 : 0.3, v: 'B' },
      { w: fParent || gParent || kParent || mParent ? 0 : 0.3, v: 'A' },
      { w: gParent || kParent || mParent ? 0 : 2, v: 'F' },
      { w: kParent || mParent ? 0 : 2, v: 'G' },
      { w: mParent ? 0 : 2, v: 'K' },
      { w: 5, v: 'M' },
      { w: companionsCount > 0 ? 1 : companionsCount > 1 ? 2 : 0, v: 'L' }
    ])
    const supergiant = supergiants.includes(spectralClass)
    if (spectralClass === 'L') companionsCount = 0
    const systemAge =
      parent?.age ?? supergiant
        ? window.dice.roll(1, 2)
        : window.dice.roll(3, 6) - 3 + (spectralClass === 'M' ? 2 : 0)
    const luminosityClass = base[spectralClass].type({
      age: systemAge,
      companions: companionsCount
    })
    const { mass, radius, luminosity, temperature } = classes[luminosityClass]
    const selectedMass = window.dice.uniform(...mass)
    const selectedLumens = window.dice.uniform(...luminosity)
    const selectedTemperature = MATH.scale({
      domain: luminosity,
      range: temperature,
      v: selectedLumens
    })
    const selectedRadius = MATH.scale({ domain: mass, range: radius, v: selectedMass })

    const star: Star = {
      idx: window.galaxy.stars.length,
      tag: 'star',
      name: '',
      system,
      parent: parent?.idx,
      distance: distance ?? 0,
      angle: angle ?? 0,
      zone,
      age: systemAge,
      base: spectralClass,
      class: luminosityClass,
      mass: selectedMass,
      radius: selectedRadius,
      luminosity: selectedLumens,
      temperature: selectedTemperature,
      orbits: [],
      r: luminosityClass === 'D' || luminosityClass === 'L' ? 25 : window.dice.randint(30, 40)
    }
    if (parent) star.distance += star.r
    window.galaxy.stars.push(star)
    if (!parent || star.zone === 'distant') {
      const dwarfStar = luminosityClass === 'L' || luminosityClass === 'D'
      const giants = luminosityClass === 'K-III' || luminosityClass === 'M-III'
      const companions = range(companionsCount).map(() =>
        window.dice.choice<Star['zone']>(['epistellar', 'inner', 'outer', 'distant'])
      )
      const tightCompanions = companions.filter(companion => companion === 'epistellar')
      const closeCompanions = companions.filter(companion => companion === 'inner')
      const moderateCompanions = companions.filter(companion => companion === 'outer')
      const distantCompanions = companions.filter(companion => companion === 'distant')
      const mClass = luminosityClass === 'M-V' || luminosityClass === 'M-Ve'
      const lClass = luminosityClass === 'L'
      const epistellar =
        dwarfStar || giants || tightCompanions.length > 0
          ? 0
          : window.dice.randint(0, mClass ? 1 : 2)
      const inner =
        closeCompanions.length > 0 ? 0 : window.dice.randint(0, lClass ? 2 : mClass ? 4 : 5)
      const outer =
        moderateCompanions.length > 0 ? 0 : window.dice.randint(0, mClass || lClass ? 4 : 5)
      let impactZone = giants || star.class === 'D' ? window.dice.randint(1, 6) : 0
      let angle = incrementAngle()
      let distance = star.r + 5
      if (tightCompanions.length > 0) {
        tightCompanions.forEach(zone => {
          const n = STAR.spawn({ system, parent: star, distance, angle, zone })
          star.orbits.push(n)
          angle += incrementAngle()
          distance = n.distance + (n.fullR ?? n.r)
        })
        impactZone -= tightCompanions.length
      }
      range(epistellar).forEach(() => {
        const orbit = ORBIT.spawn({
          star,
          zone: 'epistellar',
          impactZone: impactZone-- > 0,
          angle,
          distance
        })
        star.orbits.push(orbit)
        angle += incrementAngle()
        distance = orbit.distance + (orbit.fullR ?? orbit.r)
      })
      if (closeCompanions.length > 0) {
        closeCompanions.forEach(zone => {
          const n = STAR.spawn({ system, parent: star, distance, angle, zone })
          star.orbits.push(n)
          angle += incrementAngle()
          distance = n.distance + (n.fullR ?? n.r)
        })
        impactZone -= closeCompanions.length
      }
      range(inner).forEach(() => {
        const orbit = ORBIT.spawn({
          star,
          zone: 'inner',
          impactZone: impactZone-- > 0,
          angle,
          distance
        })
        star.orbits.push(orbit)
        angle += incrementAngle()
        distance = orbit.distance + (orbit.fullR ?? orbit.r)
      })
      if (moderateCompanions.length > 0) {
        moderateCompanions.forEach(zone => {
          const n = STAR.spawn({ system, parent: star, distance, angle, zone })
          star.orbits.push(n)
          angle += incrementAngle()
          distance = n.distance + (n.fullR ?? n.r)
        })
        impactZone -= moderateCompanions.length
      }
      range(outer).forEach(() => {
        const orbit = ORBIT.spawn({
          star,
          zone: 'outer',
          impactZone: impactZone-- > 0,
          angle,
          distance
        })
        star.orbits.push(orbit)
        angle += incrementAngle()
        distance = orbit.distance + (orbit.fullR ?? orbit.r)
      })
      if (distantCompanions.length > 0)
        distantCompanions.forEach(zone => {
          const n = STAR.spawn({ system, parent: star, distance, angle, zone })
          star.orbits.push(n)
          angle += incrementAngle()
          distance = n.distance + (n.fullR ?? n.r)
        })
      if (parent) {
        star.fullR = distance
        star.distance += star.fullR - star.r
      }
    }
    return star
  }
}
