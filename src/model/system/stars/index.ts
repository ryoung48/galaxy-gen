import { range, scaleLinear } from 'd3'
import { ORBIT } from '../orbits'
import { StarCompanionTemplate, Star, StarSpawnParams } from './types'
import { LANGUAGE } from '../../languages'
import { MATH } from '../../utilities/math'
import { Orbit } from '../orbits/types'
import { TEMPERATURE } from '../orbits/temperature'

const incrementAngle = () => window.dice.randint(90, 270)

const spectralAttributes: Record<Star['spectralClass'], { color: string; range: number[] }> = {
  O: { color: '#7cc6ff', range: [0, 2] },
  B: { color: '#d8eeff', range: [2, 4] },
  A: { color: '#ffffff', range: [4, 6] },
  F: { color: '#fffcd3', range: [6, 8] },
  G: { color: '#fff772', range: [8, 10] },
  K: { color: '#ffc37f', range: [10, 12] },
  M: { color: '#ff9719', range: [12, 14] },
  L: { color: '#e06f67', range: [14, 16] },
  T: { color: '#963f3f', range: [16, 18] },
  Y: { color: '#82779b', range: [18, 20] },
  D: { color: '#b2bdff', range: [20, 22] },
  NS: { color: '#002aff', range: [22, 24] },
  BH: { color: '#000000', range: [24, 26] }
}

const starMass: Record<Star['luminosityClass'], number[]> = {
  Ia: [200, 80, 60, 30, 20, 15, 13, 12, 12, 13, 14, 18, 20, 25, 30],
  Ib: [150, 60, 40, 25, 15, 13, 12, 10, 10, 11, 12, 13, 15, 20, 25],
  II: [130, 40, 30, 20, 14, 11, 10, 8, 8, 10, 10, 12, 14, 16, 18],
  III: [110, 30, 20, 10, 8, 6, 4, 3, 2.5, 2.4, 1.1, 1.5, 1.8, 2.4, 8],
  IV: [20, 20, 20, 10, 4, 2.3, 2, 1.5, 1.7, 1.2, 1.5, 1.5, 1.5, 1.5, 1.5],
  V: [
    90, 60, 18, 5, 2.2, 1.8, 1.5, 1.3, 1.1, 0.9, 0.8, 0.7, 0.5, 0.16, 0.08, 0.06, 0.05, 0.04, 0.025,
    0.013, 0.01
  ],
  VI: [2, 1.5, 0.5, 0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.12, 0.075]
}

const starTemp = [
  50000, 40000, 30000, 15000, 10000, 8000, 7500, 6500, 6000, 5600, 5200, 4400, 3700, 3000, 2400,
  1850, 1300, 900, 550, 300
]

const starDiameter: Record<Star['luminosityClass'], number[]> = {
  Ia: [25, 22, 20, 60, 120, 180, 210, 280, 330, 360, 420, 600, 900, 1200, 1800],
  Ib: [24, 20, 14, 25, 50, 75, 85, 115, 135, 150, 180, 260, 380, 600, 800],
  II: [22, 18, 12, 14, 30, 45, 50, 66, 77, 90, 110, 160, 230, 350, 500],
  III: [21, 15, 10, 6, 5, 5, 5, 5, 10, 15, 20, 40, 60, 100, 200],
  IV: [8, 8, 8, 5, 4, 3, 3, 2, 3, 4, 6, 6, 6, 6, 6],
  V: [
    20, 12, 7, 3.5, 2.2, 2, 1.7, 1.5, 1.1, 0.95, 0.9, 0.8, 0.7, 0.2, 0.1, 0.08, 0.09, 0.11, 0.1, 0.1
  ],
  VI: [0.18, 0.18, 0.2, 0.5, 0.5, 0.6, 0.6, 0.8, 0.8, 0.7, 0.6, 0.5, 0.4, 0.1, 0.08]
}

