import { MATH } from '../../../utilities/math'
import { RotationParams, TidalLockParams, TidalLockEffectParams } from './types'
import { Orbit } from '../types'
import { Star } from '../../stars/types'
import { ORBIT_CLASSIFICATION } from '../classification'
import { ATMOSPHERE } from '../atmosphere'

type TraceEntry = { value: number; description: string }

type DmBreakdown = { value: number; trace: TraceEntry[] }

const createCollector = () => {
  let value = 0
  const trace: TraceEntry[] = []
  return {
    add: (delta: number, description: string) => {
      value += delta
      if (delta !== 0) trace.push({ value: delta, description })
    },
    result: (): DmBreakdown => ({ value, trace })
  }
}

const resetRotationTrace = (orbit: Orbit) => {
  orbit.rotation.trace = []
  orbit.rotation.roll = 0
}

const pushTraceEntries = (orbit: Orbit, entries: TraceEntry[]) => {
  entries.forEach(({ value, description }) => {
    if (value === 0) return
    orbit.rotation.trace.push({ value, description: description.toLowerCase() })
  })
}

const classify = (orbit: Orbit, star: Star) => {
  if (
    orbit.direction !== '1:1 tidal lock' ||
    orbit.group !== 'terrestrial' ||
    orbit.type === 'acheronian'
  )
    return
  orbit.type = orbit.zone === 'epistellar' ? 'jani-lithic' : 'vesperian'
  const { atmosphere, hydrosphere } = ORBIT_CLASSIFICATION[orbit.type].roll({
    star,
    zone: orbit.zone,
    deviation: orbit.deviation,
    sizeOverride: orbit.size
  })
  orbit.hydrosphere.code = hydrosphere
  orbit.atmosphere = ATMOSPHERE.finalize(
    atmosphere,
    orbit.size,
    orbit.deviation,
    hydrosphere,
    orbit.type
  )
}

