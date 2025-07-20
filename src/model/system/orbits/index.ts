import { scaleLinear } from 'd3'
import { MATH } from '../../utilities/math'
import {
  Orbit,
  OrbitSpawnParams,
  EccentricityParams,
  AxialTiltParams,
  PopulateOrbitParams,
  OrbitTypeDetails
} from './types'
import { LANGUAGE } from '../../languages'
import { DICE } from '../../utilities/dice'
import { ORBIT_CLASSIFICATION } from './classification'
import { ORBIT_GROUPS } from './groups'
import { ATMOSPHERE } from './atmosphere'
import { TEMPERATURE } from './temperature'
import { DESIRABILITY } from './desirability'
import { BIOSPHERE } from './biosphere'
import { ASTEROID_BELT } from './asteroids'
import { TECHNOLOGY } from './technology'
import { MOONS } from './moons'
import { CONSTANTS } from '../../constants'
import { HYDROSPHERE } from './hydrosphere'

const populations: Record<string, string> = {
  '0': 'Uninhabited',
  '1': 'Few',
  '2': 'Hundreds',
  '3': 'Thousands',
  '4': 'Tens of thousands',
  '5': 'Hundreds of thousands',
  '6': 'Millions',
  '7': 'Tens of millions',
  '8': 'Hundreds of millions',
  '9': 'Billions',
  '10': 'Tens of billions',
  '11': 'Hundreds of billions',
  '12': 'Trillions'
}

const governments: Record<string, string> = {
  '0': 'None (tends toward family/clan/tribal)',
  '1': 'Company or corporation',
  '2': 'Participatory democracy',
  '3': 'Self-perpetuating oligarchy',
  '4': 'Representative democracy',
  '5': 'Feudal technocracy',
  '6': 'Captive government (colony or conquered territory)',
  '7': 'Balkanized',
  '8': 'Civil service bureaucracy',
  '9': 'Impersonal bureaucracy',
  '10': 'Charismatic dictator',
  '11': 'Non-charismatic dictator',
  '12': 'Charismatic oligarchy',
  '13': 'Religious Dictatorship',
  '14': 'Religious Autocracy',
  '15': 'Totalitarian Oligarchy'
}

const lawLevel = (law: number) => {
  if (law === 0) return 'No restrictions'
  if (law === 1) return 'Only restrictions upon WMD and other dangerous technologies'
  if (law <= 4) return 'Light restrictions: heavy weapons, narcotics, alien technology'
  if (law <= 7)
    return 'Heavy restrictions: most weapons, specialized tools and information, foreigners'
  return 'Extreme restrictions: extensive monitoring and limitations, free speech curtailed'
}

const garden = (): ReturnType<OrbitTypeDetails['roll']> => {
  const size = window.dice.randint(5, 10)
  const atmosphere = window.dice.choice([5, 6, 8])
  const hydrosphere = window.dice.randint(4, 8)
  return {
    atmosphere,
    hydrosphere,
    size,
    chemistry: 'water' as const,
    subtype: 'gaian',
    composition: 'rocky'
  }
}

const _colors: Record<string, string> = {}

const rotation = (size: number, locked?: boolean, parent?: Orbit) => {
  if (locked) return 0
  if (parent && parent.group !== 'asteroid belt' && window.dice.random < 0.6) return 0
  const mod = size <= 0 || size >= 15 ? 2 : 4
  let base = (window.dice.roll(2, 6) - 2) * mod + window.dice.roll(1, 6)
  let rotation = base
  while (base > 40 && window.dice.roll(1, 6) >= 5) {
    base = (window.dice.roll(2, 6) - 2) * mod + window.dice.roll(1, 6)
    rotation += base
  }
  return rotation
}

const axialTilt = ({ tidalLocked, homeworld }: AxialTiltParams) => {
  if (tidalLocked) return (window.dice.roll(2, 6) - 2) / 10
  if (homeworld) return window.dice.uniform(0, 30)
  const standard = window.dice.roll(2, 6)
  if (standard <= 4) return window.dice.uniform(0.01, 0.1)
  if (standard <= 5) return window.dice.uniform(0.2, 1.2)
  if (standard <= 6) return window.dice.uniform(1, 6)
  if (standard <= 7) return window.dice.uniform(7, 12)
  if (standard <= 9) return window.dice.uniform(10, 35)
  const extreme = window.dice.roll(1, 6)
  if (extreme <= 2) return window.dice.uniform(20, 70) // high axial tilt
  if (extreme <= 4) return window.dice.uniform(40, 90) // extreme axial tilt
  if (extreme <= 5) return window.dice.uniform(91, 126) // retrograde rotation
  return window.dice.uniform(144, 180) // extreme retrograde
}

