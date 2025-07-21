import jdenticon from 'jdenticon/standalone'
import { line as d3Line } from 'd3-shape'
import { CONSTANTS } from '../../../model/constants'
import { GALAXY } from '../../../model/galaxy'
import { SOLAR_SYSTEM } from '../../../model/system'
import { STAR } from '../../../model/system/stars'
import { HERALDRY } from '../../heraldry/common'
import { CANVAS } from '.'
import { PaintGalaxyParams } from './types'
import { VORONOI } from '../../../model/utilities/voronoi'
import { scaleLinear } from 'd3'
import { COLORS } from '../../../theme/colors'
import { drawResourceIconWithText, RESOURCE_ICONS } from './resourceIcons'
import { Star } from '../../../model/system/stars/types'
import { EdgeMap } from '../../../model/utilities/voronoi/types'

// Aggregate resources for a solar system and draw them beneath the system icon
const drawSystemResources = ({
  ctx,
  system
}: {
  ctx: CanvasRenderingContext2D
  system: import('../../../model/system/types').SolarSystem
}) => {
  // Gather resources from star + all orbiting bodies
  const objects = SOLAR_SYSTEM.orbits(system)
  const totals: Record<string, number> = {}
  objects.forEach(obj => {
    obj.resources?.forEach(res => {
      totals[res.type] = (totals[res.type] ?? 0) + res.amount
    })
  })

  const entries = Object.entries(totals) as [keyof typeof RESOURCE_ICONS, number][]
  if (entries.length === 0) return

  // Layout constants (world-units)
  const iconRenderSize = 0.65
  const iconSpacing = 0.3
  const textSize = 0.3

  const iconRowY = system.y + 1.0
  // (text y handled by shared helper)

  const totalWidth = entries.length * iconRenderSize + (entries.length - 1) * iconSpacing
  const startX = system.x - totalWidth / 2

  entries.forEach(([type, amount], idx) => {
    const iconX = startX + idx * (iconRenderSize + iconSpacing)

    drawResourceIconWithText({
      ctx,
      resource: { type, amount },
      x: iconX,
      y: iconRowY,
      iconSize: iconRenderSize,
      textSize
    })
  })
}

// Caches to avoid recalculating heavy objects every frame
const cellPathCache = new Map<number, Path2D>()
const identiconCache = new Map<number, HTMLCanvasElement>()
let edgeMapCache: EdgeMap | null = null
const nationBoundaryCache = new Map<number, Path2D[]>()

// Cache for pre-rendered shield + identicon composites (one per nation)
const heraldryCompositeCache = new Map<number, HTMLCanvasElement>()

// Function to clear caches when galaxy state changes
const clearCaches = () => {
  cellPathCache.clear()
  identiconCache.clear()
  edgeMapCache = null
  nationBoundaryCache.clear()
  heraldryCompositeCache.clear()
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
  paint: ({
    ctx,
    selected,
    solarSystem,
    mapMode,
    clearCache = false
  }: PaintGalaxyParams & { clearCache?: boolean }) => {
    // Clear caches if requested (e.g., when galaxy state changes)
    if (clearCache) {
      clearCaches()
    }
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
      if (!nation) return
      const opacity = 0.25
      ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`
      ctx.lineWidth = 0.15
      ctx.fillStyle = nation.flag.color.replace('%)', `%, ${opacity})`)
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
    }
    ctx.restore()
    // stars & system names
    const currentScale = ctx.getTransform().a
    const drawSystemNames = currentScale > 8 // skip tiny text when zoomed out
    systems.forEach(system => {
      // Determine all stars in the system (primary + companions)
      const stars: Star[] = [
        system.star,
        ...STAR.orbits(system.star).filter((o): o is Star => o.tag === 'star')
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

      // Draw aggregated resources when system names are visible
      if (drawSystemNames) {
        drawSystemResources({ ctx, system })
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
