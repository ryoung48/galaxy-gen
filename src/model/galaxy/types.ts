import { Delaunay, Voronoi } from 'd3-delaunay'
import { Edge } from '../utilities/mst/types'
import { Nation } from '../nations/types'
import { SolarSystem } from '../system/types'
import { Star } from '../system/stars/types'
import { Orbit } from '../system/orbits/types'

export type Galaxy = {
  seed: string
  systems: SolarSystem[]
  mst: Edge[]
  diagram: Voronoi<Delaunay.Point>
  radius: { min: number; max: number }
  nations: Nation[]
  uniqueNames: Record<string, boolean>
  stars: Star[]
  orbits: Orbit[]
}

export type GalaxySpawnParams = {
  size: number
  dimensions: { height: number; width: number }
  radius: { min: number; max: number }
  seed: string
}
