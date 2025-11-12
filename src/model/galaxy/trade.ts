import { Delaunay } from 'd3-delaunay'
import { MATH } from '../utilities/math'

// A* path-finding across the hyper-lane network (system.lanes)
const shortestPath = (startIdx: number, goalIdx: number): number[] | null => {
  if (startIdx === goalIdx) return [startIdx]
  const systems = window.galaxy.systems

  const openSet = new Set<number>([startIdx])
  const cameFrom = new Map<number, number>()

  const gScore = new Map<number, number>()
  gScore.set(startIdx, 0)

  const fScore = new Map<number, number>()
  const goalPos = systems[goalIdx]
  const heuristic = (idx: number) =>
    MATH.distance([systems[idx].x, systems[idx].y], [goalPos.x, goalPos.y])

  fScore.set(startIdx, heuristic(startIdx))

  while (openSet.size) {
    // find node in openSet with lowest fScore
    let current = -1
    let lowest = Infinity
    openSet.forEach(idx => {
      const f = fScore.get(idx) ?? Infinity
      if (f < lowest) {
        lowest = f
        current = idx
      }
    })

    if (current === -1) break // should not happen

    if (current === goalIdx) {
      const path: number[] = [current]
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!
        path.push(current)
      }
      return path.reverse()
    }

    openSet.delete(current)
    const currentG = gScore.get(current) ?? Infinity

    systems[current].lanes.forEach(neiIdx => {
      const tentativeG =
        currentG +
        MATH.distance(
          [systems[current].x, systems[current].y],
          [systems[neiIdx].x, systems[neiIdx].y]
        )
      if (tentativeG < (gScore.get(neiIdx) ?? Infinity)) {
        cameFrom.set(neiIdx, current)
        gScore.set(neiIdx, tentativeG)
        fScore.set(neiIdx, tentativeG + heuristic(neiIdx))
        openSet.add(neiIdx)
      }
    })
  }
  return null // no path
}

export const getTradeRoutes = (): number[][] => {
  const largeNations = window.galaxy.nations.filter(n => n.systems.length >= 25)
  const systems = window.galaxy.systems

  // Build points array of capitals
  const points = largeNations.map(n => {
    const cap = systems[n.capital]
    return { x: cap.x, y: cap.y, nationIdx: n.idx }
  })

  // Create Delaunay triangulation
  const delaunay = Delaunay.from(
    points,
    p => p.x,
    p => p.y
  )
  const { triangles } = delaunay

  // Build edge set according to Urquhart graph
  const edgeKeys = new Set<string>()
  const addEdge = (i: number, j: number) => {
    const a = points[i].nationIdx
    const b = points[j].nationIdx
    if (a === b) return
    const key = [a, b].sort((x, y) => x - y).join('-')
    edgeKeys.add(key)
  }

  for (let t = 0; t < triangles.length; t += 3) {
    const ai = triangles[t]
    const bi = triangles[t + 1]
    const ci = triangles[t + 2]

    const edges = [
      [ai, bi],
      [bi, ci],
      [ci, ai]
    ] as [number, number][]

    // compute lengths
    const lengths = edges.map(([i, j]) =>
      MATH.distance([points[i].x, points[i].y], [points[j].x, points[j].y])
    )

    // find index of longest edge
    const longestIdx = lengths.indexOf(Math.max(...lengths))

    // add the other two edges
    edges.forEach((e, idx) => {
      if (idx !== longestIdx) addEdge(e[0], e[1])
    })
  }

  const routes: number[][] = []

  edgeKeys.forEach(key => {
    const [aIdxStr, bIdxStr] = key.split('-')
    const aIdx = Number(aIdxStr)
    const bIdx = Number(bIdxStr)

    const path = shortestPath(
      window.galaxy.nations[aIdx].capital,
      window.galaxy.nations[bIdx].capital
    )
    if (path && path.length > 1) {
      routes.push(path)
    }
  })

  // Mark all systems that are part of trade routes
  const tradeRouteSystems = new Set<number>()
  routes.forEach(route => {
    route.forEach(systemIdx => {
      tradeRouteSystems.add(systemIdx)
    })
  })

  // Set tradeRoute=true for all systems in trade routes
  window.galaxy.systems.forEach(system => {
    system.tradeRoute = tradeRouteSystems.has(system.idx)
  })

  return routes
}
