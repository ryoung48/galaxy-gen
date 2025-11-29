import jdenticon from 'jdenticon/standalone'
import { curveCatmullRom, line as d3Line } from 'd3-shape'
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
// import { OrbitTag } from '../../../model/system/orbits/tags/types'
// import { drawTagIconWithText } from './tags'
import { NATION } from '../../../model/nations'
import { Nation } from '../../../model/nations/types'
import { mdiSwordCross } from '@mdi/js'

// Helper to draw MDI icons
const drawMDIIcon = ({
  ctx,
  x,
  y,
  size,
  path,
  color
}: {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  size: number
  path: string
  color: string
}) => {
  try {
    const p2d = new Path2D(path)
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size / 24, size / 24)
    ctx.fillStyle = color
    ctx.fill(p2d)
    ctx.restore()
  } catch {
    // Fallback: simple circle if Path2D unsupported
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }
}

// Aggregate resources for a solar system and draw them beneath the system icon
// const drawSystemResources = ({
//   ctx,
//   system
// }: {
//   ctx: CanvasRenderingContext2D
//   system: import('../../../model/system/types').SolarSystem
// }) => {
//   // Gather resources from star + all orbiting bodies
//   const objects = SOLAR_SYSTEM.orbits(system).filter(system => system.tag === 'orbit')
//   const totals: Record<string, number> = {}
//   objects.forEach(obj => {
//     obj.tags.forEach(res => {
//       totals[res.tag] = (totals[res.tag] ?? 0) + res.value
//     })
//   })

//   const entries = Object.entries(totals) as [OrbitTag, number][]
//   if (entries.length === 0) return

//   // Layout constants (world-units)
//   const iconRenderSize = 0.65
//   const iconSpacing = 0.3
//   const textSize = 0.3

//   const iconRowY = system.y + 1.0
//   // (text y handled by shared helper)

//   const totalWidth = entries.length * iconRenderSize + (entries.length - 1) * iconSpacing
//   const startX = system.x - totalWidth / 2

//   entries.forEach(([type, amount], idx) => {
//     const iconX = startX + idx * (iconRenderSize + iconSpacing)

//     drawTagIconWithText({
//       ctx,
//       tag: { tag: type, value: amount },
//       x: iconX,
//       y: iconRowY,
//       iconSize: iconRenderSize,
//       textSize
//     })
//   })
// }

// Caches to avoid recalculating heavy objects every frame
const cellPathCache = new Map<number, Path2D>()
let edgeMapCache: EdgeMap | null = null
const nationBoundaryCache = new Map<number, Path2D[]>()

// Draw static background (core, nebulae, outer rim) directly on context
const drawBackground = (ctx: CanvasRenderingContext2D) => {
  const centerX = CONSTANTS.W * 0.5
  const centerY = CONSTANTS.H * 0.5

  // Galactic Core
  const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200)
  coreGradient.addColorStop(0, 'rgba(255, 255, 224, 1)')
  coreGradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.8)')
  coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = coreGradient
  ctx.fillRect(0, 0, CONSTANTS.W, CONSTANTS.H)

  // Inner rim
  CANVAS.circle({
    ctx,
    x: centerX,
    y: centerY,
    radius: 75,
    fill: 'transparent',
    border: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
  })

  // Nebulae
  const nebulaGradient1 = ctx.createRadialGradient(
    centerX - 150,
    centerY - 100,
    50,
    centerX - 150,
    centerY - 100,
    300
  )
  nebulaGradient1.addColorStop(0, 'rgba(100, 100, 180, 0.15)')
  nebulaGradient1.addColorStop(1, 'rgba(100, 100, 180, 0)')
  ctx.fillStyle = nebulaGradient1
  ctx.fillRect(0, 0, CONSTANTS.W, CONSTANTS.H)

  const nebulaGradient2 = ctx.createRadialGradient(
    centerX + 200,
    centerY + 150,
    50,
    centerX + 200,
    centerY + 150,
    350
  )
  nebulaGradient2.addColorStop(0, 'rgba(180, 100, 100, 0.15)')
  nebulaGradient2.addColorStop(1, 'rgba(180, 100, 100, 0)')
  ctx.fillStyle = nebulaGradient2
  ctx.fillRect(0, 0, CONSTANTS.W, CONSTANTS.H)

  // Outer rim
  CANVAS.circle({
    ctx,
    x: centerX,
    y: centerY,
    radius: 335,
    fill: 'transparent',
    border: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
  })
}

