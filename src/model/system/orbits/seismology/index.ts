import { CONSTANTS } from '../../../constants'
import { Star } from '../../stars/types'
import { ATMOSPHERE } from '../atmosphere'
import { ORBIT_CLASSIFICATION } from '../classification'
import { Orbit } from '../types'
import { SeismologyParams, TidalHeatingParams } from './types'

const meltCheck = (total: number, heating: number, orbit: Orbit, star: Star, parent?: Orbit) => {
  if (orbit.group === 'dwarf' && orbit.hydrosphere.code === 12) {
    orbit.type = 'meltball'
    const atmosphere = { code: 1, type: 'trace' } as const
    const bar = ATMOSPHERE.bar(atmosphere, false)
    orbit.atmosphere = { ...atmosphere, bar }
  } else if ((orbit.type === 'rockball' || orbit.type === 'geo-cyclic') && heating > 5) {
    orbit.type = window.dice.choice(['hebean', 'hebean', 'geo-tidal'])
    const { atmosphere, hydrosphere } = ORBIT_CLASSIFICATION[orbit.type].roll({
      star,
      parent,
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
      orbit.gravity,
      orbit.type,
      star
    )
  } else if (orbit.type === 'rockball' && total > 20) {
    orbit.type = 'geo-cyclic'
    const { atmosphere, hydrosphere } = ORBIT_CLASSIFICATION[orbit.type].roll({
      star,
      parent,
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
      orbit.gravity,
      orbit.type,
      star
    )
  } else if (
    (orbit.type === 'geo-cyclic' || orbit.type === 'geo-tidal' || orbit.type === 'hebean') &&
    total < 1
  ) {
    orbit.type = window.dice.choice(['rockball', orbit.zone === 'outer' ? 'snowball' : 'rockball'])
    const { atmosphere, hydrosphere } = ORBIT_CLASSIFICATION[orbit.type].roll({
      star,
      parent,
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
      orbit.gravity,
      orbit.type,
      star
    )
  } else if ((orbit.type === 'geo-tidal' || orbit.type === 'hebean') && heating < 1) {
    orbit.type = 'geo-cyclic'
    const { atmosphere, hydrosphere } = ORBIT_CLASSIFICATION[orbit.type].roll({
      star,
      parent,
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
      orbit.gravity,
      orbit.type,
      star
    )
  }
}

export const SEISMOLOGY = {
  residual: ({ orbit, star, parent }: SeismologyParams) => {
    if (orbit.group === 'asteroid belt') return 0
    let stress = orbit.size - star.age
    const moon = parent && parent.group !== 'asteroid belt'
    if (moon) stress += 1
    if (orbit.density > 1) stress += 2
    if (orbit.density < 0.5) stress -= 1
    stress += orbit.orbits.filter(moon => moon.size > 0).length
    if (stress < 1) return 0
    return stress ** 2
  },
  tides: {
    stress: (orbit: Orbit) => orbit.tides.reduce((acc, tide) => acc + tide.effect, 0) * 0.1,
    heating: ({ planet, moon }: TidalHeatingParams) => {
      if (!planet || !moon.moon) return 0
      const distance = ((moon.moon?.pd ?? 0) * planet.diameter * CONSTANTS.ED) / 1e6
      const period = (moon.moon?.period ?? 0) / 24
      return Math.min(
        window.dice.uniform(1.5e3, 2.5e3),
        (planet.mass ** 2 * moon.size ** 5 * moon.eccentricity ** 2) /
          (3e3 * distance ** 5 * period * moon.mass)
      )
    }
  },
  total: ({ orbit, star, parent }: SeismologyParams) => {
    const residual = SEISMOLOGY.residual({ orbit, star, parent })
    const stress = SEISMOLOGY.tides.stress(orbit)
    let heating = SEISMOLOGY.tides.heating({ moon: orbit, planet: parent })
    if (orbit.type === 'rockball' && residual + stress + heating > 1e3) {
      heating = 0
      orbit.eccentricity = 0
    }
    const total = residual + stress + heating
    if (total > 1e3 && orbit.group !== 'jovian') orbit.hydrosphere.code = 12
    meltCheck(total, heating, orbit, star, parent)
    return { residual, total, tides: { stress, heating } }
  },
  describe: (value: number) =>
    value > 100 ? 'extreme' : value > 10 ? 'active' : value > 1 ? 'low' : 'dead'
}
