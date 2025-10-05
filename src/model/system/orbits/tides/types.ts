import { Star } from '../../stars/types'
import { Orbit } from '../types'

export type TidesParams = {
  size: number
  eccentricity: number
  tilt: number
  bar: number
  rotation: number
  star: Star
}

export type PlanetTidesParams = {
  type: 'planet'
  au: number
  stars: number
  moons: Orbit[]
  star: Star
}

export type MoonTidesParams = {
  type: 'moon'
  primary: Orbit
  pd: number
}

export type StarSurfaceTidesParams = {
  star: Star
  orbit: Orbit
}

export type MoonSurfaceTidesParams = {
  moon: Orbit
  planet: Orbit
}

export type MoonsSurfaceTidesParams = {
  moon: Orbit
  other: Orbit
  planet: Orbit
}
