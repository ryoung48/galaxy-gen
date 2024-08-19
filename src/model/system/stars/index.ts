import { range, scaleLinear } from 'd3'
import { ORBIT } from '../orbits'
import { Star, StarSpawnParams } from './types'
import { LANGUAGE } from '../../languages'

const incrementAngle = () => window.dice.randint(90, 270)

const spectralAttributes: Record<Star['class']['spectral'], { color: string; range: number[] }> = {
  O: { color: '#7cc6ff', range: [0, 2] },
  B: { color: '#d8eeff', range: [2, 4] },
  A: { color: '#ffffff', range: [4, 6] },
  F: { color: '#fffcd3', range: [6, 8] },
  G: { color: '#fff772', range: [8, 10] },
  K: { color: '#ffc37f', range: [10, 12] },
  M: { color: '#ff9719', range: [12, 15] }
}

const starMass: Record<Star['class']['luminosity'], number[]> = {
  Ia: [200, 80, 60, 30, 20, 15, 13, 12, 12, 13, 14, 18, 20, 25, 30],
  Ib: [150, 60, 40, 25, 15, 13, 12, 10, 10, 11, 12, 13, 15, 20, 25],
  II: [130, 40, 30, 20, 14, 11, 10, 8, 8, 10, 10, 12, 14, 16, 18],
  III: [110, 30, 20, 10, 8, 6, 4, 3, 2.5, 2.4, 1.1, 1.5, 1.8, 2.4, 8],
  IV: [20, 20, 20, 10, 4, 2.3, 2, 1.5, 1.7, 1.2, 1.5, 1.5, 1.5, 1.5, 1.5],
  V: [90, 60, 18, 5, 2.2, 1.8, 1.5, 1.3, 1.1, 0.9, 0.8, 0.7, 0.5, 0.16, 0.08],
  VI: [2, 1.5, 0.5, 0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.12, 0.075]
}

const starTemp = [
  50000, 40000, 30000, 15000, 10000, 8000, 7500, 6500, 6000, 5600, 5200, 4400, 3700, 3000, 2400
]

const starDiameter: Record<Star['class']['luminosity'], number[]> = {
  Ia: [25, 22, 20, 60, 120, 180, 210, 280, 330, 360, 420, 600, 900, 1200, 1800],
  Ib: [24, 20, 14, 25, 50, 75, 85, 115, 135, 150, 180, 260, 380, 600, 800],
  II: [22, 18, 12, 14, 30, 45, 50, 66, 77, 90, 110, 160, 230, 350, 500],
  III: [21, 15, 10, 6, 5, 5, 5, 5, 10, 15, 20, 40, 60, 100, 200],
  IV: [8, 8, 8, 5, 4, 3, 3, 2, 3, 4, 6, 6, 6, 6, 6],
  V: [20, 12, 7, 3.5, 2.2, 2, 1.7, 1.5, 1.1, 0.95, 0.9, 0.8, 0.7, 0.2, 0.1],
  VI: [0.18, 0.18, 0.2, 0.5, 0.5, 0.6, 0.6, 0.8, 0.8, 0.7, 0.6, 0.5, 0.4, 0.1, 0.08]
}

const starClass = (parent?: Star, homeworld?: boolean) => {
  const parentClass = parent?.class?.spectral
  let spectralRoll = window.dice.roll(2, 6)
  let luminosity: Star['class']['luminosity'] = 'V'
  let spectral: Star['class']['spectral'] = 'G'
  if (spectralRoll <= 3 && !homeworld) {
    spectralRoll = window.dice.roll(2, 6) + 2
    let lumRoll = window.dice.roll(2, 6)
    if (lumRoll <= 5) luminosity = 'VI'
    else if (lumRoll <= 8) luminosity = 'IV'
    else if (lumRoll <= 10) luminosity = 'III'
    else {
      lumRoll = window.dice.roll(2, 6)
      if (lumRoll <= 8) luminosity = 'III'
      else if (lumRoll <= 10) luminosity = 'II'
      else if (lumRoll === 11) luminosity = 'Ib'
      else luminosity = 'Ia'
    }
  }
  const subGiant = luminosity === 'IV'
  const subDwarf = luminosity === 'VI'
  if (spectralRoll >= 12 && homeworld) spectralRoll -= 2
  if (spectralRoll <= 6 && subGiant) spectralRoll += 5
  if (spectralRoll <= 6 || parentClass === 'K' || parentClass === 'M') spectral = 'M'
  else if (spectralRoll <= 8 || parentClass === 'G') spectral = 'K'
  else if (spectralRoll <= 10 || parentClass === 'F') spectral = 'G'
  else if (spectralRoll <= 11 || parentClass === 'A') spectral = subDwarf ? 'G' : 'F'
  else if (spectralRoll === 12) {
    spectralRoll = window.dice.roll(2, 6)
    if ((spectralRoll <= 9 || parentClass === 'B') && !subDwarf) spectral = 'A'
    else if (spectralRoll <= 11 || subGiant || parentClass === 'O') spectral = 'B'
    else spectral = 'O'
  }
  let subtype = window.dice.randint(0, 9)
  if (spectral === 'K' && subtype > 4) subtype -= 5
  if (spectral === 'M' && parentClass === 'M')
    subtype = Math.max(0, (parent?.class?.subtype ?? 0) - 1)
  return { spectral, luminosity, subtype }
}

