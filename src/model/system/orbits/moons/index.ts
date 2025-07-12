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
    const roll = window.dice.roll(1, 6)
    let size: number = 0
    if (roll <= 1 || orbit.group === 'asteroid belt') size = 0
    else if (roll <= 5) size = Math.min(window.dice.roll(1, 3) - 1, orbit.size - 1)
    else {
      if (orbit.group === 'terrestrial') {
        size = orbit.size - 1 - window.dice.roll(1, 6)
        if (size === orbit.size - 2) {
          const roll2 = window.dice.roll(2, 6)
          if (roll2 == 2) size = orbit.size - 1
          else if (roll2 == 12) size = orbit.size
        }
      } else if (orbit.group === 'jovian') {
        const roll2 = window.dice.roll(1, 6)
        if (roll2 <= 3) size = window.dice.roll(1, 6)
        else if (roll2 <= 5) size = window.dice.roll(2, 6) - 2
        else size = window.dice.roll(2, 6) + 4
        if (size === 16 && orbit.size === 18 && window.dice.roll(2, 6) === 12) size = 17
      }
    }
    return Math.max(0, size)
  },
  orbit: ({ count, mor }: MoonOrbitParams) => {
    const pd = range(count).map(() => {
      const base = (window.dice.roll(2, 6) - 2) * mor
      const roll = window.dice.roll(1, 6) + (mor < 60 ? 1 : 0)
      if (roll <= 3) return { range: 'inner', pd: base / 60 + 2 }
      else if (roll <= 5) return { range: 'middle', pd: base / 30 + mor / 6 + 3 }
      else return { range: 'outer', pd: base / 20 + mor / 2 + 4 }
    })
    return pd.sort((a, b) => a.pd - b.pd) as Omit<MoonOrbit, 'period'>[]
  },
  period: ({ parent, pd, mass }: MoonPeriodParams) => {
    return 0.176927 * ((parent.size * pd) ** 3 / (parent.mass + mass)) ** 0.5
  }
}
