import { range, scaleLinear } from 'd3'
import { MATH } from '../src/model/utilities/math'
import { Orbit, OrbitDesirabilityParams, OrbitSpawnParams, OrbitGroupDetails } from '../src/model/system/orbits/types'
import { LANGUAGE } from '../src/model/languages'
import { DICE } from '../src/model/utilities/dice'

const groups: Record<Orbit['group'], OrbitGroupDetails> = {
  'asteroid belt': {
    size: () => -1,
    moons: () => 0
  },
  terrestrial: {
    size: parent => {
      if (parent) return window.dice.roll(1, 6)
      const primary = window.dice.roll(1, 6)
      return primary <= 2
        ? window.dice.roll(1, 6)
        : primary <= 4
        ? window.dice.roll(2, 6)
        : window.dice.roll(2, 6) + 3
    },
    moons: () => {
      return Math.max(0, window.dice.roll(1, 6) - 3)
    }
  },
  jovian: {
    size: () => window.dice.randint(16, 18),
    moons: () => {
      return window.dice.roll(1, 6)
    }
  }
}

const sizes: Record<string, string> = {
  '-1': 'asteroid belt',
  '0': '≤800 km, neg. gravity',
  '1': '1,600 km, 0.05 G',
  '2': '3,200 km, 0.15 G (Triton, Luna, Europa)',
  '3': '4,800 km, 0.25 G (Mercury, Ganymede)',
  '4': '6,400 km, 0.35 G (Mars)',
  '5': '8,000 km, 0.45 G',
  '6': '9,600 km, 0.70 G',
  '7': '11,200 km, 0.9 G',
  '8': '12,800 km, 1.0 G (Terra)',
  '9': '14,400 km, 1.25 G',
  '10': '≥16,000 km, ≥1.4 G',
  '11': 'Helian sizes',
  '12': 'Helian sizes',
  '13': 'Helian sizes',
  '14': 'Helian sizes',
  '15': 'Jovian sizes'
}

const atmospheres: Record<string, string> = {
  '0': 'Vacuum',
  '1': 'Trace',
  '2': 'Very Thin Tainted',
  '3': 'Very Thin Breathable',
  '4': 'Thin Tainted',
  '5': 'Thin Breathable',
  '6': 'Standard Breathable',
  '7': 'Standard Tainted',
  '8': 'Dense Breathable',
  '9': 'Dense Tainted',
  '10': 'Exotic',
  '11': 'Corrosive',
  '12': 'Insidious',
  '13': 'Super-High Density',
  '14': 'Super-Low Density',
  '15': 'Unusual',
  '16': 'Gas Giant Envelope'
}

const hydrospheres: Record<string, string> = {
  '0': '≤5% (Trace)',
  '1': '≤15% (Dry / tiny ice caps)',
  '2': '≤25% (Small seas / ice caps)',
  '3': '≤35% (Small oceans / large ice caps)',
  '4': '≤45% (Wet)',
  '5': '≤55% (Large oceans)',
  '6': '≤65%',
  '7': '≤75% (Terra)',
  '8': '≤85% (Water world)',
  '9': '≤95% (No continents)',
  '10': '≤100% (Total coverage)',
  '11': 'Superdense (incredibly deep world oceans)',
  '12': 'Intense Volcanism (molten surface)',
  '13': 'Gas Giant Core'
}

const biospheres: Record<string, string> = {
  '0': 'Sterile',
  '1': 'Building Blocks (amino acids, or equivalent)',
  '2': 'Single-celled organisms',
  '3': 'Producers (atmosphere begins to transform)',
  '4': 'Multi-cellular organisms',
  '5': 'Complex single-celled life (nucleic cells, or equivalent)',
  '6': 'Complex multi-cellular life (microscopic animals)',
  '7': 'Small macroscopic life',
  '8': 'Large macroscopic life',
  '9': 'Simple global ecology (life goes out of the oceans and onto land or into the air, etc.)',
  '10': 'Complex global ecology',
  '11': 'Proto-sapience',
  '12': 'Full sapience',
  '13': 'Trans-sapience (able to deliberately alter their own evolution, minimum Tech Level C)'
}

