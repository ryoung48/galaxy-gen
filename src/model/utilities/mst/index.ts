import PriorityQueue from 'js-priority-queue'
import { Point, Edge } from './types'
import { ARRAY } from '../arrays'

export const MINIMUM_SPANNING_TREE = {
  build: (points: Record<number, Point>): Edge[] => {
    const visited = new Set<Point>()
    const edges: Edge[] = []
    const distances = new Map<Edge, number>()
    const priorityQueue = new PriorityQueue({
      comparator: (a: Edge, b: Edge) => {
        if (!distances.get(a)) distances.set(a, window.dice.random)
        if (!distances.get(b)) distances.set(b, window.dice.random)
        const distanceA = distances.get(a) || 0
        const distanceB = distances.get(b) || 0
        return distanceA - distanceB
      }
    })

    const _points = Object.values(points)

    const rejects: Edge[] = []

    // Start with the first point
    visited.add(_points[0])
    for (const neighbor of _points[0].n) {
      priorityQueue.queue([_points[0], points[neighbor]])
    }

    while (visited.size < _points.length) {
      const nextEdge = priorityQueue.dequeue()
      if (!nextEdge) break

      const [start, end] = nextEdge

      if (visited.has(end)) {
        rejects.push(nextEdge)
        continue
      }

      visited.add(end)
      edges.push([start, end])

      for (const neighbor of end.n) {
        if (!visited.has(points[neighbor])) {
          priorityQueue.queue([end, points[neighbor]])
        }
      }
    }
    const pruned = window.dice.shuffle(ARRAY.unique(rejects)).slice(0, rejects.length * 0.3)
    return edges.concat(pruned)
  }
}