export const ORBIT = {
  populations,
  governments,
  lawLevel,
  eccentricity: ({
    star,
    asteroidMember,
    tidalLocked,
    moon,
    proto,
    primordial
  }: EccentricityParams) => {
    // 0 = circular
    // 1 = unbound interstellar object
    let roll = window.dice.roll(2, 6)
    if (star) roll += 2
    if (tidalLocked) roll -= 2
    if (asteroidMember) roll += 1

    if (proto) roll += 2
    else if (primordial) roll += 1

    if (moon?.range === 'outer') roll += 4
    else if (moon?.range === 'middle') roll += 1
    else if (moon?.range === 'inner') roll -= 1

    if (roll <= 5) return 0
    else if (roll <= 7) return window.dice.uniform(0.005, 0.03)
    else if (roll <= 9) return window.dice.uniform(0.04, 0.09)
    else if (roll <= 10) return window.dice.uniform(0.1, 0.35)
    else if (roll <= 11) return window.dice.uniform(0.15, 0.65)
    return window.dice.uniform(0.4, 0.9)
  },
  colors: {
    set: () => {
      DICE.swap('planet', () => {
        window.galaxy.orbits.forEach(orbit => {
          if (!_colors[orbit.type]) _colors[orbit.type] = ORBIT_CLASSIFICATION[orbit.type].color
        })
      })
    },
    get: () => _colors
  },
  describe: (orbit: Orbit) => ORBIT_CLASSIFICATION[orbit.type].description,
  name: (orbit: Orbit) => {
    if (!orbit.name) {
      const system = window.galaxy.systems[orbit.system]
      const nation = window.galaxy.nations[system.nation]
      orbit.name = LANGUAGE.word.unique({ key: 'orbit', lang: nation.language })
    }
    return orbit.name
  },
  code: (orbit: Orbit) => ORBIT.name(orbit),
  orbits: (orbit: Orbit): Orbit[] => orbit.orbits.map(moon => [moon, ...ORBIT.orbits(moon)]).flat(),
  parent: (orbit: Orbit) =>
    orbit.parent.type === 'star'
      ? window.galaxy.stars[orbit.parent.idx]
      : window.galaxy.orbits[orbit.parent.idx],
  populate: ({
    orbit,
    maxPop = 0,
    maxTech = 15,
    capital = false,
    mainworld = false
  }: PopulateOrbitParams) => {
    let populationCode = window.dice.roll(2, 6) - 2
    if (orbit.habitability <= 0) populationCode -= 2
    else if (orbit.habitability <= 2) populationCode -= 1
    else if (orbit.habitability <= 4) populationCode -= 0
    else if (orbit.habitability <= 6) populationCode += 0
    else if (orbit.habitability <= 8) populationCode += 1
    else populationCode += 2
    populationCode = Math.min(Math.max(populationCode, maxPop), 9)
    const natives = orbit.biosphere === 12
    if (natives) {
      const popRoll = window.dice.roll(1, 6)
      if (popRoll > 1) populationCode = window.dice.roll(1, 5) + 4
      else populationCode = window.dice.roll(1, 5) + 1
    }
    if (capital) populationCode = window.dice.choice([9, 9, 10])
    if (mainworld) populationCode = Math.max(populationCode, 1)
    const ranges = [
      { min: 0, max: 0 },
      { min: 1, max: 99 },
      { min: 100, max: 999 },
      { min: 1_000, max: 9_999 },
      { min: 10_000, max: 99_999 },
      { min: 100_000, max: 999_999 },
      { min: 1_000_000, max: 9_999_999 },
      { min: 10_000_000, max: 99_999_999 },
      { min: 100_000_000, max: 999_999_999 },
      { min: 1_000_000_000, max: 9_999_999_999 },
      { min: 10_000_000_000, max: 99_999_999_999 }
    ]
    const { min, max } = ranges[populationCode]
    orbit.population = {
      code: populationCode,
      size: window.dice.randint(min, max)
    }
    const failedOutpost = populationCode === 0
    // government
    orbit.government = failedOutpost
      ? 0
      : Math.min(15, Math.max(0, window.dice.roll(2, 6) - 5 + populationCode))
    orbit.law = failedOutpost ? 0 : Math.max(0, window.dice.roll(2, 6) - 7 + orbit.government)
    // starport
    let starportRoll = window.dice.roll(2, 6)
    if (natives) starportRoll -= 2
    if (populationCode >= 10) starportRoll += 2
    else if (populationCode >= 8) starportRoll += 1
    if (populationCode >= 5) starportRoll += 0
    else if (populationCode >= 3) starportRoll -= 1
    else starportRoll -= 2
    orbit.starport = failedOutpost
      ? 'X'
      : starportRoll >= 11
      ? 'A'
      : starportRoll >= 9
      ? 'B'
      : starportRoll >= 7
      ? 'C'
      : starportRoll >= 5
      ? 'D'
      : starportRoll >= 3
      ? 'E'
      : 'X'
    // technology
    orbit.technology = capital ? maxTech : Math.min(TECHNOLOGY.calculate(orbit), maxTech)
    const minTech = TECHNOLOGY.minimum(orbit)
    if (mainworld) orbit.technology = Math.max(orbit.technology, minTech)
    if (!natives && orbit.technology < minTech - 2) {
      orbit.population.code = 0
      orbit.population.size = 0
      orbit.government = 0
      orbit.law = 0
      orbit.starport = 'X'
      orbit.technology = 0
    }
    if (natives && !capital) {
      orbit.starport = 'X'
      orbit.technology = window.dice.weightedChoice([
        { v: window.dice.randint(1, 3), w: 3 },
        { v: window.dice.randint(4, 6), w: 1 }
      ])
      if (orbit.technology < 4) {
        orbit.population.code = window.dice.randint(6, 7)
        const { min, max } = ranges[orbit.population.code]
        orbit.population.size = window.dice.randint(min, max)
      } else {
        orbit.population.code = window.dice.randint(8, 9)
        const { min, max } = ranges[orbit.population.code]
        orbit.population.size = window.dice.randint(min, max)
      }
    }
  },
  spawn: ({
    star,
    zone,
    impactZone,
    group,
    parent,
    angle,
    distance,
    designation,
    unary,
    deviation,
    moon
  }: OrbitSpawnParams): Orbit => {
    const _homeworld = designation === 'homeworld' && !impactZone
    const _primary = designation === 'primary' && !impactZone
    const special = star.proto || star.primordial
    const postStellar = star.postStellar
    let selected =
      group ??
      (_homeworld || _primary
        ? window.dice.weightedChoice([
            { v: 'terrestrial', w: 6 },
            { v: 'helian', w: _homeworld ? 0 : 1 },
            { v: 'jovian', w: _homeworld ? 0 : postStellar ? 0.5 : 3 }
          ])
        : window.dice.weightedChoice<Orbit['group']>([
            { v: 'asteroid belt', w: star.proto ? 6 : star.primordial || postStellar ? 4 : 2 },
            { v: 'dwarf', w: 2 },
            { v: 'terrestrial', w: 3 },
            { v: 'helian', w: 1 },
            { v: 'jovian', w: zone === 'outer' || postStellar ? 2 : 0.5 }
          ]))
    if (star.age < 0.002 && selected !== 'jovian') selected = 'asteroid belt'
    else if (star.age < 0.005 && (selected === 'terrestrial' || selected === 'helian'))
      selected = 'dwarf'
    else if (star.age < 0.011 && selected === 'helian')
      selected = window.dice.choice(['terrestrial', 'dwarf'])
    const homeworld = _homeworld && selected === 'terrestrial'
    const primary = _primary && (selected === 'terrestrial' || selected === 'dwarf')
    const type = homeworld
      ? 'tectonic'
      : primary
      ? selected === 'terrestrial'
        ? window.dice.choice<Orbit['type']>([
            'tectonic',
            star.spectralClass === 'M' && !parent ? 'vesperian' : 'tectonic',
            'arid',
            'oceanic'
          ])
        : window.dice.choice<Orbit['type']>(['geo-tidal'])
      : ORBIT_GROUPS[selected].type({ zone, impactZone, parent, star })
    const detail = homeworld
      ? garden()
      : ORBIT_CLASSIFICATION[type].roll({ star, zone, primary, parent, deviation })
    let { size } = detail
    const composition = detail.composition
    const physique = ORBIT_GROUPS[selected].size({ size, composition })
    const asteroidBelt = selected === 'asteroid belt'
    const asteroidMember = parent?.group === 'asteroid belt'
    size = asteroidMember ? size : Math.max(0, Math.min((parent?.size ?? Infinity) - 1, size))
    let hydrosphere = detail.hydrosphere
    if (special && selected !== 'asteroid belt' && selected !== 'jovian') {
      hydrosphere = HYDROSPHERE.special(star, size, hydrosphere)
      detail.atmosphere = ATMOSPHERE.special(star, size)
      detail.subtype = undefined
      detail.chemistry = undefined
    }
    const { subtype, chemistry } = detail
    const kelvin = TEMPERATURE.base(deviation)
    if (hydrosphere < 10) {
      const hot = TEMPERATURE.describe(kelvin) === 'hot'
      const burning = TEMPERATURE.describe(kelvin) === 'burning'
      if (burning) hydrosphere -= 6
      else if (hot) hydrosphere -= 2
      hydrosphere = Math.max(hydrosphere, 0)
    }
    const atmosphere = ATMOSPHERE.finalize(detail.atmosphere, size, deviation, hydrosphere, type)
    const au = MATH.orbits.distance(kelvin, star.luminosity)
    const tilt = axialTilt({ tidalLocked: ORBIT_CLASSIFICATION[type].tidalLock, homeworld })
    const eccentricity = asteroidBelt
      ? 0
      : detail.eccentric
      ? window.dice.uniform(0.4, 0.9)
      : ORBIT.eccentricity({
          tidalLocked: ORBIT_CLASSIFICATION[type].tidalLock,
          asteroidMember: parent?.group === 'asteroid belt',
          moon,
          proto: star.proto,
          primordial: star.primordial
        })
    const period = parent ? parent.period : MATH.orbits.period(au, star.mass)
    const rot = rotation(size, ORBIT_CLASSIFICATION[type].tidalLock, parent)
    const temperature = TEMPERATURE.finalize({
      atmosphere,
      hydrosphere,
      au,
      star,
      composition,
      tilt,
      eccentricity,
      period,
      rotation: rot
    })
    const r = scaleLinear([-1, 0, 5, 10, 14, 15], [0, 1, 3, 6, 8, 10])(size)
    const finalDistance = asteroidMember ? 0 : distance + r + (asteroidBelt ? 10 : 0)
    const orbit: Orbit = {
      idx: window.galaxy.orbits.length,
      tag: 'orbit',
      name: '',
      system: star.system,
      angle,
      distance: finalDistance,
      group: selected,
      zone,
      type,
      subtype,
      rotation: rot,
      eccentricity,
      axialTilt: tilt,
      au,
      period,
      size,
      ...physique,
      composition,
      atmosphere,
      temperature,
      hydrosphere: { code: hydrosphere, distribution: window.dice.roll(2, 6) - 2 },
      biosphere: ORBIT_CLASSIFICATION[type].biosphere
        ? BIOSPHERE.get({ atmosphere, hydrosphere, temperature, star, type, size })
        : 0,
      chemistry,
      habitability: DESIRABILITY.habitability({
        type,
        hydrosphere,
        atmosphere,
        size,
        temperature,
        gravity: physique.gravity
      }),
      resources: 0,
      orbits: [],
      r,
      parent: parent ? { type: 'orbit', idx: parent.idx } : { type: 'star', idx: star.idx }
    }
    if ((impactZone || window.dice.random < 0.05) && orbit.biosphere > 0) {
      orbit.biosphere = -1
    } else if (orbit.biosphere < 7 && window.dice.random > 0.998 && orbit.atmosphere.code > 0) {
      orbit.biosphere = 13
    }
    if (parent && moon) {
      const lunar = MOONS.period({ parent, pd: moon.pd, mass: physique.mass })
      orbit.moon = { range: moon.range, pd: moon.pd, period: lunar }
    }
    window.galaxy.orbits.push(orbit)
    if (asteroidBelt) orbit.belt = ASTEROID_BELT.spawn({ star, au })
    orbit.resources = DESIRABILITY.resources(orbit, parent)
    if (selected === 'jovian') orbit.rings = window.dice.roll(1, 6) <= 4 ? 'minor' : 'complex'
    if (!parent && orbit.size > 0 && !asteroidBelt) {
      const hillSphere =
        au * (1 - eccentricity) * ((orbit.mass * 0.000003) / (star.mass * 3)) ** (1 / 3)
      const hillPD = (hillSphere * 149597870.9) / (orbit.diameter * CONSTANTS.ED)
      const hillLimit = hillPD / 2
      const habMoonNeeded = _primary && selected !== 'terrestrial'
      let subAngle = window.dice.randint(90, 270)
      let distance = orbit.r + 2
      const orbits = star.age < 0.002 ? [] : ORBIT_GROUPS[selected].orbits({ size })
      const mor = Math.min(Math.round(hillLimit) - 2, 200 + orbits.length)
      if (habMoonNeeded && orbits.length < 1) orbits.push('dwarf')
      const habIndex = habMoonNeeded ? window.dice.randint(0, orbits.length - 1) : -1
      const lunarOrbits = MOONS.orbit({ count: orbits.length, mor })
      orbit.orbits = orbits.map((satellite, i) => {
        const moon = ORBIT.spawn({
          parent: orbit,
          zone: orbit.zone,
          group: satellite,
          star,
          impactZone,
          distance: distance,
          angle: subAngle,
          unary,
          deviation,
          moon: { ...lunarOrbits[i] },
          designation: habIndex === i ? 'primary' : undefined
        })
        subAngle += window.dice.randint(90, 270)
        distance = moon.distance + moon.r + 1
        return moon
      })
      orbit.fullR = distance
      orbit.distance += orbit.fullR - orbit.r
    }
    if (asteroidBelt) orbit.fullR = 10
    return orbit
  }
}
