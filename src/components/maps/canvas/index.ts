import { ZoomBehavior, select, zoom } from 'd3'
import { DrawCircleParams, DrawLineParams, DrawTextParams, ZoomParams } from './types'
import { Star } from '../../../model/system/stars/types'
import { MATH } from '../../../model/utilities/math'
import { Orbit } from '../../../model/system/orbits/types'
import { Point } from '../../../model/utilities/math/types'
import { CONSTANTS } from '../../../model/constants'
import { ORBIT } from '../../../model/system/orbits'
import { STAR } from '../../../model/system/stars'

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
  coordinates: (orbit: Orbit | Star): Point => {
    const system = window.galaxy.systems[orbit.system]
    const parent = orbit.tag === 'star' ? STAR.parent(orbit) : ORBIT.parent(orbit)
    const beltParent =
      parent?.tag === 'orbit' && parent.type === 'asteroid belt' ? ORBIT.parent(parent) : undefined
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
