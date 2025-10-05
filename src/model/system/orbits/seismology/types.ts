import { Star } from '../../stars/types'
import { Orbit } from '../types'

export interface SeismologyParams {
  orbit: Orbit
  star: Star
  parent?: Orbit
}

export interface TidalHeatingParams {
  planet?: Orbit
  moon: Orbit
}
