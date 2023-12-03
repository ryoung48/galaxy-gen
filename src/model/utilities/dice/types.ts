export interface Shuffler<T> {
  r: number
  e: T
}

export type WeightedDistribution<T> = { v: T; w: number }[]
