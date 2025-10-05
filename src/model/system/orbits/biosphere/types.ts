import { Orbit } from '../types'

import { Star } from '../../stars/types'

export interface BiosphereParams {
  orbit: Orbit
  star: Star
  impactZone?: boolean
  primary?: boolean
}
