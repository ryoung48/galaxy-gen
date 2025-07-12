import jdenticon from 'jdenticon/standalone'
import { curveCatmullRom, line as d3Line } from 'd3-shape'
import { Delaunay } from 'd3-delaunay'
import { CONSTANTS } from '../../../model/constants'
import { GALAXY } from '../../../model/galaxy'
import { SOLAR_SYSTEM } from '../../../model/system'
import { STAR } from '../../../model/system/stars'
import { HERALDRY } from '../../heraldry/common'
import { CANVAS } from '.'
import { PaintGalaxyParams } from './types'
import { METRICS } from '../legend/metrics'
import { VORONOI } from '../../../model/utilities/voronoi'
import { scaleLinear } from 'd3'
import { COLORS } from '../../../theme/colors'
import { Star as StarType } from '../../../model/system/stars/types'
import { EdgeMap } from '../../../model/utilities/voronoi/types'
import { MATH } from '../../../model/utilities/math'

// Caches to avoid recalculating heavy objects every frame
const cellPathCache = new Map<number, Path2D>()
const identiconCache = new Map<number, HTMLCanvasElement>()
let edgeMapCache: EdgeMap | null = null
const nationBoundaryCache = new Map<number, Path2D[]>()

// Cache for expensive trade route calculations
let tradeRoutesCache: number[][] | null = null

// Cache for pre-rendered shield + identicon composites (one per nation)
const heraldryCompositeCache = new Map<number, HTMLCanvasElement>()

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

const getTradeRoutes = (): number[][] => {
  if (tradeRoutesCache) return tradeRoutesCache

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

  tradeRoutesCache = routes
  return routes
}

// Pre-render static background (core, nebulae, outer rim) once
let backgroundCanvas: HTMLCanvasElement | null = null
const getBackgroundCanvas = (): HTMLCanvasElement => {
  if (backgroundCanvas) return backgroundCanvas
  backgroundCanvas = document.createElement('canvas')
  backgroundCanvas.width = CONSTANTS.W
  backgroundCanvas.height = CONSTANTS.H
  const bctx = backgroundCanvas.getContext('2d')!

  const centerX = CONSTANTS.W * 0.5
  const centerY = CONSTANTS.H * 0.5

  // Galactic Core
  const coreGradient = bctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200)
  coreGradient.addColorStop(0, 'rgba(255, 255, 224, 1)')
  coreGradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.8)')
  coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  bctx.fillStyle = coreGradient
  bctx.fillRect(0, 0, CONSTANTS.W, CONSTANTS.H)

  // Inner rim
  CANVAS.circle({
    ctx: bctx,
    x: centerX,
    y: centerY,
    radius: 75,
    fill: 'transparent',
    border: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
  })

  // Nebulae
  const nebulaGradient1 = bctx.createRadialGradient(
    centerX - 150,
    centerY - 100,
    50,
    centerX - 150,
    centerY - 100,
    300
  )
  nebulaGradient1.addColorStop(0, 'rgba(100, 100, 180, 0.15)')
  nebulaGradient1.addColorStop(1, 'rgba(100, 100, 180, 0)')
  bctx.fillStyle = nebulaGradient1
  bctx.fillRect(0, 0, CONSTANTS.W, CONSTANTS.H)

  const nebulaGradient2 = bctx.createRadialGradient(
    centerX + 200,
    centerY + 150,
    50,
    centerX + 200,
    centerY + 150,
    350
  )
  nebulaGradient2.addColorStop(0, 'rgba(180, 100, 100, 0.15)')
  nebulaGradient2.addColorStop(1, 'rgba(180, 100, 100, 0)')
  bctx.fillStyle = nebulaGradient2
  bctx.fillRect(0, 0, CONSTANTS.W, CONSTANTS.H)

  // Outer rim
  CANVAS.circle({
    ctx: bctx,
    x: centerX,
    y: centerY,
    radius: 335,
    fill: 'transparent',
    border: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
  })

  return backgroundCanvas
}