const starMAO: Record<Star['luminosityClass'], number[]> = {
  Ia: [0.63, 0.55, 0.5, 1.67, 3.34, 4.17, 4.42, 5.0, 5.21, 5.34, 5.59, 6.17, 6.8, 7.2, 7.8],
  Ib: [0.6, 0.5, 0.35, 0.63, 1.4, 2.17, 2.5, 3.25, 3.59, 3.84, 4.17, 4.84, 5.42, 6.17, 6.59],
  II: [0.55, 0.45, 0.3, 0.35, 0.75, 1.17, 1.33, 1.87, 2.24, 2.67, 3.17, 4.0, 4.59, 5.3, 5.92],
  III: [0.53, 0.38, 0.25, 0.15, 0.13, 0.13, 0.13, 0.13, 0.25, 0.38, 0.5, 1.0, 1.68, 3.0, 4.34],
  IV: [0.2, 0.2, 0.2, 0.13, 0.1, 0.07, 0.07, 0.06, 0.07, 0.1, 0.15, 0.15, 0.15, 0.15, 0.15],
  V: [0.5, 0.3, 0.18, 0.09, 0.06, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01],
  VI: [0.01, 0.01, 0.01, 0.01, 0.015, 0.015, 0.015, 0.015, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01]
}

const whiteDwarfs = {
  mass: (parent?: Star) =>
    Math.min(
      (window.dice.roll(2, 6) - 1) / 10 + window.dice.roll(1, 10) / 100,
      (parent?.mass ?? Infinity) * 0.9
    ),
  diameter: (mass: number) => (1 / mass) * 0.01,
  temperature: (mass: number) => (window.dice.randint(40e3, 1000) * mass) / 0.6
}

const neutronStars = {
  mass: (): number => {
    const mass = window.dice.roll(1, 6)
    const extra = mass === 6 ? (window.dice.roll(1, 6) - 1) / 10 : 0
    return 1 + mass / 10 + extra
  },
  diameter: () => (19 + window.dice.roll(1, 6)) / 1.4e6,
  temperature: (mass: number) => (window.dice.randint(40e3, 1000) * mass) / 0.6
}