const desirability = ({
  star,
  zone,
  group,
  hydrosphere,
  size,
  atmosphere
}: OrbitDesirabilityParams) => {
  const asteroidBelt = group === 'asteroid belt'
  let roll = asteroidBelt ? window.dice.roll(1, 6) - window.dice.roll(1, 6) : 0
  // dry world
  if (!asteroidBelt && hydrosphere === 0) roll -= 1
  // extreme environment
  if (!asteroidBelt && (size >= 13 || atmosphere >= 12 || hydrosphere === 12)) roll -= 2
  // flare star
  if (star.class === 'M-Ve') roll -= window.dice.roll(1, 3)
  // habitable world
  if (
    !asteroidBelt &&
    size >= 1 &&
    size <= 11 &&
    atmosphere >= 2 &&
    atmosphere <= 9 &&
    hydrosphere >= 0 &&
    hydrosphere <= 11
  ) {
    // garden world
    if (
      size >= 5 &&
      size <= 10 &&
      atmosphere >= 4 &&
      atmosphere <= 9 &&
      hydrosphere >= 4 &&
      hydrosphere <= 8
    )
      roll += 5
    // water world
    else if (hydrosphere >= 10 && hydrosphere <= 11) roll += 3
    // poor world
    else if (atmosphere >= 2 && atmosphere <= 6 && hydrosphere >= 0 && hydrosphere <= 3) roll += 2
    else roll += 4
  }
  // high gravity
  if (!asteroidBelt && size >= 10 && atmosphere < 14) roll -= 1
  // lifebelt
  if (zone === 'inner') {
    if (star.class === 'M-V') roll += 1
    else if (
      star.class !== 'L' &&
      star.class !== 'D' &&
      star.class !== 'O' &&
      star.class !== 'B' &&
      star.class !== 'M-Ib' &&
      star.class !== 'K-III' &&
      star.class !== 'M-III'
    )
      roll += 2
  }
  // tiny world
  if (!asteroidBelt && size === 0) roll -= 1
  // t-prime atmosphere
  if (!asteroidBelt && (atmosphere === 6 || atmosphere === 8)) roll += 1
  return roll
}

const _colors: Record<string, string> = {}

