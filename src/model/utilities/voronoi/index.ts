import { polygonCentroid } from 'd3'
import { Delaunay, Voronoi } from 'd3-delaunay'
import {
  VoronoiParams,
  RelaxedVoronoiParams,
  Vertex,
  VoronoiBoundaryParams,
  EdgeMap
} from './types'

const voronoi = ({ points, w, h }: VoronoiParams): Voronoi<[number, number]> => {
  const delaunay = Delaunay.from(points)
  return delaunay.voronoi([0, 0, w, h])
}

const pointsAreEqual = (p1: Vertex, p2: Vertex) => {
  return Math.abs(p1[0] - p2[0]) < 1e-9 && Math.abs(p1[1] - p2[1]) < 1e-9
}

export const VORONOI = {
  edgeMap: (diagram: Voronoi<[number, number]>): EdgeMap => {
    const edgeToCells = new Map<string, number[]>()
    for (let i = 0; i < diagram.delaunay.points.length / 2; i++) {
      const cell = diagram.cellPolygon(i)
      if (!cell) continue

      for (let j = 0; j < cell.length - 1; j++) {
        const p1 = cell[j]
        const p2 = cell[j + 1]
        const key = [p1, p2]
          .sort((a, b) => a[0] - b[0] || a[1] - b[1])
          .map(p => `${p[0].toFixed(9)},${p[1].toFixed(9)}`)
          .join(';')
        if (!edgeToCells.has(key)) {
          edgeToCells.set(key, [])
        }
        edgeToCells.get(key)!.push(i)
      }
    }
    return edgeToCells
  },
  commonEdge: (i: Vertex[], j: Vertex[]): Vertex[] => {
    const cellI = new Set(i.map(String))
    const edge = j.filter(p => cellI.has(String(p)))
    return edge
  },
  boundary: ({ edgeMap, points }: VoronoiBoundaryParams): Vertex[][] => {
    const pointSet = new Set(points)
    const edges: Vertex[][] = []

    for (const [key, cellIndices] of edgeMap.entries()) {
      const nationStatus = cellIndices.map(i => pointSet.has(i))
      const inNationCount = nationStatus.filter(Boolean).length

      if (inNationCount === 1) {
        // This edge is on the boundary
        const [p1Str, p2Str] = key.split(';')
        const p1 = p1Str.split(',').map(Number) as Vertex
        const p2 = p2Str.split(',').map(Number) as Vertex
        edges.push([p1, p2])
      }
    }

    const chains: Vertex[][] = []
    const remainingEdges = [...edges]

    if (remainingEdges.length === 0) {
      return []
    }

    while (remainingEdges.length > 0) {
      const currentChain = [...remainingEdges.pop()!]
      chains.push(currentChain)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // extend forward
        const lastPoint = currentChain[currentChain.length - 1]
        let found = false
        for (let i = remainingEdges.length - 1; i >= 0; i--) {
          const edge = remainingEdges[i]
          if (pointsAreEqual(lastPoint, edge[0])) {
            currentChain.push(edge[1])
            remainingEdges.splice(i, 1)
            found = true
            break
          }
          if (pointsAreEqual(lastPoint, edge[1])) {
            currentChain.push(edge[0])
            remainingEdges.splice(i, 1)
            found = true
            break
          }
        }
        if (!found) break
      }
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // extend backward
        const firstPoint = currentChain[0]
        let found = false
        for (let i = remainingEdges.length - 1; i >= 0; i--) {
          const edge = remainingEdges[i]
          if (pointsAreEqual(firstPoint, edge[0])) {
            currentChain.unshift(edge[1])
            remainingEdges.splice(i, 1)
            found = true
            break
          }
          if (pointsAreEqual(firstPoint, edge[1])) {
            currentChain.unshift(edge[0])
            remainingEdges.splice(i, 1)
            found = true
            break
          }
        }
        if (!found) break
      }
    }

    return chains
  },
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