export const GALAXY_MAP = {
  paint: ({ ctx, selected, solarSystem, mapMode }: PaintGalaxyParams) => {
    // Draw pre-rendered galaxy background (auto-scaled with current transform)
    ctx.drawImage(getBackgroundCanvas(), 0, 0, CONSTANTS.W, CONSTANTS.H)

    ctx.save()
    ctx.beginPath()
    ctx.arc(CONSTANTS.W * 0.5, CONSTANTS.H * 0.5, 335, 0, Math.PI * 2)
    ctx.clip()

    // solar system cells
    const systems = GALAXY.worlds()
    systems.forEach(system => {
      const nation = SOLAR_SYSTEM.nation(system)
      const opacity = 0.25
      ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`
      ctx.lineWidth = 0.15
      const orbits = SOLAR_SYSTEM.orbits(system)
      const biosphere = Math.max(...orbits.map(o => (o.tag === 'star' ? 0 : o.biosphere)))
      const population = Math.max(
        ...orbits.map(o => (o.tag === 'star' ? 0 : o.population?.code ?? 0))
      )
      const habitability = Math.max(...orbits.map(o => (o.tag === 'star' ? -10 : o.habitability)))
      ctx.fillStyle =
        mapMode === 'habitability'
          ? METRICS.habitability.color(habitability)
          : mapMode === 'biosphere'
          ? METRICS.biosphere.color(biosphere)
          : mapMode === 'orbits'
          ? METRICS.orbits.color(orbits.length - 1)
          : mapMode === 'population'
          ? METRICS.population.color(population)
          : nation.flag.color.replace('%)', `%, ${opacity})`)
      let path = cellPathCache.get(system.idx)
      if (!path) {
        path = new Path2D(window.galaxy.diagram.renderCell(system.idx))
        cellPathCache.set(system.idx, path)
      }
      ctx.fill(path)
      ctx.stroke(path)
    })
    // nation boundaries
    const selectedNation =
      selected?.tag === 'nation' && selected
        ? selected
        : solarSystem
        ? SOLAR_SYSTEM.nation(solarSystem)
        : null
    const lineGenerator = d3Line()
    if (window.galaxy?.diagram && mapMode === 'nations') {
      if (!edgeMapCache) edgeMapCache = VORONOI.edgeMap(window.galaxy.diagram)
      window.galaxy.nations.forEach(nation => {
        let paths = nationBoundaryCache.get(nation.idx)
        if (!paths) {
          const boundary = VORONOI.boundary({
            edgeMap: edgeMapCache!,
            points: nation.systems
          })
          paths = boundary
            .map(b => {
              const pathString = lineGenerator(b as [number, number][])
              return pathString ? new Path2D(pathString) : null
            })
            .filter((p): p is Path2D => p !== null)
          nationBoundaryCache.set(nation.idx, paths)
        }

        ctx.strokeStyle = nation.flag.color
        ctx.lineWidth = (selectedNation?.idx === nation.idx ? 3 : 1.5) * 3
        paths.forEach(p => {
          ctx.save()
          ctx.clip(p)
          ctx.filter = 'blur(10px)'
          ctx.stroke(p)
          ctx.restore()
        })
      })
    }
    if (mapMode === 'nations') {
      // hyper-lanes
      window.galaxy?.mst.forEach(([p1, p2]) => {
        CANVAS.line({
          ctx,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          width: 0.25,
          color: 'rgba(255, 255, 255, 0.5)'
        })
      })
      // trade routes – highlighted links between neighboring large nations
      const lineGen = d3Line().curve(curveCatmullRom.alpha(0.5))
      const routes = getTradeRoutes()
      const drawnEdges = new Set<string>()
      const drawSegment = (segmentIndices: number[]) => {
        const coords = segmentIndices.map(idx => [
          window.galaxy.systems[idx].x,
          window.galaxy.systems[idx].y
        ])
        if (coords.length < 2) return
        const d = lineGen(coords as [number, number][])
        if (!d) return
        const p2d = new Path2D(d)
        ctx.strokeStyle = 'rgba(111, 226, 255, 0.8)'
        ctx.lineWidth = 0.75
        ctx.stroke(p2d)
      }

      routes.forEach(pathIndices => {
        let segment: number[] = [pathIndices[0]]
        for (let i = 0; i < pathIndices.length - 1; i++) {
          const a = pathIndices[i]
          const b = pathIndices[i + 1]
          const edgeKey = [a, b].sort((x, y) => x - y).join('-')
          if (drawnEdges.has(edgeKey)) {
            // flush current segment if it has length >1
            if (segment.length > 1) drawSegment(segment)
            segment = [b]
            continue
          }
          drawnEdges.add(edgeKey)
          segment.push(b)
        }
        if (segment.length > 1) drawSegment(segment)
      })
    }
    ctx.restore()
    // stars & system names
    const currentScale = ctx.getTransform().a
    const drawSystemNames = currentScale > 8 // skip tiny text when zoomed out
    systems.forEach(system => {
      // Determine all stars in the system (primary + companions)
      const stars: StarType[] = [
        system.star,
        ...STAR.orbits(system.star).filter((o): o is StarType => o.tag === 'star')
      ]

      const focused = system.idx === solarSystem?.idx

      CANVAS.sun({
        ctx,
        x: system.x,
        y: system.y,
        radius: 0.7,
        fill: STAR.color(stars[0])
      })

      if (drawSystemNames) {
        CANVAS.text({
          ctx,
          x: system.x,
          y: system.y - 1.8,
          text: system.name,
          size: 0.7
        })
      }
      if (focused) {
        CANVAS.circle({
          ctx,
          x: system.x,
          y: system.y,
          radius: 1.25,
          fill: 'transparent',
          border: { color: COLORS.accent, width: 0.15 }
        })
      }
    })
    // nation names & heraldry – fade out as the user zooms in
    const zoomLevel = ctx.getTransform().a // uniform scale applied earlier
    const nameOpacity = scaleLinear().domain([5, 20]).range([1, 0]).clamp(true)(zoomLevel)

    window.galaxy.nations.forEach(nation => {
      const origin = window.galaxy.systems[nation.capital]
      // Scale heraldry and label sizes based on number of systems (1-150)
      const systemsCount = nation.systems.length
      const iconSizeScale = scaleLinear().domain([1, 150]).range([3, 14]).clamp(true)
      const textSizeScale = scaleLinear().domain([1, 150]).range([1.2, 8]).clamp(true)
      const offsetScale = scaleLinear().domain([1, 150]).range([2, 9]).clamp(true)

      const iconSize = iconSizeScale(systemsCount)
      const textSize = textSizeScale(systemsCount)
      const textOffsetY = offsetScale(systemsCount)

      ctx.save()
      if (nameOpacity < 0.05) {
        ctx.restore()
        return
      }
      ctx.globalAlpha = nameOpacity

      // Text label for the nation
      CANVAS.text({
        ctx,
        x: origin.x,
        y: origin.y + textOffsetY,
        text: nation.name,
        size: textSize,
        color: 'black'
      })

      // Build or retrieve a pre-composited shield + identicon canvas
      // -------------------------------------------------------------
      // We want both elements to share the same alpha fade, so we render them
      // together once, cache the result, and then draw that single bitmap with
      // `ctx.globalAlpha = nameOpacity`.

      // (1) Make sure we have the identicon for this nation
      let iconCanvas = identiconCache.get(nation.idx)
      if (!iconCanvas) {
        iconCanvas = document.createElement('canvas')
        const initialSize = 100
        iconCanvas.width = initialSize
        iconCanvas.height = initialSize
        const tempCtx = iconCanvas.getContext('2d')!
        const iconConfig = HERALDRY.config(nation)
        jdenticon.drawIcon(tempCtx, nation.name, initialSize, iconConfig)
        identiconCache.set(nation.idx, iconCanvas)
      }

      // (2) Retrieve/Create composite canvas
      let compositeCanvas = heraldryCompositeCache.get(nation.idx)
      const compW = iconSize * (1 + 0.16)
      const compH = iconSize * (1 + 0.66)

      // Render composite at higher pixel density to keep it crisp when
      // browser down-scales (avoids blurry appearance at high zoom levels)
      const PIXEL_SCALE = 16 // tweak higher for even sharper edges

      const compPxW = compW * PIXEL_SCALE
      const compPxH = compH * PIXEL_SCALE

      if (!compositeCanvas) {
        compositeCanvas = document.createElement('canvas')
        compositeCanvas.width = compPxW
        compositeCanvas.height = compPxH

        const cctx = compositeCanvas.getContext('2d')!

        // Draw shield – scale all dimensions by PIXEL_SCALE
        const cfg = HERALDRY.config(nation)
        const backColor = cfg?.backColor ?? '#ffffff'
        HERALDRY.draw({
          ctx: cctx,
          x: 0,
          y: 0,
          h: compPxH,
          w: compPxW,
          borderWidth: 0.2 * PIXEL_SCALE,
          backColor,
          style: nation.flag.style
        })

        // Draw identicon centred – multiply offsets by PIXEL_SCALE too
        cctx.drawImage(
          iconCanvas,
          0.08 * iconSize * PIXEL_SCALE,
          0.17 * iconSize * PIXEL_SCALE,
          iconSize * PIXEL_SCALE,
          iconSize * PIXEL_SCALE
        )

        heraldryCompositeCache.set(nation.idx, compositeCanvas)
      }

      // (3) Draw the composited image onto the main canvas
      ctx.drawImage(
        compositeCanvas,
        origin.x - 0.41 * iconSize,
        origin.y + 1.16 * iconSize,
        compW,
        compH
      )

      ctx.restore()
    })
  }
}
