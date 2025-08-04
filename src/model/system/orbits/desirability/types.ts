import { Star } from '../../stars/types'

import { Orbit } from '../types'

export type HabitabilityParams = {
  orbit: Orbit
  parent?: Orbit
}

export type DesirabilityParams = {
  orbit: Orbit
  parent?: Orbit
  star: Star
}
