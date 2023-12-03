import { ZoomTransform } from 'd3'

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
}
