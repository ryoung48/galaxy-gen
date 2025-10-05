import { CONSTANTS } from '../../../model/constants'
import { SOLAR_SYSTEM } from '../../../model/system'
import { STAR } from '../../../model/system/stars'
import { DICE } from '../../../model/utilities/dice'
import { COLORS } from '../../../theme/colors'
import { CANVAS } from '.'
import { PaintGalaxyParams } from './types'
import { ORBIT } from '../../../model/system/orbits'
import { METRICS } from '../legend/metrics'
import { MATH } from '../../../model/utilities/math'
import { TEXT } from '../../../model/utilities/text'
// import { drawTagIconWithText } from './tags'

// Helper function to draw resource icons and values
// const drawResources = ({
//   ctx,
//   object,
//   center,
//   mod
// }: {
//   ctx: CanvasRenderingContext2D
//   object: Orbit
//   center: { x: number; y: number }
//   mod: number
// }) => {
//   if (object.tags.length === 0) return

//   // Layout variables
//   const iconHalf = 0.35 * mod // moderately sized icon reference
//   const iconRenderSize = iconHalf * 2 // rendered size (0.7 * mod)
//   const iconSpacing = 0.3 * mod // balanced spacing
//   const textSize = 0.7 * mod // text balanced with icon

//   // Y positions for icon row and number row
//   const iconRowY = center.y + (object.r + 3) * mod
//   // (text y handled by shared helper)

//   // Calculate horizontal centering
//   const totalWidth = object.tags.length * iconRenderSize + (object.tags.length - 1) * iconSpacing
//   const startX = center.x - totalWidth / 2

//   object.tags.forEach((tag, index) => {
//     const iconLeftX = startX + index * (iconRenderSize + iconSpacing)

//     drawTagIconWithText({
//       ctx,
//       tag,
//       x: iconLeftX,
//       y: iconRowY,
//       iconSize: iconRenderSize,
//       textSize
//     })
//   })
// }

