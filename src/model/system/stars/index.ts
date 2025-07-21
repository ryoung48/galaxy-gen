import { ORBIT } from '../orbits'
import { StarCompanionTemplate, Star, StarSpawnParams } from './types'
import { LANGUAGE } from '../../languages'
import { Orbit } from '../orbits/types'
import { ORBITAL_DEPOSITS } from '../resources'

const incrementAngle = () => window.dice.randint(90, 270)

const spectralAttributes: Record<
  Star['type'],
  { color: string; habitability: number; size: number }
> = {
  'b star': { color: '#d8eeff', habitability: 0.4, size: 10 },
  'a star': { color: '#ffffff', habitability: 0.4, size: 9 },
  'f star': { color: '#fffcd3', habitability: 1, size: 8 },
  'g star': { color: '#fff772', habitability: 1, size: 7 },
  'k star': { color: '#ffc37f', habitability: 1, size: 6 },
  'm star': { color: '#ff9719', habitability: 0.3, size: 5 },
  'm red giant': { color: '#ff4500', habitability: 0.075, size: 8 },
  't star': { color: '#c9b8ef', habitability: 0.3, size: 1 },
  'neutron star': { color: '#000000', habitability: 0, size: 1 },
  'black hole': { color: '#000000', habitability: 0, size: 1 },
  pulsar: { color: '#000000', habitability: 0, size: 1 }
}

const starClass = (parent?: Star, homeworld?: boolean) => {
  const parentClass = parent?.type
  const parentSize = parentClass ? spectralAttributes[parentClass].size : Infinity
  return window.dice.weightedChoice<Star['type']>([
    { v: 'b star', w: parentSize <= spectralAttributes['b star'].size ? 0 : 5 },
    { v: 'a star', w: parentSize <= spectralAttributes['a star'].size ? 0 : 10 },
    { v: 'f star', w: parentSize <= spectralAttributes['f star'].size ? 0 : 15 },
    { v: 'g star', w: parentSize <= spectralAttributes['g star'].size ? 0 : 30 },
    { v: 'k star', w: parentSize <= spectralAttributes['k star'].size ? 0 : 20 },
    { v: 'm star', w: parentSize <= spectralAttributes['m star'].size ? 0 : 20 },
    {
      v: 'm red giant',
      w: homeworld || parentSize <= spectralAttributes['m red giant'].size ? 0 : 5
    },
    { v: 't star', w: parent ? 10 : 0 }
  ])
}

export const STAR = {
  classes: spectralAttributes,
  color: (star: Star): string => spectralAttributes[star.type].color,
  name: (star: Star) => {
    if (!star.name) {
      const system = window.galaxy.systems[star.system]
      const nation = window.galaxy.nations[system.nation]
      if (!nation) return '???'
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
    homeworld,
    spectral
  }: StarSpawnParams): Star => {
    const spectralClass = spectral ?? starClass(parent, homeworld)
    const star: Star = {
      idx: window.galaxy.stars.length,
      tag: 'star',
      name: '',
      system,
      type: spectralClass,
      parent: parent?.idx,
      distance: distance ?? 0,
      angle: angle ?? 0,
      zone,
      orbits: [],
      resources: [],
      r:
        spectralClass === 't star' ||
        spectralClass === 'neutron star' ||
        spectralClass === 'black hole'
          ? 20
          : parent
          ? 30
          : 40
    }
    if (parent) star.distance += star.r
    window.galaxy.stars.push(star)
    ORBITAL_DEPOSITS.spawn({ object: star, primary: true })
    if (star.zone !== 'epistellar') {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const giant = star.type === 'm red giant'
        const companions: StarCompanionTemplate[] = []
        const companionOdds = 11
        const epistellarCompanion = !giant && window.dice.roll(2, 6) >= companionOdds
        if (epistellarCompanion) {
          companions.push({
            type: 'star',
            deviation: window.dice.uniform(1.5, 2.5),
            zone: 'epistellar',
            spectral: starClass(star, homeworld)
          })
        }
        const innerCompanion = !parent && !homeworld && window.dice.roll(2, 6) >= companionOdds
        if (innerCompanion) {
          companions.push({
            type: 'star',
            deviation: window.dice.uniform(-1, 1),
            zone: 'inner',
            spectral: starClass(star, homeworld)
          })
        }
        const outerCompanion = !parent && window.dice.roll(2, 6) >= companionOdds
        if (outerCompanion) {
          companions.push({
            type: 'star',
            deviation: window.dice.uniform(-3.5, -1.5),
            zone: 'outer',
            spectral: starClass(star, homeworld)
          })
        }
        if (!parent && window.dice.roll(2, 6) >= companionOdds) {
          companions.push({
            type: 'star',
            deviation: window.dice.uniform(-4.5, -4),
            zone: 'distant',
            spectral: starClass(star, homeworld)
          })
        }
        const mClass = star.type === 'm star'
        const secondaryNoPlanets = parent && window.dice.random > 0.5
        const maxEpistellar =
          epistellarCompanion || secondaryNoPlanets ? 0 : star.zone === 'inner' ? 1 : 2
        const epistellar = Math.min(maxEpistellar, window.dice.randint(0, mClass ? 1 : 2))
        const maxInner =
          innerCompanion || secondaryNoPlanets || star.zone === 'inner'
            ? 0
            : star.zone === 'outer'
            ? 1
            : 3
        const inner = Math.min(maxInner, window.dice.randint(1, mClass ? 4 : 5))
        const maxOuter =
          outerCompanion || secondaryNoPlanets || star.zone === 'inner'
            ? 0
            : star.zone === 'outer'
            ? 2
            : 5
        const outer = Math.min(
          maxOuter,
          window.dice.randint(innerCompanion ? 1 : 0, mClass ? 4 : 5)
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
            .sample([-1.75, -2.25, -2.75, -3.25, -3.75], outer)
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
          if (primary.zone === 'inner') {
            primary.primary = true
            if (Math.abs(primary.deviation) > 1) {
              primary.deviation = window.dice.choice([-0.5, 0, 0.75])
            }
          }
        }
        if (satellites.length === 0 && !parent) continue
        const orbitals = [...companions, ...satellites]
        orbitals.sort((a, b) => b.deviation - a.deviation)
        let angle = incrementAngle()
        let distance = star.r + 10
        const habitable = spectralAttributes[star.type].habitability * 3
        orbitals.forEach(template => {
          const obj =
            template.type === 'star'
              ? STAR.spawn({
                  system,
                  parent: star,
                  distance,
                  angle,
                  zone: template.zone,
                  spectral: template.spectral
                })
              : ORBIT.spawn({
                  star,
                  zone: template.zone,
                  angle,
                  distance,
                  habitable,
                  homeworld: Boolean(template.homeworld)
                })
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
  }
}
