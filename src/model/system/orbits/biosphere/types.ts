import { Orbit } from '../types'

import { Star } from '../../stars/types'

export interface BiosphereParams {
  atmosphere: Orbit['atmosphere']
  hydrosphere: number
  temperature: Orbit['temperature']
  star: Star
  type: Orbit['type']
  chemistry?: Orbit['chemistry']
  size: number
}
