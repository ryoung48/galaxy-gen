import { polygonCentroid } from 'd3'
import { Delaunay } from 'd3-delaunay'
import { VoronoiParams, RelaxedVoronoiParams } from './types'

const voronoi = ({ points, w, h }: VoronoiParams) => {
  const delaunay = Delaunay.from(points)
  return delaunay.voronoi([0, 0, w, h])
}

export const VORONOI = {
  relaxed: ({ points, relaxation = 1, w, h }: RelaxedVoronoiParams) => {
    // create voronoi object clipped by the image width & height
    let diagram = voronoi({ points, w, h })
    let count = 0
    // perform loyd relaxation to smooth voronoi cells
    let relaxedSites = points
    while (count++ < relaxation) {
      relaxedSites = Array.from(diagram.cellPolygons()).map(poly =>
        polygonCentroid(poly.map(([x, y]) => [x, y]))
      )
      diagram = voronoi({ points: relaxedSites, w, h })
    }
    return { diagram, relaxedSites }
  }
}
