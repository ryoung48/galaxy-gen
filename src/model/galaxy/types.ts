import { Delaunay, Voronoi } from 'd3-delaunay'
import { Edge } from '../utilities/mst/types'
import { Nation } from '../nations/types'
import { SolarSystem } from '../system/types'
import { Star } from '../system/stars/types'
import { Satellite } from '../system/satellites/types'

export type Galaxy = {
  seed: string
  systems: SolarSystem[]
  mst: Edge[]
  diagram: Voronoi<Delaunay.Point>
  radius: { min: number; max: number }
  nations: Nation[]
  uniqueNames: Record<string, boolean>
  stars: Star[]
  satellites: Satellite[]
}

export type GalaxySpawnParams = {
  size: number
  dimensions: { height: number; width: number }
  radius: { min: number; max: number }
}
