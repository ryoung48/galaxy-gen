import { scaleLinear, scalePow } from 'd3'
import { CartesianCoords, Point, ScaleParams, ScalePowerParams } from './types'
import { WeightedDistribution } from '../dice/types'

export const MATH = {
  angles: {
    cartesian: ({ radius, deg, center = { x: 0, y: 0 } }: CartesianCoords) => {
      const radians = MATH.angles.radians(deg)
      const x = center.x + radius * Math.cos(radians)
      const y = center.y + radius * Math.sin(radians)
      return { x, y }
    },
    degrees: (rad: number) => rad * (180 / Math.PI),
    radians: (deg: number) => deg * (Math.PI / 180)
  },
  buildDistribution: <T>(map: WeightedDistribution<T>, qty = 1): WeightedDistribution<T> => {
    const total = map.reduce((sum, { w }) => sum + w, 0)
    return map.map(({ w, v }) => ({ v, w: total === 0 ? 0 : (w / total) * qty }))
  },
  clamp: (x: number, min: number, max: number) => Math.min(Math.max(x, min), max),
  extractHue: (hslString: string): number | null => {
    // Use a regular expression to match the hue, saturation, and lightness values
    const regex = /hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/
    const match = hslString.match(regex)
    // Check if the string matches the HSL format
    if (match && match[1]) {
      // Return the hue as a number
      return parseInt(match[1], 10)
    }
    // Return null if the string doesn't match the HSL format
    return null
  },
  hslToHex(h: number, s: number, l: number) {
    l /= 100
    const a = (s * Math.min(l, 1 - l)) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0') // convert to Hex and prefix "0" if needed
    }
    return `#${f(0)}${f(8)}${f(4)}`
  },
  normalize: (a: number[]) => {
    const total = a.reduce((sum, i) => sum + i, 0)
    return a.map(i => i / total)
  },
  percentageScale: (a: number[]) => {
    const total = a.reduce((sum, i) => sum + i, 0)
    return a.map(i => i / total)
  },
  scale: ({ domain, range, v }: ScaleParams) => {
    const scaleFn = scaleLinear().domain(domain).range(range)
    return scaleFn(v)
  },
  scalePow: ({ domain, range, exponent, v }: ScalePowerParams) => {
    const scaleFn = scalePow().domain(domain).range(range).exponent(exponent)
    return scaleFn(v)
  },
  distance: ([x1, y1]: number[], [x2, y2]: number[]) => {
    return Math.hypot(x1 - x2, y1 - y2)
  },
  findClosest: <T extends Point, K extends Point>(point: T, points: K[]) => {
    return points
      .slice(1)
      .reduce(
        (a, b) =>
          MATH.distance([a.x, a.y], [point.x, point.y]) <
          MATH.distance([b.x, b.y], [point.x, point.y])
            ? a
            : b,
        points[0]
      )
  }
}
