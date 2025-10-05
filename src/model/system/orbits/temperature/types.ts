import { Star } from '../../stars/types'
import { Orbit } from '../types'

export type FinalizeTemperatureParams = {
  star: Star
  orbit: Orbit
  parent?: Orbit
}
