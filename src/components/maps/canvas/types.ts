import { ZoomTransform } from 'd3'
import { ViewState } from '../../../context/types'
import { SolarSystem } from '../../../model/system/types'
import { MapModes } from '../types'

export type ZoomParams = { node: Element; onZoom: (event: { transform: ZoomTransform }) => void }

export type DrawCircleParams = {
  x: number
  y: number
  radius: number
  ctx: CanvasRenderingContext2D
  fill: string
  border?: { color: string; width: number }
}
export type DrawLineParams = {
  ctx: CanvasRenderingContext2D
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
  color: string
}
export type DrawTextParams = {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  text: string
  color?: string
  size: number
  align?: 'center' | 'left'
}

export type PaintGalaxyParams = {
  ctx: CanvasRenderingContext2D
  selected: ViewState['selected']
  solarSystem?: SolarSystem
  mapMode: MapModes
}

export type DrawCurveParams = DrawLineParams & {
  /**
   * Curveness factor – roughly the fraction of the segment length used as orthogonal offset for the control point (default 0.2)
   */
  curveness?: number
}