export const SYSTEM_MAP = {
  paint: ({ ctx, selected, solarSystem, mapMode }: PaintGalaxyParams) => {
    if (!solarSystem) return
    const mod = CONSTANTS.SOLAR_SYSTEM_MOD
    const objects = SOLAR_SYSTEM.orbits(solarSystem)
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
          width: mod * 0.05
        }
      })
    })
    objects.forEach(object => {
      const center = CANVAS.coordinates(object)
      if (object.tag === 'star') {
        const star = object
        CANVAS.sun({
          ctx,
          ...center,
          radius: star.r * mod,
          fill:
            mapMode === 'habitability'
              ? METRICS.habitability.color(-10)
              : mapMode === 'biosphere'
              ? METRICS.biosphere.color(0)
              : mapMode === 'population'
              ? METRICS.population.color(0)
              : STAR.color(star)
        })
      } else {
        if (object.type === 'asteroid belt') {
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
        }
        if (object.type === 'asteroid belt') return
        const orbit = object
        if (object.type === 'asteroid') {
          DICE.swap(object.idx.toString() + solarSystem.seed, () => {
            CANVAS.asteroid({
              ctx,
              x: center.x,
              y: center.y,
              radius: orbit.r * mod,
              fill:
                mapMode === 'habitability'
                  ? METRICS.habitability.color(orbit.habitability.score)
                  : mapMode === 'biosphere'
                  ? METRICS.biosphere.color(orbit.biosphere.code)
                  : mapMode === 'population'
                  ? METRICS.population.color(orbit.population?.code ?? 0)
                  : ORBIT.colors(orbit)
            })
          })
        } else {
          // Draw back portion of rings for gas giants
          if (orbit.type === 'jovian' && (orbit.rings === 'complex' || orbit.rings === 'minor')) {
            const ringRadius = orbit.r * mod * 1.8
            const ringWidth = orbit.rings === 'minor' ? orbit.r * mod * 0.1 : orbit.r * mod * 0.3
            const tiltAngle = (orbit.tilt * Math.PI) / 180

            // Draw back half of rings (behind planet)
            ctx.save()
            ctx.translate(center.x, center.y)
            ctx.rotate(tiltAngle)
            ctx.scale(1, 0.3)

            if (orbit.rings === 'complex') {
              ctx.lineWidth = ringWidth
              ctx.strokeStyle = 'rgba(200, 180, 150, 0.4)' // Darker for back portion
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius, Math.PI, 2 * Math.PI) // Bottom half
              ctx.stroke()

              // Inner ring back half
              ctx.lineWidth = ringWidth * 0.6
              ctx.strokeStyle = 'rgba(180, 160, 130, 0.3)'
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius * 0.7, Math.PI, 2 * Math.PI)
              ctx.stroke()
            } else if (orbit.rings === 'minor') {
              ctx.lineWidth = ringWidth
              ctx.strokeStyle = 'rgba(200, 180, 150, 0.3)' // Lighter for minor rings
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius, Math.PI, 2 * Math.PI) // Bottom half
              ctx.stroke()

              // Inner ring back half
              ctx.lineWidth = ringWidth * 0.6
              ctx.strokeStyle = 'rgba(180, 160, 130, 0.25)'
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius * 0.85, Math.PI, 2 * Math.PI)
              ctx.stroke()
            }

            ctx.restore()
          }
          CANVAS.texturedSphere({
            ctx,
            x: center.x,
            y: center.y,
            radius: orbit.r * mod,
            fill:
              mapMode === 'habitability'
                ? METRICS.habitability.color(orbit.habitability.score)
                : mapMode === 'biosphere'
                ? METRICS.biosphere.color(orbit.biosphere.code)
                : mapMode === 'population'
                ? METRICS.population.color(orbit.population?.code ?? 0)
                : ORBIT.colors(orbit),
            orbit,
            seed: solarSystem.seed + orbit.idx
          })
          // Draw front portion of rings for gas giants
          if (orbit.type === 'jovian' && (orbit.rings === 'complex' || orbit.rings === 'minor')) {
            const ringRadius = orbit.r * mod * 1.8
            const ringWidth = orbit.rings === 'minor' ? orbit.r * mod * 0.1 : orbit.r * mod * 0.3
            const tiltAngle = (orbit.tilt * Math.PI) / 180

            // Draw front half of rings (in front of planet)
            ctx.save()
            ctx.translate(center.x, center.y)
            ctx.rotate(tiltAngle)
            ctx.scale(1, 0.3)

            if (orbit.rings === 'complex') {
              ctx.lineWidth = ringWidth
              ctx.strokeStyle = 'rgba(200, 180, 150, 0.7)' // Brighter for front portion
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius, 0, Math.PI) // Top half
              ctx.stroke()

              // Inner ring front half
              ctx.lineWidth = ringWidth * 0.6
              ctx.strokeStyle = 'rgba(180, 160, 130, 0.5)'
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius * 0.7, 0, Math.PI)
              ctx.stroke()
            } else if (orbit.rings === 'minor') {
              ctx.lineWidth = ringWidth
              ctx.strokeStyle = 'rgba(200, 180, 150, 0.5)' // Lighter for minor rings
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius, 0, Math.PI) // Top half
              ctx.stroke()

              // Inner ring front half
              ctx.lineWidth = ringWidth * 0.6
              ctx.strokeStyle = 'rgba(180, 160, 130, 0.4)'
              ctx.beginPath()
              ctx.arc(0, 0, ringRadius * 0.85, 0, Math.PI)
              ctx.stroke()
            }

            ctx.restore()
          }
        }
      }
    })
    objects.forEach(object => {
      const center = CANVAS.coordinates(object)
      if (object.tag === 'star' || object.type !== 'asteroid belt') {
        const distance =
          object.tag === 'star' || !object.moon
            ? `${TEXT.formatters.compact(object.au)} AU`
            : `${TEXT.formatters.compact(object.moon.pd)} PD`
        CANVAS.text({
          ctx,
          x: center.x,
          y: center.y - (object.r + 0.5) * mod,
          text: distance,
          size: 0.015
        })
      }
      if (object.tag === 'star') {
        const star = object
        CANVAS.text({
          ctx,
          x: center.x,
          y: center.y + (star.r + 5) * mod,
          text: STAR.name(star),
          size: 0.05
        })
      } else {
        if (object.type === 'asteroid belt') return
        const orbit = object
        CANVAS.text({
          ctx,
          x: center.x,
          y: center.y + (orbit.r + 1.5) * mod,
          text: ORBIT.name(orbit),
          size: 0.025
        })
        CANVAS.text({
          ctx,
          x: center.x,
          y: center.y + (orbit.r + 2.5) * mod,
          text: ORBIT.code(orbit),
          size: 0.015
        })
        // Draw orbit resources
        // drawResources({ ctx, object: orbit, center, mod })
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
