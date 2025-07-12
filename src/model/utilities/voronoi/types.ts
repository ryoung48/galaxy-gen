export type EdgeMap = Map<string, number[]>

export interface VoronoiParams {
  points: [number, number][]
  w: number
  h: number
  relaxation?: number
}

export interface RelaxedVoronoiParams extends VoronoiParams {
  relaxation?: number
}

export interface VoronoiBoundaryParams {
  edgeMap: EdgeMap
  points: number[] // indices of points in the set for which we want the boundary
}

export type Vertex = [number, number]
