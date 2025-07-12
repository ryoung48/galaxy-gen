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

    // The gradient will make the star look like a glowing ball of light.
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
  text: ({ ctx, x, y, text, color, size }: DrawTextParams) => {
    ctx.textAlign = 'center'
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
