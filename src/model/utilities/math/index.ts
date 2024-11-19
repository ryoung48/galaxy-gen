import { CartesianCoords, Point } from './types'
import { WeightedDistribution } from '../dice/types'
import { scaleLinear } from 'd3'

// Data points for orbit-to-AU mapping
const orbitAUMapping = [
  { orbit: 0, au: 0 },
  { orbit: 1, au: 0.4 },
  { orbit: 2, au: 0.7 },
  { orbit: 3, au: 1.0 },
  { orbit: 4, au: 1.6 },
  { orbit: 5, au: 2.8 },
  { orbit: 6, au: 5.2 },
  { orbit: 7, au: 10 },
  { orbit: 8, au: 20 },
  { orbit: 9, au: 40 },
  { orbit: 10, au: 77 },
  { orbit: 11, au: 154 },
  { orbit: 12, au: 308 },
  { orbit: 13, au: 615 },
  { orbit: 14, au: 1230 },
  { orbit: 15, au: 2500 },
  { orbit: 16, au: 4900 },
  { orbit: 17, au: 9800 },
  { orbit: 18, au: 19500 },
  { orbit: 19, au: 39500 },
  { orbit: 20, au: 78700 }
]

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
  distance: ([x1, y1]: number[], [x2, y2]: number[]) => {
    return Math.hypot(x1 - x2, y1 - y2)
  },
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
  orbits: {
    fromAU: (au: number): number => {
      // Extract orbit and AU arrays for scale
      const orbits = orbitAUMapping.map(d => d.orbit)
      const aus = orbitAUMapping.map(d => d.au)

      // Create a D3 linear scale for interpolation
      const scale = scaleLinear()
        .domain(aus) // Input domain: orbit numbers
        .range(orbits) // Output range: AU values
        .clamp(true) // Clamp to ensure values outside range are constrained
      return scale(au)
    },
    toAU: (orbitNumber: number): number => {
      // Extract orbit and AU arrays for scale
      const orbits = orbitAUMapping.map(d => d.orbit)
      const aus = orbitAUMapping.map(d => d.au)
      // Create a D3 linear scale for interpolation
      const scale = scaleLinear()
        .domain(orbits) // Input domain: orbit numbers
        .range(aus) // Output range: AU values
        .clamp(true) // Clamp to ensure values outside range are constrained
      return scale(orbitNumber)
    },
    period: (au: number, solarMass: number) => {
      return Math.sqrt(au ** 3 / solarMass)
    },
    distance: (kelvin: number, luminosity: number) => {
      return (luminosity / (kelvin / 279) ** 4) ** 0.5
    }
  },
  temperature: {
    celsius: (kelvin: number) => kelvin - 273.15,
    kelvin: (celsius: number) => celsius + 273.15
  },
  time: {
    convertYears: (inputYears: number): string => {
      const daysInYear = 365.25 // Accounts for leap years
      const hoursInDay = 24
      const yearsInDecade = 10
      const yearsInCentury = 100

      if (inputYears >= yearsInCentury) {
        const centuries = inputYears / yearsInCentury
        return `${centuries.toFixed(2)} centuries`
      } else if (inputYears >= yearsInDecade) {
        const decades = inputYears / yearsInDecade
        return `${decades.toFixed(2)} decades`
      } else if (inputYears >= 1) {
        return `${inputYears.toFixed(2)} years`
      } else if (inputYears >= 1 / daysInYear) {
        const days = inputYears * daysInYear
        return `${days.toFixed(2)} days`
      } else {
        const hours = inputYears * daysInYear * hoursInDay
        return `${hours.toFixed(2)} hours`
      }
    }
  }
}
