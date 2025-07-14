import { CONSTANTS } from '../../../model/constants'
import { SOLAR_SYSTEM } from '../../../model/system'
import { STAR } from '../../../model/system/stars'
import { DICE } from '../../../model/utilities/dice'
import { COLORS } from '../../../theme/colors'
import { CANVAS } from '.'
import { PaintGalaxyParams } from './types'
import { ORBIT } from '../../../model/system/orbits'
import { MATH } from '../../../model/utilities/math'
import { ORBITAL_DEPOSITS } from '../../../model/system/resources'
import { Orbit } from '../../../model/system/orbits/types'
import { Star } from '../../../model/system/stars/types'
import {
  mdiDiamondStone,
  mdiLightningBolt,
  mdiAccountGroup,
  mdiAtom,
  mdiCog,
  mdiFire,
  mdiStar,
  mdiAnvil,
  mdiFlask,
  mdiRing,
  mdiTerrain
} from '@mdi/js'
import { ORBIT_CLASSIFICATION } from '../../../model/system/orbits/classification'

// MDI icon paths for each resource type
const RESOURCE_ICONS = {
  minerals: mdiTerrain,
  energy: mdiLightningBolt,
  society: mdiAccountGroup,
  physics: mdiAtom,
  engineering: mdiCog,
  trade: mdiRing,
  'exotic gas': mdiFire,
  'rare crystals': mdiDiamondStone,
  'volatile motes': mdiFlask,
  zro: mdiStar,
  alloys: mdiAnvil
} as const

// Helper function to draw MDI icon on canvas using Path2D
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
    // Create a Path2D object from the SVG path
    const path2D = new Path2D(path)

    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size / 24, size / 24) // Scale to fit in 24x24 viewBox
    ctx.fillStyle = color

    // Fill the path
    ctx.fill(path2D)

    ctx.restore()
  } catch (error) {
    // Fallback to simple circle if Path2D fails
    console.warn('Path2D not supported, falling back to circle:', error)
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }
}

// Helper function to draw resource icons and values
const drawResources = ({
  ctx,
  object,
  center,
  mod
}: {
  ctx: CanvasRenderingContext2D
  object: Orbit | Star
  center: { x: number; y: number }
  mod: number
}) => {
  if (!object.resources || object.resources.length === 0) return

  const resourceSpacing = 1.5 * mod
  const iconSize = 0.6 * mod
  const textSize = 1 * mod
  const nameY = center.y + (object.r + (object.tag === 'star' ? 6 : 2)) * mod

  // Calculate text width dynamically
  ctx.font = `${textSize}px Michroma`
  const startX = center.x - 1 * mod // Offset based on actual text width
  const startY = nameY

  object.resources.forEach((resource, index) => {
    const resourceDef =
      ORBITAL_DEPOSITS.deposits[resource.type as keyof typeof ORBITAL_DEPOSITS.deposits]
    if (!resourceDef) return

    const x = startX
    const y = startY + index * resourceSpacing

    // Draw resource icon (MDI)
    const iconPath = RESOURCE_ICONS[resource.type as keyof typeof RESOURCE_ICONS]
    if (iconPath) {
      drawMDIIcon({
        ctx,
        x,
        y,
        size: iconSize * 2,
        path: iconPath,
        color: resourceDef.color
      })
    }

    // Draw resource tag
    CANVAS.text({
      ctx,
      x: x + iconSize + 0.75 * mod,
      y: y + textSize,
      text: `${resource.amount}`,
      size: textSize,
      color: resourceDef.color,
      align: 'left'
    })
  })
}

export const SYSTEM_MAP = {
  paint: ({ ctx, selected, solarSystem }: PaintGalaxyParams) => {
    if (!solarSystem) return
    const mod = CONSTANTS.SOLAR_SYSTEM_MOD
    const objects = SOLAR_SYSTEM.orbits(solarSystem)
    ctx.globalAlpha = 0.5
    objects.forEach(object => {
      const radius = object.distance
      const parent = object.tag === 'star' ? STAR.parent(object) : ORBIT.parent(object)
      const center = CANVAS.coordinates(parent ?? object)
      const zone = object.zone
      CANVAS.circle({
        ctx,
        ...center,
        radius: radius * mod,
        fill: 'transparent',
        border: {
          color:
            zone === 'outer'
              ? 'lightblue'
              : zone === 'inner'
              ? 'yellow'
              : zone === 'epistellar'
              ? 'orange'
              : 'lightgray',
          width: mod * 0.25
        }
      })
    })
    ctx.globalAlpha = 1
    objects.forEach(object => {
      const center = CANVAS.coordinates(object)
      if (object.tag === 'star') {
        const star = object
        CANVAS.sun({
          ctx,
          ...center,
          radius: star.r * mod,
          fill: STAR.color(star)
        })
      } else {
        if (ORBIT_CLASSIFICATION[object.type]?.asteroidBelt) {
          const parent = ORBIT.parent(object)
          const asteroidCenter = CANVAS.coordinates(parent ?? object)
          const asteroidBeltRadius = object.distance
          const beltWidth = 10
          // Draw the translucent belt band
          CANVAS.circle({
            ctx,
            ...asteroidCenter,
            radius: asteroidBeltRadius * mod,
            fill: 'transparent',
            border: {
              color: 'rgba(160, 140, 120, 0.15)',
              width: beltWidth * mod
            }
          })
          DICE.swap(solarSystem.seed, () => {
            const numAsteroids = Math.floor(5 * object.distance)
            for (let i = 0; i < numAsteroids; i++) {
              const angle = window.dice.random * 360
              const radiusOffset = window.dice.random * beltWidth - beltWidth / 2
              const asteroidPosition = MATH.angles.cartesian({
                radius: (asteroidBeltRadius + radiusOffset) * mod,
                deg: angle,
                center: asteroidCenter
              })
              CANVAS.asteroid({
                ctx,
                x: asteroidPosition.x,
                y: asteroidPosition.y,
                radius: (0.5 + window.dice.random) * mod,
                fill: COLORS.darken('#808080', window.dice.random * 30)
              })
            }
          })
        } else {
          const orbit = object
          CANVAS.sphere({
            ctx,
            x: center.x,
            y: center.y,
            radius: orbit.r * mod,
            fill: ORBIT.color(orbit)
          })
        }
      }
    })
    objects.forEach(object => {
      const center = CANVAS.coordinates(object)
      if (object.tag === 'star') {
        const star = object
        const starName = STAR.name(star)
        CANVAS.text({
          ctx,
          x: center.x,
          y: center.y + (star.r + 5) * mod,
          text: starName,
          size: 0.05
        })
        // Draw star resources
        drawResources({ ctx, object: star, center, mod })
      } else {
        if (!ORBIT_CLASSIFICATION[object.type]?.asteroidBelt) {
          const orbit = object
          const orbitName = ORBIT.name(orbit)
          CANVAS.text({
            ctx,
            x: center.x,
            y: center.y + (orbit.r + 1.5) * mod,
            text: orbitName,
            size: 0.025
          })
          // Draw orbit resources
          drawResources({ ctx, object: orbit, center, mod })
        }
      }
    })
    if (selected?.tag === 'star' || selected?.tag === 'orbit') {
      const offset = selected.tag === 'star' ? 1 : 0.5
      const center = CANVAS.coordinates(selected)
      CANVAS.circle({
        ctx,
        x: center.x,
        y: center.y,
        radius: (selected.r + offset) * mod,
        fill: 'transparent',
        border: { color: COLORS.accent, width: mod * 0.25 }
      })
    }
  }
}
