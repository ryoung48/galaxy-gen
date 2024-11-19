import { scaleLinear } from 'd3'
import { MATH } from '../../utilities/math'
import {
  Orbit,
  OrbitDesirabilityParams,
  OrbitSpawnParams,
  OrbitFinalizeParams,
  EccentricityParams,
  BiosphereParams
} from './types'
import { LANGUAGE } from '../../languages'
import { DICE } from '../../utilities/dice'
import { ORBIT_CLASSIFICATION } from './classification'
import { ORBIT_GROUPS } from './groups'

const hydrospheres = [
  { code: 0, range: '≤5%', description: 'arid, barren' },
  { code: 1, range: '≤15%', description: 'dry, small seas' },
  { code: 2, range: '≤25%', description: 'semi-arid, small oceans' },
  { code: 3, range: '≤35%', description: 'moderate oceans' },
  { code: 4, range: '≤45%', description: 'large oceans' },
  { code: 5, range: '≤55%', description: 'equal land/oceans' },
  { code: 6, range: '≤65%', description: 'ocean-dominated' },
  { code: 7, range: '≤75%', description: 'mostly oceanic' },
  { code: 8, range: '≤85%', description: 'ocean world' },
  { code: 9, range: '≤95%', description: 'no continents' },
  { code: 10, range: '≤100%', description: 'total coverage' },
  { code: 11, description: 'Superdense (incredibly deep world oceans)' },
  { code: 12, description: 'Intense volcanism (molten surface)' },
  { code: 13, description: 'Gas giant core' }
]

const biospheres: Record<string, string> = {
  '0': 'Sterile',
  '1': 'Building Blocks (amino acids, or equivalent)',
  '2': 'Single-celled organisms',
  '3': 'Producers (atmosphere begins to transform)',
  '4': 'Multi-cellular organisms',
  '5': 'Complex single-celled life',
  '6': 'Complex multi-cellular life',
  '7': 'Small macroscopic life',
  '8': 'Large macroscopic life',
  '9': 'Simple global ecology',
  '10': 'Complex global ecology',
  '11': 'Proto-sapience',
  '12': 'Full sapience',
  '13': 'Trans-sapience'
}

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
  '13': 'Theocracy',
  '14': 'Supreme authority',
  '15': 'Hive-mind collective'
}

const lawLevel = (law: number) => {
  if (law === 0) return 'No restrictions'
  if (law === 1) return 'Only restrictions upon WMD and other dangerous technologies'
  if (law <= 4) return 'Light restrictions: heavy weapons, narcotics, alien technology'
  if (law <= 7)
    return 'Heavy restrictions: most weapons, specialized tools and information, foreigners'
  return 'Extreme restrictions: extensive monitoring and limitations, free speech curtailed'
}

const techLevel = (tech: number) => {
  if (tech === 0) return 'No industry. Everything must be imported.'
  if (tech <= 3) return 'Primitive. Mostly only raw materials made locally.'
  if (tech <= 6) return 'Industrial. Local tools maintained, some produced'
  if (tech <= 9) return 'Pre-Stellar. Production and maintenance of space technologies.'
  if (tech <= 11) return 'Early Stellar. Support for A.I. and local starship production.'
  if (tech <= 14) return 'Average Stellar. Support for terraforming, flying cities, clones.'
  return 'High Stellar. Support for highest of the high tech.'
}

