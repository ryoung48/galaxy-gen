import { scaleLinear } from 'd3'
import { Orbit, OrbitSpawnParams } from './types'
import { LANGUAGE } from '../../languages'
import { MOON, ORBIT_CLASSIFICATION } from './classification'
import { WeightedDistribution } from '../../utilities/dice/types'
import { ORBITAL_DEPOSITS } from '../resources'

const planets = (
  habitable: number
): Record<Orbit['zone'], WeightedDistribution<Orbit['type']>> => ({
  epistellar: [
    { v: 'asteroid belt', w: 5 },
    { v: 'barren', w: 10 },
    { v: 'molten', w: 10 }
  ],
  inner: [
    { v: 'asteroid belt', w: 5 },
    { v: 'barren', w: 10 },
    { v: 'desert', w: habitable / 9 },
    { v: 'arid', w: habitable / 9 },
    { v: 'savanna', w: habitable / 9 },
    { v: 'oceanic', w: habitable / 9 },
    { v: 'continental', w: habitable / 9 },
    { v: 'tropical', w: habitable / 9 },
    { v: 'tundra', w: habitable / 9 },
    { v: 'alpine', w: habitable / 9 },
    { v: 'arctic', w: habitable / 9 },
    { v: 'gas giant', w: 6 },
    { v: 'toxic', w: 10 }
  ],
  outer: [
    { v: 'ice asteroid belt', w: 5 },
    { v: 'gas giant', w: 6 },
    { v: 'frozen', w: 10 }
  ]
})

export const ORBIT = {
  color: (orbit: Orbit) => ORBIT_CLASSIFICATION[orbit.type].color,
  name: (orbit: Orbit) => {
    if (!orbit.name) {
      const system = window.galaxy.systems[orbit.system]
      const nation = window.galaxy.nations[system.nation]
      if (!nation) return '???'
      orbit.name = LANGUAGE.word.unique({ key: 'orbit', lang: nation.language })
    }
    return orbit.name
  },
  orbits: (orbit: Orbit): Orbit[] => orbit.orbits.map(moon => [moon, ...ORBIT.orbits(moon)]).flat(),
  parent: (orbit: Orbit) =>
    orbit.parent.type === 'star'
      ? window.galaxy.stars[orbit.parent.idx]
      : window.galaxy.orbits[orbit.parent.idx],
  spawn: ({
    star,
    zone,
    parent,
    moon,
    angle,
    distance,
    habitable,
    homeworld
  }: OrbitSpawnParams): Orbit => {
    const type = homeworld
      ? window.dice.choice<Orbit['type']>([
          'desert',
          'arid',
          'savanna',
          'oceanic',
          'continental',
          'tropical',
          'tundra',
          'alpine',
          'arctic'
        ])
      : moon?.type ?? window.dice.weightedChoice(planets(habitable)[zone])
    const size = moon?.size ?? ORBIT_CLASSIFICATION[type].size()
    const asteroidMember = ORBIT_CLASSIFICATION[parent?.type ?? 'frozen']?.asteroidBelt
    const asteroidBelt = ORBIT_CLASSIFICATION[type]?.asteroidBelt
    const r = scaleLinear([-1, 0, 5, 10, 14, 15], [0, 1, 3, 6, 8, 10])(size)
    const finalDistance = asteroidMember ? 0 : distance + r + (asteroidBelt ? 10 : 0)
    const orbit: Orbit = {
      idx: window.galaxy.orbits.length,
      tag: 'orbit',
      type,
      size,
      zone,
      name: '',
      system: star.system,
      angle,
      distance: finalDistance,
      orbits: [],
      resources: [],
      r,
      parent: parent ? { type: 'orbit', idx: parent.idx } : { type: 'star', idx: star.idx }
    }
    window.galaxy.orbits.push(orbit)
    if (!asteroidBelt) ORBITAL_DEPOSITS.spawn({ object: orbit })
    if (!parent && (orbit.size > 0 || orbit.size === -1)) {
      let subAngle = window.dice.randint(90, 270)
      let distance = asteroidBelt ? 0 : orbit.r + 2
      const orbits = ORBIT_CLASSIFICATION[type].orbits({ habitable, zone, giant: size > 12 })
      orbit.orbits = orbits.map(satellite => {
        const moonSize = MOON.sizes(orbit, satellite)
        const moon = ORBIT.spawn({
          parent: orbit,
          zone: orbit.zone,
          moon: { type: satellite, size: moonSize },
          star,
          distance: distance,
          angle: subAngle,
          habitable,
          homeworld: false
        })
        subAngle += window.dice.randint(90, 270)
        distance = asteroidBelt ? 0 : moon.distance + moon.r + 1
        return moon
      })
      orbit.fullR = distance
      if (!asteroidBelt) orbit.distance += orbit.fullR - orbit.r
    }
    if (asteroidBelt) orbit.fullR = 10
    return orbit
  }
}
