import { CONSTANTS } from '../../../model/constants'
import { SOLAR_SYSTEM } from '../../../model/system'
import { STAR } from '../../../model/system/stars'
import { DICE } from '../../../model/utilities/dice'
import { COLORS } from '../../../theme/colors'
import { CANVAS } from '.'
import { PaintGalaxyParams } from './types'
import { ORBIT } from '../../../model/system/orbits'
import { MATH } from '../../../model/utilities/math'
import { drawResourceIconWithText } from './resourceIcons'
import { Orbit } from '../../../model/system/orbits/types'
import { Star } from '../../../model/system/stars/types'
import { ORBIT_CLASSIFICATION } from '../../../model/system/orbits/classification'

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

  // Layout variables
  const iconHalf = 0.35 * mod // moderately sized icon reference
  const iconRenderSize = iconHalf * 2 // rendered size (0.7 * mod)
  const iconSpacing = 0.3 * mod // balanced spacing
  const textSize = 0.7 * mod // text balanced with icon

  // Y positions for icon row and number row
  const iconRowY = center.y + (object.r + (object.tag === 'star' ? 6 : 2)) * mod
  // (text y handled by shared helper)

  // Calculate horizontal centering
  const totalWidth =
    object.resources.length * iconRenderSize + (object.resources.length - 1) * iconSpacing
  const startX = center.x - totalWidth / 2

  object.resources.forEach((resource, index) => {
    const iconLeftX = startX + index * (iconRenderSize + iconSpacing)

    drawResourceIconWithText({
      ctx,
      resource,
      x: iconLeftX,
      y: iconRowY,
      iconSize: iconRenderSize,
      textSize
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