const habitable = ({
  hydrosphere,
  size,
  gravity,
  atmosphere,
  temperature,
  type
}: OrbitDesirabilityParams) => {
  let habitability = 10

  if (size <= 4) habitability -= 1
  else if (size >= 9) habitability += 1

  if (atmosphere.code === 12 || atmosphere.code === 14) habitability -= 12
  else if (atmosphere.code === 11) habitability -= 10
  else if ([0, 1, 10].includes(atmosphere.code)) habitability -= 8
  else if (atmosphere.code === 2 || atmosphere.subtype === 'low' || atmosphere.unusual)
    habitability -= 4
  else if (atmosphere.code === 3 || atmosphere.subtype === 'very dense') habitability -= 3
  else if (atmosphere.code === 4 || atmosphere.code === 9) habitability -= 2
  else if ([5, 7, 8].includes(atmosphere.code)) habitability -= 1

  if (hydrosphere === 0) habitability -= 4
  else if (hydrosphere <= 3) habitability -= 2
  else if (hydrosphere === 9) habitability -= 1
  else if (hydrosphere === 10 || hydrosphere === 11) habitability -= 2
  else if (hydrosphere === 12) habitability -= 12

  if (temperature.desc === 'burning' || temperature.desc === 'frozen') habitability -= 6
  else if (temperature.desc === 'cold' || temperature.desc === 'hot') habitability -= 2

  if (gravity <= 0.4) habitability -= 2
  else if (gravity <= 0.7) habitability -= 1
  else if (gravity <= 0.9) habitability += 1
  else if (gravity <= 1.4) habitability -= 1
  else if (gravity <= 2) habitability -= 2
  else habitability -= 6

  if (ORBIT_CLASSIFICATION[type].tidalLock) habitability -= 2
  return habitability
}

