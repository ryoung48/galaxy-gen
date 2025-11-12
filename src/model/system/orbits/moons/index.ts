import { range } from 'd3'

import { Orbit } from '../types'
import { MATH } from '../../../utilities/math'
import { MoonOrbit, MoonPeriodParams } from './types'
import { MoonOrbitParams } from './types'

export const MOONS = {
  count: (orbit: Orbit) => {
    if (orbit.group === 'asteroid belt') return 0
    let roll = window.dice.roll(1, 6) + 2
    if (orbit.size < 1) roll = 0
    else if (orbit.size <= 2) roll = window.dice.roll(1, 6) - 5
    else if (orbit.size <= 9) roll = window.dice.roll(2, 6) - 9
    else if (orbit.size <= 15) roll = window.dice.roll(2, 6) - 6
    const num = MATH.orbits.fromAU(orbit.au)
    if (num < 1) roll -= orbit.size > 2 ? 2 : 1
    return Math.max(roll, 0)
  },
  size: (orbit: Orbit) => {
    const roll = window.dice.roll(2, 4) - 2
    let size: number = 0
    if (roll <= 0 || orbit.group === 'asteroid belt') size = 0
    else if (roll <= 5) size = Math.min(window.dice.roll(1, 5) - 1, Math.max(orbit.size - 2, 0))
    else {
      if (orbit.group !== 'jovian') {
        size = orbit.size - 1 - window.dice.roll(1, 6)
        if (size === orbit.size - 2) {
          const roll2 = window.dice.roll(2, 6)
          if (roll2 <= 4) size = orbit.size - 1
          else if (roll2 >= 10) size = orbit.size
        }
      } else {
        const roll2 = window.dice.roll(1, 6)
        if (roll2 <= 2) size = window.dice.roll(1, 6)
        else if (roll2 <= 4) size = window.dice.roll(2, 6) - 2
        else size = window.dice.roll(2, 6) + 4
        if (size === 16 && orbit.size === 18 && window.dice.roll(2, 6) >= 10) size = 17
      }
    }
    return Math.max(0, size)
  },
  orbit: ({ count, mor }: MoonOrbitParams) => {
    const mod = mor < 60 ? 1 : 0
    const roche = 2
    const pd = range(count).map(() => {
      const roll = window.dice.roll(1, 6) + mod
      if (roll <= 3) return { range: 'inner', pd: roche + mor * window.dice.uniform(0, 0.16) }
      else if (roll <= 5)
        return { range: 'middle', pd: roche + mor * window.dice.uniform(0.16, 0.5) }
      else {
        const mod = window.dice.uniform(0.5, 1.1)
        return { range: mod > 1 ? 'extreme' : 'outer', pd: roche + mor * mod }
      }
    })
    return pd.sort((a, b) => a.pd - b.pd) as Omit<MoonOrbit, 'period'>[]
  },
  period: ({ parent, pd, mass }: MoonPeriodParams) => {
    return 0.176927 * ((parent.size * pd) ** 3 / (parent.mass + mass)) ** 0.5
  }
}
