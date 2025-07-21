import { Delaunay, Voronoi } from 'd3-delaunay'
import { Edge } from '../utilities/mst/types'
import { Nation } from '../nations/types'
import { SolarSystem } from '../system/types'
import { Star } from '../system/stars/types'
import { Orbit } from '../system/orbits/types'
import * as PriorityQueue from 'js-priority-queue'
import { HistoryEvent } from '../history/types'

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
  time: number
  futures: PriorityQueue<HistoryEvent>
  past: HistoryEvent[]
}

export type GalaxySpawnParams = {
  size: number
  dimensions: { height: number; width: number }
  radius: { min: number; max: number }
  seed: string
}
