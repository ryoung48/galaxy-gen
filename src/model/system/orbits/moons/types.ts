import { Orbit } from '../types'

export type MoonOrbit = { range: 'inner' | 'middle' | 'outer'; pd: number; period: number }
export type MoonOrbitParams = { count: number; mor: number }
export type MoonPeriodParams = { parent: Orbit; pd: number; mass: number }