export const ORBIT = {
  atmospheres,
  biospheres,
  colors: {
    set: () => {
      DICE.swap('planet', () => {
        window.galaxy.orbits.forEach(orbit => {
          if (!_colors[orbit.type]) _colors[orbit.type] = details[orbit.type].color
        })
      })
    },
    get: () => _colors
  },
  describe: (orbit: Orbit) => details[orbit.type].description,
  hydrospheres,
  name: (orbit: Orbit) => {
    if (!orbit.name) {
      const system = window.galaxy.systems[orbit.system]
      const nation = window.galaxy.nations[system.nation]
      orbit.name = LANGUAGE.word.unique({ key: 'orbit', lang: nation.language })
    }
    return orbit.name
  },
  orbits: (orbit: Orbit): Orbit[] => orbit.orbits.map(moon => [moon, ...ORBIT.orbits(moon)]).flat(),
  sizes,
  parent: (orbit: Orbit) =>
    orbit.parent.type === 'star'
      ? window.galaxy.stars[orbit.parent.idx]
      : window.galaxy.orbits[orbit.parent.idx],
  spawn: ({ star, zone, group, parent, angle, distance, orbit }: OrbitSpawnParams): Orbit => {
    const selected =
      group ??
      window.dice.weightedChoice<Orbit['group']>([
        { v: 'asteroid belt', w: 2 },
        { v: 'terrestrial', w: 6 },
        { v: 'jovian', w: zone === 'outer' ? 2 : 0.5 }
      ])
    if (!groups[selected]) throw new Error(`Invalid orbit group: ${selected}`)
    const _size = groups[selected].size(parent)
    const asteroidBelt = selected === 'asteroid belt'
    const size = Math.max(0, Math.min((parent?.size ?? Infinity) - 3, _size))
    const r = scaleLinear([-1, 0, 5, 10, 15], [0, 1, 3, 6, 10])(size)
    const finalDistance = distance + r + (asteroidBelt ? 10 : 0)
    const dev = star.hzco - orbit
    const temperature: Orbit['temperature'] =
      parent?.temperature ?? dev >= 1.1
        ? 'frozen'
        : dev >= 0.25
        ? 'cold'
        : dev >= -0.25
        ? 'temperate'
        : dev >= -1.1
        ? 'hot'
        : 'burning'
    const atmosphereRoll = Math.max(0, window.dice.roll(2, 6) - 7 + size)
    const atmosphere =
      size <= 1
        ? 0
        : zone === 'inner'
        ? atmosphereRoll
        : zone === 'epistellar'
        ? atmosphereRoll <= 0
          ? 0
          : atmosphereRoll <= 2
          ? 1
          : atmosphereRoll <= 9
          ? 10
          : atmosphereRoll <= 12
          ? 11
          : atmosphereRoll <= 14
          ? 12
          : atmosphereRoll
        : atmosphereRoll <= 0
        ? 0
        : atmosphereRoll <= 2
        ? 1
        : atmosphereRoll <= 10
        ? 10
        : atmosphereRoll <= 12
        ? 11
        : atmosphereRoll <= 13
        ? 12
        : atmosphereRoll <= 14
        ? 13
        : atmosphereRoll
    const hydrosphere = Math.max(
      0,
      size <= 1
        ? 0
        : Math.max(0, window.dice.roll(2, 6) - 7 + atmosphere) -
            (temperature === 'hot' ? 2 : temperature === 'burning' ? 6 : 0) -
            (atmosphere <= 1 || atmosphere >= 10 ? 4 : 0)
    )
    const biosphere = Math.max(
      window.dice.roll(2, 6) +
        (atmosphere <= 0
          ? -6
          : atmosphere <= 1
          ? -4
          : atmosphere <= 3 || atmosphere === 15 || atmosphere == 10
          ? -3
          : atmosphere <= 5
          ? -2
          : atmosphere <= 7
          ? 0
          : atmosphere <= 9 || atmosphere === 14
          ? 2
          : atmosphere === 12
          ? -7
          : -5) +
        (hydrosphere === 0
          ? -4
          : hydrosphere <= 3
          ? -3
          : hydrosphere <= 5
          ? 0
          : hydrosphere <= 8
          ? 1
          : 2) +
        (star.class.spectral === 'O' || star.class.spectral === 'B' || star.class.spectral === 'A'
          ? -6
          : 0) +
        (temperature === 'temperate'
          ? 2
          : temperature === 'cold'
          ? -2
          : temperature === 'hot'
          ? 0
          : -6),
      0
    )
    const spawned: Orbit = {
      idx: window.galaxy.orbits.length,
      tag: 'orbit',
      name: '',
      system: star.system,
      angle,
      distance: finalDistance,
      group: selected,
      zone,
      size,
      temperature,
      atmosphere,
      hydrosphere,
      biosphere,
      orbits: [],
      r,
      parent: parent ? { type: 'orbit', idx: parent.idx } : { type: 'star', idx: star.idx }
    }
    window.galaxy.orbits.push(spawned)
    if (!parent) {
      let subAngle = 0
      let distance = spawned.r + 2
      spawned.orbits = range(groups[selected].moons()).map(() => {
        const moon = ORBIT.spawn({
          parent: spawned,
          zone: spawned.zone,
          group: 'terrestrial',
          star,
          orbit,
          distance: distance,
          angle: subAngle
        })
        subAngle += window.dice.randint(90, 270)
        distance = moon.distance + moon.r + 1
        return moon
      })
      spawned.fullR = distance
      spawned.distance += spawned.fullR - spawned.r
    }
    if (asteroidBelt) spawned.fullR = 10
    return spawned
  }
}
