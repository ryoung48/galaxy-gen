export interface VoronoiParams {
  points: [number, number][]
  w: number
  h: number
}

export interface RelaxedVoronoiParams extends VoronoiParams {
  relaxation?: number
}
