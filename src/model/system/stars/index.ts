import { range, scaleLinear } from 'd3'
import { ORBIT } from '../orbits'
import { StarCompanionTemplate, Star, StarSpawnParams } from './types'
import { LANGUAGE } from '../../languages'
import { MATH } from '../../utilities/math'
import { Orbit } from '../orbits/types'

const incrementAngle = () => window.dice.randint(90, 270)

const spectralAttributes: Record<Star['spectralClass'], { color: string; range: number[] }> = {
  O: { color: '#7cc6ff', range: [0, 2] },
  B: { color: '#d8eeff', range: [2, 4] },
  A: { color: '#ffffff', range: [4, 6] },
  F: { color: '#fffcd3', range: [6, 8] },
  G: { color: '#fff772', range: [8, 10] },
  K: { color: '#ffc37f', range: [10, 12] },
  M: { color: '#ff9719', range: [12, 14] }
}

const starMass: Record<Star['luminosityClass'], number[]> = {
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

const starDiameter: Record<Star['luminosityClass'], number[]> = {
  Ia: [25, 22, 20, 60, 120, 180, 210, 280, 330, 360, 420, 600, 900, 1200, 1800],
  Ib: [24, 20, 14, 25, 50, 75, 85, 115, 135, 150, 180, 260, 380, 600, 800],
  II: [22, 18, 12, 14, 30, 45, 50, 66, 77, 90, 110, 160, 230, 350, 500],
  III: [21, 15, 10, 6, 5, 5, 5, 5, 10, 15, 20, 40, 60, 100, 200],
  IV: [8, 8, 8, 5, 4, 3, 3, 2, 3, 4, 6, 6, 6, 6, 6],
  V: [20, 12, 7, 3.5, 2.2, 2, 1.7, 1.5, 1.1, 0.95, 0.9, 0.8, 0.7, 0.2, 0.1],
  VI: [0.18, 0.18, 0.2, 0.5, 0.5, 0.6, 0.6, 0.8, 0.8, 0.7, 0.6, 0.5, 0.4, 0.1, 0.08]
}

const starClass = (parent?: Star, homeworld?: boolean) => {
  const parentClass = parent?.spectralClass
  let spectralRoll = window.dice.roll(2, 6)
  let luminosityClass: Star['luminosityClass'] = 'V'
  let spectralClass: Star['spectralClass'] = 'G'
  if (spectralRoll <= 3 && !homeworld && !parent) {
    spectralRoll = window.dice.roll(2, 6) + 2
    let lumRoll = window.dice.roll(2, 6)
    if (lumRoll <= 5) luminosityClass = 'VI'
    else if (lumRoll <= 8) luminosityClass = 'IV'
    else if (lumRoll <= 10) luminosityClass = 'III'
    else {
      lumRoll = window.dice.roll(2, 6)
      if (lumRoll <= 8) luminosityClass = 'III'
      else if (lumRoll <= 10) luminosityClass = 'II'
      else if (lumRoll === 11) luminosityClass = 'Ib'
      else luminosityClass = 'Ia'
    }
  }
  const giant = luminosityClass === 'III'
  const subGiant = luminosityClass === 'IV'
  const subDwarf = luminosityClass === 'VI'
  if (spectralRoll >= 12 && homeworld) spectralRoll -= 2
  if (spectralRoll <= 6 && (subGiant || giant)) spectralRoll += 5
  if (spectralRoll <= 6 || parentClass === 'K' || parentClass === 'M') spectralClass = 'M'
  else if (spectralRoll <= 8 || parentClass === 'G') spectralClass = 'K'
  else if (spectralRoll <= 10 || parentClass === 'F') spectralClass = 'G'
  else if (spectralRoll <= 11 || parentClass === 'A') spectralClass = subDwarf ? 'G' : 'F'
  else if (spectralRoll === 12) {
    spectralRoll = window.dice.roll(2, 6)
    if ((spectralRoll <= 9 || parentClass === 'B') && !subDwarf) spectralClass = 'A'
    else if (spectralRoll <= 11 || subGiant || parentClass === 'O') spectralClass = 'B'
    else spectralClass = 'O'
  }
  let subtype = window.dice.randint(0, 9)
  if (spectralClass === 'K' && subtype > 4) subtype -= 5
  if (spectralClass === 'M' && parentClass === 'M')
    subtype = window.dice.randint((parent?.subtype ?? 0) + 1, 9)

  const { range: r } = spectralAttributes[spectralClass]
  const domain = range(15)
  const idx = scaleLinear([0, 9], r)(subtype)
  const mass = scaleLinear(domain, starMass[luminosityClass])(idx)
  const temperature = scaleLinear(domain, starTemp)(idx)
  const diameter = scaleLinear(domain, starDiameter[luminosityClass])(idx)
  const luminosity = diameter ** 2 * (temperature / 5772) ** 4

  let age = parent?.age ?? 0
  if (!parent) {
    const mainSequenceMass = scaleLinear(domain, starMass.V)(idx)
    const mainSequenceLifespan = 10 / mainSequenceMass ** 2.5
    const subgiantMass = scaleLinear(domain, starMass.IV)(idx)
    const subgiantLifespan = mainSequenceLifespan / (4 + subgiantMass)
    const giantLifespan = mainSequenceLifespan / (10 * mass ** 3)

    age = window.dice.roll(1, 6) * 2 + window.dice.roll(1, 3) - 2 + window.dice.uniform(0.1, 0.9)
    if (mass > 0.9) age = mainSequenceLifespan * window.dice.uniform(0.1, 0.9)
    if (luminosityClass == 'IV')
      age = mainSequenceLifespan + subgiantLifespan * window.dice.uniform(0.1, 0.9)
    else if (luminosityClass == 'III')
      age = mainSequenceLifespan + subgiantLifespan + giantLifespan * window.dice.uniform(0.1, 0.9)
    if (age > 14) age = window.dice.uniform(13, 14)
  }
  return {
    spectralClass,
    luminosityClass,
    subtype,
    mass,
    temperature,
    diameter,
    luminosity,
    age,
    eccentricity: parent ? ORBIT.eccentricity({ star: true }) : 0
  }
}

const isGiant = (luminosityClass: Star['luminosityClass']) =>
  luminosityClass === 'III' ||
  luminosityClass === 'II' ||
  luminosityClass === 'Ib' ||
  luminosityClass === 'Ia'

export const STAR = {
  classes: spectralAttributes,
  color: (star: Star): string =>
    isGiant(star.luminosityClass) ? 'red' : spectralAttributes[star.spectralClass].color,
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
  spawn: ({
    system,
    parent,
    distance,
    angle,
    zone,
    attributes,
    homeworld,
    deviation
  }: StarSpawnParams): Star => {
    const classAttributes = attributes ?? starClass(parent, homeworld)
    const au = parent
      ? MATH.orbits.distance(ORBIT.temperature(deviation ?? 0), parent.luminosity)
      : 0
    const star: Star = {
      idx: window.galaxy.stars.length,
      tag: 'star',
      name: '',
      system,
      ...classAttributes,
      period: parent ? MATH.orbits.period(au, parent.mass) : 0,
      parent: parent?.idx,
      distance: distance ?? 0,
      angle: angle ?? 0,
      zone,
      au,
      orbits: [],
      r: parent ? 30 : 40
    }
    if (parent) star.distance += star.r
    window.galaxy.stars.push(star)
    if (star.zone !== 'epistellar') {
      const giant = isGiant(star.luminosityClass)
      const companions: StarCompanionTemplate[] = []
      const companionOdds = 10
      const epistellarCompanion = !giant && window.dice.roll(2, 6) >= companionOdds
      if (epistellarCompanion) {
        companions.push({
          type: 'star',
          deviation: window.dice.uniform(1.5, 2.5),
          zone: 'epistellar',
          attributes: starClass(star)
        })
      }
      const innerCompanion = !parent && !homeworld && window.dice.roll(2, 6) >= companionOdds
      if (innerCompanion) {
        companions.push({
          type: 'star',
          deviation: window.dice.uniform(-1, 1),
          zone: 'inner',
          attributes: starClass(star)
        })
      }
      const outerCompanion = !parent && window.dice.roll(2, 6) >= companionOdds
      if (outerCompanion) {
        companions.push({
          type: 'star',
          deviation: window.dice.uniform(-3.5, -1.5),
          zone: 'outer',
          attributes: starClass(star)
        })
      }
      if (!parent && window.dice.roll(2, 6) >= companionOdds) {
        companions.push({
          type: 'star',
          deviation: window.dice.uniform(-4.5, -4),
          zone: 'distant',
          attributes: starClass(star)
        })
      }
      const mClass = star.spectralClass === 'M'
      const secondaryNoPlanets = parent && window.dice.random > 0.5
      const maxEpistellar =
        epistellarCompanion || secondaryNoPlanets ? 0 : star.zone === 'inner' ? 1 : 2
      const epistellar = Math.min(maxEpistellar, window.dice.randint(0, mClass ? 1 : 2))
      const maxInner =
        innerCompanion || secondaryNoPlanets || star.zone === 'inner'
          ? 0
          : star.zone === 'outer'
          ? 2
          : 5
      const inner = Math.min(maxInner, window.dice.randint(1, mClass ? 4 : 5))
      const maxOuter =
        outerCompanion || secondaryNoPlanets || star.zone === 'inner'
          ? 0
          : star.zone === 'outer'
          ? 2
          : 5
      const outer = Math.min(maxOuter, window.dice.randint(innerCompanion ? 1 : 0, mClass ? 4 : 5))
      const satellites: { type: 'satellite'; deviation: number; zone: Orbit['zone'] }[] = [
        ...window.dice
          .sample([2.25, 1.75], epistellar)
          .map(d => ({ type: 'satellite' as const, deviation: d, zone: 'epistellar' as const })),
        ...window.dice
          .sample([1.25, 0.75, 0, -0.75, -1.25], inner)
          .map(d => ({ type: 'satellite' as const, deviation: d, zone: 'inner' as const })),
        ...window.dice
          .sample([-1.75, -2.25, -2.75, -3.25, -3.75], outer)
          .map(d => ({ type: 'satellite' as const, deviation: d, zone: 'outer' as const }))
      ]
      const orbitals = [...companions, ...satellites]
      orbitals.sort((a, b) => b.deviation - a.deviation)
      let angle = incrementAngle()
      let distance = star.r + 10
      let impactZone = giant ? window.dice.randint(1, 2) : 0
      orbitals.forEach(template => {
        const obj =
          template.type === 'star'
            ? STAR.spawn({
                system,
                parent: star,
                distance,
                angle,
                zone: template.zone,
                deviation: template.deviation,
                attributes: template.attributes
              })
            : ORBIT.spawn({
                star,
                zone: template.zone,
                angle,
                distance,
                deviation: window.dice.uniform(
                  template.deviation - 0.25,
                  template.deviation + 0.25
                ),
                impactZone: impactZone > 0,
                unary: companions.length === 0
              })
        impactZone -= 1
        star.orbits.push(obj)
        angle += incrementAngle()
        distance = obj.distance + (obj.fullR ?? obj.r)
      })
      const planets = STAR.orbits(star).filter(orbit => orbit.tag === 'orbit')
      if (!parent && planets.length > 0) {
        const topBio = planets.reduce((max, orbit) => {
          const bio = orbit.biosphere
          return bio > max.biosphere ? orbit : max
        }, planets[0])
        planets.forEach(orbit => {
          if (orbit !== topBio) {
            orbit.biosphere = Math.ceil(orbit.biosphere / 2)
          }
        })
      }
      if (parent) {
        star.fullR = distance
        star.distance += star.fullR - star.r
      }
    }
    return star
  }
}
