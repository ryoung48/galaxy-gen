import { ZoomBehavior, select, zoom } from 'd3'
import { DrawCircleParams, DrawLineParams, DrawTextParams, ZoomParams } from './types'

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
  line: ({ ctx, x1, y1, x2, y2, color, width }: DrawLineParams) => {
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
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
  }
}
