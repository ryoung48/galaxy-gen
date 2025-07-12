import { DICE } from '../../../model/utilities/dice'
import { COLORS } from '../../../theme/colors'
import { CANVAS } from '.'
import { Point } from '../../../model/utilities/math/types'
import { MATH } from '../../../model/utilities/math'

const STAR_COUNT = 2500

interface BackgroundObject extends Point {
  r: number
}

const hexToRgb = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return null
  const [r, g, b] = (hex.match(/\w\w/g) || []).map(h => parseInt(h, 16))
  return { r, g, b }
}

export const BACKGROUND = {
  paint: ({
    ctx,
    objects = [],
    systemCenter,
    maxSystemRadius
  }: {
    ctx: CanvasRenderingContext2D
    objects?: BackgroundObject[]
    systemCenter?: Point
    maxSystemRadius?: number
  }) => {
    // Draw the system background gradient first
    if (systemCenter && maxSystemRadius) {
      const gradient = ctx.createRadialGradient(
        systemCenter.x,
        systemCenter.y,
        0,
        systemCenter.x,
        systemCenter.y,
        maxSystemRadius
      )
      gradient.addColorStop(0, COLORS.map)
      gradient.addColorStop(0.6, COLORS.map)
      gradient.addColorStop(1, 'black')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    // Draw the starfield
    DICE.swap('background', () => {
      for (let i = 0; i < STAR_COUNT; i++) {
        const x = window.dice.randint(0, ctx.canvas.width)
        const y = window.dice.randint(0, ctx.canvas.height)
        const radius = window.dice.random * 0.75

        let alpha = 1.0
        const falloffDistance = 300 // pixels
        for (const obj of objects) {
          const dist = MATH.distance([x, y], [obj.x, obj.y])
          if (dist < obj.r + falloffDistance) {
            const effectiveDist = Math.max(0, dist - obj.r)
            alpha = Math.min(alpha, effectiveDist / falloffDistance)
          }
        }
        alpha = Math.max(0.1, alpha ** 2)
        const starColorHex = COLORS.random.star()
        const rgb = hexToRgb(starColorHex)
        let fillStyle = starColorHex
        if (rgb) {
          fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
        }
        CANVAS.circle({
          ctx,
          x,
          y,
          radius,
          fill: fillStyle,
          border: { color: 'transparent', width: 0 }
        })
      }
    })
  }
}
