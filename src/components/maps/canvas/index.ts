import { ZoomBehavior, select, zoom } from 'd3'
import {
  DrawCircleParams,
  DrawLineParams,
  DrawTextParams,
  ZoomParams,
  DrawCurveParams
} from './types'
import { Star } from '../../../model/system/stars/types'
import { MATH } from '../../../model/utilities/math'
import { Orbit } from '../../../model/system/orbits/types'
import { Point } from '../../../model/utilities/math/types'
import { CONSTANTS } from '../../../model/constants'
import { ORBIT } from '../../../model/system/orbits'
import { STAR } from '../../../model/system/stars'
import { COLORS } from '../../../theme/colors'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let zoomRef: ZoomBehavior<Element, unknown> = null

export const CANVAS = {
  circle: ({ ctx, x, y, radius, fill, border }: DrawCircleParams) => {
    const width = border?.width ?? 0
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = border?.color ?? 'black'
    ctx.fillStyle = fill
    ctx.fill()
    if (width > 0) ctx.stroke()
  },
  asteroid: ({ ctx, x, y, radius, fill, border }: DrawCircleParams) => {
    const width = border?.width ?? 0
    const points = window.dice.randint(6, 12)
    const variance = 0.4 // how irregular the edges are
    ctx.beginPath()
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2
      const r = radius * (1 - variance / 2 + window.dice.random * variance)
      const px = x + r * Math.cos(angle)
      const py = y + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    const gradient = ctx.createRadialGradient(
      x - radius / 3,
      y - radius / 3,
      radius / 4,
      x,
      y,
      radius * 1.5
    )
    gradient.addColorStop(0, COLORS.lighten(fill, 20))
    gradient.addColorStop(0.5, fill)
    gradient.addColorStop(1, COLORS.darken(fill, 40))

    ctx.fillStyle = gradient
    ctx.fill()
    if (width > 0) {
      ctx.lineWidth = width
      ctx.strokeStyle = border?.color ?? COLORS.darken(fill, 30)
      ctx.stroke()
    }
  },
  sphere: ({ ctx, x, y, radius, fill, border }: DrawCircleParams) => {
    const width = border?.width ?? 0
    const gradient = ctx.createRadialGradient(
      x - radius / 2,
      y - radius / 2,
      radius / 4,
      x,
      y,
      radius * 1.5
    )
    gradient.addColorStop(0, COLORS.darken(fill, 10))
    gradient.addColorStop(0.5, fill)
    gradient.addColorStop(1, COLORS.darken(fill, 60))
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.closePath()

    if (width > 0) {
      ctx.lineWidth = width
      ctx.strokeStyle = border?.color ?? 'black'
      ctx.stroke()
    }
  },
  texturedSphere: ({
    ctx,
    x,
    y,
    radius,
    fill,
    border,
    seed,
    orbit
  }: DrawCircleParams & { seed?: string; orbit: Orbit }) => {
    const width = border?.width ?? 0

    // Base gradient
    const gradient = ctx.createRadialGradient(
      x - radius / 2,
      y - radius / 2,
      radius / 4,
      x,
      y,
      radius * 1.5
    )
    gradient.addColorStop(0, COLORS.lighten(fill, 20))
    gradient.addColorStop(0.5, fill)
    gradient.addColorStop(1, COLORS.darken(fill, 60))

    // Draw base sphere
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.closePath()

    // Add texture patterns based on planet type
    if (seed) {
      ctx.save()

      // Create clipping mask for sphere
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.clip()

      // Use seed for consistent patterns
      const seedNum = parseInt(seed.slice(-6), 16) || 123456

      switch (orbit.type) {
        case 'jovian': {
          // Draw tilted atmospheric bands
          const tiltAngle = ((orbit.tilt % 360) * Math.PI) / 180

          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(tiltAngle)

          for (let i = 0; i < 6; i++) {
            const bandY = -radius + (i * radius * 2) / 5
            const bandHeight = radius * 0.35

            ctx.globalAlpha = 0.2 + (i % 2) * 0.1
            ctx.fillStyle = i % 2 === 0 ? COLORS.lighten(fill, 15) : COLORS.darken(fill, 15)

            // Draw curved band using multiple segments
            ctx.beginPath()
            const segments = 20
            for (let j = 0; j <= segments; j++) {
              const segmentX = -radius + (j * radius * 2) / segments
              const distFromCenter = Math.abs(segmentX)
              const curveHeight = Math.sqrt(radius * radius - distFromCenter * distFromCenter)
              const curveOffset = (1 - curveHeight / radius) * radius * 0.4

              const topY = bandY - curveOffset

              if (j === 0) {
                ctx.moveTo(segmentX, topY)
              } else {
                ctx.lineTo(segmentX, topY)
              }
            }
            for (let j = segments; j >= 0; j--) {
              const segmentX = -radius + (j * radius * 2) / segments
              const distFromCenter = Math.abs(segmentX)
              const curveHeight = Math.sqrt(radius * radius - distFromCenter * distFromCenter)
              const curveOffset = (1 - curveHeight / radius) * radius * 0.4

              const bottomY = bandY + bandHeight - curveOffset
              ctx.lineTo(segmentX, bottomY)
            }
            ctx.closePath()
            ctx.fill()
          }

          ctx.restore()
          break
        }
        default: {
          // Determine if this planet should have swirl texture
          const { atmosphere } = orbit
          const hasSwirls =
            atmosphere?.subtype !== 'very thin' &&
            atmosphere?.type !== 'trace' &&
            atmosphere?.type !== 'vacuum'

          if (hasSwirls) {
            // Draw thin tilted atmospheric bands
            const tiltAngle = ((orbit.tilt % 360) * Math.PI) / 180

            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(tiltAngle)

            for (let i = 0; i < 8; i++) {
              const bandY = -radius + (i * radius * 2) / 7
              const bandHeight = radius * 0.08

              ctx.globalAlpha = 0.15 + (i % 2) * 0.1 + (orbit.type === 'tectonic' ? 0.2 : 0)
              ctx.fillStyle = i % 2 === 0 ? COLORS.lighten(fill, 20) : COLORS.darken(fill, 25)

              // Draw curved band using multiple segments
              ctx.beginPath()
              const segments = 20
              for (let j = 0; j <= segments; j++) {
                const segmentX = -radius + (j * radius * 2) / segments
                const distFromCenter = Math.abs(segmentX)
                const curveHeight = Math.sqrt(radius * radius - distFromCenter * distFromCenter)
                const curveOffset = (1 - curveHeight / radius) * radius * 0.3

                const topY = bandY - curveOffset

                if (j === 0) {
                  ctx.moveTo(segmentX, topY)
                } else {
                  ctx.lineTo(segmentX, topY)
                }
              }
              for (let j = segments; j >= 0; j--) {
                const segmentX = -radius + (j * radius * 2) / segments
                const distFromCenter = Math.abs(segmentX)
                const curveHeight = Math.sqrt(radius * radius - distFromCenter * distFromCenter)
                const curveOffset = (1 - curveHeight / radius) * radius * 0.3

                const bottomY = bandY + bandHeight - curveOffset
                ctx.lineTo(segmentX, bottomY)
              }
              ctx.closePath()
              ctx.fill()
            }

            ctx.restore()
          } else {
            // Add noise-based texture for all other planets
            const noiseScale = radius * 0.1
            const noiseIntensity =
              orbit.type === 'meltball'
                ? 0.5
                : orbit.type === 'tectonic'
                ? 0.35
                : orbit.type === 'geo-cyclic' || orbit.type === 'hebean'
                ? 0.25
                : 0.15

            for (let i = 0; i < 120; i++) {
              const angle = (((seedNum + i * 137) % 360) * Math.PI) / 180
              const distance = (((seedNum + i * 73) % 100) / 100) * radius * 0.9
              const noiseX = x + Math.cos(angle) * distance
              const noiseY = y + Math.sin(angle) * distance
              const noiseSize = noiseScale * (0.3 + ((seedNum + i * 91) % 70) / 100)

              // Vary the noise intensity based on position
              const distanceFromCenter = Math.sqrt((noiseX - x) ** 2 + (noiseY - y) ** 2) / radius
              const alpha = noiseIntensity * (1 - distanceFromCenter * 0.5)

              ctx.globalAlpha = alpha * (0.5 + ((seedNum + i * 59) % 50) / 100)

              // Alternate between lighter and darker noise
              const isLight = (seedNum + i * 43) % 3 > 0
              ctx.fillStyle = isLight ? COLORS.lighten(fill, 20) : COLORS.darken(fill, 25)

              ctx.beginPath()
              ctx.arc(noiseX, noiseY, noiseSize, 0, Math.PI * 2)
              ctx.fill()
            }
          }
          break
        }
      }

      ctx.globalAlpha = 1
      ctx.restore()
    }

    if (width > 0) {
      ctx.lineWidth = width
      ctx.strokeStyle = border?.color ?? 'black'
      ctx.stroke()
    }
  },
  sun: ({ ctx, x, y, radius, fill }: Omit<DrawCircleParams, 'border'>) => {
    // Helper to add alpha to hex or rgb colors
    const alphaColor = (color: string, alpha: number) => {
      const clamp = (n: number, min = 0, max = 255) => Math.min(Math.max(n, min), max)
      // Hex format e.g. #aabbcc or #abc
      if (color.startsWith('#')) {
        const hex = color.slice(1)
        // Expand shorthand form (#abc => #aabbcc)
        const fullHex =
          hex.length === 3
            ? hex
                .split('')
                .map(ch => ch + ch)
                .join('')
            : hex
        if (fullHex.length !== 6) return color
        const alphaHex = Math.round(clamp(alpha * 255))
          .toString(16)
          .padStart(2, '0')
        return `#${fullHex}${alphaHex}`
      }
      // rgb(...) format
      if (color.startsWith('rgb(')) {
        const nums = color.match(/\d+/g)
        if (!nums || nums.length < 3) return color
        const [r, g, b] = nums.map(Number)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      // rgba already: adjust alpha if needed
      if (color.startsWith('rgba(')) {
        const nums = color.match(/\d+\.?\d*/g)
        if (!nums || nums.length < 4) return color
        const [r, g, b] = nums.map(Number)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      return color
    }

    // Check if this is a black hole (black color indicates BH)
    const isBlackHole = fill === '#000000'

    if (isBlackHole) {
      // Add an outer glow for black holes
      const outerGlow = ctx.createRadialGradient(x, y, radius, x, y, radius * 1.5)
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.beginPath()
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = outerGlow
      ctx.fill()
      ctx.closePath()
      // Special gradient for black holes: black center to white edge
      const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius)
      gradient.addColorStop(0.5, 'black')
      gradient.addColorStop(0.9, '#333333')
      gradient.addColorStop(1, 'white')

      // Draw the black hole core
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.closePath()
    } else {
      // Regular star gradient
      const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius)

      // Color stops: from a white center, to the star's color, to a faint glow.
      gradient.addColorStop(0, 'white')
      gradient.addColorStop(0.5, fill)
      gradient.addColorStop(1, alphaColor(fill, 0.5))

      // Draw the star core
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.closePath()

      // Optional: add an outer, more transparent glow
      const outerGlow = ctx.createRadialGradient(x, y, radius, x, y, radius * 1.5)
      outerGlow.addColorStop(0, alphaColor(fill, 0.3))
      outerGlow.addColorStop(1, alphaColor(fill, 0))

      ctx.beginPath()
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = outerGlow
      ctx.fill()
      ctx.closePath()
    }
  },
  coordinates: (orbit: Orbit | Star): Point => {
    const system = window.galaxy.systems[orbit.system]
    const parent = orbit.tag === 'star' ? STAR.parent(orbit) : ORBIT.parent(orbit)
    const beltParent =
      parent?.tag === 'orbit' && parent.group === 'asteroid belt' ? ORBIT.parent(parent) : undefined
    const center = parent ? CANVAS.coordinates(beltParent ?? parent) : system
    return MATH.angles.cartesian({
      radius: (beltParent ? parent.distance : orbit.distance) * CONSTANTS.SOLAR_SYSTEM_MOD,
      deg: orbit.angle,
      center
    })
  },
  line: ({ ctx, x1, y1, x2, y2, color, width }: DrawLineParams) => {
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  },
  curve: ({ ctx, x1, y1, x2, y2, color, width, curveness = 0.2 }: DrawCurveParams) => {
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const dx = x2 - x1
    const dy = y2 - y1
    const cpX = mx - dy * curveness
    const cpY = my + dx * curveness

    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(cpX, cpY, x2, y2)
    ctx.stroke()
  },
  text: ({ ctx, x, y, text, color, size, align }: DrawTextParams) => {
    ctx.textAlign = align ?? 'center'
    ctx.font = `${size}px Michroma`
    ctx.fillStyle = color ?? 'black'
    ctx.fillText(text, x, y)
  },
  zoom: ({ node, onZoom }: ZoomParams) => {
    zoomRef = zoom().scaleExtent([1, 4000]).on('zoom', onZoom)
    const selection = select(node)
    selection.call(zoomRef)
  },
  init: (node: Element) => {
    const selection = select(node)
    zoomRef.scaleTo(selection, 1.5)
    zoomRef.translateTo(selection, node.clientWidth * 0.44, node.clientHeight * 0.95)
  }
}