const _heraldry: Record<number, HTMLCanvasElement> = {}

const drawHeraldry = (nation: Nation) => {
  if (!_heraldry[nation.idx]) {
    const tempCanvas = document.createElement('canvas')
    const initialSize = 100
    tempCanvas.width = initialSize
    tempCanvas.height = initialSize
    const tempCtx = tempCanvas.getContext('2d')!
    const config = HERALDRY.config(nation)
    jdenticon.drawIcon(tempCtx, nation.name, initialSize, config)
    _heraldry[nation.idx] = tempCanvas
  }
  return _heraldry[nation.idx]
}

export const GALAXY_MAP = {
  paint: ({ ctx, selected, solarSystem, mapMode }: PaintGalaxyParams) => {
    // Draw galaxy background directly on context
    drawBackground(ctx)

    ctx.save()
    ctx.beginPath()
    ctx.arc(CONSTANTS.W * 0.5, CONSTANTS.H * 0.5, 335, 0, Math.PI * 2)
    ctx.clip()

    // solar system cells
    const systems = GALAXY.worlds()
    const currentScale = ctx.getTransform().a
    systems.forEach(system => {
      const nation = SOLAR_SYSTEM.nation(system)
      const opacity = 0.25
      ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`
      ctx.lineWidth = 0.15
      const orbits = SOLAR_SYSTEM.orbits(system).filter(
        o => o.tag !== 'orbit' || o.type !== 'asteroid belt'
      )
      const biosphere = Math.max(...orbits.map(o => (o.tag === 'star' ? 0 : o.biosphere.code)))
      const population = Math.max(
        ...orbits.map(o => (o.tag === 'star' ? 0 : o.population?.code ?? 0))
      )
      const habitability = Math.max(
        ...orbits.map(o => (o.tag === 'star' ? -10 : o.habitability.score))
      )
      const wtn = Math.max(
        ...orbits.map(o => (o.tag === 'star' ? 0 : o.wtn?.score ?? 0))
      )
      const resources = Math.max(
        ...orbits.map(o => (o.tag === 'star' ? 0 : o.resources?.score ?? 0))
      )
      const baseColor =
        mapMode === 'habitability'
          ? METRICS.habitability.color(habitability)
          : mapMode === 'biosphere'
          ? METRICS.biosphere.color(biosphere)
          : mapMode === 'orbits'
          ? METRICS.orbits.color(orbits.length - 1)
          : mapMode === 'population'
          ? METRICS.population.color(population)
          : mapMode === 'government'
          ? METRICS.government.colors[nation.government]
          : mapMode === 'wtn'
          ? METRICS.wtn.color(wtn)
          : mapMode === 'resources'
          ? METRICS.resources.color(resources)
          : nation?.flag.color.replace('%)', `%, ${opacity})`)

      ctx.fillStyle = baseColor
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
    if (window.galaxy?.diagram && (mapMode === 'nations' || mapMode === 'government')) {
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

        ctx.strokeStyle = mapMode === 'government' ? 'rgba(0, 0, 0, 0.6)' : nation.flag.color
        ctx.lineWidth =
          (selectedNation?.idx === nation.idx ? 3 : 1.5) * (mapMode === 'nations' ? 3 : 1.5)
        paths.forEach(p => {
          ctx.save()
          ctx.clip(p)
          ctx.filter = 'blur(10px)'
          ctx.stroke(p)
          ctx.restore()
        })
      })
      // Draw war zones with thin red borders and conflict indicators
      ctx.save()
      window.galaxy.systems.forEach(system => {
        const isUnderAttack = NATION.isSystemUnderAttack(system.idx)
        if (isUnderAttack && mapMode === 'nations') {
          const path = cellPathCache.get(system.idx)
          if (path) {
            // Static red border
            ctx.save()
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.4)'
            ctx.lineWidth = 1.25
            ctx.stroke(path)
            ctx.restore()

            // Add conflict icon in center of system
            drawMDIIcon({
              ctx,
              x: system.x - 0.5,
              y: system.y + 1.25,
              size: 1,
              path: mdiSwordCross,
              color: 'rgba(255, 50, 50, 0.9)'
            })
          }
        }
      })
      ctx.restore()
    }
    if (mapMode === 'nations' || mapMode === 'wtn') {
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
      const routes = window.galaxy.routes
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
    const drawSystemNames = currentScale > 8 // skip tiny text when zoomed out
    systems.forEach(system => {
      // Determine all stars in the system (primary + companions)
      const stars: StarType[] = [
        system.star,
        ...STAR.orbits(system.star).filter((o): o is StarType => o.tag === 'star')
      ]

      const focused = system.idx === solarSystem?.idx

      // Render primary and companion stars clustered around the system centre.
      const starRadius = 0.6
      const clusterRadius = starRadius * 1.3 // distance of companions from primary

      if (stars.length === 1) {
        // Single star: just render at centre
        CANVAS.sun({
          ctx,
          x: system.x,
          y: system.y,
          radius: starRadius,
          fill: STAR.color(stars[0])
        })
      } else {
        // Distribute all stars evenly around a circle – none occupy the exact centre
        stars.forEach((s, idx) => {
          const angle = (idx / stars.length) * Math.PI * 2
          const x = system.x + clusterRadius * Math.cos(angle)
          const y = system.y + clusterRadius * Math.sin(angle)
          CANVAS.sun({
            ctx,
            x,
            y,
            radius: starRadius,
            fill: STAR.color(s)
          })
        })
      }

      if (drawSystemNames) {
        CANVAS.text({
          ctx,
          x: system.x,
          y: system.y - 1.8,
          text: SOLAR_SYSTEM.name(system),
          size: 0.7
        })
        // drawSystemResources({ ctx, system })
      }
      if (focused) {
        // Expand the highlight radius so the entire star cluster fits inside.
        const highlightRadius = stars.length > 1 ? clusterRadius + starRadius : 1.25
        CANVAS.circle({
          ctx,
          x: system.x,
          y: system.y,
          radius: highlightRadius,
          fill: 'transparent',
          border: { color: COLORS.accent, width: 0.15 }
        })
      }
    })
    // nation names & heraldry – fade out as the user zooms in
    const zoomLevel = ctx.getTransform().a // uniform scale applied earlier
    const textSizeScale = scaleLinear().domain([1, 150]).range([1.2, 8]).clamp(true)
    const offsetScale = scaleLinear().domain([1, 150]).range([2, 9]).clamp(true)

    const iconSizeScale = scaleLinear().domain([1, 150]).range([3, 14]).clamp(true)

    window.galaxy.nations.forEach(nation => {
      const origin = window.galaxy.systems[nation.capital]
      // Scale heraldry and label sizes based on number of systems (1-150)
      const systemsCount = nation.systems.length
      const textSize = textSizeScale(systemsCount)
      const textOffsetY = offsetScale(systemsCount)

      ctx.save()
      if (zoomLevel > 15) {
        ctx.restore()
        return
      }

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
      const tempCanvas = drawHeraldry(nation)
      const config = HERALDRY.config(nation)
      const iconSize = iconSizeScale(systemsCount)
      const backColor = config?.backColor ?? '#ffffff'
      const shieldSize = iconSize * 1.5
      HERALDRY.draw({
        ctx,
        x: origin.x - iconSize * 0.6,
        y: origin.y + iconSize,
        h: shieldSize,
        w: shieldSize * 0.75,
        borderWidth: iconSize / 20,
        backColor,
        style: nation.flag.style
      })
      // Copy the identicon from the temporary canvas to the main canvas at the new size
      ctx.drawImage(
        tempCanvas,
        origin.x - iconSize * 0.54,
        origin.y + iconSize * 1.1,
        iconSize,
        iconSize
      )

      ctx.restore()
    })
  }
}