const blackHoles = {
  mass: (): number => {
    const mass = window.dice.roll(1, 6)
    const total = mass + (mass === 6 ? blackHoles.mass() : 0)
    return 2.1 + total - 1 + window.dice.roll(1, 10) / 10
  },
  diameter: (mass: number) => (5.9 / 1.4e6) * mass,
  temperature: () => 0
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

  const whiteDwarfParent = parent?.spectralClass === 'D'
  const brownDwarfParent = parent?.spectralClass === 'L' || parent?.spectralClass === 'T'

  if (whiteDwarfParent || brownDwarfParent || (parent && window.dice.random > 0.85)) {
    spectralClass = window.dice.weightedChoice([
      { v: 'L', w: parent?.spectralClass === 'L' || parent?.spectralClass === 'T' ? 0 : 0.4 },
      { v: 'T', w: parent?.spectralClass === 'T' ? 0 : 0.3 },
      { v: 'Y', w: 0.3 },
      { v: 'D', w: whiteDwarfParent ? 1 : 0 }
    ])
    luminosityClass = 'V'
    subtype = window.dice.randint(0, 9)
  }

  if (window.dice.random > 0.95 && !parent && !homeworld) {
    spectralClass = window.dice.weightedChoice([
      { v: window.dice.choice(['L', 'T']), w: 0.1 },
      { v: 'D', w: 0.5 },
      { v: 'NS', w: parent ? 0 : 0.1 },
      { v: 'BH', w: parent ? 0 : 0.1 }
    ])
    luminosityClass = 'V'
    subtype = window.dice.randint(0, 9)
  }
  if (spectralClass === 'Y' && subtype > 5) subtype = window.dice.randint(0, 5)
  const whiteDwarf = spectralClass === 'D'
  const neutronStar = spectralClass === 'NS'
  const blackHole = spectralClass === 'BH'
  const brownDwarf = STAR.isBrownDwarf(spectralClass)
  const { range: r } = spectralAttributes[spectralClass]
  const domain = range(luminosityClass === 'V' ? 20 : 15)
  const idx = scaleLinear([0, 9], r)(subtype)
  const mass = whiteDwarf
    ? whiteDwarfs.mass(parent)
    : neutronStar
    ? neutronStars.mass()
    : blackHole
    ? blackHoles.mass()
    : scaleLinear(domain, starMass[luminosityClass])(idx)
  const temperature = whiteDwarf
    ? whiteDwarfs.temperature(mass)
    : neutronStar
    ? neutronStars.temperature(mass)
    : blackHole
    ? blackHoles.temperature()
    : scaleLinear(domain, starTemp)(idx)
  const diameter = whiteDwarf
    ? whiteDwarfs.diameter(mass)
    : neutronStar
    ? neutronStars.diameter()
    : blackHole
    ? blackHoles.diameter(mass)
    : scaleLinear(domain, starDiameter[luminosityClass])(idx)
  const luminosity = diameter ** 2 * (temperature / 5772) ** 4

  const mao = brownDwarf
    ? 0.005
    : whiteDwarf || neutronStar || blackHole
    ? 0.001
    : scaleLinear(range(15), starMAO[luminosityClass])(idx)

  let age = parent?.age ?? 0
  if (!parent) {
    const deadStar = whiteDwarf || neutronStar || blackHole
    const mainSequenceMass = scaleLinear(domain, starMass.V)(idx)
    const mainSequenceLifespan = 10 / mainSequenceMass ** 2.5
    const subgiantMass = scaleLinear(domain, starMass.IV)(idx)
    const subgiantLifespan = mainSequenceLifespan / (4 + subgiantMass)
    const giantLifespan = mainSequenceLifespan / (10 * mass ** 3)

    age = window.dice.roll(1, 6) * 2 + window.dice.roll(1, 3) - 2 + window.dice.uniform(0.1, 0.9)
    if (mass > 0.9 && !deadStar) age = mainSequenceLifespan * window.dice.uniform(0.1, 0.9)
    if (luminosityClass == 'IV')
      age = mainSequenceLifespan + subgiantLifespan * window.dice.uniform(0.1, 0.9)
    else if (luminosityClass == 'III')
      age = mainSequenceLifespan + subgiantLifespan + giantLifespan * window.dice.uniform(0.1, 0.9)

    if (deadStar)
      age +=
        window.dice.roll(1, 6) * 2 +
        window.dice.roll(2, 3) * mass -
        2 +
        window.dice.uniform(0.1, 0.9)
    if (age > 14) age = window.dice.uniform(13, 14)
  }
  const proto = parent?.proto ?? false
  const primordial = parent?.primordial ?? false
  const eccentricity = parent ? MATH.orbits.eccentricity({ star: true, proto, primordial }) : 0
  return {
    spectralClass,
    luminosityClass,
    subtype,
    mass,
    temperature,
    diameter,
    luminosity,
    age,
    eccentricity,
    mao,
    hzco: MATH.orbits.fromAU(luminosity ** 0.5)
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
    isGiant(star.luminosityClass) ? '#F60000' : spectralAttributes[star.spectralClass].color,
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
      ? MATH.orbits.distance(TEMPERATURE.base(deviation ?? 0), parent.luminosity)
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
      r: parent ? 30 : 40,
      proto: classAttributes.age < 0.01 && classAttributes.mass < 8,
      primordial: classAttributes.age < 0.1,
      postStellar:
        classAttributes.spectralClass === 'D' ||
        classAttributes.spectralClass === 'NS' ||
        classAttributes.spectralClass === 'BH'
    }
    const brownDwarf = STAR.isBrownDwarf(star.spectralClass)
    const tBrownDwarf = star.spectralClass === 'T'
    const yBrownDwarf = star.spectralClass === 'Y'
    const whiteDwarf = star.spectralClass === 'D'
    const neutronStar = star.spectralClass === 'NS'
    const blackHole = star.spectralClass === 'BH'
    const giant = isGiant(star.luminosityClass)
    if (brownDwarf) star.r = parent ? 20 : 25
    else if (whiteDwarf || neutronStar) star.r = parent ? 10 : 15
    else if (giant || star.spectralClass === 'O' || star.spectralClass === 'B')
      star.r = parent ? 40 : 50
    if (parent) {
      star.distance += star.r
      star.temperature = Math.max(star.temperature, TEMPERATURE.base(deviation ?? 0))
    }
    window.galaxy.stars.push(star)
    if (star.zone !== 'epistellar') {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const companions: StarCompanionTemplate[] = []
        const noCompanions = neutronStar || blackHole || yBrownDwarf
        let companionMods = 0
        if (star.luminosityClass !== 'V' && star.luminosityClass !== 'VI') companionMods += 1
        else if (
          star.spectralClass === 'O' ||
          star.spectralClass === 'B' ||
          star.spectralClass === 'A' ||
          star.spectralClass === 'F'
        )
          companionMods += 1
        else if (star.spectralClass === 'M' || whiteDwarf || brownDwarf || neutronStar || blackHole)
          companionMods -= 1
        const companionOdds = noCompanions ? Infinity : 11 + companionMods
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
        const deadStar = whiteDwarf || neutronStar || blackHole
        const deadSystem = deadStar && window.dice.random > 0.8
        const noPlanets = secondaryNoPlanets || deadSystem || blackHole || yBrownDwarf
        const maxEpistellar =
          epistellarCompanion || brownDwarf || deadStar || noPlanets
            ? 0
            : star.zone === 'inner'
            ? 1
            : 2
        const epistellar = Math.min(maxEpistellar, window.dice.randint(0, mClass ? 1 : 2))
        const maxInner =
          innerCompanion || star.zone === 'inner' || noPlanets || neutronStar || tBrownDwarf
            ? 0
            : star.zone === 'outer' || brownDwarf || deadStar
            ? 1
            : 3
        const inner = Math.min(maxInner, window.dice.randint(1, mClass || brownDwarf ? 4 : 5))
        const maxOuter =
          outerCompanion || star.zone === 'inner' || noPlanets
            ? 0
            : star.zone === 'outer' || brownDwarf || deadStar
            ? 2
            : 5
        const outer = Math.min(
          maxOuter,
          window.dice.randint(innerCompanion ? 1 : 0, mClass || brownDwarf ? 4 : 5)
        )
        const satellites: {
          type: 'satellite'
          deviation: number
          zone: Orbit['zone']
          primary?: boolean
          homeworld?: boolean
        }[] = [
          ...window.dice
            .sample([2.25, 1.75], epistellar)
            .map(d => ({ type: 'satellite' as const, deviation: d, zone: 'epistellar' as const })),
          ...window.dice
            .sample(
              homeworld ? [1.25, 0.75, -0.75, -1.25] : [1.25, 0.75, 0, -0.75, -1.25],
              homeworld ? inner - 1 : inner
            )
            .map(d => ({ type: 'satellite' as const, deviation: d, zone: 'inner' as const })),
          ...window.dice
            .sample([-1.75, -2.25, -2.75, -3.25, -3.75, -4, -4.25, -4.5], outer)
            .map(d => ({ type: 'satellite' as const, deviation: d, zone: 'outer' as const }))
        ]
        if (homeworld)
          satellites.push({
            type: 'satellite' as const,
            deviation: 0,
            zone: 'inner' as const,
            homeworld: true
          })
        else if (satellites.length > 0 && !parent) {
          const primary = satellites.slice(1).reduce((min, satellite) => {
            return Math.abs(min.deviation) > Math.abs(satellite.deviation) ? satellite : min
          }, satellites[0])
          if (primary.zone === 'inner' && !blackHole && !neutronStar) {
            primary.primary = true
            if (Math.abs(primary.deviation) > 1) {
              primary.deviation = window.dice.choice([-0.5, 0, 0.75])
            }
          }
        }
        if (satellites.length === 0 && !parent && !noPlanets) continue
        const orbitals = [...companions, ...satellites]
        orbitals.sort((a, b) => b.deviation - a.deviation)
        let angle = incrementAngle()
        let distance = star.r + 10
        let impactZone =
          star.luminosityClass === 'III' || whiteDwarf ? window.dice.randint(1, 3) : 0
        if (system === 752) {
          console.log()
        }
        orbitals.forEach(template => {
          const deviation = window.dice.uniform(
            template.deviation - 0.25,
            template.deviation + 0.25
          )
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
                  deviation,
                  impactZone: impactZone > 0,
                  companions: companions.length,
                  designation: template.homeworld
                    ? 'homeworld'
                    : template.primary && window.dice.random > 0.3
                    ? 'primary'
                    : undefined
                })
          impactZone -= 1
          star.orbits.push(obj)
          angle += incrementAngle()
          distance = obj.distance + (obj.fullR ?? obj.r)
        })
        if (parent) {
          star.fullR = distance
          star.distance += star.fullR - star.r
        }
        break
      }
    }
    return star
  },
  isBrownDwarf: (spectralClass: Star['spectralClass']) =>
    spectralClass === 'L' || spectralClass === 'T' || spectralClass === 'Y'
}
