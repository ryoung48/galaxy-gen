import { Star } from '../../stars/types'
import { Orbit } from '../types'

export type FinalizeTemperatureParams = {
  composition: Orbit['composition']
  au: number
  star: Star
  atmosphere: Orbit['atmosphere']
  hydrosphere: number
  tilt: number
  eccentricity: number
  rotation: number
  period: number
}
