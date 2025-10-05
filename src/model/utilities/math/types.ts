import { MoonOrbit } from '../../system/orbits/moons/types'

export type Point = {
  x: number
  y: number
}

export type ScaleParams = {
  domain: number[]
  range: number[]
  v: number
}

export type ScalePowerParams = ScaleParams & { exponent: number }

export type CartesianCoords = {
  radius: number
  deg: number
  center?: Point
}

export interface EccentricityParams {
  star?: boolean
  asteroidMember?: boolean
  homeworld?: boolean
  locked?: boolean
  moon?: MoonOrbit['range']
  proto?: boolean
  primordial?: boolean
  size?: number
}

export type AxialTiltParams = {
  homeworld?: boolean
}

export type RotationFormattingParams = {
  hours: number
  daysInYear: number
  hoursInDay: number
  prefix?: string
}