export const ROTATION = {
  get: ({ orbit, star }: RotationParams) => {
    const mult = orbit.size <= 0 || orbit.size > 15 ? 2 : 4
    const mod = Math.floor(star.age / 2)
    let base = (window.dice.roll(2, 6) - 2) * mult + 2 + window.dice.roll(1, 6) + mod
    let rotation = base
    while (base > 40 && window.dice.roll(1, 6) >= 5) {
      base = (window.dice.roll(2, 6) - 2) * mult + window.dice.roll(1, 6)
      rotation += base
    }
    orbit.rotation.value = rotation * window.dice.uniform(0.95, 1.05)
  },
  calendar: ({ period, direction, rotation }: Orbit) => {
    const yearHours = 8766 * period
    const sidereal = direction === 'retrograde' ? -rotation.value : rotation.value
    const year = Math.abs(yearHours / sidereal - 1)
    return { year, day: yearHours / year }
  },
  locks: {
    general: ({ orbit, star }: RotationParams): DmBreakdown => {
      const collector = createCollector()
      if (orbit.size > 0) collector.add(Math.ceil(orbit.size / 3), `Planet size (${orbit.size})`)
      if (orbit.eccentricity > 0.1) {
        const penalty = -Math.floor(orbit.eccentricity * 10)
        collector.add(penalty, `Eccentric (${orbit.eccentricity.toFixed(1)})`)
      }
      if (orbit.tilt > 30) collector.add(-2, `Axial tilt (${orbit.tilt.toFixed(0)}°)`)
      if (orbit.tilt >= 60 && orbit.tilt <= 120) collector.add(-4, 'Axial tilt 60°–120°')
      if (orbit.tilt >= 80 && orbit.tilt <= 100) collector.add(-4, 'Axial tilt 80°–100°')
      if (orbit.atmosphere.bar > 2.5)
        collector.add(-2, `Atmosphere (${orbit.atmosphere.bar.toFixed(1)} bar)`)
      const systemNote = `System age (${star.age.toFixed(1)} Gyr)`
      if (star.age < 1) collector.add(-2, systemNote)
      else if (star.age < 10) collector.add(2, systemNote)
      else collector.add(4, systemNote)
      return collector.result()
    },
    planet: {
      star: ({ orbit, star }: RotationParams): DmBreakdown => {
        const collector = createCollector()
        collector.add(-4, 'Star modifier')

        const orbitNumber = MATH.orbits.fromAU(orbit.au)
        const orbitNote = `Distance (orbit #${orbitNumber.toFixed(0.1)})`
        if (orbitNumber < 1) collector.add(4 + Math.floor(10 * (1 - orbitNumber)), orbitNote)
        else if (orbitNumber < 2) collector.add(4, orbitNote)
        else if (orbitNumber < 3) collector.add(1, orbitNote)
        else {
          const penalty = -Math.floor(orbitNumber * 2)
          collector.add(penalty, orbitNote)
        }

        const starMassNote = `Star mass (${star.mass.toFixed(1)} M☉)`
        if (star.mass < 0.5) collector.add(-2, starMassNote)
        else if (star.mass < 1) collector.add(-1, starMassNote)
        else if (star.mass < 5) collector.add(1, starMassNote)
        else collector.add(2, starMassNote)

        const largeMoons = orbit.orbits.reduce((sum, moon) => moon.size + sum, 0)
        if (largeMoons > 0) collector.add(-largeMoons, `Large moons`)

        return collector.result()
      },
      moon: ({ moon, planet }: TidalLockParams): DmBreakdown => {
        const collector = createCollector()
        const base = -10 + moon.size
        collector.add(base, `Moon size (${moon.size})`)

        const pd = moon.moon?.pd ?? 0
        const pdNote = `Moon orbit (PD ${pd.toFixed(0)})`
        if (pd < 5) collector.add(5 + Math.ceil((5 - pd) * 5), pdNote)
        else if (pd < 10) collector.add(4, pdNote)
        else if (pd < 20) collector.add(2, pdNote)
        else if (pd < 40) collector.add(1, pdNote)
        else if (pd > 60) collector.add(-6, pdNote)

        const siblingMoons = planet.orbits.filter(m => m !== moon && m.size > 0).length
        if (siblingMoons > 0) collector.add(-2 * siblingMoons, `Other moons (${siblingMoons})`)

        return collector.result()
      }
    },
    moon: {
      planet: ({ moon, planet }: TidalLockParams): DmBreakdown => {
        const collector = createCollector()
        collector.add(2, 'Planet modifier')

        const pd = moon.moon?.pd ?? 0
        const pdNote = `Moon orbit (PD ${pd.toFixed(0)})`
        if (pd > 20) collector.add(-Math.floor(pd / 20), pdNote)
        if (moon.direction === 'retrograde') collector.add(-2, 'Retrograde')

        const planetMassNote = `Planet mass (${planet.mass.toFixed(0)} M⊕)`
        if (planet.mass <= 10) collector.add(2, planetMassNote)
        else if (planet.mass < 100) collector.add(4, planetMassNote)
        else if (planet.mass < 1000) collector.add(6, planetMassNote)
        else collector.add(8, planetMassNote)

        return collector.result()
      }
    },
    effect: ({ orbit, dm, broke, period, homeworld }: TidalLockEffectParams) => {
      if (dm < -10) return
      const roll = window.dice.roll(2, 6) + dm

      orbit.rotation.roll = roll

      if (roll <= 4) {
        return
      } else if (roll === 5) {
        orbit.rotation.value *= 1.5
      } else if (roll === 6) {
        orbit.rotation.value *= 2
      } else if (roll === 7) {
        orbit.rotation.value *= 3
      } else if (roll === 8) {
        orbit.rotation.value *= 5
      } else if (roll === 9) {
        orbit.rotation.value = window.dice.roll(1, 6) * 5 * 24
      } else if (roll === 10) {
        orbit.rotation.value = window.dice.roll(1, 6) * 10 * 24
      } else if (roll === 11) {
        orbit.direction = '3:2 tidal lock'
        orbit.rotation.value = (period * 3) / 2
      } else if (!broke && (window.dice.roll(2, 6) === 12 || homeworld)) {
        ROTATION.locks.effect({ orbit, dm: 0, period, broke: true })
        return
      } else {
        orbit.direction = '1:1 tidal lock'
        orbit.rotation.value = period
      }

      pushTraceEntries(orbit, [{ value: roll - dm, description: 'Base roll (2d6)' }])

      if (roll === 10 && orbit.tilt < 90) {
        orbit.direction = 'retrograde'
        orbit.tilt = 180 - orbit.tilt
      }
      if (roll >= 11 && orbit.tilt > 3) {
        orbit.tilt = window.dice.roll(2, 6) / 10
      }
      if (roll >= 12 && orbit.eccentricity > 0.1) {
        const newEcc = MATH.orbits.eccentricity({
          locked: true,
          moon: orbit.moon?.range,
          size: orbit.size
        })
        orbit.eccentricity = Math.min(orbit.eccentricity, newEcc)
      }
    },
    get: ({ orbit, star, homeworld }: RotationParams) => {
      if (orbit.group === 'asteroid belt') return

      resetRotationTrace(orbit)
      const general = ROTATION.locks.general({ orbit, star })
      const generalValue = general.value
      pushTraceEntries(orbit, general.trace)

      orbit.orbits.forEach(moon => {
        resetRotationTrace(moon)
        const moonSpecific = ROTATION.locks.moon.planet({ moon, planet: orbit })
        pushTraceEntries(moon, moonSpecific.trace)
        const moonGeneral = ROTATION.locks.general({ orbit: moon, star })
        pushTraceEntries(moon, moonGeneral.trace)
        const moonDm = moonSpecific.value + moonGeneral.value
        ROTATION.locks.effect({
          orbit: moon,
          dm: moonDm,
          period: moon.moon?.period ?? 0
        })
        if (moon.direction === '1:1 tidal lock') moon.lock = { type: 'planet', idx: orbit.idx }
      })

      const lockedMoons = orbit.orbits.filter(moon => moon.direction === '1:1 tidal lock')
      const starProspect = ROTATION.locks.planet.star({ orbit, star })
      let prospect: { entity: Orbit | Star; dm: number; trace: TraceEntry[] } = {
        entity: star,
        dm: starProspect.value + generalValue,
        trace: starProspect.trace
      }

      if (orbit.size > 0 && orbit.size < 16 && lockedMoons.length) {
        lockedMoons.forEach(moon => {
          const moonProspect = ROTATION.locks.planet.moon({ moon, planet: orbit })
          const dm = moonProspect.value + generalValue
          if (dm >= prospect.dm) {
            prospect = { entity: moon, dm, trace: moonProspect.trace }
          }
        })
      }

      pushTraceEntries(orbit, prospect.trace)
      const { entity } = prospect
      ROTATION.locks.effect({
        orbit,
        dm: prospect.dm,
        period: entity.tag === 'star' ? orbit.period * 8766 : entity.moon?.period ?? 0,
        homeworld
      })
      if (orbit.direction === '1:1 tidal lock')
        orbit.lock = { type: entity.tag === 'star' ? 'star' : 'moon', idx: entity.idx }
      if (orbit.lock?.type === 'star') classify(orbit, star)
    }
  }
}
