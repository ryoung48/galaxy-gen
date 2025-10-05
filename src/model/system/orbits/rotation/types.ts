import { Star } from '../../stars/types'
import { Orbit } from '../types'

export type RotationParams = {
  orbit: Orbit
  star: Star
  homeworld?: boolean
}

export type TidalLockParams = {
  moon: Orbit
  planet: Orbit
}

export type TidalLockEffectParams = {
  orbit: Orbit
  dm: number
  period: number // hours
  broke?: boolean
  homeworld?: boolean
}