const isGiant = (luminosityClass: Star['class']['luminosity']) =>
  luminosityClass === 'III' ||
  luminosityClass === 'II' ||
  luminosityClass === 'Ib' ||
  luminosityClass === 'Ia'

export const STAR = {
  classes: spectralAttributes,
  color: (star: Star): string =>
    isGiant(star.class.luminosity) ? 'red' : spectralAttributes[star.class.spectral].color,
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
  spawn: ({ system, parent, distance, angle, zone, homeworld }: StarSpawnParams): Star => {
    const classAttributes = starClass(parent, homeworld)
    const { spectral } = classAttributes
    const { range: r } = spectralAttributes[spectral]
    const luminosityClass = classAttributes.luminosity
    const domain = range(15)
    const idx = scaleLinear([0, 9], r)(classAttributes.subtype)
    const mass = scaleLinear(domain, starMass[luminosityClass])(idx)
    const temperature = scaleLinear(domain, starTemp)(idx)
    const diameter = scaleLinear(domain, starDiameter[luminosityClass])(idx)
    const luminosity = diameter ** 2 * (temperature / 5772) ** 4

    const companionsCount = parent
      ? 0
      : window.dice.weightedChoice([
          { w: 10, v: 0 },
          { w: 2, v: 1 },
          { w: 1, v: 2 }
        ])

    const systemAge =
      parent?.age ??
      (spectral === 'O' || spectral === 'B' || spectral === 'A'
        ? window.dice.roll(1, 2)
        : window.dice.roll(3, 6) - 3 + (spectral === 'M' ? 2 : 0))

    const star: Star = {
      idx: window.galaxy.stars.length,
      tag: 'star',
      name: '',
      system,
      age: systemAge,
      parent: parent?.idx,
      distance: distance ?? 0,
      angle: angle ?? 0,
      zone,
      class: classAttributes,
      mass,
      temperature,
      diameter,
      luminosity,
      orbits: [],
      r: parent ? 35 : 40
    }
    if (parent) star.distance += star.r
    window.galaxy.stars.push(star)
    if (!parent || star.zone === 'distant') {
      const giants = isGiant(luminosityClass)
      const companions = range(companionsCount).map(() =>
        window.dice.weightedChoice<Star['zone']>([
          { w: giants ? 0 : 1, v: 'epistellar' },
          { w: homeworld ? 0 : 1, v: 'inner' },
          { w: 1, v: 'outer' },
          { w: 1, v: 'distant' }
        ])
      )
      const tightCompanions = companions.filter(companion => companion === 'epistellar')
      const closeCompanions = companions.filter(companion => companion === 'inner')
      const moderateCompanions = companions.filter(companion => companion === 'outer')
      const distantCompanions = companions.filter(companion => companion === 'distant')
      const mClass = spectral === 'M'
      const epistellar =
        giants || tightCompanions.length > 0 ? 0 : window.dice.randint(0, mClass ? 1 : 2)
      const inner = closeCompanions.length > 0 ? 0 : window.dice.randint(1, mClass ? 4 : 5)
      const outer = moderateCompanions.length > 0 ? 0 : window.dice.randint(0, mClass ? 4 : 5)
      let angle = incrementAngle()
      let distance = star.r + 10
      let impactZone = giants ? window.dice.randint(1, 3) : 0
      if (tightCompanions.length > 0) {
        tightCompanions.forEach(zone => {
          const n = STAR.spawn({
            system,
            parent: star,
            distance,
            angle,
            zone
          })
          star.orbits.push(n)
          angle += incrementAngle()
          distance = n.distance + (n.fullR ?? n.r)
        })
      }
      range(epistellar).forEach(() => {
        const orbit = ORBIT.spawn({
          star,
          zone: 'epistellar',
          angle,
          distance,
          impactZone: impactZone-- > 0,
          deviation: -1.2
        })
        star.orbits.push(orbit)
        angle += incrementAngle()
        distance = orbit.distance + (orbit.fullR ?? orbit.r)
      })
      if (closeCompanions.length > 0) {
        closeCompanions.forEach(zone => {
          const n = STAR.spawn({
            system,
            parent: star,
            distance,
            angle,
            zone
          })
          star.orbits.push(n)
          angle += incrementAngle()
          distance = n.distance + (n.fullR ?? n.r)
        })
      }
      const deviations = range(inner)
        .map(() => window.dice.uniform(-1.15, 1.15))
        .slice(homeworld ? 1 : 0)
        .concat(homeworld ? [0] : [])
        .sort((a, b) => a - b)
      range(inner).forEach((_, i) => {
        const orbit = ORBIT.spawn({
          star,
          zone: 'inner',
          angle,
          distance,
          impactZone: impactZone-- > 0,
          deviation: deviations[i],
          homeworld: homeworld && deviations[i] === 0
        })
        star.orbits.push(orbit)
        angle += incrementAngle()
        distance = orbit.distance + (orbit.fullR ?? orbit.r)
      })
      if (moderateCompanions.length > 0) {
        moderateCompanions.forEach(zone => {
          const n = STAR.spawn({
            system,
            parent: star,
            distance,
            angle,
            zone
          })
          star.orbits.push(n)
          angle += incrementAngle()
          distance = n.distance + (n.fullR ?? n.r)
        })
      }
      range(outer).forEach(() => {
        const orbit = ORBIT.spawn({
          star,
          zone: 'outer',
          angle,
          distance,
          impactZone: impactZone-- > 0,
          deviation: 1.2
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
