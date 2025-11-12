import { scaleLinear } from 'd3'
import { MATH } from '../../utilities/math'
import { Orbit, OrbitSpawnParams, OrbitTypeDetails } from './types'
import { LANGUAGE } from '../../languages'
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
import { TEXT } from '../../utilities/text'
import { SURFACE_TIDES } from './tides'
import { SEISMOLOGY } from './seismology'
import { ROTATION } from './rotation'
import { PopulateOrbitParams } from './population/types'
import { POPULATION } from './population'
import { ECONOMY } from './economy'

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

export const ORBIT = {
  populations,
  governments,
  lawLevel,
  colors: (orbit: Orbit | Orbit['type']) => {
    const type = typeof orbit === 'string' ? orbit : orbit.type
    return type === 'asteroid'
      ? typeof orbit !== 'string' && orbit.subtype === 'ice'
        ? '#ADD8E6'
        : '#778899'
      : ORBIT_CLASSIFICATION[type].color
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
  code: (orbit: Orbit) => {
    const toHex = TEXT.toHex
    const size = toHex(orbit.size)
    const atmosphere = toHex(orbit.atmosphere.code)
    const hydrosphere = toHex(orbit.hydrosphere.code)
    const biosphere = toHex(orbit.biosphere.code)
    const population = orbit.population ? toHex(orbit.population.code) : '0'
    const government = orbit.government !== undefined ? toHex(orbit.government) : '0'
    const law = orbit.law !== undefined ? toHex(orbit.law) : '0'
    const tech = orbit.technology !== undefined ? toHex(orbit.technology.score) : '0'

    return `${size}${atmosphere}${hydrosphere}${biosphere}-${population}${tech}${government}${law}`
  },
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
  }: PopulateOrbitParams & {
    maxTech?: number
  }) => {
    orbit.mainworld = mainworld
    POPULATION.base({ orbit, maxPop, capital, mainworld })
    const populationCode = orbit.population?.code ?? 0
    const natives = orbit.biosphere.code === 10
    const failedOutpost = populationCode === 0
    // government
    orbit.government = failedOutpost
      ? 0
      : Math.min(15, Math.max(0, window.dice.roll(2, 6) - 5 + populationCode))
    orbit.law = failedOutpost
      ? 0
      : Math.max(0, window.dice.roll(2, 6) - 7 + Math.min(orbit.government, 10))
    // starport
    let starportRoll = window.dice.roll(2, 6)
    if (capital) starportRoll += 4
    else if (natives) starportRoll -= 4
    if (populationCode >= 10) starportRoll += 2
    else if (populationCode >= 8) starportRoll += 1
    if (populationCode >= 5) starportRoll += 0
    else if (populationCode >= 3) starportRoll -= 1
    else starportRoll -= 2
    if (failedOutpost) starportRoll -= 12
    orbit.starport =
      starportRoll >= 11
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
    orbit.technology = TECHNOLOGY.calculate(orbit)

    if (capital) {
      if (orbit.technology.score !== maxTech) {
        orbit.technology.trace.push({
          value: maxTech - orbit.technology.score,
          description: 'capital world'
        })
      }
      orbit.technology.score = maxTech
    } else {
      const cappedTech = Math.min(orbit.technology.score, maxTech)
      if (cappedTech !== orbit.technology.score) {
        orbit.technology.trace.push({
          value: cappedTech - orbit.technology.score,
          description: `local tech cap (TL-${maxTech})`
        })
      }
      orbit.technology.score = cappedTech
    }

    const canTerraform = orbit.technology.score >= 12
    if (
      (canTerraform || window.dice.random > 0.8) &&
      orbit.habitability.score < 8 &&
      orbit.habitability.score > 0
    ) {
      const gap = 10 - orbit.habitability.score
      const terraforming = Math.min(window.dice.randint(1, canTerraform ? 4 : 3), gap)
      orbit.habitability.score += terraforming
      const description = canTerraform ? 'terraforming' : 'old terraforming'
      orbit.habitability.trace.push({ value: terraforming, description })
    }

    const minTech = TECHNOLOGY.minimum(orbit)

    if (mainworld && orbit.technology.score < minTech) {
      orbit.technology.trace.push({
        value: minTech - orbit.technology.score,
        description: 'mainworld minimum tech enforced'
      })
      orbit.technology.score = minTech
    }

    if (!natives && orbit.technology.score < minTech - 2 && orbit.population) {
      orbit.technology.trace.push({
        value: -orbit.technology.score,
        description: 'colony collapse from tech shortfall'
      })
      orbit.technology.score = 0
      orbit.population.code = 0
      orbit.population.size = 0
      orbit.government = 0
      orbit.law = 0
      orbit.starport = 'X'
    }

    if ((orbit.population?.code ?? 0) > 0) {
      orbit.pcr = POPULATION.concentration(orbit)
      orbit.urbanization = POPULATION.urbanization(orbit)
      const cities = POPULATION.cities.count(orbit)
      orbit.cities = { count: cities.count, total: cities.pop, pops: [] }
      orbit.cities.pops = POPULATION.cities
        .pops(orbit)
        .map(count => ({ count, unusual: POPULATION.cities.unusual(orbit) }))
      ECONOMY.compute(orbit)
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
    companions,
    deviation,
    moon,
    size: sizeOverride
  }: OrbitSpawnParams): Orbit => {
    const _homeworld = designation === 'homeworld' && !impactZone
    const _primary = designation === 'primary' && !impactZone
    const youth = star.proto || star.primordial
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
            {
              v: 'asteroid belt',
              w: star.proto ? 6 : star.primordial || postStellar ? 4 : zone === 'inner' ? 1 : 2
            },
            { v: 'dwarf', w: 2 },
            { v: 'terrestrial', w: zone === 'inner' ? 3 : 2 },
            { v: 'helian', w: 1 },
            { v: 'jovian', w: zone === 'outer' || postStellar ? 2 : 0.5 }
          ]))
    if (star.age < 0.002 && selected !== 'jovian') selected = 'asteroid belt'
    else if (star.age < 0.005 && (selected === 'terrestrial' || selected === 'helian'))
      selected = 'dwarf'
    else if (star.age < 0.011 && selected === 'helian')
      selected = window.dice.choice(['terrestrial', 'dwarf'])
    const homeworld = _homeworld && selected === 'terrestrial'
    const primary =
      _primary && (selected === 'terrestrial' || selected === 'dwarf' || selected === 'helian')
    const type = homeworld
      ? 'tectonic'
      : primary
      ? selected === 'terrestrial'
        ? window.dice.choice<Orbit['type']>(['tectonic', 'arid', 'oceanic'])
        : selected === 'dwarf'
        ? window.dice.choice<Orbit['type']>(['geo-tidal'])
        : window.dice.choice<Orbit['type']>(['helian', 'helian', 'panthalassic'])
      : ORBIT_GROUPS[selected].type({ zone, impactZone, parent, star, deviation })
    const detail = homeworld
      ? garden()
      : ORBIT_CLASSIFICATION[type].roll({ star, zone, primary, parent, deviation, sizeOverride })
    let { size } = detail
    if (primary) size = Math.max(2, size)
    const asteroidBelt = selected === 'asteroid belt'
    const asteroidMember = parent?.group === 'asteroid belt'
    const au = MATH.orbits.distance(TEMPERATURE.base(deviation), star.luminosity)
    const period = parent ? parent.period : MATH.orbits.period(au, star.mass)
    const composition = detail.composition
    const physique = ORBIT_GROUPS[selected].size({ size, composition, star, au })
    let hydrosphere = detail.hydrosphere
    if (youth && selected !== 'asteroid belt' && selected !== 'jovian') {
      hydrosphere = HYDROSPHERE.proto(star, size, hydrosphere)
      detail.atmosphere = ATMOSPHERE.youth(star, size)
      detail.subtype = undefined
      detail.chemistry = undefined
    }
    // orbital
    let eccentricity = asteroidBelt
      ? 0
      : MATH.orbits.eccentricity({
          asteroidMember: parent?.group === 'asteroid belt',
          moon: moon?.range,
          proto: star.proto,
          primordial: star.primordial,
          size
        })
    if (detail.eccentric) eccentricity = Math.max(eccentricity, window.dice.uniform(0.01, 0.05))
    // axial tilt
    const tilt = MATH.tilt.compute({ homeworld })
    const direction: Orbit['direction'] = tilt > 90 ? 'retrograde' : 'prograde'
    // environmental
    const { subtype, chemistry } = detail
    const kelvin = TEMPERATURE.base(deviation)
    if (hydrosphere < 10) {
      const hot = TEMPERATURE.describe(kelvin) === 'hot'
      const burning = TEMPERATURE.describe(kelvin) === 'burning'
      if (burning) hydrosphere -= 6
      else if (hot) hydrosphere -= 2
      hydrosphere = Math.max(hydrosphere, 0)
    }

    const atmosphere = ATMOSPHERE.finalize(
      detail.atmosphere,
      size,
      deviation,
      hydrosphere,
      physique.gravity,
      type,
      star,
      primary
    )
    const r = scaleLinear([-1, 0, 5, 10, 14, 15], [0, 1, 3, 6, 8, 10])(size)
    const finalDistance = asteroidMember ? 0 : distance + r + (asteroidBelt ? 10 : 0)
    const orbit: Orbit = {
      idx: window.galaxy.orbits.length,
      tag: 'orbit',
      name: '',
      system: star.system,
      angle,
      distance: finalDistance,
      deviation,
      group: selected,
      zone,
      type,
      subtype,
      rotation: { value: -1, trace: [], roll: -1 },
      direction,
      calendar: { year: -1, day: -1 },
      eccentricity,
      tilt,
      au,
      period,
      size,
      hillSphere: -1,
      mor: -1,
      ...physique,
      composition: { type: composition, description: physique.description },
      atmosphere,
      temperature: {
        mean: 0,
        low: 0,
        high: 0,
        delta: { tilt: 0, rotation: 0, geography: 0, atmospheric: 0, eccentricity: 0, value: 0 },
        trace: { greenhouse: 0, albedo: 0, luminosity: 0, au: 0 }
      },
      hydrosphere: { code: hydrosphere, distribution: window.dice.roll(2, 6) - 2 },
      tides: [],
      seismology: { residual: 0, total: 0, tides: { stress: 0, heating: 0 } },
      biosphere: { code: 0, trace: [] },
      chemistry,
      habitability: { score: -100, trace: [] },
      resources: { score: 0, trace: [] },
      technology: { score: 0, trace: [] },
      orbits: [],
      r,
      parent: parent ? { type: 'orbit', idx: parent.idx } : { type: 'star', idx: star.idx },
      tags: []
    }
    ROTATION.get({ orbit, star })
    window.galaxy.orbits.push(orbit)
    if (asteroidBelt) orbit.belt = ASTEROID_BELT.spawn({ star, au })
    if (parent && moon) {
      const lunar = MOONS.period({ parent, pd: moon.pd, mass: physique.mass })
      orbit.moon = { range: moon.range, pd: moon.pd, period: lunar }
    }
    if (selected === 'jovian' && !moon)
      orbit.rings = window.dice.weightedChoice([
        { v: 'none', w: 6 },
        { v: 'minor', w: 2 },
        { v: 'complex', w: 1 }
      ])

    const hillSphere =
      au * (1 - eccentricity) * ((physique.mass * 0.000003) / (star.mass * 3)) ** (1 / 3)
    const hillPD = (hillSphere * 149597870.9) / (physique.diameter * CONSTANTS.ED)
    const hillLimit = hillPD / 2
    orbit.hillSphere = hillSphere
    if (!parent && (orbit.size > 0 || asteroidBelt) && hillLimit > 2.5) {
      const habMoonNeeded = _primary && selected === 'jovian' && !asteroidBelt
      let subAngle = window.dice.randint(0, 360)
      let distance = asteroidBelt ? 0 : orbit.r + 2
      const orbits =
        star.age < 0.002 && !asteroidBelt ? [] : ORBIT_GROUPS[selected].orbits({ size })
      orbit.mor = Math.min(hillLimit - 2, 200 + orbits.length)
      if (habMoonNeeded && orbits.length < 1) orbits.push('dwarf')
      const habIndex = habMoonNeeded ? window.dice.randint(0, orbits.length - 1) : -1
      const lunarOrbits = MOONS.orbit({ count: orbits.length, mor: orbit.mor })
      orbit.orbits = orbits.map((satellite, i) => {
        const size = MOONS.size(orbit)
        const moon = ORBIT.spawn({
          parent: orbit,
          zone: orbit.zone,
          group:
            satellite === 'asteroid belt'
              ? satellite
              : size > 15
              ? 'jovian'
              : size > 10
              ? 'helian'
              : size > 4
              ? 'terrestrial'
              : 'dwarf',
          size,
          star,
          impactZone,
          distance: distance,
          angle: subAngle,
          companions,
          deviation,
          moon: asteroidBelt ? undefined : { ...lunarOrbits[i] },
          designation: habIndex === i ? 'primary' : undefined
        })
        subAngle += window.dice.randint(90, 180)
        distance = asteroidBelt ? 0 : moon.distance + moon.r + 1
        return moon
      })
      orbit.fullR = distance
      if (!asteroidBelt) orbit.distance += orbit.fullR - orbit.r
    }
    if (!parent) {
      ROTATION.locks.get({ star, orbit, homeworld })
      orbit.calendar = ROTATION.calendar(orbit)
      SURFACE_TIDES.effects({ star, orbit })
      orbit.seismology = SEISMOLOGY.total({ orbit, star })
      orbit.temperature = TEMPERATURE.finalize({ orbit, star })
      BIOSPHERE.get({ orbit, star, impactZone, primary })
      DESIRABILITY.habitability({ orbit })
      orbit.resources = DESIRABILITY.resources(orbit, parent)
      orbit.orbits.forEach(moon => {
        moon.calendar = ROTATION.calendar(moon)
        moon.seismology = SEISMOLOGY.total({ orbit: moon, parent: orbit, star })
        moon.temperature = TEMPERATURE.finalize({ orbit: moon, star, parent: orbit })
        BIOSPHERE.get({ orbit: moon, star, impactZone })
        DESIRABILITY.habitability({ orbit: moon, parent: orbit })
        moon.resources = DESIRABILITY.resources(moon, orbit)
      })
    }
    if (asteroidBelt) orbit.fullR = 10
    return orbit
  }
}
