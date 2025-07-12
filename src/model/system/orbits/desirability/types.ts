import { Star } from '../../stars/types'

import { Orbit } from '../types'

export type HabitabilityParams = {
  type: Orbit['type']
  hydrosphere: number
  atmosphere: Orbit['atmosphere']
  temperature: Orbit['temperature']
  size: number
  gravity: number
}

export type DesirabilityParams = {
  orbit: Orbit
  parent?: Orbit
  star: Star
}