const garden = () => {
  const size = window.dice.randint(5, 10)
  const atmosphere = MATH.clamp(window.dice.roll(2, 6) + size - 7, 4, 9)
  const hydrosphere = window.dice.randint(4, 8)
  return {
    atmosphere,
    hydrosphere,
    size,
    chemistry: 'water' as const,
    subtype: 'gaian',
    biosphere: 12
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

const axialTilt = (tidalLocked?: boolean) => {
  if (tidalLocked) return (window.dice.roll(2, 6) - 2) / 10
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

const _temperature = scaleLinear<number, number>()
  .domain([
    -4.5, -4.0, -4.0, -3.5, -3.5, -3.0, -3.0, -2.5, -2.5, 2.0, -2.0, -1.5, -1.5, -1.0, -1.0, -0.5,
    -0.5, 0.5, 0.5, 1.0, 1.0, 1.5, 1.5, 2.0, 2.0, 2.5
  ])
  .range([
    -250, -230, -210, -190, -180, -160, -150, -130, -120, -100, -95, -75, -65, -50, -40, 0, 5, 25,
    35, 75, 85, 180, 200, 300, 350, 450
  ])

const finalizeTemperature = (
  atmosphere: Orbit['atmosphere'],
  hydrosphere: number,
  type: Orbit['type']
) => {
  let roll = 0
  if (atmosphere.subtype === 'very thin') roll -= 2
  else if (atmosphere.subtype === 'thin') roll -= 1
  else if (atmosphere.subtype === 'dense') roll += 1
  else if (atmosphere.subtype === 'very dense') roll += 2
  if ([11, 12].includes(atmosphere.code)) roll += 6
  if (hydrosphere === 12) roll += 8
  if (type === 'telluric') roll += 8
  return roll * window.dice.uniform(10, 15)
}

const finalizeAtmosphere = (
  code: number,
  size: number,
  deviation: number,
  hydrosphere: number,
  type: Orbit['type']
): Orbit['atmosphere'] => {
  if (code === 0) return { code, type: 'vacuum' }
  if (code === 1) return { code, type: 'trace' }
  if (code === 2) return { code, type: 'breathable', subtype: 'very thin', tainted: true }
  if (code === 3) return { code, type: 'breathable', subtype: 'very thin' }
  if (code === 4) return { code, type: 'breathable', subtype: 'thin', tainted: true }
  if (code === 5) return { code, type: 'breathable', subtype: 'thin' }
  if (code === 6) return { code, type: 'breathable', subtype: 'standard' }
  if (code === 7) return { code, type: 'breathable', subtype: 'standard', tainted: true }
  if (code === 8) return { code, type: 'breathable', subtype: 'dense' }
  if (code === 9) return { code, type: 'breathable', subtype: 'dense', tainted: true }
  if (code === 10) {
    let roll = window.dice.roll(2, 6)
    if (size <= 4) roll -= 2
    if (deviation >= 1.5) roll -= 2
    if (deviation <= -1.5) roll += 2
    if (roll <= 2) return { code, type: 'exotic', subtype: 'very thin', tainted: true }
    if (roll <= 3) return { code, type: 'exotic', subtype: 'very thin' }
    if (roll <= 4) return { code, type: 'exotic', subtype: 'thin', tainted: true }
    if (roll <= 5) return { code, type: 'exotic', subtype: 'thin' }
    if (roll <= 6) return { code, type: 'exotic', subtype: 'standard', tainted: true }
    if (roll <= 8) return { code, type: 'exotic', subtype: 'standard' }
    if (roll <= 9) return { code, type: 'exotic', subtype: 'dense', tainted: true }
    if (roll <= 10) return { code, type: 'exotic', subtype: 'dense' }
    if (roll <= 11) return { code, type: 'exotic', subtype: 'very dense', tainted: true }
    return { code, type: 'exotic', subtype: 'very dense' }
  }
  if (code === 11 || code === 12) {
    const insidious = code === 12
    const gas = insidious ? 'insidious' : 'corrosive'
    let roll = window.dice.roll(2, 6)
    if (size <= 4) roll -= 3
    if (size >= 8) roll += 2
    if (deviation >= 1.5) roll += 4
    if (deviation <= -1.5) roll -= 2
    if (insidious) roll += 2
    if (type === 'telluric') roll += 4
    if (roll <= 3) return { code, type: gas, subtype: 'very thin' }
    if (roll <= 5) return { code, type: gas, subtype: 'thin' }
    if (roll <= 7) return { code, type: gas, subtype: 'standard' }
    if (roll <= 10) return { code, type: gas, subtype: 'dense' }
    return { code, type: gas, subtype: 'very dense' }
  }
  if (code === 13) {
    const panthalassic = type === 'panthalassic'
    const subtype: Orbit['atmosphere']['subtype'] = window.dice.weightedChoice([
      { v: 'very dense', w: 3 },
      { v: 'low', w: panthalassic ? 0 : 1 },
      { v: 'unusual', w: 0.5 },
      { v: 'gas, helium', w: panthalassic ? 0 : 0.25 },
      { v: 'gas, hydrogen', w: panthalassic ? 0 : 0.25 }
    ])
    return {
      code,
      type: 'massive',
      subtype,
      unusual:
        subtype === 'unusual'
          ? window.dice.weightedChoice([
              { v: 'ellipsoid', w: 1 },
              { v: 'layered', w: 1 },
              { v: 'steam', w: panthalassic || hydrosphere < 5 ? 0 : 1 },
              { v: 'storms', w: 1 },
              { v: 'tides', w: hydrosphere < 5 ? 0 : 1 },
              { v: 'seasonal', w: 1 }
            ])
          : undefined
    }
  }
  return { code, type: 'gas giant envelope' }
}

const finalizeAtmosphereHazards = (atmosphere: Orbit['atmosphere']) => {
  if (atmosphere.tainted) {
    const exotic = atmosphere.type === 'exotic'
    const subtype = atmosphere.subtype
    const invalidOxygen =
      (subtype && ['very thin', 'thin', 'dense', 'very dense'].includes(subtype)) || exotic
    atmosphere.hazard = window.dice.weightedChoice([
      { v: 'biologic', w: 2 },
      { v: 'gas mix', w: 2 },
      { v: 'particulates', w: 2 },
      { v: 'sulphur compounds', w: 1 },
      { v: 'radioactive', w: 2 },
      { v: 'low oxygen', w: invalidOxygen ? 0 : 1 },
      { v: 'high oxygen', w: invalidOxygen ? 0 : 1 }
    ])
  } else if (atmosphere.type === 'corrosive' || atmosphere.type === 'insidious') {
    atmosphere.hazard = window.dice.weightedChoice([
      { v: 'biologic', w: 1 },
      { v: 'gas mix', w: 3 },
      { v: 'radioactive', w: 2 }
    ])
  }
}

const calculateBiosphere = (params: BiosphereParams) => {
  const { chemistry, star, type, atmosphere, size, temperature, hydrosphere } = params
  let modifier = 0
  if (chemistry === 'ammonia') modifier += 1
  else if (chemistry === 'methane') modifier += 3

  let complexity = 0
  if (type === 'geo-cyclic') {
    complexity =
      star.age >= 4 + modifier && atmosphere.code === 10
        ? window.dice.roll(1, 6) + size - 2
        : star.age >= window.dice.roll(1, 3) + modifier
        ? atmosphere.code === 10
          ? window.dice.roll(1, 3)
          : window.dice.roll(1, 6) - 4
        : 0
  } else if (type === 'snowball') {
    const subsurface = hydrosphere < 10
    complexity =
      subsurface && star.age >= 6 + modifier
        ? window.dice.roll(1, 6) + size - 2
        : subsurface && star.age >= window.dice.roll(1, 6)
        ? window.dice.roll(1, 6) - 3
        : 0
  } else {
    complexity =
      star.age >= 4 + modifier
        ? window.dice.roll(2, 6)
        : star.age >= window.dice.roll(1, 3) + modifier
        ? window.dice.roll(1, 3)
        : 0
  }
  if (type !== 'snowball') {
    if (temperature === 'frozen' || temperature === 'burning') complexity -= 6
    else if (temperature === 'cold') complexity -= 2
  }

  if (atmosphere.hazard === 'low oxygen') complexity -= 2
  if (atmosphere.code < 4 || atmosphere.code > 9) complexity -= 2

  if (atmosphere.type !== 'breathable') {
    if (window.dice.random < 0.5) complexity -= 1
    else complexity += 1
  }

  complexity = Math.max(atmosphere.hazard === 'biologic' ? 1 : 0, Math.min(12, complexity))

  return { biomass: 0, complexity }
}

export const ORBIT = {
  biospheres,
  populations,
  governments,
  lawLevel,
  techLevel,
  hydrospheres,
  eccentricity: ({ star, asteroidMember, tidalLocked }: EccentricityParams) => {
    // 0 = circular
    // 1 = unbound interstellar object
    let roll = window.dice.roll(2, 6)
    if (star) roll += 2
    if (tidalLocked) roll -= 2
    if (asteroidMember) roll += 1
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
  code: (orbit: Orbit) =>
    orbit.population > 0 ? `${ORBIT.name(orbit)} (${orbit.habitation})` : ORBIT.name(orbit),
  orbits: (orbit: Orbit): Orbit[] => orbit.orbits.map(moon => [moon, ...ORBIT.orbits(moon)]).flat(),
  parent: (orbit: Orbit) =>
    orbit.parent.type === 'star'
      ? window.galaxy.stars[orbit.parent.idx]
      : window.galaxy.orbits[orbit.parent.idx],
  spawn: ({
    star,
    zone,
    impactZone,
    group,
    parent,
    angle,
    distance,
    homeworld,
    unary,
    deviation
  }: OrbitSpawnParams): Orbit => {
    const selected =
      group ??
      (homeworld
        ? 'terrestrial'
        : window.dice.weightedChoice<Orbit['group']>([
            { v: 'asteroid belt', w: 2 },
            { v: 'dwarf', w: 2 },
            { v: 'terrestrial', w: 3 },
            { v: 'helian', w: 1 },
            { v: 'jovian', w: zone === 'outer' ? 2 : 0.5 }
          ]))
    const type = homeworld
      ? 'tectonic'
      : ORBIT_GROUPS[selected].type({ zone, impactZone, parent, star })
    const detail = homeworld ? garden() : ORBIT_CLASSIFICATION[type].roll({ star, zone })
    let { size } = detail
    const physique = ORBIT_GROUPS[selected].size({ star, deviation, size })
    const asteroidBelt = selected === 'asteroid belt'
    const asteroidMember = parent?.group === 'asteroid belt'
    size = asteroidMember ? size : Math.max(0, Math.min((parent?.size ?? Infinity) - 3, size))
    const { subtype, hydrosphere, chemistry } = detail
    const atmosphere = finalizeAtmosphere(detail.atmosphere, size, deviation, hydrosphere, type)
    finalizeAtmosphereHazards(atmosphere)
    const kelvin = parent?.temperature.base ?? ORBIT.temperature(deviation)
    const finalKelvin = kelvin + finalizeTemperature(atmosphere, hydrosphere, type)
    const temperature: Orbit['temperature'] = {
      base: kelvin,
      kelvin: finalKelvin,
      desc:
        finalKelvin <= 223
          ? 'frozen'
          : finalKelvin <= 273.15
          ? 'cold'
          : finalKelvin <= 303.15
          ? 'temperate'
          : finalKelvin <= 353.15
          ? 'hot'
          : 'burning'
    }
    const au = MATH.orbits.distance(kelvin, star.luminosity)
    const r = scaleLinear([-1, 0, 5, 10, 15], [0, 1, 3, 6, 10])(size)
    const finalDistance = asteroidMember ? 0 : distance + r + (asteroidBelt ? 10 : 0)
    const habitability = habitable({
      type,
      hydrosphere,
      atmosphere,
      size,
      temperature,
      gravity: physique.gravity
    })
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
      rotation: rotation(size, ORBIT_CLASSIFICATION[type].tidalLock, parent),
      eccentricity: asteroidBelt
        ? 0
        : parent && parent.group !== 'asteroid belt'
        ? parent.eccentricity
        : ORBIT.eccentricity({
            tidalLocked: ORBIT_CLASSIFICATION[type].tidalLock,
            asteroidMember: parent?.group === 'asteroid belt'
          }),
      axialTilt: axialTilt(ORBIT_CLASSIFICATION[type].tidalLock),
      au,
      period: parent ? parent.period : MATH.orbits.period(au, star.mass),
      size,
      ...physique,
      atmosphere,
      temperature,
      hydrosphere: { code: hydrosphere, distribution: window.dice.roll(2, 6) - 2 },
      biosphere: ORBIT_CLASSIFICATION[type].biosphere
        ? calculateBiosphere({
            atmosphere,
            hydrosphere,
            temperature: temperature.desc,
            star,
            type,
            size
          })
        : { biomass: 0, complexity: 0 },
      chemistry,
      habitability,
      habitation: 'none',
      population: 0,
      government: 0,
      law: 0,
      starport: 'X',
      tech: 0,
      orbits: [],
      r,
      parent: parent ? { type: 'orbit', idx: parent.idx } : { type: 'star', idx: star.idx }
    }
    ORBIT_CLASSIFICATION[type].classify?.({ orbit, deviation })
    window.galaxy.orbits.push(orbit)
    if (selected === 'jovian') orbit.rings = window.dice.roll(1, 6) <= 4 ? 'minor' : 'complex'
    if (selected === 'asteroid belt') {
      console.log()
    }
    if (!parent && (orbit.size > 0 || asteroidBelt)) {
      let subAngle = window.dice.randint(90, 270)
      let distance = orbit.r + 2
      orbit.orbits = ORBIT_GROUPS[selected].orbits().map(satellite => {
        const moon = ORBIT.spawn({
          parent: orbit,
          zone: orbit.zone,
          group: satellite,
          star,
          impactZone,
          distance: distance,
          angle: subAngle,
          unary,
          deviation
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
  },
  finalize: ({ orbit, capital, primary, main }: OrbitFinalizeParams) => {
    const habitability = orbit.habitability
    const habitation =
      orbit.biosphere.complexity >= 12
        ? 'homeworld'
        : (main?.population ?? Infinity) <= 1
        ? 'none'
        : (window.dice.roll(2, 6) - 2 < habitability && habitability >= 0) ||
          (habitability > 3 && primary)
        ? 'colony'
        : window.dice.roll(1, 6) < 4 || primary
        ? 'outpost'
        : 'none'
    const homeworldPop = habitability + window.dice.roll(1, 3) - window.dice.roll(1, 3)
    let population =
      habitation === 'homeworld'
        ? homeworldPop
        : habitation === 'colony'
        ? window.dice.randint(4, Math.max(4, homeworldPop - 1))
        : habitation === 'outpost'
        ? Math.max(1, Math.min(habitability + window.dice.roll(1, 3), 4))
        : 0
    if (capital) population += 1
    if (main) population = Math.min(main.population - 1, population)
    let port = Math.max(
      1,
      window.dice.roll(2, 6) +
        (population >= 10
          ? 2
          : population >= 8
          ? 1
          : population >= 5
          ? 0
          : population >= 3
          ? -1
          : -2)
    )
    if (habitation === 'none') port = 0
    orbit.starport =
      capital || port >= 11
        ? 'A'
        : port >= 9
        ? 'B'
        : port >= 7
        ? 'C'
        : port >= 5
        ? 'D'
        : port >= 3
        ? 'E'
        : 'X'
    if (orbit.starport === 'X') population = 0
    let government = population > 0 ? population + window.dice.roll(2, 6) - 7 : 0
    if (habitation === 'outpost') government = Math.min(6, government)
    if (capital && government === 6) government = 7
    government = Math.max(0, government)
    let industry = Math.max(
      capital ? 15 : 0,
      habitation === 'none'
        ? 0
        : window.dice.roll(1, 6) +
            (orbit.starport === 'A'
              ? 6
              : orbit.starport === 'B'
              ? 4
              : orbit.starport === 'C'
              ? 2
              : 0) +
            (orbit.size <= 1 ? 2 : orbit.size <= 4 ? 1 : 0) +
            (orbit.atmosphere.code <= 3 || orbit.atmosphere.code >= 10 ? 1 : 0) +
            (orbit.hydrosphere.code === 10
              ? 2
              : orbit.hydrosphere.code >= 9 || orbit.hydrosphere.code <= 1
              ? 1
              : 0) +
            (orbit.hydrosphere.code === 10
              ? 2
              : orbit.hydrosphere.code >= 9 || orbit.hydrosphere.code <= 1
              ? 1
              : 0) +
            (orbit.population <= 5 || orbit.population === 8
              ? 1
              : orbit.population === 9
              ? 2
              : orbit.population >= 10
              ? 4
              : 0) +
            (government === 0 || government === 5
              ? 1
              : government === 7
              ? 2
              : government === 13
              ? -2
              : 0)
    )
    const minSustainable =
      orbit.atmosphere.code === 12
        ? 10
        : orbit.atmosphere.code === 11
        ? 9
        : orbit.atmosphere.code <= 1 || orbit.atmosphere.code >= 14 || orbit.atmosphere.code === 10
        ? 8
        : orbit.atmosphere.code <= 3 || orbit.atmosphere.code === 13
        ? 5
        : orbit.atmosphere.code === 4 || orbit.atmosphere.code === 7 || orbit.atmosphere.code === 9
        ? 3
        : 0
    if (main) industry = Math.min(main.tech - 1, industry)
    industry = Math.max(minSustainable, industry)
    const law = Math.max(0, government === 0 ? 0 : government + window.dice.roll(2, 6) - 7)
    orbit.habitation = habitation
    orbit.population = population
    orbit.government = government
    orbit.law = law
    orbit.tech = industry
  },
  temperature: (deviation: number) => MATH.temperature.kelvin(_temperature(deviation))
}
