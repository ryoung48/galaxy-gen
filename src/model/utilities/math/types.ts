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
